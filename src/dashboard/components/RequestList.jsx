/**
 * Request List Component
 */

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import FilterBar from './FilterBar';

function RequestList({ onRequestSelect, selectedRequest }) {
  const requests = useSelector(state => state.network.requests);
  const filters = useSelector(state => state.filters);

  // Filter requests based on current filters
  const filteredRequests = useMemo(() => {
    let filtered = [...requests];

    // URL pattern filter
    if (filters.urlPattern) {
      const pattern = filters.urlPattern.toLowerCase();
      filtered = filtered.filter(r => r.url.toLowerCase().includes(pattern));
    }

    // Method filter
    if (filters.method !== 'all') {
      filtered = filtered.filter(r => r.method === filters.method);
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(r => r.type === filters.type);
    }

    // Time range filter
    if (filters.startTime) {
      filtered = filtered.filter(r => r.startTime >= filters.startTime);
    }

    // Errors only filter
    if (filters.showErrors) {
      filtered = filtered.filter(r => 
        r.error || (r.statusCode && r.statusCode >= 400)
      );
    }

    return filtered;
  }, [requests, filters]);

  /**
   * Get status badge class
   */
  const getStatusClass = (request) => {
    if (request.error) return 'status-error';
    if (!request.statusCode) return 'status-pending';
    if (request.statusCode < 200) return 'status-info';
    if (request.statusCode < 300) return 'status-success';
    if (request.statusCode < 400) return 'status-redirect';
    if (request.statusCode < 500) return 'status-client-error';
    return 'status-server-error';
  };

  /**
   * Get method badge class
   */
  const getMethodClass = (method) => {
    const classes = {
      'GET': 'method-get',
      'POST': 'method-post',
      'PUT': 'method-put',
      'DELETE': 'method-delete',
      'PATCH': 'method-patch',
      'OPTIONS': 'method-options'
    };
    return classes[method] || 'method-other';
  };

  /**
   * Format URL for display
   */
  const formatUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname + urlObj.search;
      return path.length > 60 ? path.substring(0, 57) + '...' : path;
    } catch {
      return url.substring(0, 60);
    }
  };

  /**
   * Format duration
   */
  const formatDuration = (duration) => {
    if (!duration) return '-';
    if (duration < 1000) return `${Math.round(duration)}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  /**
   * Format timestamp
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  /**
   * Get domain from URL
   */
  const getDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  };

  return (
    <div className="request-list">
      <div className="request-list-header">
        <h2 className="section-title">
          Network Requests
          <span className="request-count">{filteredRequests.length}</span>
        </h2>
        <FilterBar />
      </div>
      
      <div className="request-table-container">
        <table className="request-table">
          <thead>
            <tr>
              <th className="col-status">Status</th>
              <th className="col-method">Method</th>
              <th className="col-domain">Domain</th>
              <th className="col-url">Path</th>
              <th className="col-type">Type</th>
              <th className="col-duration">Duration</th>
              <th className="col-time">Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No requests found. Start browsing to capture network traffic.
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => (
                <tr
                  key={request.id}
                  className={`request-row ${selectedRequest?.id === request.id ? 'selected' : ''}`}
                  onClick={() => onRequestSelect(request)}
                >
                  <td className="col-status">
                    <span className={`status-badge ${getStatusClass(request)}`}>
                      {request.error ? 'ERR' : (request.statusCode || '...')}
                    </span>
                  </td>
                  <td className="col-method">
                    <span className={`method-badge ${getMethodClass(request.method)}`}>
                      {request.method}
                    </span>
                  </td>
                  <td className="col-domain" title={getDomain(request.url)}>
                    {getDomain(request.url)}
                  </td>
                  <td className="col-url" title={request.url}>
                    {formatUrl(request.url)}
                  </td>
                  <td className="col-type">
                    <span className="type-badge">{request.type}</span>
                  </td>
                  <td className="col-duration">
                    {formatDuration(request.duration)}
                  </td>
                  <td className="col-time">
                    {formatTime(request.startTime)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RequestList;