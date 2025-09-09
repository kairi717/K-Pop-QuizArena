import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './QuizPage.css';
import AdModal from './AdModal';

// 1. JSON 파일에서 퀴즈 데이터를 직접 import 합니다.
import blackpinkQuizData from './quizData/blackpinkQuizData.json';
import btsQuizData from './quizData/btsQuizData.json';
import twiceQuizData from './quizData/twiceQuizData.json';
import seventeenQuizData from './quizData/seventeenQuizData.json';

// 2. 모든 퀴즈 데이터를 하나의 객체로 관리합니다.
const allQuizData = {
    'blackpink-quiz': { // contentData.js의 id와 일치해야 합니다.
        title: 'BLACKPINK Ultimate Quiz',
        data: blackpinkQuizData
    },
    'bts-quiz': {
        title: 'BTS ARMY Challenge',
        data: btsQuizData 
    },
    'twice-quiz': { 
        title: 'TWICE ONCE Challenge',
        data: twiceQuizData
    },
    'seventeen-quiz': { // 👈 이 블록을 새로 추가!
        title: 'SEVENTEEN CARAT Challenge',
        data: seventeenQuizData
    },
};    
    

function QuizPage({ quizId }) {
    const [difficulty, setDifficulty] = useState(null); // 'easy', 'medium', 'hard'
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [showAd, setShowAd] = useState(false);
    const [ranking, setRanking] = useState([]);
    const [timer, setTimer] = useState(15); // 문제당 제한 시간 15초

    const quizInfo = allQuizData[quizId];

    // 난이도 선택 핸들러
    const handleDifficultySelect = (level) => {
        // 해당 난이도의 문제를 가져와 순서를 섞습니다.
        const shuffledQuestions = [...quizInfo.data[level]].sort(() => Math.random() - 0.5);
        // 100개 중 랜덤으로 10문제만 선택하여 퀴즈에 사용합니다.
        setQuestions(shuffledQuestions.slice(0, 10));
        setDifficulty(level);
    };
    
    // 정답(옵션) 선택 핸들러
    const handleOptionSelect = (option) => {
        if (isAnswered) return; // 이미 답을 선택했다면 다시 선택 불가
        
        setIsAnswered(true);
        setSelectedOption(option);
        
        // 정답 체크 (option이 null이면 시간 초과이므로 무조건 오답)
        if (option === questions[currentQuestionIndex].answer) {
            setScore(prev => prev + 10);
        }

        // 10초 후에 다음 문제로 넘어가거나 결과를 보여줌
        setTimeout(() => {
            const nextQuestion = currentQuestionIndex + 1;
            if (nextQuestion < questions.length) {
                setCurrentQuestionIndex(nextQuestion);
                setIsAnswered(false);
                setSelectedOption(null);
                setTimer(10); // 다음 문제로 넘어갈 때 타이머를 10초로 리셋!
            } else {
                setShowResults(true);
                setShowAd(true);
            }
        }, 1000);
    };
    
    // 리포트 버튼 핸들러
    const handleReport = () => {
        const question = questions[currentQuestionIndex];
        const subject = `[K-Quiz Arena] Quiz Report - ${quizId} (${difficulty})`;
        const body = `Hello, I'd like to report an issue with the following quiz question:
--------------------------------
Quiz: ${quizInfo.title}
Difficulty: ${difficulty}
Question: "${question.question}"
Options: ${question.options.join(', ')}
Correct Answer on file: ${question.answer}
--------------------------------

[Please describe the issue here]

Thank you.`;
        
        // 사용자의 기본 이메일 클라이언트를 엽니다.
        window.location.href = `mailto:ms1324@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    // --- 랭킹 및 점수 제출 로직 (useCallback으로 안정화) ---
    const fetchRanking = useCallback(async () => {
        try {
            const res = await axios.get(`/api/quiz/ranking?quizId=${quizId}`);
            setRanking(res.data);
        } catch (error) {
            console.error("Failed to fetch ranking", error);
        }
    }, [quizId]);

    const submitScoreToServer = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            await axios.post('/api/quiz/submit-score', 
                { quizId, score },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchRanking();
        } catch (error) {
            console.error("Failed to submit score", error);
        }
    }, [quizId, score, fetchRanking]);

    useEffect(() => {
        // 이 페이지에 들어왔을 때, 기존 랭킹을 먼저 불러옵니다.
        fetchRanking();
    }, [fetchRanking]);

    // --- 타이머 로직을 위한 useEffect 추가 ---
    useEffect(() => {
        // 퀴즈가 진행 중이고, 아직 답을 선택하지 않았을 때만 타이머 작동
        if (!isAnswered && !showResults) {
            // 시간이 0이 되면 자동으로 오답 처리하고 다음 문제로 넘어감
            if (timer === 0) {
                handleOptionSelect(null); // null을 보내 오답으로 처리
                return;
            }

            // 1초마다 타이머를 1씩 감소
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);

            // 컴포넌트가 unmount되거나, 다음 문제로 넘어갈 때 interval 정리
            return () => clearInterval(interval);
        }
    }, [timer, isAnswered, showResults]);    

    
    
    const handleCloseAd = (pointsAwarded) => {
        setShowAd(false);
        submitScoreToServer();
    };

    // 1. 난이도 선택 화면
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

    

    // 2. 결과 화면
    if (showResults) {
        return (
            <div className="quiz-container">
                {showAd && 
                    <AdModal 
                        pointsToAward={5}
                        onClose={handleCloseAd}
                        contentType="quiz_complete"
                    />
                }
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
    
    // 퀴즈 데이터 로딩 중...
    if (questions.length === 0) {
        return <div>Loading questions...</div>
    }

    const currentQuestion = questions[currentQuestionIndex];

    // 3. 퀴즈 진행 화면
    // QuizPage.js의 퀴즈 진행 화면 return문 (수정본)

return (
    <div className="quiz-container">
        <h2>{quizInfo.title} - <span className="difficulty-text">{difficulty}</span></h2>
        <div className="question-container">
            <p className="question-number">Question {currentQuestionIndex + 1}/{questions.length}</p>
            
            <div className="timer">⏳ {timer}s</div> {/* --- 타이머 UI 추가 --- */}
            
            {/* --- 이하 프로그레스 바 --- */}
            <div className="progress-bar-container">
                <div 
                    className="progress-bar" 
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
            </div>
            {/* --- 이상 프로그레스 바 --- */}

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
);
}

export default QuizPage;