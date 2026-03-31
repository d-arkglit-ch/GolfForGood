import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

export default function ProtectedRoute({ children, requireSubscription = true }) {
  const { user, isSubscribed, loading, isAdmin } = useAuth()
  const location = useLocation()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Redirect Admins away from the player Dashboard to the Admin panel
  if (isAdmin && location.pathname === '/dashboard') {
    return <Navigate to="/admin" replace />
  }

  // Logged in but needs subscription and doesn't have one
  if (requireSubscription && !isSubscribed) {
    return <Navigate to="/subscription" state={{ from: location }} replace />
  }

  // All checks passed
  return children
}