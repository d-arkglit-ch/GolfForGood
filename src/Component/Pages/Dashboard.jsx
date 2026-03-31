import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { LandPlot, LogOut, Crown, HeartHandshake, ArrowRight } from 'lucide-react'
import ScoreEntry from '../ScoreEntry'
import LotteryDisplay from '../LotteryDisplay'
import authService from '../../lib/supabase'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const { user, profile, subscription, isSubscribed, signOut } = useAuth()
  const [scores, setScores] = useState([])
  const [activeCharity, setActiveCharity] = useState('Loading...')

  const fetchDashboardData = async () => {
    if (!user) return
    const [scoresRes, settingsRes] = await Promise.all([
      authService.supabase.from('scores').select('*').eq('user_id', user.id).order('date_played', { ascending: false }),
      authService.supabase.from('platform_settings').select('active_charity').eq('id', 1).single()
    ])
    
    setScores(scoresRes.data || [])
    if (settingsRes.data) {
      setActiveCharity(settingsRes.data.active_charity)
    } else {
      setActiveCharity('Global Golf Foundation')
    }
  }

  // Load scores and charity data on mount
  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-ivory text-golf font-sans selection:bg-tan/30 leading-relaxed">
      {/* Editorial Header */}
      <header className="relative z-50 border-b border-golf/10 px-6 sm:px-12 py-6 sm:py-10 flex flex-col sm:flex-row justify-between items-center sm:items-end bg-ivory gap-6 sm:gap-0">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-60 mb-1 leading-none italic text-olive">Established 2026</span>
          <span className="text-xl font-display font-black leading-none tracking-tighter italic text-golf">Golf For Good</span>
        </div>

        <div className="flex gap-6 sm:gap-8 items-center">
          <Link
            to="/profile"
            className="group flex items-center gap-3 px-4 py-2 rounded-full border border-olive/10 hover:bg-olive hover:text-white transition-all duration-500"
          >
            <div className="w-6 h-6 rounded-full bg-pastel-olive/30 text-olive flex items-center justify-center font-bold text-[10px] uppercase group-hover:bg-white/20 group-hover:text-white">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
              {profile?.full_name?.split(' ')[0] || 'Profile'}
            </span>
          </Link>
          
          <button
            onClick={handleSignOut}
            className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 hover:opacity-100 hover:text-red-700 transition-all flex items-center gap-2"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden xs:inline">Leave</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Charity Banner */}
        <div className="mb-12 p-6 bg-pastel-olive/10 border border-olive/10 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up">
          <div className="bg-olive/10 p-2 rounded-full">
            <HeartHandshake className="h-5 w-5 text-olive" />
          </div>
          <span className="text-[11px] uppercase tracking-[0.1em] font-bold text-olive/80 text-center sm:text-left">
             Monthly Beneficiary: <span className="text-golf underline decoration-olive/30 underline-offset-4">{activeCharity}</span>
          </span>
        </div>

        {/* Subscription Status Banner */}
        {isSubscribed ? (
          <div className="mb-16 p-6 border border-olive/10 bg-sand/5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-olive/10 p-3 rounded-full">
                <Crown className="h-6 w-6 text-olive" />
              </div>
              <div>
                <p className="text-lg font-serif italic font-bold">VIP Membership Active</p>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                  Renews: {new Date(subscription?.current_period_end).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <Link
              to="/subscription"
              className="text-[10px] uppercase tracking-[0.2em] font-bold border-b border-olive/40 pb-1 hover:border-olive transition-all flex items-center gap-2"
            >
              Manage Privilege <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="mb-16 p-8 border border-white/5 bg-tan text-golf rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-4">
              <div className="bg-olive/10 p-3 rounded-full">
                <Crown className="h-6 w-6 text-olive" />
              </div>
              <div>
                <p className="text-2xl font-serif italic font-bold">Amateur Status</p>
                <p className="text-sm opacity-60">Upgrade to join the inner circle and support the cause.</p>
              </div>
            </div>
            <Link
              to="/subscription"
              className="bg-golf text-ivory px-8 py-3 rounded-full text-[11px] uppercase tracking-[0.2em] font-extrabold hover:opacity-90 transition-all whitespace-nowrap"
            >
              Secure Pass
            </Link>
          </div>
        )}

        {/* Split Feature Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Left Column: Score Entry (The Freemium Paywall target) */}
          <div className="relative rounded-3xl overflow-hidden h-full">
            <div className={`transition-all duration-500 h-full ${!isSubscribed ? 'pointer-events-none select-none opacity-40 blur-[2px] scale-[0.98]' : ''}`}>
              <ScoreEntry userId={user.id} onScoreChange={fetchDashboardData} />
            </div>

            {/* Paywall Overlay locked exclusively to the Left Side */}
            {!isSubscribed && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center backdrop-blur-[4px]">
                <div className="bg-ivory/95 p-8 sm:p-10 rounded-2xl shadow-2xl border border-olive/10 max-w-sm mx-auto flex flex-col items-center transform transition-transform hover:scale-105 duration-500">
                  <div className="bg-olive/10 p-4 rounded-full mb-6">
                    <Crown className="w-8 h-8 text-olive" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif italic font-bold mb-4">Subscriber Exclusive</h3>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold opacity-50 mb-6 sm:mb-8 leading-relaxed">
                    Unlock elite algorithms and enter your rounds to fuel the Legacy Draw.
                  </p>
                  <Link 
                    to="/subscription" 
                    className="w-full bg-olive text-white px-8 py-4 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold shadow-xl shadow-olive/10 hover:bg-olive/90 transition-all text-center"
                  >
                    Upgrade Privilege
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column: Lottery Display (Unlocked, relying on natural progression) */}
          <div className="h-full">
            <LotteryDisplay scores={scores} user={user} />
          </div>
        </div>
      </main>
    </div>
  )
}