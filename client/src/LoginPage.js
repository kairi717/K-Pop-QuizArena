import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';

function LoginPage({ onLoginSuccess }) {
    const login = useGoogleLogin({
        flow: 'auth-code',
        ux_mode: 'redirect',
        // 로그인 후 코드를 처리할 전용 페이지의 전체 주소를 입력합니다.
        // redirect_uri: 'http://localhost:3000/auth/google/callback', // 개발용
        // redirect_uri: 'https://k-pop-quiz-arena.vercel.app/auth/google/callback', // 배포용
        redirect_uri: 'https://k-pop-quiz-arena.vercel.app/api/auth/google', 
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