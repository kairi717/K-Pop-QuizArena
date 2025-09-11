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

  const sendCodeToServer = async (code) => {
    if (!code) {
      console.error("Google 인증 코드를 찾을 수 없습니다.");
      navigate('/login');
      return;
    }
    try {
      // Vercel 배포 환경에서는 프록시 설정이 작동하지 않을 수 있으므로,
      // API의 전체 URL을 명시적으로 지정하는 것이 더 안전합니다.
      // .env 파일에 REACT_APP_API_URL=https://k-pop-quiz-arena.vercel.app 와 같이 설정합니다.
      const apiUrl = process.env.REACT_APP_API_URL || 'https://k-pop-quiz-arena.vercel.app';
      const response = await axios.post(
        `${apiUrl}/api/auth/google`,
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

  useEffect(() => {
    // URL의 쿼리 파라미터에서 'code'를 추출합니다.
    const code = searchParams.get('code');
    console.log("받아온 인증 코드:", code);
    sendCodeToServer(code);
    // sendCodeToServer는 컴포넌트 렌더링 간에 변경되지 않으므로 안전하게 의존성 배열에 추가할 수 있습니다.
  }, [searchParams, sendCodeToServer]);

  // 서버와 통신하는 동안 사용자에게 로딩 중임을 보여줍니다.
  return <LoadingSpinner />;
};

export default GoogleRedirectPage;
