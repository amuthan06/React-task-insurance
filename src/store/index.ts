import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import policiesReducer from '../features/policies/policiesSlice'
import policyholdersReducer from '../features/policyholders/policyholdersSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    policyholders: policyholdersReducer,
    policies: policiesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
