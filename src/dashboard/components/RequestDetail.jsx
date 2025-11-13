/**
 * Request Detail Panel Component
 */

import React, { useState } from 'react';

function RequestDetail({ request, onClose }) {
  const [activeTab, setActiveTab] = useState('general');

  if (!request) return null;

  /**
   * Format headers for display
   */
  const formatHeaders = (headers) => {
    if (!headers) return [];
    return Object.entries(headers).map(([key, value]) => ({ key, value }));
  };

  /**
   * Get timing information
   */
  const getTimingInfo = () => {
    return [
      { label: 'Request Start', value: new Date(request.startTime).toLocaleString() },
      { label: 'Duration', value: request.duration ? `${request.duration}ms` : 'N/A' },
      { label: 'From Cache', value: request.fromCache ? 'Yes' : 'No' },
      { label: 'IP Address', value: request.ip || 'N/A' }
    ];
  };

  /**
   * Copy to clipboard
   */
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="request-detail">
      <div className="detail-header">
        <h3 className="detail-title">Request Details</h3>
        <button className="btn-close" onClick={onClose}>×</button>
      </div>
      
      <div className="detail-url">
        <div className="url-bar">
          <span className={`method-badge ${request.method.toLowerCase()}`}>
            {request.method}
          </span>
          <span className="url-text" title={request.url}>{request.url}</span>
          <button 
            className="btn-icon"
            onClick={() => copyToClipboard(request.url)}
            title="Copy URL"
          >
            📋
          </button>
        </div>
      </div>
      
      <div className="detail-tabs">
        <button
          className={`tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`tab ${activeTab === 'headers' ? 'active' : ''}`}
          onClick={() => setActiveTab('headers')}
        >
          Headers
        </button>
        <button
          className={`tab ${activeTab === 'response' ? 'active' : ''}`}
          onClick={() => setActiveTab('response')}
        >
          Response
        </button>
        <button
          className={`tab ${activeTab === 'timing' ? 'active' : ''}`}
          onClick={() => setActiveTab('timing')}
        >
          Timing
        </button>
      </div>
      
      <div className="detail-content">
        {activeTab === 'general' && (
          <div className="detail-section">
            <div className="detail-row">
              <span className="detail-label">Status Code:</span>
              <span className="detail-value">
                {request.statusCode || 'N/A'} {request.statusLine || ''}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Request Method:</span>
              <span className="detail-value">{request.method}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Resource Type:</span>
              <span className="detail-value">{request.type}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Content Type:</span>
              <span className="detail-value">{request.contentType || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Initiator:</span>
              <span className="detail-value">{request.initiator || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tab Title:</span>
              <span className="detail-value">{request.tabTitle || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tab URL:</span>
              <span className="detail-value">{request.tabUrl || 'N/A'}</span>
            </div>
            {request.error && (
              <div className="detail-row error">
                <span className="detail-label">Error:</span>
                <span className="detail-value">{request.error}</span>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'headers' && (
          <div className="detail-section">
            <h4 className="subsection-title">Request Headers</h4>
            <div className="headers-list">
              {formatHeaders(request.requestHeaders).map((header, idx) => (
                <div key={idx} className="header-row">
                  <span className="header-key">{header.key}:</span>
                  <span className="header-value">{header.value}</span>
                </div>
              ))}
            </div>
            
            {request.responseHeaders && (
              <>
                <h4 className="subsection-title">Response Headers</h4>
                <div className="headers-list">
                  {formatHeaders(request.responseHeaders).map((header, idx) => (
                    <div key={idx} className="header-row">
                      <span className="header-key">{header.key}:</span>
                      <span className="header-value">{header.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {request.cookies && request.cookies.length > 0 && (
              <>
                <h4 className="subsection-title">Cookies</h4>
                <div className="cookies-list">
                  {request.cookies.map((cookie, idx) => (
                    <div key={idx} className="cookie-item">{cookie}</div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        
        {activeTab === 'response' && (
          <div className="detail-section">
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className="detail-value">
                {request.statusCode} {request.statusLine}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Content Type:</span>
              <span className="detail-value">{request.contentType || 'N/A'}</span>
            </div>
            {request.requestBody && (
              <>
                <h4 className="subsection-title">Request Body</h4>
                <pre className="code-block">
                  {JSON.stringify(request.requestBody, null, 2)}
                </pre>
              </>
            )}
          </div>
        )}
        
        {activeTab === 'timing' && (
          <div className="detail-section">
            {getTimingInfo().map((item, idx) => (
              <div key={idx} className="detail-row">
                <span className="detail-label">{item.label}:</span>
                <span className="detail-value">{item.value}</span>
              </div>
            ))}
            
            <div className="timing-visualization">
              <div className="timing-bar">
                <div 
                  className="timing-segment timing-request"
                  style={{ width: '100%' }}
                  title={`Total: ${request.duration}ms`}
                >
                  {request.duration}ms
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RequestDetail;