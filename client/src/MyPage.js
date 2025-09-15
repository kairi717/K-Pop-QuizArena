import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
// 1. useAuth 훅을 import 합니다.
import { useAuth } from './AuthProvider';
import './MyPage.css';
import ErrorDisplay from './ErrorDisplay';

// MyPage 전용 스켈레톤 로더
const MyPageSkeleton = () => (
    <div className="mypage-container">
        <div className="profile-card">
            <div className="skeleton-avatar profile-picture"></div>
            <div className="skeleton-text skeleton-h2" style={{ width: '40%', height: '2.2em', margin: '20px 0 10px 0' }}></div>
            <div className="skeleton-text skeleton-p" style={{ width: '60%' }}></div>
        </div>
        <div className="stats-grid">
            <div className="stat-card skeleton-card"></div>
            <div className="stat-card skeleton-card"></div>
            <div className="stat-card skeleton-card"></div>
        </div>
        <div className="history-card">
            <h3>Points History</h3>
            <div className="skeleton-wrapper"><div className="skeleton-text-group"><div className="skeleton-text skeleton-title"></div></div></div>
            <div className="skeleton-wrapper"><div className="skeleton-text-group"><div className="skeleton-text skeleton-title"></div></div></div>
        </div>
    </div>
);

function MyPage() {
    const { user: authUser } = useAuth(); // 2. AuthProvider의 user를 authUser로 받습니다.
    const [userInfo, setUserInfo] = useState(null); // DB에서 가져온 사용자 정보를 저장할 상태
    const [history, setHistory] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [myStats, setMyStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async (token) => {
        setLoading(true);
        setError('');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            // 3. 4개의 API를 동시에 요청합니다.
            const [userRes, historyRes, rankRes, statsRes] = await Promise.all([
                axios.get('/api/user/me', { headers }),
                axios.get('/api/user/point-history', { headers }),
                axios.get('/api/ranking/my-weekly-rank', { headers }),
                axios.get('/api/user/my-stats', { headers })
            ]);
            
            setUserInfo(userRes.data);
            setHistory(historyRes.data);
            setMyRank(rankRes.data);
            setMyStats(statsRes.data);
        } catch (err) {
            setError('Something went wrong while loading data.');
            console.error("MyPage data fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authUser) {
            authUser.getIdToken().then(token => {
                fetchData(token);
            }).catch(err => {
                setError('Could not authenticate. Please log in again.');
                setLoading(false);
            });
        }
    }, [authUser, fetchData]);

    if (loading) return <MyPageSkeleton />;
    if (error) return <ErrorDisplay message={error} onRetry={fetchData} />;
    if (!userInfo) return <div>We couldn’t find your user information.</div>;

    return (
        <>
            <Helmet>
                <title>My Page | K-Pop Quiz Arena</title>
                <meta name="description" content={`Check your profile, total points, and point history on your personal page in K-Pop Quiz Arena.`} />
            </Helmet>        
            <div className="mypage-container">
                <div className="profile-card">
                    <img src={userInfo.picture_url} alt="profile" className="profile-picture" />
                    <h2 className="profile-nickname">{userInfo.nickname}</h2>
                    <p className="profile-email">{userInfo.email}</p>
                </div>

                {/* --- 👇 통계 섹션 새로 추가 --- */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <h4>Weekly Rank</h4>
                        <p className="stat-value">{myRank?.rank || 'N/A'}</p>
                    </div>
                    <div className="stat-card">
                        <h4>Total Score</h4>
                        <p className="stat-value">{myStats?.total_score || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h4>Quizzes Completed</h4>
                        <p className="stat-value">{myStats?.quizzes_completed || 0}</p>
                    </div>
                </div>
                {/* --- 👆 여기까지 --- */}

                <div className="history-card">
                    <h3>Reward Points History</h3>
                    <p className="total-points">Total Points: <span>{userInfo.points} P</span></p>
                    <ul className="history-list">
                        {history.length > 0 ? (
                            history.map((item, index) => (
                                <li key={index} className="history-item">
                                    <div className="history-details">
                                        <span className="history-reason">{item.reason}</span>
                                        <span className="history-date">
                                            {new Date(item.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <span className={`history-points ${item.points_change > 0 ? 'positive' : ''}`}>
                                        {item.points_change > 0 ? '+' : ''}{item.points_change} P
                                    </span>
                                </li>
                            ))
                        ) : (
                            <p>You have no points history yet.</p>
                        )}
                    </ul>
                </div>
            </div>
        </>
    );
}

export default MyPage;