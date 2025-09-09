import React from 'react';
import './SkeletonLoader.css';

// count prop을 받아서, 원하는 개수만큼 스켈레톤 라인을 생성
function SkeletonLoader({ count = 3 }) {
    return (
        <div className="skeleton-container">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="skeleton-wrapper">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-text-group">
                        <div className="skeleton-text skeleton-title"></div>
                        <div className="skeleton-text skeleton-subtitle"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SkeletonLoader;