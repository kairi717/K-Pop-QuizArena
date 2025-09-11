// 우리 앱의 모든 콘텐츠 목록을 정의하는 파일

export const contentList = [
    // --- 노래 월드컵 ---
    {
        id: 'bts_32_songs',
        type: 'worldcup',
        title: 'BTS All-Time Hits World Cup (32)',
        emoji: '🎤',
        group: 'BTS',
        description: 'Choose the best BTS title track!'
    },
    {
        id: 'twice_32_songs',
        type: 'worldcup',
        title: 'TWICE All-Time Hits World Cup (32)',
        emoji: '🎤',
        group: 'TWICE',
        description: 'Which TWICE song is your ultimate favorite?'
    },
    {
        id: 'blackpink_32_songs', // kpopData.js의 키와 일치
        type: 'worldcup',
        title: 'BLACKPINK Hits World Cup (32)',
        emoji: '🎤',
        group: 'BLACKPINK',
        description: 'Which BLACKPINK song is your anthem?'
    },
    {
        id: 'seventeen_32_songs', // kpopData.js의 키와 일치
        type: 'worldcup',
        title: 'SEVENTEEN Hits World Cup (32)',
        emoji: '🎤',
        group: 'SEVENTEEN',
        description: 'Choose the best track from the self-producing idols!'
    },

    // --- 퀴즈 콘텐츠 ---
    {
        id: 'blackpink-quiz',
        type: 'quiz',
        title: 'BLACKPINK Ultimate Quiz',
        emoji: '🎵',
        group: 'BLACKPINK',
        description: 'How well do you know the Queens?'
    },
    {
        id: 'bts-quiz',
        type: 'quiz',
        title: 'BTS ARMY Challenge',
        emoji: '💜',
        group: 'BTS',
        description: 'Test your knowledge as a true ARMY!'
    },
    {
        id: 'twice-quiz',
        type: 'quiz',
        title: 'TWICE ONCE Challenge',
        emoji: '🍭', // 트와이스를 상징하는 캔디봉 이모지
        group: 'TWICE',
        description: 'Are you a true ONCE? Prove it!'
    },
    {
        id: 'seventeen-quiz',
        type: 'quiz',
        title: 'SEVENTEEN CARAT Challenge',
        emoji: '💎', // 세븐틴을 상징하는 다이아몬드 이모지
        group: 'SEVENTEEN',
        description: 'Say the name! How much do you know?'
    }        
];