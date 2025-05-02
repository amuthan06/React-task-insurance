import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

export interface Policyholder {
  id: string
  name: string
  contact: string
  user_id: string
  region: string
}

interface PolicyholdersState {
  list: Policyholder[]
  loading: boolean
  error: string | null
}

const initialState: PolicyholdersState = {
  list: [],
  loading: false,
  error: null,
}

export const fetchPolicyholders = createAsyncThunk(
  'policyholders/fetch',
  async () => {
    const { data, error } = await supabase.from('policyholders').select('*')
    console.log('Fetch Policyholders Response:', { data, error }) // Debug log
    if (error) {
      throw error
    }
    return data
  }
)

const policyholdersSlice = createSlice({
  name: 'policyholders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPolicyholders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPolicyholders.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchPolicyholders.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch policyholders'
      })
  },
})

export default policyholdersSlice.reducer
