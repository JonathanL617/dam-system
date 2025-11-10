'use client';
import { configureStore } from '@reduxjs/toolkit';
import assetReducer from './assetSlice';

const store = configureStore({
  reducer: {
    assets: assetReducer,
  },
});

export default store;
