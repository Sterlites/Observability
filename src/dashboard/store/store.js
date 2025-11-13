/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import networkReducer from './networkSlice';
import filterReducer from './filterSlice';

const store = configureStore({
  reducer: {
    network: networkReducer,
    filters: filterReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false // Disable for performance with large datasets
    })
});

export default store;