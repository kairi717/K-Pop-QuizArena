// client/src/auth.js
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

/**
 * Google 계정으로 Firebase에 로그인하는 팝업을 띄웁니다.
 * @returns {Promise<import("firebase/auth").User>} 성공 시 Firebase 사용자 객체를 반환합니다.
 * @throws {Error} 로그인 실패 시 에러를 발생시킵니다.
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("✅ Google 로그인 성공:", result.user);
    return result.user;
  } catch (error) {
    console.error("🔴 Google 로그인 실패:", error);
    // 에러를 다시 던져서 호출한 컴포넌트에서 처리할 수 있도록 합니다.
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
  console.log("✅ 로그아웃 성공");
};