import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

interface AuthState {
  user: any | null
}

const initialState: AuthState = {
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload
    },
    logout: (state) => {
      state.user = null
    },
  },
})

export const { setUser, logout } = authSlice.actions

// Sync with Supabase auth state
export const initializeAuth = () => (dispatch: any) => {
  supabase.auth.onAuthStateChange((_event, session) => {
    dispatch(setUser(session?.user ?? null))
  })
}

export default authSlice.reducer
