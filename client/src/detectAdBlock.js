/**
 * 강력한 AdBlock 감지 유틸리티 (옵션 기반)
 *
 * - 여러 신호(네트워크, 프리로드, DOM bait, 선택적 adsbygoogle)를 동시에 수집합니다.
 * - 집계 정책(policy)을 통해 "하나라도 걸리면 차단" 또는 "과반수 이상이면 차단"을 선택할 수 있습니다.
 * - 기본 설정은 보수적으로 false positive(오탐)를 줄이는 방향:
 *    - checkAdsbygoogle: false (애드센스 스크립트를 실제로 쓰지 않는 경우 오탐을 방지)
 *    - useScriptLoad: false (실제 <script> 실행은 기본 비활성화; 필요 시만 켜세요)
 *    - policy: 'any' (하나라도 차단 신호면 차단으로 간주) → 오탐이 걱정되면 'majority' 추천
 *
 * 사용 예:
 *   const blocked = await detectAdBlockStrong();
 *   const blocked = await detectAdBlockStrong({ checkAdsbygoogle: true, policy: 'majority' });
 */

const DEFAULT_URL =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";

export default async function detectAdBlockStrong(options = {}) {
  // ──────────────────────────────────────────────────────────────
  // 옵션 병합 (기본값)
  // ──────────────────────────────────────────────────────────────
  const cfg = {
    // 네가 실제로 Google AdSense를 로드하고 있고, window.adsbygoogle 이 존재해야 정상인 상황에서만 true로!
    // (광고 스크립트를 사용하지 않는다면 반드시 false 유지)
    checkAdsbygoogle: false,

    // 네트워크 감지 시, 실제 <script> 로드까지 시도할지 여부.
    // 기본값 false: 성능/부작용(코드 실행) 최소화. 필요 시만 true로 켜세요.
    useScriptLoad: false,

    // 광고 스크립트(또는 광고 도메인) URL. 필요 시 커스텀 가능.
    adScriptUrl: DEFAULT_URL,

    // bait 엘리먼트에 붙일 클래스들(광고 차단 확장프로그램이 자주 차단하는 클래스명)
    baitClassNames: [
      "ads",
      "ad",
      "ad-banner",
      "ad-container",
      "adunit",
      "adsbox",
      "sponsored",
      "ad__slot",
      "ad-slot",
    ],

    // 각 체크별 타임아웃(밀리초)
    timeoutMs: 1800,

    // 집계 정책: 'any' | 'majority' | 'all'
    //  - any: 신호 중 하나라도 true면 차단으로 판정(민감, 오탐 증가 가능)
    //  - majority: true가 과반수 이상일 때만 차단(권장)
    //  - all: 모든 신호가 true여야 차단(너무 느슨해질 수 있음)
    policy: "any",

    ...options,
  };

  // 브라우저 환경이 아니면 감지 불가 → 차단 아님 처리
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  console.log("[AdBlock] 감지 시작...", cfg);

  // ──────────────────────────────────────────────────────────────
  // 1) 네트워크 체크 (fetch) — 확장프로그램이 요청 자체를 막는지 감지
  //    - mode: 'no-cors'로 opaque 응답이라도 재현 가능
  //    - 일부 환경(CSP/네트워크 정책)에서도 막힐 수 있으므로 "차단 신호" 중 하나로 취급
  // ──────────────────────────────────────────────────────────────
  const pFetch = detectByFetch(cfg.adScriptUrl, cfg.timeoutMs);

  // ──────────────────────────────────────────────────────────────
  // 2) 프리로드 체크 (<link rel="preload" as="script">)
  //    - 실행 없이 네트워크만 시도. 많은 차단기가 이 단계도 차단.
  // ──────────────────────────────────────────────────────────────
  const pPreload = detectByPreload(cfg.adScriptUrl, cfg.timeoutMs);

  // ──────────────────────────────────────────────────────────────
  // 3) DOM bait 체크 — 광고 관련 클래스명을 가진 요소가 강제로 숨겨지는지 감지
  // ──────────────────────────────────────────────────────────────
  const pBait = detectByBait(cfg.baitClassNames);

  // ──────────────────────────────────────────────────────────────
  // 4) (옵션) 실제 <script> 로드 체크 — 가장 공격적(실행 발생 가능)
  //    - 기본값 false. 광고 코드 실행을 원치 않으면 끄세요.
  // ──────────────────────────────────────────────────────────────
  const pScriptLoad = cfg.useScriptLoad
    ? detectByScriptLoad(cfg.adScriptUrl, cfg.timeoutMs)
    : Promise.resolve(false);

  // ──────────────────────────────────────────────────────────────
  // 5) (옵션) adsbygoogle 전역 객체 체크
  //    - "이미 페이지에서 광고 스크립트를 로드하는 것이 정상"인 경우에만 사용
  //    - 스크립트를 안 쓰는 프로젝트에서 켜면 100% 오탐
  // ──────────────────────────────────────────────────────────────
  const pAdsbygoogle = cfg.checkAdsbygoogle
    ? detectByAdsbygoogleObject()
    : Promise.resolve(false);

  // 모든 신호 병렬 수집
  const signals = await Promise.all([
    pFetch,        // 0
    pPreload,      // 1
    pBait,         // 2
    pScriptLoad,   // 3 (옵션)
    pAdsbygoogle,  // 4 (옵션)
  ]);

  const blocked = reduceSignals(signals, cfg.policy);

  if (blocked) {
    console.warn("[AdBlock] 차단 감지됨! signals =", signals, "policy =", cfg.policy);
  } else {
    console.log("[AdBlock] 차단 없음. signals =", signals, "policy =", cfg.policy);
  }

  return blocked;
}

/* ───────────────────────── 헬퍼들 ───────────────────────── */

/**
 * fetch 기반 네트워크 감지:
 * - 차단 시 보통 네트워크 에러가 throw 됨 → true(차단)
 * - no-cors + opaque 응답이라도 에러가 아니면 "차단 아님(false)"
 */
async function detectByFetch(url, timeoutMs) {
  try {
    await withTimeout(
      fetch(url, {
        method: "HEAD", // 일부 CDN에서 HEAD 제한 시 자동 fallback 예정
        mode: "no-cors",
        cache: "no-store",
      }),
      timeoutMs
    );
    return false; // 요청이 "실패 없이" 끝났다면 차단 신호 아님
  } catch {
    // 네트워크 차단/에러 → 차단 신호
    return true;
  }
}

/**
 * <link rel="preload"> 기반 감지:
 * - 스크립트를 "실행"하지 않고 네트워크만 시도
 * - onerror 또는 타임아웃이면 차단 신호(true)
 */
function detectByPreload(url, timeoutMs) {
  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "script";
    link.href = url;
    link.crossOrigin = "anonymous"; // CORS 경고 최소화 (응답 자체엔 영향 없음)

    let done = false;
    const finish = (blocked) => {
      if (done) return;
      done = true;
      cleanup();
      resolve(blocked);
    };

    const cleanup = () => {
      link.onload = null;
      link.onerror = null;
      if (link.parentNode) link.parentNode.removeChild(link);
    };

    const timer = setTimeout(() => finish(true), timeoutMs);

    link.onload = () => {
      clearTimeout(timer);
      // 네트워크가 이루어진 것으로 간주(프리로드 성공) → 차단 아님
      finish(false);
    };
    link.onerror = () => {
      clearTimeout(timer);
      // 요청이 막힌 것으로 간주 → 차단
      finish(true);
    };

    document.head.appendChild(link);
  });
}

/**
 * DOM bait 기반 감지:
 * - 광고 관련 클래스명을 가진 요소를 화면 밖에 생성
 * - 애드블록이 CSS 차단 규칙으로 display:none 처리하면 감지
 */
function detectByBait(classNames) {
  return new Promise((resolve) => {
    const bait = document.createElement("div");
    bait.setAttribute("aria-hidden", "true");
    bait.className = classNames.join(" ");

    // 화면에 영향이 없도록 최대한 눈에 띄지 않게 배치
    Object.assign(bait.style, {
      position: "absolute",
      left: "-9999px",
      top: "0",
      width: "1px",
      height: "1px",
      pointerEvents: "none",
      lineHeight: "1px",
      zIndex: "0",
    });

    document.body.appendChild(bait);

    // 스타일이 적용될 시간을 아주 짧게 부여
    setTimeout(() => {
      const cs = window.getComputedStyle(bait);
      const rect = bait.getBoundingClientRect();

      // 일반적인 차단 징후들을 종합 체크
      const hiddenByRules =
        cs.display === "none" ||
        cs.visibility === "hidden" ||
        cs.opacity === "0" ||
        rect.width === 0 ||
        rect.height === 0 ||
        bait.offsetParent === null;

      document.body.removeChild(bait);
      resolve(!!hiddenByRules);
    }, 120);
  });
}

/**
 * 실제 <script> 로드 감지 (공격적):
 * - 스크립트를 "다운로드 + 실행"합니다.
 * - 실행 부작용이 싫다면 cfg.useScriptLoad를 false로 두세요(기본값).
 * - onerror/타임아웃이면 차단(true), onload면 차단 아님(false).
 */
function detectByScriptLoad(url, timeoutMs) {
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = url;
    s.async = true;
    s.setAttribute("data-adblock-probe", "1");

    let done = false;
    const finish = (blocked) => {
      if (done) return;
      done = true;
      cleanup();
      resolve(blocked);
    };

    const cleanup = () => {
      s.onerror = null;
      s.onload = null;
      if (s.parentNode) s.parentNode.removeChild(s);
    };

    const timer = setTimeout(() => finish(true), timeoutMs);

    s.onload = () => {
      clearTimeout(timer);
      finish(false);
    };
    s.onerror = () => {
      clearTimeout(timer);
      finish(true);
    };

    document.head.appendChild(s);
  });
}

/**
 * adsbygoogle 전역 객체 감지:
 * - "정상" 상태에서 window.adsbygoogle이 존재해야만 의미가 있습니다.
 * - 페이지가 애드센스를 로드하지 않는다면 100% 오탐 → 반드시 옵션으로만!
 */
async function detectByAdsbygoogleObject() {
  try {
    // 이미 로드된 상태에서만 true/false 의미가 있음
    const ok = !!(window.adsbygoogle && Array.isArray(window.adsbygoogle));
    // 존재하지 않으면 "차단 신호"로 간주
    return !ok;
  } catch {
    return true;
  }
}

/**
 * 여러 신호를 정책에 따라 하나의 boolean으로 집계
 */
function reduceSignals(signals, policy) {
  const total = signals.length;
  const positives = signals.filter(Boolean).length;

  switch (policy) {
    case "all":
      return positives === total;
    case "majority":
      return positives >= Math.ceil(total / 2);
    case "any":
    default:
      return positives >= 1;
  }
}

/**
 * Promise 타임아웃 유틸
 */
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(timer);
        reject(e);
      });
  });
}
