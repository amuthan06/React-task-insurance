import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import policyholdersReducer from '../features/policyholders/policyholdersSlice'
import policiesReducer from '../features/policies/policiesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    policyholders: policyholdersReducer,
    policies: policiesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
