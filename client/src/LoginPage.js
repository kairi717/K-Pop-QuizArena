import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';

function LoginPage({ onLoginSuccess }) {
    const login = useGoogleLogin({
        flow: 'auth-code',
        ux_mode: 'redirect',
        // 환경 변수가 불안정할 수 있으므로, 배포 환경에서는 리디렉션 URI를 명시적으로 지정하는 것이 가장 안전합니다.
        // 로컬 개발 시에는 아래 주석을, 배포 시에는 실제 주소를 사용하세요.
        // redirect_uri: 'http://localhost:3000/auth/google/callback', // 개발용
        redirect_uri: 'https://k-pop-quiz-arena.vercel.app/api/auth/google', // 배포용
    });

    return (
        <div className="login-container">
            <h2>Are you the Ultimate K-Pop Fan?</h2>
            <p>Prove your knowledge, climb the ranks, and get rewarded!</p>
            <button onClick={() => login()} className="google-login-button">
                Sign in with Google
            </button>
        </div>
    );
}

export default LoginPage;