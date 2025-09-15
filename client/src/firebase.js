// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
 
// .env 파일에서 환경 변수를 가져옵니다.
// Firebase 설정 정보를 하드코딩합니다.
// Create React App에서는 변수 이름 앞에 REACT_APP_ 접두사가 필요합니다.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};
 
// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase Analytics 초기화
export const analytics = getAnalytics(app);
 
// Firebase 인증 객체 및 Google 공급자 내보내기
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
