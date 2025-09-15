import React, { useState, useEffect} from 'react'; 
import axios from 'axios';
import './Ranking.css';
// 1. useAuth 훅을 import하여 인증 상태와 토큰을 가져옵니다.
import { useAuth } from './AuthProvider';
import SkeletonLoader from './SkeletonLoader';
import ErrorDisplay from './ErrorDisplay';

function Ranking() {

    const [weeklyRankers, setWeeklyRankers] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth(); // 2. AuthProvider로부터 현재 사용자 정보를 가져옵니다.
    
    // 💥 useEffect 안에서 모든 비동기 로직을 처리합니다.
    useEffect(() => {
        let isMounted = true; // 1. 컴포넌트 마운트 상태 추적

        // API를 호출하는 함수
        const fetchRankings = async () => {
            setLoading(true);
            setError(null);

            let token = null;
            if (user) {
                try {
                    token = await user.getIdToken();
                } catch (e) {
                    console.error("Error getting ID token", e);
                }
            }

            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            try {
                const [weeklyRes, myRankRes] = await Promise.all([
                    axios.get('/api/ranking/weekly', { headers }), // 랭킹 조회에도 인증 헤더를 추가합니다.
                    token ? axios.get('/api/ranking/my-weekly-rank', { headers }) : Promise.resolve(null)
                ]);
                
                // 2. 컴포넌트가 여전히 마운트된 상태일 때만 state를 업데이트
                if (isMounted) {
                    setWeeklyRankers(weeklyRes.data.rankers || []); // 3. API 응답 구조에 맞게 수정합니다.
                    if (myRankRes) {
                        setMyRank(myRankRes.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch rankings", error);
                if (isMounted) {
                    if (error.response && error.response.status === 429) {
                        setError("You're making too many requests. Please wait a moment and try again.");
                    } else {
                        setError("Could not load rankings. Please try again later.");
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };


        fetchRankings();

        // 3. Cleanup 함수: 컴포넌트가 unmount되면 isMounted를 false로 설정
        return () => {
            isMounted = false;
        };

    }, [user]); // 4. user 객체가 변경될 때마다 랭킹을 다시 불러옵니다.


    if (loading) {
        return (
            <div className="ranking-container">
                <div className="ranking-header"><h3>🏆 Weekly Top Rankers</h3></div>
                <SkeletonLoader count={5} />
            </div>
        );
    }

    if (error) {
        // 'Try Again' 버튼을 누르면, 페이지 전체를 새로고침하는 함수를 전달합니다.
        const handleRetry = () => window.location.reload();
        
        return (
            <div className="ranking-container">
                <ErrorDisplay message={error} onRetry={handleRetry} />
            </div>
        );
    }

    return (
        <div className="ranking-container">
            <div className="ranking-header">
                <h3>🏆 Weekly Top Rankers</h3>
            </div>
            <ol className="ranker-list">
                {weeklyRankers.length > 0 ? weeklyRankers.map((ranker, index) => {
                    let rankIcon = '';
                    if (index === 0) rankIcon = '🥇';
                    else if (index === 1) rankIcon = '🥈';
                    else if (index === 2) rankIcon = '🥉';

                    return (
                        <li key={ranker.user_id}>
                            <span className="rank-number">{rankIcon || index + 1}</span>
                            <img src={ranker.picture_url} alt={ranker.nickname} className="ranker-avatar" />
                            <span className="ranker-name">{ranker.nickname}</span>
                            <span className="ranker-score">{ranker.weekly_score} pts</span>
                        </li>
                    );
                }) : <p className="no-rankers">No rankers this week. Be the first!</p>}
            </ol>
            {myRank && (
                <div className="my-rank-strip">
                    <span>My Weekly Rank: <strong>{myRank.rank}</strong></span>
                    <span>Score: <strong>{myRank.weekly_score} pts</strong></span>
                </div>
            )}
        </div>
    );

}
    

export default Ranking;
