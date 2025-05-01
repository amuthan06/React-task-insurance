import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

interface Policy {
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

const policiesSlice = createSlice({
  name: 'policies',
  initialState,
  reducers: {
    fetchPoliciesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPoliciesSuccess: (state, action: PayloadAction<Policy[]>) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchPoliciesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addPolicy: (state, action: PayloadAction<Policy>) => {
      state.list.push(action.payload);
    },
  },
});

export const { fetchPoliciesStart, fetchPoliciesSuccess, fetchPoliciesFailure, addPolicy } = policiesSlice.actions;

export const fetchPolicies = () => async (dispatch: any) => {
  dispatch(fetchPoliciesStart());
  try {
    const { data, error } = await supabase.from('policies').select('*');
    console.log('Fetch Policies Response:', { data, error });
    if (error) throw new Error(error.message);
    dispatch(fetchPoliciesSuccess(data));
  } catch (error) {
    console.error('Fetch Policies Error:', error);
    dispatch(fetchPoliciesFailure((error as Error).message));
  }
};

export const createPolicy = (policy: Omit<Policy, 'id'>) => async (dispatch: any) => {
  try {
    console.log('Creating Policy with Data:', policy);

    // Validate that the policyholder_id belongs to the authenticated user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { data: policyholder, error: policyholderError } = await supabase
      .from('policyholders')
      .select('id')
      .eq('id', policy.policyholder_id)
      .eq('user_id', userId)
      .single();

    if (policyholderError || !policyholder) {
      throw new Error('Invalid policyholder_id: You do not have access to this policyholder.');
    }

    const { data, error } = await supabase.from('policies').insert(policy).select();
    console.log('Create Policy Response:', { data, error });
    if (error) throw new Error(error.message);
    if (data) dispatch(addPolicy(data[0]));
  } catch (error) {
    console.error('Create Policy Error:', error);
    throw error;
  }
};

export default policiesSlice.reducer;