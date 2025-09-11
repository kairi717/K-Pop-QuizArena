import React from 'react';
import './ErrorDisplay.css';
function ErrorDisplay({ message, onRetry }) {
return (
<div className="error-container">
<span className="error-icon">😥</span>
<p className="error-message">{message || "An unexpected error occurred."}</p>
{onRetry && (
<button className="retry-button" onClick={onRetry}>
Try Again
</button>
)}
</div>
);
}
export default ErrorDisplay;