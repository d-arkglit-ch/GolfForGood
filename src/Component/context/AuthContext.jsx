import { createContext, useContext, useEffect, useState } from 'react'
import authService from '../../lib/supabase'

const AuthContext = createContext()

// Test mode: when true, any logged-in user gets full access (subscribed + admin)
const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    authService.supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserData(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = authService.supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserData(session.user.id)
      } else {
        setProfile(null)
        setSubscription(null)
        setLoading(false)
      }
    })

    return () => authSubscription.unsubscribe()
  }, [])

  const loadUserData = async (userId) => {
    try {
      const [profileData, subData] = await Promise.all([
        authService.getProfile(userId).catch(() => null),
        authService.getSubscription(userId).catch(() => null) // Subscription might not exist
      ])
      setProfile(profileData)
      setSubscription(subData)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshSubscription = async () => {
    if (user) {
      const subData = await authService.getSubscription(user.id).catch(() => null)
      setSubscription(subData)
    }
  }

  // In test mode: any logged-in user is subscribed + admin
  const isSubscribed = TEST_MODE
    ? !!user
    : subscription?.status === 'active'

  const isAdmin = TEST_MODE
    ? !!user
    : (profile?.is_admin ?? false)

  if (TEST_MODE && user) {
    console.log('%c🧪 TEST MODE ACTIVE — subscription & admin checks bypassed', 'color: #10b981; font-weight: bold;')
  }

  const value = {
    user,
    profile,
    subscription,
    loading,
    isSubscribed,
    refreshSubscription,
    isAdmin,
    // Expose auth methods
    signUp: authService.signUp.bind(authService),
    signIn: authService.signIn.bind(authService),
    signOut: authService.signOut.bind(authService)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}