import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { songWorldCupData } from './kpopData';
import { contentList } from './contentData';
import axios from 'axios';
// 1. Firebase auth 객체를 가져옵니다.
import { auth } from './firebase';
import VideoPlayerModal from './VideoPlayerModal';
import './WorldCupPage.css';

function WorldCupPage() {
    const { cupId } = useParams();
    const navigate = useNavigate();
    const [cupTitle, setCupTitle] = useState('');
    const [roundParticipants, setRoundParticipants] = useState([]);
    const [winners, setWinners] = useState([]);
    const [matchIndex, setMatchIndex] = useState(0);
    const [playingVideoId, setPlayingVideoId] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false); // 초기화 완료 여부 상태 추가

    // 1. 컴포넌트 초기화 로직
    useEffect(() => {
        if (isInitialized) return; // 이미 초기화되었다면 다시 실행하지 않음

        const cupInfo = contentList.find(c => c.id === cupId);
        const participantsData = songWorldCupData[cupId];

        if (participantsData && cupInfo) {
            setCupTitle(cupInfo.title);
            setRoundParticipants([...participantsData.participants].sort(() => Math.random() - 0.5));
            setWinners([]);
            setMatchIndex(0);
            setIsInitialized(true); // 초기화 완료!
        } else {
            navigate('/');
        }
    }, [cupId, navigate, isInitialized]);


    // 2. 사용자가 한 명을 선택했을 때의 로직 (가장 큰 변경점)
    const handleSelect = async (selectedWinner) => {
        const newWinners = [...winners, selectedWinner];
        const nextMatchIndex = matchIndex + 1;
        
        // 현재 라운드의 모든 경기가 끝났는지 확인
        if (nextMatchIndex * 2 >= roundParticipants.length) {
            let nextRoundParticipants = [...newWinners];
            // 부전승자 처리
            if (roundParticipants.length % 2 !== 0) {
                nextRoundParticipants.push(roundParticipants[roundParticipants.length - 1]);
            }

            // 최종 우승자 결정 또는 다음 라운드 시작
            if (nextRoundParticipants.length === 1) {
                const finalWinner = nextRoundParticipants[0];
                // 2. 현재 로그인된 사용자 객체를 가져옵니다.
                const user = auth.currentUser;
                if (user) {
                    try {
                        // 3. 사용자로부터 Firebase ID 토큰을 가져옵니다.
                        const token = await user.getIdToken();
                        // 4. API 요청 헤더에 Firebase ID 토큰을 담아 보냅니다.
                        await axios.post('/api/worldcup/vote',
                            { cupId: cupId, winnerName: finalWinner.name },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                    } catch (err) { console.error("Failed to submit vote", err); }
                }
                navigate(`/worldcup/results/${cupId}`);
            } else {
                // 다음 라운드 시작: 관련된 모든 state를 이 함수 안에서 순차적으로 업데이트
                setRoundParticipants(nextRoundParticipants.sort(() => Math.random() - 0.5));
                setWinners([]);
                setMatchIndex(0);
            }
        } else {
            // 다음 경기로 이동
            setWinners(newWinners);
            setMatchIndex(nextMatchIndex);
        }
    };
    
    // ... (비디오 핸들러는 변경 없음) ...
    const handlePlayVideo = (e, videoId) => { e.stopPropagation(); setPlayingVideoId(videoId); };
    const handleCloseVideo = () => { setPlayingVideoId(null); };

    // 로딩 화면
    if (!isInitialized || roundParticipants.length === 0) {
        return <div>Loading World Cup...</div>;
    }

    const participant1 = roundParticipants[matchIndex * 2];
    const participant2 = roundParticipants[matchIndex * 2 + 1];
    
    if (!participant1) {
        // 이 경우는 거의 발생하지 않지만, 만약을 대비한 안전장치
        return <div>Calculating results...</div>;
    }

    const totalParticipants = roundParticipants.length;
        let roundName;
    if (totalParticipants <= 2) {
        roundName = "Final";
    } else if (totalParticipants <= 4) {
        roundName = "Semi-finals";
    } else if (totalParticipants <= 8) {
        roundName = "Quarter-finals";
    } else {
        roundName = `Round of ${totalParticipants}`;
    }

    return (
        <>
            <Helmet>
                <title>{`${cupTitle} | K-Pop Quiz Arena`}</title>
                <meta name="description" content={`Join the ${cupTitle}! Choose your favorite songs from artists like BTS, TWICE, and more. Who will be the final winner?`} />
            </Helmet>        
        <div className="world-cup-container">
            {playingVideoId && <VideoPlayerModal videoId={playingVideoId} onClose={handleCloseVideo} />}
            <h2>{cupTitle}</h2>
            <p className="round-info">{roundName} - Match {matchIndex + 1} of {Math.floor(totalParticipants / 2)}</p>
            <div className="match-container">
                <div className="participant-card" onClick={() => handleSelect(participant1)}>
                    <img src={participant1.img} alt={participant1.name} />
                    <div className="card-title-container">
                        <h3>{participant1.name}</h3>
                        <button className="listen-button" onClick={(e) => handlePlayVideo(e, participant1.videoId)}>
                            Listen 🎵
                        </button>
                    </div>
                </div>
                {participant2 && (
                    <>
                        <div className="vs-text">VS</div>
                        <div className="participant-card" onClick={() => handleSelect(participant2)}>
                            <img src={participant2.img} alt={participant2.name} />
                            <div className="card-title-container">
                                <h3>{participant2.name}</h3>
                                <button className="listen-button" onClick={(e) => handlePlayVideo(e, participant2.videoId)}>
                                    Listen 🎵
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div className="progress-info">
                Winners of this round: {winners.length}
            </div>
        </div>
        </>
    );
}

export default WorldCupPage;