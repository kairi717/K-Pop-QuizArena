import React, { useState, useEffect, lazy, Suspense } from 'react';
// react-router-dom에서 필요한 것들을 import
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import axios from 'axios'; // axios import 추가
import detectAdBlockStrong  from './detectAdBlock'; // 애드블록 감지 유틸리티 import
import AdBlockModal from './AdBlockModal'; // 애드블록 모달 import
import { AuthProvider, useAuth } from "./AuthProvider"; // 새로고침해도 로그아웃되지 않는 재사용 가능한 인증

// 페이지 컴포넌트들을 React.lazy를 사용해 import 합니다.
const HomePage = lazy(() => import('./HomePage'));
const ContentPage = lazy(() => import('./ContentPage'));
const LoginPage = lazy(() => import('./LoginPage'));
const MyPage = lazy(() => import('./MyPage'));
const WorldCupPage = lazy(() => import('./WorldCupPage'));
const ResultPage = lazy(() => import('./ResultPage'));
const PrivacyPolicyPage = lazy(() => import('./PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./TermsOfServicePage'));
const GOOGLE_CLIENT_ID = "312445077290-b4kjhscds8brpl8krrloes6gv7pe3m9s.apps.googleusercontent.com";

// 로딩 중에 보여줄 간단한 컴포넌트
const LoadingSpinner = () => (
  <div className="loading-spinner-container">
    <div className="loading-spinner"></div>
  </div>
);

function App() {
  // useState의 초기값 설정 로직은 일단 null로 단순화합니다.
  // (새로고침 시 로그인 유지는 나중에 구현하는 것이 좋습니다.)
  const [user, setUser] = useState(null);

  const [adBlockerDetected, setAdBlockerDetected] = useState(false); // 애드블록 감지 상태 추가
  const [isAuthLoading, setIsAuthLoading] = useState(true); // 인증 로딩 상태 추가
  // 리디렉션 후 인증 코드 처리를 위한 useEffect
useEffect(() => {
  let mounted = true;
  console.log('[App] initialize 시작');
  const checkAdBlocker = async () => {
    console.log('[App] checkAdBlocker 호출');
    try {
      const isBlocked = await detectAdBlockStrong({
        // ✅ 애드센스를 실제로 쓰지 않는 경우에는 반드시 false 유지
        checkAdsbygoogle: false,

        // 실행 부작용 없이 네트워크/프리로드/DOM bait로만 감지
        useScriptLoad: false,

        // 오탐이 거슬리면 'majority'로 조정 가능
        policy: 'any', // 'majority' 추천 옵션

        // 필요 시 URL 커스터마이징 가능
        // adScriptUrl: 'https://static.criteo.net/js/ld/publishertag.prebid.js',
      });

      console.log('[App] detectAdBlockStrong 결과:', isBlocked);
      if (mounted && isBlocked) {
        console.warn('[App] Ad blocker detected.');
        setAdBlockerDetected(true);
      }
    } catch (e) {
      console.error('[App] detectAdBlockStrong 에러:', e);
    }
  };

  // 바로 실행
  checkAdBlocker();

  // Google OAuth Redirect handling
  (async function handleAuthRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setIsAuthLoading(true);
      try {
        window.history.replaceState({}, document.title, "/");
        const res = await axios.post('/api/auth/google', { code });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
      } catch (error) {
        console.error('Authentication failed:', error);
        alert('Login failed. Please try again.');
      } finally {
        setIsAuthLoading(false);
      }
    } else {
      setIsAuthLoading(false);
    }
  })();

  return () => {
    mounted = false;
    console.log('[App] cleanup');
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  
  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  }

  // 인증이 진행 중일 때는 로딩 스피너를 보여줍니다.
  if (isAuthLoading) {
    return <LoadingSpinner /> ;
  }

  // 애드블록이 감지되면, 다른 모든 UI를 렌더링하지 않고 모달만 보여줍니다.
  if (adBlockerDetected) {
    return <AdBlockModal />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div className="App">
          <header className="app-header">
            <Link to="/" className="header-logo-link">
              <h1>🏆 K-Pop Quiz Arena</h1>
            </Link>
            {user && (
              <div className="header-nav">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/mypage" className="nav-link">My</Link>
                <button onClick={handleLogout} className="logout-button">Logout</button>
              </div>
            )}
          </header>
          <main>
            <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* /login 주소로 접속하면 LoginPage를 보여줌 */}
              <Route path="/login" element={
                !user ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />
              } />

              {/* /content/:contentId 주소로 접속하면 ContentPage를 보여줌 */}
              {/* 로그인이 되어있어야만 접근 가능 */}
              <Route path="/content/:contentId" element={
                user ? <ContentPage /> : <Navigate to="/login" />
              } />

              {/* / (메인) 주소로 접속하면 HomePage를 보여줌 */}
              {/* 로그인이 되어있어야만 접근 가능 */}
              <Route path="/" element={
                user ? <HomePage user={user} /> : <Navigate to="/login" />
              } />
              <Route path="/mypage" element={
                user ? <MyPage /> : <Navigate to="/login" />
              } />
               <Route path="/worldcup/:cupId" element={
                user ? <WorldCupPage /> : <Navigate to="/login" />
              } />
                <Route path="/worldcup/results/:cupId" element={
                    user ? <ResultPage /> : <Navigate to="/login" />
              } />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
              
            </Routes>
            </Suspense>            
          </main>
                    <footer className="app-footer">
                      <Link to="/privacy" className="footer-link">Privacy Policy</Link>
                      <span>|</span>
              <Link to="/terms" className="footer-link">Terms of Service</Link>
            <p>K-Pop Quiz Arena is a fan-made project developed for entertainment and portfolio purposes only.</p>
            <p>All image rights belong to their respective agencies:  Big Hit Music, HYBE, JYP Entertainment, YG Entertainment, Pledis Entertainment.</p>
            <p>&copy; {new Date().getFullYear()} K-Quiz Arena. All Rights Reserved.</p>
          </footer>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;