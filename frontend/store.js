'use client';

import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import assetReducer from './assetSlice';
// import other reducers here as needed
// import userReducer from './userSlice';
// import productReducer from './productSlice';

// Combine all reducers dynamically
const rootReducer = combineReducers({
  assets: assetReducer,
  // Add other reducers here
  // user: userReducer,
  // products: productReducer,
});

// Configure store
const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(customMiddleware),
});

// Optional: TypeScript helpers
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

export default store;
