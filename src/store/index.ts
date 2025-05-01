import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import policyholdersReducer from '../features/policyholders/policyholdersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    policyholders: policyholdersReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;