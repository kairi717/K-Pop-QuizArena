import React, { useState } from 'react';
import axios from 'axios';
import './AdModal.css'; // 광고 모달 전용 CSS 파일

// AdModal 컴포넌트는 두 개의 props를 받습니다:
// 1. pointsToAward: 이번 광고 시청으로 적립할 포인트 (예: 15)
// 2. onClose: 광고 모달이 닫힐 때 부모 컴포넌트에 알려주는 함수

function AdModal({ pointsToAward, onClose, contentType }) {
    const [isAdLoading, setIsAdLoading] = useState(false);

    const handleWatchAd = async () => {
        setIsAdLoading(true);
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 광고 시청 시뮬레이션

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No token found");

            const response = await axios.post(
                '/api/user/add-points',
                { pointsToAdd: pointsToAward, contentType: contentType }, // contentType 추가
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert(`🎉 ${pointsToAward} 포인트가 적립되었습니다!`);
                onClose(true); // 성공 시 true와 함께 닫기
            } else {
                // API 요청은 성공했으나, 서버에서 success: false를 반환한 경우
                alert("포인트 적립에 실패했습니다.");
                onClose(false); // 실패 시 false와 함께 닫기
            }
        } catch (error) {
            console.error("Failed to add points:", error);
            alert("포인트 적립에 실패했습니다.");
            onClose(false); // 에러 발생 시 false와 함께 닫기
        }
    };

    return (
        <div className="ad-overlay">
            <div className="ad-modal">
                <h3>⭐ 목표 달성! ⭐</h3>
                <p>광고를 시청하고 보상을 받으세요!</p>
                <div className="ad-mock-content">
                    (여기에 동영상 광고가 재생됩니다)
                </div>
                <button onClick={handleWatchAd} disabled={isAdLoading}>
                    {isAdLoading ? '적립 중...' : `광고 보고 ${pointsToAward} 포인트 받기`}
                </button>
                <button 
                    className="ad-close-button" 
                    onClick={() => onClose(false)} // '나중에 받기'는 실패로 간주
                    disabled={isAdLoading}>
                    나중에 받기
                </button>
            </div>
        </div>
    );
}

export default AdModal;