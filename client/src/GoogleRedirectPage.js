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
  const [isProcessing, setIsProcessing] = useState(false); // 💥 요청 처리 중인지 상태를 추적합니다.

  useEffect(() => {
    // URL의 쿼리 파라미터에서 'code'를 추출합니다.
    const code = searchParams.get('code');
    console.log("받아온 인증 코드:", code);

    // 💥 이미 처리 중이거나 코드가 없으면 아무것도 하지 않습니다.
    if (isProcessing || !code) return;

    // 코드가 존재하는 경우에만 서버로 요청을 보냅니다.
    const sendCodeToServer = async () => {
      const sendCodeToServer = async () => {
        try {
          // 벡엔드 서버의 주소입니다. 실제 주소로 변경해주세요.
          const response = await axios.get('/api/auth/google', {params: { code }});

          // 서버로부터 JWT 토큰과 사용자 정보를 받습니다.
          const { token, user } = response.data;

          setAuthData(token, user);
          navigate('/');

          /*
          // AuthProvider의 setAuthData 함수를 호출해 앱의 로그인 상태를 직접 설정합니다.
          setAuthData(token, user);

          // 로그인이 성공했으므로 홈페이지로 이동시킵니다.
          navigate('/');
          */

        } catch (error) {
          console.error('Google 로그인 서버 인증 실패:', error);
          // 실패 시 로그인 페이지로 다시 이동시킵니다.
          navigate('/login');
        }
      };
      
      setIsProcessing(true); // 💥 요청 시작을 표시합니다.
      await sendCodeToServer();
    };

    sendCodeToServer();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, navigate, setAuthData, isProcessing]); // 의존성 배열에 필요한 값들을 추가합니다.

  // 서버와 통신하는 동안 사용자에게 로딩 중임을 보여줍니다.
  return <LoadingSpinner />;
};

export default GoogleRedirectPage;