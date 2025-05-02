import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPolicyholders } from '../features/policyholders/policyholdersSlice';
import { fetchPolicies, createPolicy, updatePolicyThunk, deletePolicy } from '../features/policies/policiesSlice';
import { RootState, AppDispatch } from '../store';
import { supabase } from '../lib/supabase';
import PolicyholderChart from '../components/PolicyholderChart';
import PolicyCountByTypeAndStatusChart from '../components/PolicyCountByTypeAndStatusChart';
import CoverageOverTimeChart from '../components/CoverageOverTimeChart';
import PolicyDistributionByRegionChart from '../components/PolicyDistributionByRegionChart';
import { Policy } from '../features/policies/policiesSlice';

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { list: policyholders, loading: phLoading, error: phError } = useSelector((state: RootState) => state.policyholders);
  const { list: policies, loading: pLoading, error: pError } = useSelector((state: RootState) => state.policies);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [region, setRegion] = useState(''); // New state for region
  const [policyNumber, setPolicyNumber] = useState('');
  const [policyType, setPolicyType] = useState('');
  const [coverage, setCoverage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('Active');
  const [selectedPolicyholderId, setSelectedPolicyholderId] = useState('');
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        setUserRole('policy_holder');
        return;
      }

      if (!user) {
        console.error('No user found in session');
        setUserRole('policy_holder');
        return;
      }

      console.log('DEBUG - Full user object:', user);
      const role = user.user_metadata?.role || 'policy_holder';
      console.log('DEBUG - Fetched user metadata:', user.user_metadata);
      console.log('DEBUG - User role:', role);
      setUserRole(role);
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    dispatch(fetchPolicyholders());
    dispatch(fetchPolicies());
  }, [dispatch]);

  const handleLogout = async () => {
    dispatch({ type: 'policyholders/clear' });
    dispatch({ type: 'policies/clear' });
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleAddPolicyholder = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('policyholders').insert({
      name,
      contact,
      region, // Include region in the insert
      user_id: user.id,
    });
    if (error) {
      console.error(error);
    } else {
      setName('');
      setContact('');
      setRegion(''); // Reset region
      dispatch(fetchPolicyholders());
    }
  };

  const handleAddPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setPolicyError(null);
    if (!selectedPolicyholderId) {
      setPolicyError('Please select a policyholder.');
      return;
    }
    try {
      await dispatch(
        createPolicy({
          number: policyNumber,
          type: policyType,
          coverage: parseInt(coverage),
          start_date: startDate,
          end_date: endDate,
          status,
          policyholder_id: selectedPolicyholderId,
        })
      );
      setPolicyNumber('');
      setPolicyType('');
      setCoverage('');
      setStartDate('');
      setEndDate('');
      setStatus('Active');
      setSelectedPolicyholderId('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add policy.';
      setPolicyError(errorMessage);
      console.error('Add Policy Error:', error);
    }
  };

  const handleEditPolicy = (policy: Policy) => {
    setEditingPolicyId(policy.id);
    setPolicyNumber(policy.number);
    setPolicyType(policy.type);
    setCoverage(policy.coverage.toString());
    setStartDate(policy.start_date);
    setEndDate(policy.end_date);
    setStatus(policy.status);
    setSelectedPolicyholderId(policy.policyholder_id);
  };

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setPolicyError(null);
    if (!editingPolicyId) return;
    try {
      await dispatch(
        updatePolicyThunk({
          id: editingPolicyId,
          policy: {
            number: policyNumber,
            type: policyType,
            coverage: parseInt(coverage),
            start_date: startDate,
            end_date: endDate,
            status,
            policyholder_id: selectedPolicyholderId,
          },
        })
      );
      setEditingPolicyId(null);
      setPolicyNumber('');
      setPolicyType('');
      setCoverage('');
      setStartDate('');
      setEndDate('');
      setStatus('Active');
      setSelectedPolicyholderId('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update policy.';
      setPolicyError(errorMessage);
      console.error('Update Policy Error:', error);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await dispatch(deletePolicy(id));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete policy.';
        setPolicyError(errorMessage);
        console.error('Delete Policy Error:', error);
      }
    }
  };

  if (!userRole) {
    return <div>Loading...</div>;
  }

  console.log('DEBUG - Policyholders in Dashboard:', policyholders);
  console.log('DEBUG - Policies in Dashboard:', policies);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{userRole === 'admin' ? 'Admin Dashboard' : userRole === 'agent' ? 'Agent Dashboard' : 'Policyholders Dashboard'}</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Filters</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border p-2 w-full rounded"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Date Range</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="border p-2 w-full rounded"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="border p-2 w-full rounded"
              />
            </div>
          </div>
        </div>

        <PolicyholderChart />
        <PolicyCountByTypeAndStatusChart statusFilter={statusFilter} />
        <CoverageOverTimeChart dateRange={dateRange} />
        <PolicyDistributionByRegionChart />
      </div>

      {(userRole === 'policy_holder' || userRole === 'admin') && (
        <>
            <h3 className="text-xl font-semibold mb-4">Add Policyholder</h3>
          <form onSubmit={handleAddPolicyholder} className="mb-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Mail <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Region <span className="text-red-500">*</span></label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                >
                  <option value="">Select Region</option>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="South">East</option>
                  <option value="South">West</option>
                </select>
              </div>
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Add Policyholder
            </button>
          </form>

          <form onSubmit={editingPolicyId ? handleUpdatePolicy : handleAddPolicy} className="mb-6 space-y-4">
            <h3 className="text-xl font-semibold mb-4">
              {editingPolicyId ? 'Edit Policy' : 'Add Policy'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Policyholder <span className="text-red-500">*</span></label>
                <select
                  value={selectedPolicyholderId}
                  onChange={(e) => setSelectedPolicyholderId(e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                >
                  <option value="">Select Policyholder</option>
                  {policyholders.map((ph) => (
                    <option key={ph.id} value={ph.id}>
                      {ph.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Policy Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Type <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={policyType}
                  onChange={(e) => setPolicyType(e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Coverage ($) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={coverage}
                  onChange={(e) => setCoverage(e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Start Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">End Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Status <span className="text-red-500">*</span></label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
            {policyError && <p className="text-red-500">{policyError}</p>}
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              {editingPolicyId ? 'Update Policy' : 'Add Policy'}
            </button>
            {editingPolicyId && (
              <button
                type="button"
                onClick={() => {
                  setEditingPolicyId(null);
                  setPolicyNumber('');
                  setPolicyType('');
                  setCoverage('');
                  setStartDate('');
                  setEndDate('');
                  setStatus('Active');
                  setSelectedPolicyholderId('');
                  setPolicyError(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2"
              >
                Cancel
              </button>
            )}
          </form>
        </>
      )}

      {pLoading && <p className="text-gray-600">Loading policies...</p>}
      {pError && <p className="text-red-500">Error: {pError}</p>}
      {!pLoading && !pError && policies.length > 0 && (
        <div className="overflow-x-auto">
          <h3 className="text-xl font-semibold mb-4">Policies</h3>
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Number</th>
                <th className="py-2 px-4 border-b text-left">Type</th>
                <th className="py-2 px-4 border-b text-left">Coverage ($)</th>
                <th className="py-2 px-4 border-b text-left">Start Date</th>
                <th className="py-2 px-4 border-b text-left">End Date</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                {userRole !== 'agent' && <th className="py-2 px-4 border-b text-left">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <tr key={policy.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{policy.number}</td>
                  <td className="py-2 px-4 border-b">{policy.type}</td>
                  <td className="py-2 px-4 border-b">{policy.coverage}</td>
                  <td className="py-2 px-4 border-b">{policy.start_date}</td>
                  <td className="py-2 px-4 border-b">{policy.end_date}</td>
                  <td className="py-2 px-4 border-b">{policy.status}</td>
                  {userRole !== 'agent' && (
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleEditPolicy(policy)}
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePolicy(policy.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}