import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async'; 
import './QuizPage.css';
import AdModal from './AdModal';
// 1. useAuth 훅을 import 합니다.
import { useAuth } from './AuthProvider';

// 퀴즈 데이터 파일들을 import 합니다.
import blackpinkQuizData from './quizData/blackpinkQuizData.json';
import btsQuizData from './quizData/btsQuizData.json';
import twiceQuizData from './quizData/twiceQuizData.json';
import seventeenQuizData from './quizData/seventeenQuizData.json';

// 모든 퀴즈 데이터를 하나의 객체로 묶어서 관리합니다.
const allQuizData = {
    'blackpink-quiz': { title: 'BLACKPINK Ultimate Quiz', data: blackpinkQuizData },
    'bts-quiz': { title: 'BTS ARMY Challenge', data: btsQuizData },
    'twice-quiz': { title: 'TWICE ONCE Challenge', data: twiceQuizData },
    'seventeen-quiz': { title: 'SEVENTEEN CARAT Challenge', data: seventeenQuizData },
};

// 퀴즈 제한 시간을 상수로 관리하여 유지보수를 쉽게 합니다.
const QUIZ_TIME_LIMIT = 10;

// --- 사운드 재생 헬퍼 함수---
const playSound = (soundFile) => {
    try {
        // public 폴더에 있는 파일은 / 로 바로 접근 가능합니다.
        const audio = new Audio(`/${soundFile}`);
        audio.play();
    } catch (e) {
        console.error("Could not play sound:", e);
    }
};

function QuizPage({ quizId }) {
    // 퀴즈의 여러 상태들을 관리합니다.
    const [difficulty, setDifficulty] = useState(null); // 선택된 난이도
    const [questions, setQuestions] = useState([]); // 현재 퀴즈의 질문 목록
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // 현재 문제 번호
    const [score, setScore] = useState(0); // 현재 점수
    const [showResults, setShowResults] = useState(false); // 결과 화면 표시 여부
    const [selectedOption, setSelectedOption] = useState(null); // 사용자가 선택한 답
    const [isAnswered, setIsAnswered] = useState(false); // 현재 문제의 정답을 선택했는지 여부
    const [timer, setTimer] = useState(QUIZ_TIME_LIMIT); // 남은 시간
    const [showAd, setShowAd] = useState(false); // 광고 모달 표시 여부
    const [ranking, setRanking] = useState([]); // 랭킹 데이터
    const { user: authUser } = useAuth(); // 2. AuthProvider로부터 사용자 정보를 가져옵니다.

    const quizInfo = allQuizData[quizId];

    // 랭킹 조회 함수
    const fetchRanking = useCallback(async () => {
        try {
            const res = await axios.get(`/api/quiz/ranking?quizId=${quizId}`);
            setRanking(res.data.ranking || []); // 💥 API 응답 객체에서 'ranking' 배열을 추출합니다.
        } catch (error) {
            console.error("Failed to fetch ranking", error);
        }
    }, [quizId]);

    // 점수 제출 함수
    const submitScoreToServer = useCallback(async () => {
        // 3. authUser가 없으면 함수를 종료합니다.
        if (!authUser) return;

        try {
            // 4. authUser로부터 최신 ID 토큰을 비동기적으로 가져옵니다.
            const token = await authUser.getIdToken();
            console.log(`Submitting score: quizId=${quizId}, score=${score}`);
            const response = await axios.post('/api/quiz/submit-score', { quizId, score }, {
  headers: { Authorization: `Bearer ${token}` }
});
            if (response.data.success) {
                // 점수 제출 성공 시에만 랭킹을 다시 불러옵니다.
                await fetchRanking();
            }
        } catch (error) {
            console.error("Failed to submit score", error);
        }
    }, [quizId, score, fetchRanking, authUser]); // 5. 의존성 배열에 authUser를 추가합니다.

        // 퀴즈 종료를 처리하는 useEffect
    useEffect(() => {
        // showResults가 true로 바뀌었을 때만 이 로직을 실행합니다.
        if (showResults) {
            submitScoreToServer();
            // setShowAd(true); // 광고 로직은 필요시 활성화
        }
    }, [showResults, submitScoreToServer]);

    // 정답 선택 핸들러
    const handleOptionSelect = (option) => {
        if (isAnswered) return;
        setIsAnswered(true);
        setSelectedOption(option);
        
        if (questions[currentQuestionIndex] && option === questions[currentQuestionIndex].answer) {
            setScore(prev => prev + 10);
            playSound('sounds/correct.mp3');
        } else {
            playSound('sounds/wrong.mp3');
        }

        setTimeout(() => {
            const nextQuestionIndex = currentQuestionIndex + 1;
            if (nextQuestionIndex < questions.length) {
                setCurrentQuestionIndex(nextQuestionIndex);
                setSelectedOption(null);
                setIsAnswered(false);
                setTimer(QUIZ_TIME_LIMIT);
            } else {
                setShowResults(true);
            }
        }, 1500);
    };  

    // 다음 문제로 넘어가거나 결과를 보여주는 핵심 로직 함수
    const moveToNextStep = useCallback(async () => {
        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < questions.length) {
            setCurrentQuestionIndex(nextQuestionIndex);
            setSelectedOption(null);
            setIsAnswered(false);
            setTimer(QUIZ_TIME_LIMIT);
        } else {
            await submitScoreToServer(); // 퀴즈가 끝나면 바로 점수 제출!
            setShowResults(true); // 퀴즈 결과 보여주기
            // 문제 완료시 AdModal 띄우기 해제
            // setShowAd(true);
        }
    }, [currentQuestionIndex, questions.length, submitScoreToServer]);

    // 타이머 로직
    useEffect(() => {
        if (isAnswered || showResults || !difficulty) return;

        if (timer === 0) {
            handleOptionSelect(null);
            return;
        }
        const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [timer, isAnswered, showResults, difficulty]);



    // 난이도 선택 핸들러
    const handleDifficultySelect = (level) => {
        setDifficulty(level);
    };

    // 난이도가 선택되면, 해당 난이도의 질문들을 준비합니다.
    useEffect(() => {
        if (difficulty && quizInfo) {
            const shuffledQuestions = [...quizInfo.data[difficulty]].sort(() => Math.random() - 0.5);
            setQuestions(shuffledQuestions.slice(0, 10));
            
            // 퀴즈 시작 상태 초기화
            setCurrentQuestionIndex(0);
            setScore(0);
            setShowResults(false);
            setSelectedOption(null);
            setIsAnswered(false);
            setTimer(QUIZ_TIME_LIMIT);
        }
    }, [difficulty, quizInfo]);

    // 리포트 버튼 핸들러
    const handleReport = () => {
        const question = questions[currentQuestionIndex];
        if (!question) return;

        const subject = `[K-Quiz Arena] Quiz Report - ${quizId} (${difficulty})`;
        const body = `Hello, I'd like to report an issue with the following quiz question:\n--------------------------------\nQuiz: ${quizInfo.title}\nDifficulty: ${difficulty}\nQuestion: "${question.question}"\nOptions: ${question.options.join(', ')}\nCorrect Answer on file: ${question.answer}\n--------------------------------\n\n[Please describe the issue here]\n\nThank you.`;
        window.location.href = `mailto:ms1324@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };




    useEffect(() => {
        fetchRanking();
    }, [fetchRanking]);
    
    const handleCloseAd = (pointsAwarded) => {
        setShowAd(false);
    };

    // 1. 난이도 선택 화면 렌더링
    if (!difficulty) {
        if (!quizInfo || !quizInfo.data) {
             return <div className="quiz-container">Quiz data for '{quizId}' not found. Please check the data files.</div>
        }
        return (
            <div className="quiz-container difficulty-selector">
                <h2>{quizInfo.title}</h2>
                <p>Select a difficulty level to start!</p>
                <div className="difficulty-buttons">
                    <button onClick={() => handleDifficultySelect('easy')}>Easy</button>
                    <button onClick={() => handleDifficultySelect('medium')}>Medium</button>
                    <button onClick={() => handleDifficultySelect('hard')}>Hard</button>
                </div>
            </div>
        );
    }

    // 2. 결과 화면 렌더링
    if (showResults) {
        return (
            <div className="quiz-container">
                {/* AdModal 띄우기 주석처리
                {showAd && 
                    <AdModal 
                        pointsToAward={5}
                        onClose={handleCloseAd}
                        contentType="quiz_complete"
                    />
                }
                    여기까지 */}
                <div style={{ filter: showAd ? 'blur(5px)' : 'none' }}>
                    <h2>Quiz Results</h2>
                    <div className="results-score">Your Final Score: <span>{score}</span></div>
                    <h3>🏆 Top 10 Ranking</h3>
                    <ol className="ranking-list">
                        {ranking.length > 0 ? ranking.map((rank, index) => (
                            <li key={index}>
                                <img src={rank.picture_url} alt={rank.nickname} />
                                <span className="rank-name">{rank.nickname}</span>
                                <span className="rank-score">{rank.score} pts</span>
                            </li>
                        )) : <p>Be the first to set a record!</p>}
                    </ol>
                </div>
            </div>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
        return <div>Loading questions...</div>;
    }

    // 3. 퀴즈 진행 화면 렌더링
    return (
        <>
            <Helmet>
                {/* 퀴즈 제목을 동적으로 title에 포함 */}
                <title>{`${quizInfo.title} | K-Pop Quiz Arena`}</title>
                <meta name="description" content={`Take the ${quizInfo.title} and test your knowledge. Can you get a perfect score?`} />
            </Helmet>
        <div className="quiz-container">
            <h2>{quizInfo.title} - <span className="difficulty-text">{difficulty}</span></h2>
            <div className="question-container">
                <div className="quiz-header">
                    <p className="question-number">Question {currentQuestionIndex + 1}/{questions.length}</p>
                    <div className="timer">⏳ {timer}s</div>
                </div>
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                </div>
                <p className="question-text">{currentQuestion.question}</p>
                <div className="options-grid">
                    {currentQuestion.options.map((option, index) => {
                        let buttonClass = "option-button";
                        if (isAnswered) {
                            if (option === currentQuestion.answer) {
                                buttonClass += " correct";
                            } else if (option === selectedOption) {
                                buttonClass += " incorrect";
                            }
                        }
                        return (
                            <button key={index} className={buttonClass} onClick={() => handleOptionSelect(option)} disabled={isAnswered}>
                                {option}
                            </button>
                        );
                    })}
                </div>
                <div className="quiz-footer">
                    <div className="score">Score: {score}</div>
                    <button className="report-button" onClick={handleReport}>Report Issue</button>
                </div>
            </div>
        </div>
        </>
    );
}

export default QuizPage;