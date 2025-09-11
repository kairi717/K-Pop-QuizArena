import React from 'react';
import './VideoPlayerModal.css';

function VideoPlayerModal({ videoId, onClose }) {
    if (!videoId) return null;

    // 모달 배경 클릭 시 닫기
    const handleOverlayClick = (e) => {
        if (e.target.className === 'video-modal-overlay') {
            onClose();
        }
    };

    return (
        <div className="video-modal-overlay" onClick={handleOverlayClick}>
            <div className="video-modal-content">
                <button className="video-close-button" onClick={onClose}>&times;</button>
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
}

export default VideoPlayerModal;