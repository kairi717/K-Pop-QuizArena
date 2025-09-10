// --- START OF FILE GoogleRedirectPage.js (새 파일) ---

import React, { useEffect } from 'react';
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

    // 코드가 존재하는 경우에만 서버로 요청을 보냅니다.
    if (code) {
      const sendCodeToServer = async () => {
        try {
          // 벡엔드 서버의 주소입니다. 실제 주소로 변경해주세요.
          // 예: 'https://api.yourdomain.com/auth/google'
          // const response = await axios.post('/api/auth/google', { code });
          // const response = await axios.post('http://localhost:5001/api/auth/google', { code }) 개발용
          const response = await axios.post('http://localhost:5001/api/auth/google', { code })
          // 서버로부터 JWT 토큰과 사용자 정보를 받습니다.
          const { token, user } = response.data;

          // AuthProvider의 setAuthData 함수를 호출해 앱의 로그인 상태를 직접 설정합니다.
          setAuthData(token, user);

          // 로그인이 성공했으므로 홈페이지로 이동시킵니다.
          navigate('/');

        } catch (error) {
          console.error('Google 로그인 서버 인증 실패:', error);
          // 실패 시 로그인 페이지로 다시 이동시킵니다.
          navigate('/login');
        }
      };
      
      sendCodeToServer();
    } else {
      // URL에 'code'가 없는 비정상적인 접근일 경우
      console.error("Google 인증 코드를 찾을 수 없습니다.");
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 이 useEffect는 컴포넌트가 처음 마운트될 때 한 번만 실행되어야 합니다.

  // 서버와 통신하는 동안 사용자에게 로딩 중임을 보여줍니다.
  return <LoadingSpinner />;
};

export default GoogleRedirectPage;