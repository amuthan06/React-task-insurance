import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

export interface Policy {
  id: string;
  number: string;
  type: string;
  coverage: number;
  start_date: string;
  end_date: string;
  status: string;
  policyholder_id: string;
}

interface PoliciesState {
  list: Policy[];
  loading: boolean;
  error: string | null;
}

const initialState: PoliciesState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchPolicies = createAsyncThunk('policies/fetch', async () => {
  const { data, error } = await supabase.from('policies').select('*');
  console.log('Fetch Policies Response:', { data, error }); // Debug log
  if (error) throw error;
  return data;
});

export const createPolicy = createAsyncThunk('policies/create', async (policy: Omit<Policy, 'id'>) => {
  const { data, error } = await supabase.from('policies').insert(policy).select().single();
  if (error) throw error;
  return data;
});

export const updatePolicyThunk = createAsyncThunk(
  'policies/update',
  async ({ id, policy }: { id: string; policy: Omit<Policy, 'id'> }) => {
    const { data, error } = await supabase.from('policies').update(policy).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
);

export const deletePolicy = createAsyncThunk('policies/delete', async (id: string) => {
  const { error } = await supabase.from('policies').delete().eq('id', id);
  if (error) throw error;
  return id;
});

const policiesSlice = createSlice({
  name: 'policies',
  initialState,
  reducers: {
    clear(state) {
      state.list = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPolicies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicies.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchPolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch policies';
      })
      .addCase(createPolicy.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updatePolicyThunk.fulfilled, (state, action) => {
        const index = state.list.findIndex((policy) => policy.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deletePolicy.fulfilled, (state, action) => {
        state.list = state.list.filter((policy) => policy.id !== action.payload);
      });
  },
});

export const { clear } = policiesSlice.actions;
export default policiesSlice.reducer;