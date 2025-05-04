import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom'
import { supabase } from './lib/supabase'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Policy from './pages/Policy'
import ResetPassword from './pages/ResetPassword'
import ResetPasswordRequest from './pages/ResetPasswordRequest'
import Signup from './pages/Signup'

export default function App() {
  const _dispatch = useDispatch()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user)
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/policy"
          element={
            <ProtectedRoute>
              <Policy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password-request"
          element={<ResetPasswordRequest />}
        />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error fetching session:', error)
        setIsAuthenticated(false)
        return
      }
      setIsAuthenticated(!!data.session)
    }

    checkSession()
  }, [])

  if (isAuthenticated === null) {
    return <div>Loading...</div>
  }

  return isAuthenticated ? children : <Navigate to="/login" />
}
