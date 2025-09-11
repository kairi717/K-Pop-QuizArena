import React from 'react'; // useState는 여기서 직접 사용하지 않으므로 제거
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { contentList } from './contentData'; 
import './HomePage.css';
import Ranking from './Ranking'; 
// SkeletonLoader와 ErrorDisplay는 이 컴포넌트에서 직접 사용하지 않으므로 import 제거

// 💥 홈페이지 전용 스켈레톤 로더를 만듭니다.
const HomePageSkeleton = () => (
    <div className="homepage-container">
        {/* Welcome 메시지 뼈대 */}
        <div className="skeleton-welcome">
            <div className="skeleton-text skeleton-h2"></div>
            <div className="skeleton-text skeleton-p"></div>
        </div>
        {/* 랭킹 뼈대 */}
        <div className="ranking-container skeleton-ranking">
            <div className="skeleton-text skeleton-h3"></div>
            <div className="skeleton-wrapper">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-text-group">
                    <div className="skeleton-text skeleton-title"></div>
                </div>
            </div>
            <div className="skeleton-wrapper">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-text-group">
                    <div className="skeleton-text skeleton-title"></div>
                </div>
            </div>
        </div>
    </div>
);


function HomePage({ user }) {
  // App.js에서 user 정보가 아직 넘어오지 않았을 때,
  // 단순 텍스트 대신 홈페이지 모양의 스켈레톤 UI를 보여줍니다.
  if (!user) {
    return <HomePageSkeleton />;
  }

  // user 정보가 정상적으로 넘어왔을 때의 화면
  return (
    <>
      <Helmet>
        <title>K-Pop Quiz Arena - Test Your Fandom!</title>
        <meta name="description" content="The ultimate arena for K-Pop fans! Take fun quizzes and join song world cups for BTS, BLACKPINK, TWICE, SEVENTEEN. Climb the ranks and prove your knowledge!" />
      </Helmet>

      <div className="homepage-container">
        <div className="welcome-message">
          <h2>Welcome to K-Quiz Arena, {user.nickname}!</h2>
          <p>Choose your challenge and prove you're the ultimate K-Pop fan!</p>
        </div>

        <Ranking />
        
        <h3 className="section-title">Challenges</h3>
        <div className="content-grid"> 
          {contentList.map(content => {
            const linkTo = content.type === 'worldcup'
                ? `/worldcup/${content.id}`
                : `/content/${content.id}`;

            return (
              <Link to={linkTo} key={content.id} className="content-card-link">
                <div className="content-card">
                  <div className="content-card-emoji">{content.emoji}</div>
                  <div className="content-card-content">
                    <span 
                      className="content-card-tag"
                      style={{ backgroundColor: content.type === 'worldcup' ? '#ffae00' : '#7F5283' }}
                    >
                      {content.group}
                    </span>
                    <h4>{content.title}</h4>
                    <p>{content.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default HomePage;