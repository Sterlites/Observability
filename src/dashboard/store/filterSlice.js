/**
 * Filter State Redux Slice
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  urlPattern: '',
  method: 'all',
  statusCode: null,
  type: 'all',
  domain: null,
  startTime: null,
  endTime: null,
  showErrors: false,
  timeRange: '1h'
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setUrlPattern: (state, action) => {
      state.urlPattern = action.payload;
    },
    setMethod: (state, action) => {
      state.method = action.payload;
    },
    setStatusCode: (state, action) => {
      state.statusCode = action.payload;
    },
    setType: (state, action) => {
      state.type = action.payload;
    },
    setDomain: (state, action) => {
      state.domain = action.payload;
    },
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
      
      // Calculate start/end times based on range
      const now = Date.now();
      const ranges = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      };
      
      state.startTime = now - (ranges[action.payload] || ranges['1h']);
      state.endTime = now;
    },
    setShowErrors: (state, action) => {
      state.showErrors = action.payload;
    },
    resetFilters: (state) => {
      return initialState;
    }
  }
});

export const {
  setUrlPattern,
  setMethod,
  setStatusCode,
  setType,
  setDomain,
  setTimeRange,
  setShowErrors,
  resetFilters
} = filterSlice.actions;

export default filterSlice.reducer;