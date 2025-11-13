/**
 * Dashboard Header Component
 */

import React from 'react';

function Header({ stats, onClearData }) {
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1 className="header-title">
          <span className="header-icon">📡</span>
          Network Observatory
        </h1>
        <span className="header-subtitle">Super Admin Network Monitoring</span>
      </div>
      
      <div className="header-stats">
        <div className="stat-item">
          <span className="stat-label">Total Requests</span>
          <span className="stat-value">{formatNumber(stats.totalRequests || 0)}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Errors</span>
          <span className="stat-value error">{formatNumber(stats.totalErrors || 0)}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Data</span>
          <span className="stat-value">{formatBytes(stats.totalDataTransferred || 0)}</span>
        </div>
      </div>
      
      <div className="header-actions">
        <button className="btn btn-secondary" onClick={onClearData}>
          Clear Data
        </button>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Refresh
        </button>
      </div>
    </header>
  );
}

export default Header;