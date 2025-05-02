import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

export interface Policyholder {
  id: string;
  name: string;
  contact: string;
  user_id: string;
  region: string; // Add region field
}

interface PolicyholdersState {
  list: Policyholder[];
  loading: boolean;
  error: string | null;
}

const initialState: PolicyholdersState = {
  list: [],
  loading: false,
  error: null,
};

const policyholdersSlice = createSlice({
  name: 'policyholders',
  initialState,
  reducers: {
    fetchPolicyholdersStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchPolicyholdersSuccess(state, action: PayloadAction<Policyholder[]>) {
      state.loading = false;
      state.list = action.payload;
    },
    fetchPolicyholdersFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchPolicyholdersStart,
  fetchPolicyholdersSuccess,
  fetchPolicyholdersFailure,
} = policyholdersSlice.actions;

export const fetchPolicyholders = () => async (dispatch: any) => {
  dispatch(fetchPolicyholdersStart());
  try {
    const { data, error } = await supabase.from('policyholders').select('*');
    if (error) throw error;
    dispatch(fetchPolicyholdersSuccess(data));
  } catch (error) {
    dispatch(fetchPolicyholdersFailure((error as Error).message));
  }
};

export default policyholdersSlice.reducer;