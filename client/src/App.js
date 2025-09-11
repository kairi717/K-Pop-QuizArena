import React, { useState, useEffect, lazy, Suspense } from 'react';
// --- 👇 1. 애니메이션에 필요한 useLocation을 import 합니다 ---
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
// --- 👇 2. Framer Motion을 import 합니다 ---
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import detectAdBlockStrong from './detectAdBlock';
import AdBlockModal from './AdBlockModal';
import { AuthProvider, useAuth } from "./AuthProvider";

const HomePage = lazy(() => import('./HomePage'));
const ContentPage = lazy(() => import('./ContentPage'));
const LoginPage = lazy(() => import('./LoginPage'));
const MyPage = lazy(() => import('./MyPage'));
const WorldCupPage = lazy(() => import('./WorldCupPage'));
const ResultPage = lazy(() => import('./ResultPage'));
const PrivacyPolicyPage = lazy(() => import('./PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./TermsOfServicePage'));
const GoogleRedirectPage = lazy(() => import('./GoogleRedirectPage'));

const GOOGLE_CLIENT_ID = "312445077290-b4kjhscds8brpl8krrloes6gv7pe3m9s.apps.googleusercontent.com";

const LoadingSpinner = () => (
    <div className="loading-spinner-container"><div className="loading-spinner"></div></div>
);

// --- 👇 3. 기존 Routes 부분을 별도의 AnimatedRoutes 컴포넌트로 분리합니다 ---
function AnimatedRoutes() {
    const { user } = useAuth(); // Auth 훅을 여기서도 사용하여 user 정보를 가져옵니다.
    const location = useLocation();

    // 애니메이션 효과 정의
    const pageVariants = {
        initial: { opacity: 0, x: "-200px" },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: "200px" }
    };

    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.5
    };

    return (
        <AnimatePresence mode="wait">
            {/* Suspense를 AnimatePresence 바로 안쪽으로 이동시킵니다. */}
            <Suspense fallback={<LoadingSpinner />}>
                <motion.div
                    key={location.pathname}
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                >
                    <Routes location={location}>
                        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
                        <Route path="/content/:contentId" element={user ? <ContentPage /> : <Navigate to="/login" />} />
                        <Route path="/" element={user ? <HomePage user={user} /> : <Navigate to="/login" />} />
                        <Route path="/mypage" element={user ? <MyPage /> : <Navigate to="/login" />} />
                        <Route path="/worldcup/:cupId" element={user ? <WorldCupPage /> : <Navigate to="/login" />} />
                        <Route path="/worldcup/results/:cupId" element={user ? <ResultPage /> : <Navigate to="/login" />} />
                        <Route path="/privacy" element={<PrivacyPolicyPage />} />
                        <Route path="/terms" element={<TermsOfServicePage />} />
                        <Route path="/auth/google/callback" element={<GoogleRedirectPage />} />
                    </Routes>
                </motion.div>
            </Suspense>
        </AnimatePresence>
    );
}


function AppContent() {
    const { user, isAuthLoading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [adBlockerDetected, setAdBlockerDetected] = useState(false);

    useEffect(() => {
        // ... 기존 애드블록 감지 로직은 그대로 둡니다 ...
    }, []);

    // user 상태가 변경될 때마다 실행됩니다.
    useEffect(() => {
        // 사용자가 로그인되었고, 현재 페이지가 로그인 관련 페이지라면 홈페이지로 리디렉션합니다.
        if (user && (location.pathname === '/login' || location.pathname === '/auth/google/callback')) {
            navigate('/');
        }
    }, [user, navigate, location.pathname]);

    if (isAuthLoading) return <LoadingSpinner />;
    if (adBlockerDetected) return <AdBlockModal />;

    return (
        <div className="App">
            <header className="app-header">
                <Link to="/" className="header-logo-link">
                    <h1>🏆 K-Pop Quiz Arena</h1>
                </Link>
                {user && (
                    <div className="header-nav">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/mypage" className="nav-link">My</Link>
                        <button onClick={logout} className="logout-button">Logout</button>
                    </div>
                )}
            </header>

            <main className="app-main">
                {/* --- 👇 4. 기존 Routes 부분을 AnimatedRoutes 컴포넌트로 교체합니다 --- */}
                <AnimatedRoutes />
            </main>

            <footer className="app-footer">
                {/* ... 푸터 JSX는 그대로 둡니다 ... */}
            </footer>
        </div>
    );
}

// --- 👇 5. 최상위 App 컴포넌트는 Router를 포함하도록 변경합니다 ---
export default function App() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthProvider>
                {/* Router를 여기에 배치하여 useLocation Hook이 작동하도록 합니다. */}
                {/* AppContent 내부에서 navigate를 사용하기 위해 Router가 AppContent를 감싸야 합니다. */}
                <Router>
                    <AppContent />
                </Router>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}