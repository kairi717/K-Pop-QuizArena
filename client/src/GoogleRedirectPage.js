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
        // Vercel 배포 환경에서는 프록시 설정이 작동하지 않을 수 있으므로,
        // API의 전체 URL을 명시적으로 지정하는 것이 더 안전합니다.
        const response = await axios.post(
          'https://k-pop-quiz-arena.vercel.app/api/auth/google',
          { code }
        );

        // 서버로부터 JWT 토큰과 사용자 정보를 받습니다.
        const { token, user } = response.data;

        // AuthProvider의 setAuthData 함수를 호출해 앱의 로그인 상태를 직접 설정합니다.
        setAuthData(token, user);

        // 페이지 이동은 App.js의 useEffect가 담당하므로 여기서는 호출하지 않습니다.
} catch (error) {
  if (error.response) {
    // 서버가 응답을 준 경우 (status code 4xx, 5xx)
    console.error('🔴 서버 응답 에러:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers,
    });
  } else if (error.request) {
    // 요청은 보냈는데 응답이 안 온 경우
    console.error('🟠 요청 보냈지만 응답 없음:', error.request);
  } else {
    // 요청 설정 중 에러
    console.error('⚠️ 요청 설정 에러:', error.message);
  }
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
