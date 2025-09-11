import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthProvider'; // AuthProvider에서 만든 useAuth 훅을 사용합니다.

const LoadingSpinner = () => (
    <div className="loading-spinner-container"><div className="loading-spinner"></div></div>
);

const GoogleRedirectPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthData } = useAuth(); // AuthProvider의 setAuthData 함수를 가져옵니다.

  useEffect(() => {
    // URL의 쿼리 파라미터에서 'code'를 추출합니다.
    const code = searchParams.get('code');
    console.log("받아온 인증 코드:", code);

    const sendCodeToServer = async () => {
      if (!code) return; // 코드가 없으면 아무것도 하지 않습니다.
      try {
        // 벡엔드 서버의 주소입니다.
        const response = await axios.get('/api/auth/google', { params: { code } });

        // 서버로부터 JWT 토큰과 사용자 정보를 받습니다.
        const { token, user } = response.data;

        // AuthProvider의 setAuthData 함수를 호출해 앱의 로그인 상태를 직접 설정합니다.
        setAuthData(token, user);

        // 페이지 이동은 App.js의 useEffect가 담당하므로 여기서는 호출하지 않습니다.
      } catch (error) {
        console.error('Google 로그인 서버 인증 실패:', error);
        // 실패 시 로그인 페이지로 다시 이동시킵니다.
        navigate('/login');
      }
    };

    sendCodeToServer();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 이 효과는 컴포넌트가 처음 마운트될 때 한 번만 실행되어야 합니다.

  // 서버와 통신하는 동안 사용자에게 로딩 중임을 보여줍니다.
  return <LoadingSpinner />;
};

export default GoogleRedirectPage;