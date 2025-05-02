import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('policy_holder');
  const [region, setRegion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Sign up the user
      const { data: { user }, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
        },
      });
      if (signupError) throw signupError;

      if (!user) {
        throw new Error('User creation failed, no user returned.');
      }

      // Log the user in to establish a session
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;

      // Refresh the session to ensure user_metadata is up to date
      const { data: { user: refreshedUser }, error: refreshError } = await supabase.auth.getUser();
      if (refreshError) throw refreshError;

      if (!refreshedUser) {
        throw new Error('Failed to fetch refreshed user after login.');
      }

      console.log('Refreshed user after signup:', refreshedUser); // Debug log

      // If the role is agent, insert into agents table
      if (role === 'agent') {
        if (!region) {
          throw new Error('Please select a region.');
        }
        const { error: agentError } = await supabase
          .from('agents')
          .insert({ user_id: refreshedUser.id, region });
        if (agentError) {
          console.error('Agent Insert Error:', agentError);
          throw agentError;
        }
      }

      // Navigate to login page with a success message
      navigate('/login', {
        state: {
          message: 'Sign-up successful! Please log in to continue.',
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up.';
      setError(errorMessage);
      console.error('Error during signup:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border p-2 w-full rounded"
              required
            >
              <option value="policy_holder">Policy Holder</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {role === 'agent' && (
            <div>
              <label className="block mb-1">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="border p-2 w-full rounded"
                required
              >
                <option value="">Select Region</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
          )}
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}