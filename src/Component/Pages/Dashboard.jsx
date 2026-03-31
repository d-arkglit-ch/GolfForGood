import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { LandPlot, LogOut, Crown } from 'lucide-react'
import ScoreEntry from '../ScoreEntry'
import LotteryDisplay from '../LotteryDisplay'
import authService from '../../lib/supabase'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const { user, profile, subscription, isSubscribed, signOut } = useAuth()
  const [scores, setScores] = useState([])

  // Load scores for lottery display
  useEffect(() => {
    if (!user) return
    let ignore = false

    const fetchScores = async () => {
      const { data } = await authService.supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .order('date_played', { ascending: false })
      if (!ignore) {
        setScores(data || [])
      }
    }

    fetchScores()
    return () => { ignore = true }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary-50 p-1.5 rounded-lg group-hover:bg-primary-100 transition-colors">
              <LandPlot className="h-6 w-6 text-primary-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">GolfCharity</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/profile"
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 flex items-center justify-center font-bold text-sm shadow-inner">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors hidden sm:block">
                {profile?.full_name || 'My Profile'}
              </span>
            </Link>
            
            <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-red-600 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Subscription Status Banner */}
        {isSubscribed ? (
          <div className="mb-8 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-full">
                <Crown className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-emerald-900">Active VIP Pass</p>
                <p className="text-sm text-emerald-700">
                  Renews: {new Date(subscription?.current_period_end).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
              {subscription?.plan_type || 'Monthly ₹5'}
            </span>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-full">
                <Crown className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-900">Free Account</p>
                <p className="text-sm text-amber-700">Subscribe to unlock features & support charity</p>
              </div>
            </div>
            <Link
              to="/subscription"
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors whitespace-nowrap"
            >
              Upgrade Now
            </Link>
          </div>
        )}

        {/* Locked Feature Area */}
        <div className="relative rounded-3xl overflow-hidden">
          {/* Content Grid (Dimmed but fully readable if locked) */}
          <div className={`grid md:grid-cols-2 gap-8 transition-all duration-500 ${!isSubscribed ? 'pointer-events-none select-none opacity-80' : ''}`}>
            {/* Left: Score Entry */}
            <ScoreEntry userId={user.id} />
            
            {/* Right: Lottery Display */}
            <LotteryDisplay scores={scores} user={user} />
          </div>

          {/* Freemium Paywall Overlay (Transparent backing so they can see features) */}
          {!isSubscribed && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/10 rounded-3xl p-6 text-center">
              <div className="bg-white/95 p-8 rounded-3xl shadow-2xl border border-gray-200 max-w-sm w-full mx-auto flex flex-col items-center transform transition-transform hover:scale-105 duration-300">
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-4 rounded-2xl mb-6 shadow-lg shadow-orange-500/30">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Subscriber Exclusive</h3>
                <p className="text-gray-600 font-medium mb-8">
                  Unlock exact score algorithms, track your history, and enter monthly prize draws.
                </p>
                <Link 
                  to="/subscription" 
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold text-lg shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  Unlock for ₹5/mo
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}