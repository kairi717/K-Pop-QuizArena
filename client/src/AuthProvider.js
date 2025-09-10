import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

/**
 * AuthProvider: 앱 전역에서 사용하는 인증 컨텍스트
 *
 * 설계:
 * - 로그인 시 서버에서 받은 access token 을 localStorage에 저장 (key: 'token')
 * - 앱 시작 시 localStorage 에서 token 읽어 사용자 상태 복원
 * - token 만료(exp) 체크 후 자동으로 /api/auth/refresh 호출(백엔드 필요)
 * - 제공되는 값: user, isAuthLoading, login(), logout(), getToken()
 *
 * 보안 주의:
 * - access token을 localStorage에 두면 XSS에 취약합니다. 실 운영에서는 refresh token 을 httpOnly cookie로 두고,
 *   access token은 메모리에서만 관리하거나 short-lived로 사용하는 방식을 권장합니다.
 */

// 토큰을 저장할 localStorage 키
const TOKEN_KEY = "token";

// Context 생성
const AuthContext = createContext(null);

// 유틸: 토큰 decode (minimally, payload만) — 설치된 jwt-decode가 있으면 사용 권장
function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded;
  } catch {
    return null;
  }
}

// Axios 인스턴스: 인증헤더 자동 추가
const api = axios.create({
  baseURL: "/api",
  // 필요한 공용 설정 여기에...
});

// helper: set Authorization header for axios instance
function setAuthHeader(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // 유저 정보 (예: { id, name, email })
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // 내부: 현재 token 가져오기
  const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

  // 내부: token 저장
  const saveToken = (token) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    setAuthHeader(token);
  };

  // 내부: 로그아웃
  const logout = (opts = {}) => {
    saveToken(null);
    setUser(null);
    // 필요시 서버에 로그아웃 API 호출(세션/refresh 삭제)
    if (!opts.silent) {
      // 예: api.post('/auth/logout') ...
    }
  };

  // 내부: 외부에서 직접 인증 상태를 설정하는 함수 (OAuth 콜백용)
  const setAuthData = (token, user) => {
    saveToken(token);
    setUser(user);
  };


  // 로그인 함수: 서버에 로그인 요청 후 토큰 저장
  // serverResponse should include { token, user? }
  const login = async (credentials) => {
    // credentials 예: { email, password } or OAuth code
    const res = await api.post("/auth/login", credentials);
    const { token, user: userFromServer } = res.data;

    if (!token) throw new Error("No token returned from login");

    saveToken(token);
    // 유저 정보가 서버에서 반환되면 사용, 없으면 토큰 페이로드에서 추출
    if (userFromServer) {
      setUser(userFromServer);
    } else {
      const payload = parseJwt(token);
      setUser(payload || null);
    }
    return res.data;
  };

  // 토큰 갱신: 백엔드에 refresh 엔드포인트를 구현해두세요.
  // 권장: refresh token은 httpOnly cookie 로 관리하고, 여기서는 /auth/refresh 를 호출해 새 access token 받기
  const refreshToken = async () => {
    try {
      const res = await api.post("/auth/refresh");
      const { token } = res.data;
      if (token) {
        saveToken(token);
        const payload = parseJwt(token);
        setUser(payload || null);
        return token;
      } else {
        logout({ silent: true });
        return null;
      }
    } catch (e) {
      console.warn("refreshToken failed:", e);
      logout({ silent: true });
      return null;
    }
  };

  // 토큰 만료 확인
  function isTokenExpired(token) {
    if (!token) return true;
    const payload = parseJwt(token);
    if (!payload) return true;
    // exp는 초 단위인 경우가 많음
    const nowSec = Math.floor(Date.now() / 1000);
    // 안전 마진 (예: 60초) — 만료 임박 시 미리 갱신
    const leeway = 60;
    return payload.exp ? payload.exp <= nowSec + leeway : false;
  }

  // 앱 시작 시 초기화: localStorage에서 token 로드하고 필요하면 refresh 시도
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = getToken();
        if (!token) {
          // 토큰 없음 → 비로그인 상태
          setIsAuthLoading(false);
          return;
        }

        // 토큰이 만료되었거나 곧 만료된다면 refresh 시도
        if (isTokenExpired(token)) {
          // refreshToken 함수에서 실패 시 자동 로그아웃 처리
          const newToken = await refreshToken();
          if (!mounted) return;
          if (!newToken) {
            setIsAuthLoading(false);
            return;
          }
        } else {
          // 토큰 유효: axios header 설정 및 user 복원
          setAuthHeader(token);
          const payload = parseJwt(token);
          if (mounted) setUser(payload || null);
        }
      } catch (e) {
        console.error("Auth init error", e);
        logout({ silent: true });
      } finally {
        if (mounted) setIsAuthLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // 빈 deps: 앱 최초 마운트 시 한 번 실행
  }, []);

  // axios 응답 인터셉터: 401 발생 시 자동 refresh 시도
  useEffect(() => {
    const resInterceptor = api.interceptors.response.use(
      (res) => res,
      async (error) => {
        const originalReq = error.config;
        if (
          error.response &&
          error.response.status === 401 &&
          !originalReq._retry
        ) {
          originalReq._retry = true;
          const newToken = await refreshToken();
          if (newToken) {
            originalReq.headers["Authorization"] = `Bearer ${newToken}`;
            return api(originalReq); // 원 요청 재시도
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(resInterceptor);
    };
  }, []);

  // Context value
  const value = {
    user,
    isAuthLoading,
    login,
    logout,
    setAuthData, // OAuth 콜백에서 사용할 수 있도록 노출
    getToken,
    api, // 필요하면 API 인스턴스도 제공
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 커스텀 훅: 컴포넌트에서 사용
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
