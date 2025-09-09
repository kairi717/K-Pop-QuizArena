// src/quizData.js

// HomePage와 ContentPage에서 공통으로 사용할 퀴즈 데이터
export const quizList = [
    { id: 'blackpink-song-quiz', type: 'Guess the Song', title: 'BLACKPINK Song Quiz', emoji: '🎵', group: 'BLACKPINK', contentType: 'quiz', content: 'blackpink_song_quiz' },
    { id: 'bts-mv-quiz', type: 'Music Video', title: 'BTS Music Video Quiz', emoji: '🎬', group: 'BTS', contentType: 'quiz', content: 'bts_mv_quiz' },
    { id: 'twice-debut-quiz', type: 'Debut Era', title: 'TWICE Debut Facts', emoji: '✨', group: 'TWICE', contentType: 'quiz', content: 'twice_debut_quiz' },
    { id: 'seventeen-unit-quiz', type: 'Unit Members', title: 'SEVENTEEN Unit Quiz', emoji: '👤', group: 'SEVENTEEN', contentType: 'quiz', content: 'seventeen-unit-quiz' },
];

// 각 퀴즈의 상세 내용 (실제 앱에서는 이 또한 서버에서 받아오는 것이 좋습니다)
export const quizzes = {
    'blackpink_song_quiz': { questions: [/* ... 질문 데이터 ... */] },
    'bts_mv_quiz': { questions: [/* ... 질문 데이터 ... */] },
    // ... 다른 퀴즈 데이터
};