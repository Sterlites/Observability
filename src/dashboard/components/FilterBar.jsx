/**
 * Filter Bar Component
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setUrlPattern,
  setMethod,
  setType,
  setTimeRange,
  setShowErrors,
  resetFilters
} from '../store/filterSlice';

function FilterBar() {
  const dispatch = useDispatch();
  const filters = useSelector(state => state.filters);

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <input
          type="text"
          className="filter-input"
          placeholder="Filter by URL pattern..."
          value={filters.urlPattern}
          onChange={(e) => dispatch(setUrlPattern(e.target.value))}
        />
      </div>
      
      <div className="filter-group">
        <select
          className="filter-select"
          value={filters.method}
          onChange={(e) => dispatch(setMethod(e.target.value))}
        >
          <option value="all">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
          <option value="OPTIONS">OPTIONS</option>
        </select>
      </div>
      
      <div className="filter-group">
        <select
          className="filter-select"
          value={filters.type}
          onChange={(e) => dispatch(setType(e.target.value))}
        >
          <option value="all">All Types</option>
          <option value="main_frame">Document</option>
          <option value="sub_frame">iFrame</option>
          <option value="stylesheet">CSS</option>
          <option value="script">JavaScript</option>
          <option value="image">Image</option>
          <option value="font">Font</option>
          <option value="xmlhttprequest">XHR</option>
          <option value="fetch">Fetch</option>
          <option value="websocket">WebSocket</option>
          <option value="media">Media</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div className="filter-group">
        <select
          className="filter-select"
          value={filters.timeRange}
          onChange={(e) => dispatch(setTimeRange(e.target.value))}
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.showErrors}
            onChange={(e) => dispatch(setShowErrors(e.target.checked))}
          />
          <span>Errors Only</span>
        </label>
      </div>
      
      <button
        className="btn btn-small btn-secondary"
        onClick={() => dispatch(resetFilters())}
      >
        Reset Filters
      </button>
    </div>
  );
}

export default FilterBar;