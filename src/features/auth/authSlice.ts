import { type PayloadAction, createSlice } from '@reduxjs/toolkit'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { AppDispatch } from '../../store'

interface AuthState {
  user: User | null
}

const initialState: AuthState = {
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
    },
    logout: (state) => {
      state.user = null
    },
  },
})

export const { setUser, logout } = authSlice.actions

// Sync with Supabase auth state
export const initializeAuth = () => (dispatch: AppDispatch) => {
  supabase.auth.onAuthStateChange((_event, session) => {
    dispatch(setUser(session?.user ?? null))
  })
}

export default authSlice.reducer
