import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { contentList } from './contentData';
import './ResultPage.css';

// 💥 재사용할 컴포넌트들을 import 합니다.
import SkeletonLoader from './SkeletonLoader';
import ErrorDisplay from './ErrorDisplay';

function ResultPage() {
    const { cupId } = useParams();
    const [results, setResults] = useState([]);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // 💥 error state를 null로 초기화

    // fetchData 함수를 fetchResults에서 분리하여 재사용 가능하게 만듭니다.
    const fetchResults = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`/api/worldcup/results?cupId=${cupId}`);
            setResults(res.data.results || []); // 💥 API 응답 객체에서 'results' 배열을 추출합니다.
        } catch (error) {
            console.error("Failed to fetch results", error);
            setError("Failed to load the results. Please try again."); // 💥 에러 메시지 설정
        } finally {
            setLoading(false);
        }
    }, [cupId]);

    useEffect(() => {
        const groupKey = cupId.replace('_member_cup', '').replace('_32_songs', '');
        const cupInfo = contentList.find(c => c.id === groupKey);
        
        if (cupInfo) {
            setTitle(cupInfo.title);
        } else {
            // contentData.js에 정의되지 않은 cupId의 경우를 대비
            const fallbackTitle = cupId.replace(/_/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
            setTitle(fallbackTitle);
        }
        
        fetchResults();
    }, [cupId, fetchResults]);

    const totalVotes = results.reduce((sum, item) => sum + Number(item.votes), 0);

    // --- 👇 렌더링 로직을 수정합니다 ---
    if (loading) {
        return (
            <>
                <Helmet>
                    <title>Loading Results... | K-Pop Quiz Arena</title>
                </Helmet>
                <div className="result-container">
                    <h2>🏆 Final Results 🏆</h2>
                    <p>{title || '...'}</p>
                    <div className="chart-container">
                        {/* 💥 범용 SkeletonLoader를 사용합니다. */}
                        <SkeletonLoader count={5} /> 
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <div className="result-container">
                <ErrorDisplay message={error} onRetry={fetchResults} />
            </div>
        );
    }
    // --- 👆 여기까지 ---

    return (
        <>
            <Helmet>
                <title>Results for {title} | K-Pop Quiz Arena</title>
                <meta name="description" content={`See the final ranking and vote results for the ${title} world cup.`} />
            </Helmet>
            <div className="result-container">
                <h2>🏆 Final Results 🏆</h2>
                <p>{title}</p>
                <div className="chart-container">
                    {results.length > 0 ? results.map((result, index) => {
                        const percentage = totalVotes > 0 ? ((result.votes / totalVotes) * 100).toFixed(1) : 0;
                        const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';
                        return (
                            <div key={result.name || index} className="bar-wrapper">
                                <span className={`participant-name ${rankClass}`}>{index + 1}. {result.participant_name}</span>
                                <div className="bar">
                                    <div 
                                        className="bar-fill" 
                                        style={{ width: `${percentage}%` }}
                                    >
                                        <span className="bar-text">{result.votes} votes ({percentage}%)</span>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : <p>No votes have been cast yet. Be the first!</p>}
                </div>
                <Link to="/" className="home-button">Play Another Game</Link>
            </div>
        </>
    );
}

export default ResultPage;