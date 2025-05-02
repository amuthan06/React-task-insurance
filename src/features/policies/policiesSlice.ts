import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

// Export the Policy interface so it can be imported in other files
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
    updatePolicy: (state, action: PayloadAction<Policy>) => {
      const index = state.list.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) state.list[index] = action.payload;
    },
    removePolicy: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((p) => p.id !== action.payload);
    },
  },
});

export const {
  fetchPoliciesStart,
  fetchPoliciesSuccess,
  fetchPoliciesFailure,
  addPolicy,
  updatePolicy,
  removePolicy,
} = policiesSlice.actions;

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

export const updatePolicyThunk = (id: string, updates: Partial<Omit<Policy, 'id'>>) => async (dispatch: any) => {
  try {
    console.log('Updating Policy with ID:', id, 'Updates:', updates);
    const { data, error } = await supabase
      .from('policies')
      .update(updates)
      .eq('id', id)
      .select();
    console.log('Update Policy Response:', { data, error });
    if (error) throw new Error(error.message);
    if (data && data.length > 0) dispatch(updatePolicy(data[0]));
  } catch (error) {
    console.error('Update Policy Error:', error);
    throw error;
  }
};

export const deletePolicy = (id: string) => async (dispatch: any) => {
  try {
    console.log('Deleting Policy with ID:', id);
    const { error } = await supabase.from('policies').delete().eq('id', id);
    console.log('Delete Policy Response:', { error });
    if (error) throw new Error(error.message);
    dispatch(removePolicy(id));
  } catch (error) {
    console.error('Delete Policy Error:', error);
    throw error;
  }
};

export default policiesSlice.reducer;