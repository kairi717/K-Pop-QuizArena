/**
 * 애드블록 사용 여부를 감지하는 함수.
 * 광고처럼 보이는 미끼(bait) 요소를 DOM에 추가한 후,
 * 애드블록에 의해 해당 요소가 숨겨지는지 (offsetHeight === 0) 확인합니다.
 * @returns {Promise<boolean>} 애드블록이 감지되면 true를 반환하는 프로미스.
 */
export default function detectAdBlock() {
  return new Promise((resolve) => {
    const bait = document.createElement('div');
    bait.innerHTML = '&nbsp;';
    // 애드블록이 흔히 차단하는 클래스 이름들을 사용합니다.
    bait.className = 'pub_300x250 pub_300x250m pub_728x90 text-ad text-ads text_ad text_ads text-ad-links';
    bait.style.cssText = 'width: 1px !important; height: 1px !important; position: absolute !important; left: -9999px !important; top: -9999px !important;';

    document.body.appendChild(bait);

    // 브라우저가 렌더링하고 애드블록이 요소를 숨길 시간을 줍니다.
    requestAnimationFrame(() => {
      resolve(bait.offsetHeight === 0);
      document.body.removeChild(bait);
    });
  });
}