/**
 * Main Dashboard Application Component
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RequestList from './components/RequestList';
import RequestDetail from './components/RequestDetail';
import Analytics from './components/Analytics';
import LiveIndicator from './components/LiveIndicator';
import { addRequest, setRequests, setStats } from './store/networkSlice';

function App() {
  const dispatch = useDispatch();
  const [currentView, setCurrentView] = useState('live');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const stats = useSelector(state => state.network.stats);

  useEffect(() => {
    // Load initial data
    loadInitialData();

    // Listen for live updates
    const messageListener = (message) => {
      if (message.type === 'NETWORK_UPDATE') {
        dispatch(addRequest(message.data));
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Periodic stats refresh
    const statsInterval = setInterval(loadStats, 5000);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
      clearInterval(statsInterval);
    };
  }, [dispatch]);

  /**
   * Load initial data from storage
   */
  const loadInitialData = async () => {
    try {
      // Load recent requests
      const response = await chrome.runtime.sendMessage({
        type: 'GET_REQUESTS',
        filters: { limit: 1000 }
      });

      if (response.success) {
        dispatch(setRequests(response.data));
      }

      // Load stats
      await loadStats();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  /**
   * Load statistics
   */
  const loadStats = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_STATS'
      });

      if (response.success) {
        dispatch(setStats(response.data));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  /**
   * Handle request selection
   */
  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
  };

  /**
   * Handle view change
   */
  const handleViewChange = (view) => {
    setCurrentView(view);
    setSelectedRequest(null);
  };

  /**
   * Handle clear all data
   */
  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all captured data?')) {
      try {
        await chrome.runtime.sendMessage({ type: 'CLEAR_DATA' });
        dispatch(setRequests([]));
        setSelectedRequest(null);
      } catch (error) {
        console.error('Error clearing data:', error);
      }
    }
  };

  return (
    <div className="dashboard">
      <Header stats={stats} onClearData={handleClearData} />
      
      <div className="dashboard-body">
        <Sidebar 
          currentView={currentView}
          onViewChange={handleViewChange}
        />
        
        <div className="main-content">
          <LiveIndicator />
          
          {currentView === 'live' && (
            <div className="content-split">
              <div className="request-list-panel">
                <RequestList 
                  onRequestSelect={handleRequestSelect}
                  selectedRequest={selectedRequest}
                />
              </div>
              
              {selectedRequest && (
                <div className="request-detail-panel">
                  <RequestDetail 
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                  />
                </div>
              )}
            </div>
          )}
          
          {currentView === 'analytics' && (
            <Analytics />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;