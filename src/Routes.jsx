import ProtectedRoute from './Component/ProtectedRoute'
import AdminRoute from './Component/AdminRoute'

// Pages
import Home from './Component/Pages/Home'
import Login from './Component/Pages/Login'
import Signup from './Component/Pages/Signup'
import Dashboard from './Component/Pages/Dashboard'
import Subscription from './Component/Pages/Subscription'
import Admin from './Component/Pages/Admin'
import Profile from './Component/Pages/Profile'

export const routes = [
  // Public routes
  {
    path: '/',
    element: <Home />,
    protected: false
  },
  {
    path: '/login',
    element: <Login />,
    protected: false
  },
  {
    path: '/signup',
    element: <Signup />,
    protected: false
  },

  // Protected - subscription required (locked features)
  {
    path: '/dashboard',
    element: <Dashboard />,
    protected: true,
    requireSubscription: false
  },
  {
    path: '/profile',
    element: <Profile />,
    protected: true,
    requireSubscription: false
  },

  // Protected - no subscription required (conversion page)
  {
    path: '/subscription',
    element: <Subscription />,
    protected: true,
    requireSubscription: false
  },

  // Admin only
  {
    path: '/admin',
    element: <Admin />,
    protected: true,
    requireSubscription: true,
    admin: true
  }
]