/**
 * Analytics Dashboard Component
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const timeRange = useSelector(state => state.filters.timeRange);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  /**
   * Load analytics data
   */
  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_ANALYTICS',
        timeRange: timeRange
      });

      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  // Prepare data for charts
  const methodData = Object.entries(analytics.byMethod).map(([method, count]) => ({
    name: method,
    value: count
  }));

  const statusData = Object.entries(analytics.byStatus).map(([status, count]) => ({
    name: status,
    value: count
  }));

  const typeData = Object.entries(analytics.byType).map(([type, count]) => ({
    name: type,
    value: count
  })).slice(0, 8); // Top 8 types

  const domainData = analytics.topDomains.slice(0, 10);

  const timelineData = analytics.timeline.map(point => ({
    time: new Date(point.time).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    requests: point.count
  }));

  // Colors for charts
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
  const STATUS_COLORS = {
    '2xx': '#10b981',
    '3xx': '#3b82f6',
    '4xx': '#f59e0b',
    '5xx': '#ef4444',
    'Error': '#dc2626'
  };

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h2 className="section-title">Network Analytics</h2>
        <div className="analytics-summary">
          <div className="summary-card">
            <span className="summary-label">Total Requests</span>
            <span className="summary-value">{analytics.totalRequests.toLocaleString()}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Avg Duration</span>
            <span className="summary-value">{analytics.avgDuration}ms</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Error Rate</span>
            <span className="summary-value error">{analytics.errorRate}%</span>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Timeline Chart */}
        <div className="chart-card full-width">
          <h3 className="chart-title">Request Timeline</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="requests" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* HTTP Methods */}
        <div className="chart-card">
          <h3 className="chart-title">Requests by Method</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={methodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {methodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status Codes */}
        <div className="chart-card">
          <h3 className="chart-title">Requests by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resource Types */}
        <div className="chart-card">
          <h3 className="chart-title">Top Resource Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Domains */}
        <div className="chart-card">
          <h3 className="chart-title">Top Domains</h3>
          <div className="domain-list">
            {domainData.map((item, index) => (
              <div key={index} className="domain-item">
                <div className="domain-info">
                  <span className="domain-rank">#{index + 1}</span>
                  <span className="domain-name" title={item.domain}>{item.domain}</span>
                </div>
                <div className="domain-bar-container">
                  <div 
                    className="domain-bar"
                    style={{ 
                      width: `${(item.count / domainData[0].count) * 100}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  ></div>
                  <span className="domain-count">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slowest Requests */}
        <div className="chart-card">
          <h3 className="chart-title">Slowest Requests</h3>
          <div className="slowest-list">
            {analytics.slowestRequests.map((request, index) => (
              <div key={index} className="slowest-item">
                <div className="slowest-info">
                  <span className="slowest-method">{request.method}</span>
                  <span className="slowest-url" title={request.url}>
                    {request.url.substring(0, 50)}...
                  </span>
                </div>
                <div className="slowest-timing">
                  <span className="slowest-duration">{request.duration}ms</span>
                  <span className={`slowest-status status-${Math.floor(request.statusCode / 100)}xx`}>
                    {request.statusCode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;