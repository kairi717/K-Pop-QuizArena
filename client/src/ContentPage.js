import React from 'react';
import { useParams, Link } from 'react-router-dom';
import QuizPage from './QuizPage';

function ContentPage() {
    // URL에서 contentId를 가져옵니다 (예: 'blackpink-quiz')
    const { contentId } = useParams();

    // 다른 로직 없이, 받은 contentId를 QuizPage로 그대로 전달합니다.
    return (
        // 1. 기존 div의 style 속성을 수정합니다.
        <div style={{ padding: '20px 40px' }}> {/* 좌우 패딩을 넉넉하게 줍니다 */}
            
            {/* 2. 링크를 감쌀 새로운 div를 만들고, 여기에 text-align 스타일을 적용합니다. */}
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <Link to="/" style={{ textDecoration: 'none', color: '#888', fontWeight: 'bold' }}>
                    &larr; Back to Home
                </Link>
            </div>
            
            <QuizPage quizId={contentId} />
        </div>
    );
}

export default ContentPage;