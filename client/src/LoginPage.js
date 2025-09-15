import React from 'react';
// 1. AuthProvider의 useAuth 훅을 import 합니다.
import { useAuth } from './AuthProvider';

function LoginPage() {
    // 2. useAuth 훅에서 login 함수를 가져옵니다.
    const { login } = useAuth();

    // 2. 로그인 버튼 클릭 시 실행될 핸들러 함수입니다.
    const handleLogin = async () => {
        try {
            // AuthProvider의 login 함수를 호출합니다.
            // 성공 시 onAuthStateChanged가 상태를 업데이트하고 App.js가 리디렉션합니다.
            await login();
        } catch (error) {
            // 사용자가 팝업을 닫거나 다른 에러가 발생한 경우를 처리할 수 있습니다.
            alert('로그인에 실패했습니다. 다시 시도해주세요.');
        }
    };

    return (
        <div className="login-container">
            <h2>Are you the Ultimate K-Pop Fan?</h2>
            <p>Prove your knowledge, climb the ranks, and get rewarded!</p>
            {/* 3. 버튼 클릭 시 handleLogin 함수를 호출합니다. */}
            <button onClick={handleLogin} className="google-login-button">
                Sign in with Google
            </button>
        </div>
    );
}

export default LoginPage;