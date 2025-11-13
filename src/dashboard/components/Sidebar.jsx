/**
 * Dashboard Sidebar Navigation
 */

import React from 'react';

function Sidebar({ currentView, onViewChange }) {
  const menuItems = [
    { id: 'live', icon: '🔴', label: 'Live Requests', badge: null },
    { id: 'analytics', icon: '📊', label: 'Analytics', badge: null },
    { id: 'sessions', icon: '🗂️', label: 'Sessions', badge: 'Soon' },
    { id: 'errors', icon: '⚠️', label: 'Errors', badge: 'Soon' }
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''} ${item.badge ? 'disabled' : ''}`}
            onClick={() => !item.badge && onViewChange(item.id)}
            disabled={!!item.badge}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </button>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="sidebar-info">
          <p className="info-label">Version</p>
          <p className="info-value">1.0.0</p>
        </div>
        <div className="sidebar-info">
          <p className="info-label">Status</p>
          <p className="info-value status-active">● Active</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;