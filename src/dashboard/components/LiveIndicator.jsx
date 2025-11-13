/**
 * Live Status Indicator Component
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

function LiveIndicator() {
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [requestRate, setRequestRate] = useState(0);
  const requests = useSelector(state => state.network.requests);

  useEffect(() => {
    // Calculate request rate per second
    const interval = setInterval(() => {
      const now = Date.now();
      const recentRequests = requests.filter(r => 
        now - r.startTime < 1000
      );
      setRequestRate(recentRequests.length);
      setLastUpdate(now);
    }, 1000);

    return () => clearInterval(interval);
  }, [requests]);

  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((Date.now() - lastUpdate) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <div className="live-indicator">
      <div className="live-status">
        <span className="live-dot"></span>
        <span className="live-text">LIVE MONITORING</span>
      </div>
      <div className="live-stats">
        <span className="live-rate">{requestRate} req/s</span>
        <span className="live-time">Updated {getTimeSinceUpdate()}</span>
      </div>
    </div>
  );
}

export default LiveIndicator;