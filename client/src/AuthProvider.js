import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
// 1. Firebase auth 관련 모듈을 import 합니다.
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { signInWithGoogle, logout as firebaseLogout } from "./auth";

/**
 * AuthProvider: 앱 전역에서 사용하는 인증 컨텍스트
 *
 * 설계:
 * - Firebase의 onAuthStateChanged를 사용하여 실시간으로 사용자 인증 상태를 감지합니다.
 * - 앱이 시작될 때 Firebase가 자동으로 로그인 상태를 복원합니다.
 * - 로그인/로그아웃 함수는 auth.js에 정의된 함수를 사용합니다.
 * - 제공되는 값: user, isAuthLoading, login(), logout()
 *
 * 보안 주의:
 * - access token을 localStorage에 두면 XSS에 취약합니다. 실 운영에서는 refresh token 을 httpOnly cookie로 두고,
 *   access token은 메모리에서만 관리하거나 short-lived로 사용하는 방식을 권장합니다.
 */

// 토큰을 저장할 localStorage 키
// const TOKEN_KEY = "token"; // 더 이상 사용하지 않습니다.

// Context 생성
const AuthContext = createContext(null);

// Axios 인스턴스: 인증헤더 자동 추가
const api = axios.create({
  baseURL: "/api",
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Firebase 사용자 객체
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // 2. onAuthStateChanged를 사용하여 Firebase 인증 상태 변화를 감지합니다.
  useEffect(() => {
    // onAuthStateChanged는 구독 해제 함수를 반환합니다.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("Auth state changed. User:", firebaseUser);
      setUser(firebaseUser); // 사용자가 있거나 null로 상태를 업데이트합니다.
      setIsAuthLoading(false); // 인증 상태 확인이 끝났으므로 로딩을 종료합니다.
    });

    // 컴포넌트가 언마운트될 때 구독을 해제하여 메모리 누수를 방지합니다.
    return () => unsubscribe();
  }, []);

  // 3. 로그인/로그아웃 함수를 auth.js의 함수로 교체합니다.
  const login = async () => {
    // signInWithGoogle은 성공 시 user 객체를, 실패 시 에러를 throw합니다.
    return await signInWithGoogle();
  };

  const logout = async () => {
    await firebaseLogout();
  };

  // Context value
  const value = {
    user,
    isAuthLoading,
    login,
    logout,
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
