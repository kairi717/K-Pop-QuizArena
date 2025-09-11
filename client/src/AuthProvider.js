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
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = parseJwt(token);
        // 토큰이 유효기간이 지났는지 간단히 확인
        if (payload && payload.exp * 1000 > Date.now()) {
          setAuthHeader(token); // axios 헤더 설정
          return payload; // 초기 user 상태를 바로 설정!
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  });

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
  const logout = () => {
    localStorage.removeItem("token");
    setAuthHeader(null);
    setUser(null);
  };

  // GoogleRedirectPage에서 호출될 함수
  const loginWithToken = (token) => {
      try {
          localStorage.setItem("token", token);
          const payload = parseJwt(token);
          if (payload) {
              setAuthHeader(token);
              setUser(payload);
              return true;
          }
          return false;
      } catch (error) {
          return false;
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

  // Context value
  const value = {
    user,
    login,
    logout,
    loginWithToken,
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
