import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPolicyholders } from '../features/policyholders/policyholdersSlice';
import { fetchPolicies, createPolicy } from '../features/policies/policiesSlice';
import { RootState, AppDispatch } from '../store';
import { supabase } from '../lib/supabase';
import PolicyholderChart from '../components/PolicyholderChart';

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { list: policyholders, loading: phLoading, error: phError } = useSelector((state: RootState) => state.policyholders);
  const { list: policies, loading: pLoading, error: pError } = useSelector((state: RootState) => state.policies);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [policyType, setPolicyType] = useState('');
  const [coverage, setCoverage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('Active');
  const [selectedPolicyholderId, setSelectedPolicyholderId] = useState('');

  // Update user metadata with role on component mount
  useEffect(() => {
    const updateUserRole = async () => {
      const { error } = await supabase.auth.updateUser({
        data: { role: 'policy_holder' },
      });
      if (error) console.error('Error updating role:', error);
      else console.log('Role updated successfully');
    };

    updateUserRole();
  }, []); // Empty dependency array to run once on mount

  useEffect(() => {
    dispatch(fetchPolicyholders());
    dispatch(fetchPolicies());
  }, [dispatch]);

  const handleLogout = async () => {
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
      user_id: user.id,
    });
    if (error) {
      console.error(error);
    } else {
      setName('');
      setContact('');
      dispatch(fetchPolicyholders());
    }
  };

  const handleAddPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicyholderId) return;
    dispatch(
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
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Policyholders Dashboard</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="mb-6">
        <PolicyholderChart />
      </div>

      <form onSubmit={handleAddPolicyholder} className="mb-6 space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1">Contact</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </div>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add Policyholder
        </button>
      </form>

      <form onSubmit={handleAddPolicy} className="mb-6 space-y-4">
        <h3 className="text-xl font-semibold mb-4">Add Policy</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Policyholder</label>
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
            <label className="block mb-1">Policy Number</label>
            <input
              type="text"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Type</label>
            <input
              type="text"
              value={policyType}
              onChange={(e) => setPolicyType(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Coverage ($)</label>
            <input
              type="number"
              value={coverage}
              onChange={(e) => setCoverage(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border p-2 w-full rounded"
            >
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Add Policy
        </button>
      </form>

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}