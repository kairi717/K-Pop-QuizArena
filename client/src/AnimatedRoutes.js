import React, { lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// App.js에서 가져왔던 lazy-loaded 컴포넌트들을 그대로 가져옵니다.
const HomePage = lazy(() => import('./HomePage'));
const ContentPage = lazy(() => import('./ContentPage'));
const LoginPage = lazy(() => import('./LoginPage'));
const MyPage = lazy(() => import('./MyPage'));
const WorldCupPage = lazy(() => import('./WorldCupPage'));
const ResultPage = lazy(() => import('./ResultPage'));
const PrivacyPolicyPage = lazy(() => import('./PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./TermsOfServicePage'));

const pageVariants = {
    initial: {
        opacity: 0,
        x: "-100vw", // 왼쪽 바깥에서 시작
    },
    in: {
        opacity: 1,
        x: 0, // 화면 안으로 들어옴
    },
    out: {
        opacity: 0,
        x: "100vw", // 오른쪽 바깥으로 사라짐
    }
};

const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
};

function AnimatedRoutes({ user, onLoginSuccess }) {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname} // URL 경로가 바뀔 때마다 애니메이션이 트리거됨
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
            >
                <Routes location={location}>
                    <Route path="/login" element={!user ? <LoginPage onLoginSuccess={onLoginSuccess} /> : <Navigate to="/" />} />
                    <Route path="/terms" element={<TermsOfServicePage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/worldcup/results/:cupId" element={user ? <ResultPage /> : <Navigate to="/login" />} />
                    <Route path="/worldcup/:cupId" element={user ? <WorldCupPage /> : <Navigate to="/login" />} />
                    <Route path="/content/:contentId" element={user ? <ContentPage /> : <Navigate to="/login" />} />
                    <Route path="/mypage" element={user ? <MyPage /> : <Navigate to="/login" />} />
                    <Route path="/" element={user ? <HomePage user={user} /> : <Navigate to="/login" />} />
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
}

export default AnimatedRoutes;