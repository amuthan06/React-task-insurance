import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { supabase } from '../lib/supabase'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [userRole, setUserRole] = useState<
    'admin' | 'agent' | 'policy_holder' | null
  >(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) {
        console.error('Error fetching user:', error)
        setUserRole('policy_holder')
        return
      }

      if (!user) {
        console.error('No user found in session')
        setUserRole('policy_holder')
        return
      }

      const role = user.user_metadata?.role || 'policy_holder'
      setUserRole(role as 'admin' | 'agent' | 'policy_holder')
    }

    fetchUserRole()
  }, [])

  const handleLogout = async () => {
    dispatch({ type: 'policyholders/clear' })
    dispatch({ type: 'policies/clear' })
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-500 p-4 shadow-lg">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Left side: Role */}
        <div className="text-white text-2xl font-bold tracking-wide">
          {userRole
            ? userRole === 'admin'
              ? 'Admin'
              : userRole === 'agent'
                ? 'Agent'
                : 'Policyholder'
            : 'Loading...'}
        </div>

        {/* Right side: Dashboard, Policy, and Logout */}
        <div className="flex items-center space-x-6">
          <ul className="flex space-x-6">
            <li>
              <Link
                to="/dashboard"
                className={`text-white text-lg font-medium px-3 py-2 rounded-md transition-all duration-300 ${
                  location.pathname === '/dashboard'
                    ? 'bg-blue-800 text-white shadow-md'
                    : 'hover:bg-blue-600 hover:shadow-md'
                }`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/policy"
                className={`text-white text-lg font-medium px-3 py-2 rounded-md transition-all duration-300 ${
                  location.pathname === '/policy'
                    ? 'bg-blue-800 text-white shadow-md'
                    : 'hover:bg-blue-600 hover:shadow-md'
                }`}
              >
                Policy
              </Link>
            </li>
          </ul>
          <Button
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition-all duration-300"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
