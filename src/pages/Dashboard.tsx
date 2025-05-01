import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPolicyholders } from '../features/policyholders/policyholdersSlice';
import { RootState, AppDispatch } from '../store';
import { supabase } from '../lib/supabase';
import PolicyholderChart from '../components/PolicyholderChart'; // Import the chart

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { list: policyholders, loading, error } = useSelector((state: RootState) => state.policyholders);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');

  useEffect(() => {
    dispatch(fetchPolicyholders());
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

      {/* Add Policyholder Chart */}
      <div className="mb-6">
        <PolicyholderChart />
      </div>

      {/* Form to Add Policyholder */}
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

      {/* Policyholders Table */}
      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {policyholders.length === 0 && !loading && !error && (
        <p className="text-gray-600">No policyholders found.</p>
      )}
      {!loading && !error && policyholders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Contact</th>
              </tr>
            </thead>
            <tbody>
              {policyholders.map((ph) => (
                <tr key={ph.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{ph.name}</td>
                  <td className="py-2 px-4 border-b">{ph.contact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}