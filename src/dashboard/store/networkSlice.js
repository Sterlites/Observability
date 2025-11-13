/**
 * Network Data Redux Slice
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  requests: [],
  stats: {
    totalRequests: 0,
    totalErrors: 0,
    totalDataTransferred: 0,
    firstRequestTime: Date.now(),
    lastRequestTime: Date.now()
  },
  isLoading: false
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setRequests: (state, action) => {
      state.requests = action.payload;
    },
    addRequest: (state, action) => {
      // Add to beginning (most recent first)
      state.requests.unshift(action.payload);
      
      // Keep only last 1000 in memory
      if (state.requests.length > 1000) {
        state.requests = state.requests.slice(0, 1000);
      }
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearRequests: (state) => {
      state.requests = [];
    }
  }
});

export const { setRequests, addRequest, setStats, setLoading, clearRequests } = networkSlice.actions;
export default networkSlice.reducer;