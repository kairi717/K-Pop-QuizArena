import React from 'react';
import './AdBlockModal.css';

function AdBlockModal() {
  return (
    <div className="adblock-overlay">
      <div className="adblock-modal">
        <h3>Ad Blocker Detected</h3>
        <p>
          Our service is supported by advertisements. To continue using our site,
          please disable your ad blocker and refresh the page.
        </p>
      </div>
    </div>
  );
}

export default AdBlockModal;