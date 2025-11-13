/**
 * Extension Popup
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './popup.css';

function Popup() {
  const [stats, setStats] = useState(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const openDashboard = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
  };

  const clearData = async () => {
    if (window.confirm('Clear all captured data?')) {
      await chrome.runtime.sendMessage({ type: 'CLEAR_DATA' });
      loadStats();
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  return (
    <div className="popup">
      <div className="popup-header">
        <div className="popup-title">
          <span className="popup-icon">📡</span>
          <span>Network Observatory</span>
        </div>
        <div className={`popup-status ${isActive ? 'active' : ''}`}>
          <span className="status-dot"></span>
          {isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      {stats ? (
        <div className="popup-stats">
          <div className="stat">
            <span className="stat-value">{formatNumber(stats.totalRequests)}</span>
            <span className="stat-label">Total Requests</span>
          </div>
          <div className="stat">
            <span className="stat-value error">{formatNumber(stats.totalErrors)}</span>
            <span className="stat-label">Errors</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {Math.round((stats.totalDataTransferred || 0) / 1024 / 1024)}MB
            </span>
            <span className="stat-label">Data Transferred</span>
          </div>
        </div>
      ) : (
        <div className="popup-loading">Loading...</div>
      )}

      <div className="popup-actions">
        <button className="popup-btn primary" onClick={openDashboard}>
          Open Dashboard
        </button>
        <button className="popup-btn secondary" onClick={clearData}>
Clear Data
</button>
</div>
<div className="popup-footer">
    <span className="popup-version">v1.0.0</span>
    <span className="popup-link" onClick={() => chrome.tabs.create({ url: 'https://github.com' })}>
      Help & Documentation
    </span>
  </div>
</div>
);
}
const root = ReactDOM.createRoot(document.getElementById('popup-root'));
root.render(<Popup />);
