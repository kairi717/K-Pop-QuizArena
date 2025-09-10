import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
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
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [myStats, setMyStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) { /* ... */ return; }
        const headers = { Authorization: `Bearer ${token}` };

        try {
            // 이제 4개의 API를 동시에 요청합니다.
            const [userRes, historyRes, rankRes, statsRes] = await Promise.all([
                axios.get('/api/user/me', { headers }),
                axios.get('/api/user/point-history', { headers }),
                axios.get('/api/ranking/my-weekly-rank', { headers }),
                axios.get('/api/user/my-stats', { headers })
            ]);
            
            setUser(userRes.data);
            setHistory(historyRes.data);
            setMyRank(rankRes.data);
            setMyStats(statsRes.data);
        } catch (err) {
            setError('Something went wrong while loading data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <MyPageSkeleton />;
    if (error) return <ErrorDisplay message={error} onRetry={fetchData} />;
    if (!user) return <div>We couldn’t find your user information.</div>;

    return (
        <>
            <Helmet>
                <title>My Page | K-Pop Quiz Arena</title>
                <meta name="description" content={`Check your profile, total points, and point history on your personal page in K-Pop Quiz Arena.`} />
            </Helmet>        
            <div className="mypage-container">
                <div className="profile-card">
                    <img src={user.picture_url} alt="profile" className="profile-picture" />
                    <h2 className="profile-nickname">{user.nickname}</h2>
                    <p className="profile-email">{user.email}</p>
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
                    <p className="total-points">Total Points: <span>{user.points} P</span></p>
                    <ul className="history-list">
                        {history.length > 0 ? (
                            history.map((item, index) => (
                                <li key={index} className="history-item">
                                    {/* ... 기존 history item JSX ... */}
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