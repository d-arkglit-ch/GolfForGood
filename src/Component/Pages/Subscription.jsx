import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import authService from '../../lib/supabase'
import {
  LandPlot,
  Check,
  ArrowRight,
  Shield,
  Trophy,
  Heart,
  Zap,
  Star,
  Sparkles,
  CreditCard,
  ArrowLeft,
  RefreshCw,
  X
} from 'lucide-react'

// Helper to dynamically load the Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function Subscription() {
  const { user, profile, subscription, isSubscribed, refreshSubscription } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  // Pre-load the script for a faster checkout opening experience
  useEffect(() => {
    loadRazorpayScript()
  }, [])

  // Handle "Subscribe" with Razorpay
  const handleSubscribe = async () => {
    setLoading(true)
    setError('')

    try {
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Are you online?')
      }

      // 1. Ask our backend to generate a Razorpay Subscription ID
      const response = await fetch('/api/create-razorpay-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize subscription')
      }

      // 2. Open the Razorpay Checkout Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        subscription_id: data.subscriptionId,
        name: 'Golf Charity',
        description: 'Monthly ₹5 Subscription',
        image: 'https://cdn.lucide.dev/icons/land-plot.svg', 
        handler: async function (response) {
          const { error: subError } = await authService.supabase
            .from('subscriptions')
            .upsert({
              user_id: user.id,
              status: 'active',
              plan_type: 'Monthly ₹5',
              amount: 500, 
              stripe_customer_id: response.razorpay_payment_id || 'razorpay_direct',
              stripe_subscription_id: response.razorpay_subscription_id,
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            }, { onConflict: 'user_id' })

          if (subError) console.error("Could not instantly update local DB, relying on webhook:", subError)

          setSuccess(true)
          await refreshSubscription()
          setTimeout(() => navigate('/dashboard'), 2000)
        },
        prefill: {
          name: profile?.full_name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#10b981', 
        },
      }

      const razorpayInstance = new window.Razorpay(options)
      razorpayInstance.on('payment.failed', function (response){
        console.error(response.error)
        setError(response.error.description || 'Payment completely failed or was canceled.')
      })
      razorpayInstance.open()

    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to activate subscription. Check console.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Cancel Subscription
  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your VIP membership? You will lose access to premium features immediately.')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: cancelError } = await authService.supabase
        .from('subscriptions')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (cancelError) throw cancelError

      // Refresh local auth state so the UI updates globally
      await refreshSubscription()
      
    } catch (err) {
      console.error('Cancellation error:', err)
      setError('Failed to cancel subscription. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <div className="min-h-screen bg-ivory text-golf font-sans selection:bg-tan/30 overflow-x-hidden">
        <nav className="relative z-50 border-b border-golf/10 px-6 sm:px-12 py-10 flex justify-between items-end bg-ivory">
          <Link to="/" className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-40 mb-1 leading-none italic text-olive">Established 2026</span>
            <span className="text-xl font-display font-black leading-none tracking-tighter italic text-golf">Golf For Good</span>
          </Link>
          <Link to="/dashboard" className="text-[11px] uppercase tracking-[0.2em] font-bold border-b border-golf/40 pb-1 hover:border-golf transition-colors">
            Dashboard
          </Link>
        </nav>

        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex p-5 bg-olive/5 rounded-full mb-8">
              <Check className="h-10 w-10 text-olive" />
            </div>
            <h1 className="text-5xl font-serif italic mb-4">Membership Active</h1>
            <p className="text-sm uppercase tracking-widest opacity-60 mb-12 max-w-xs mx-auto">
              Welcome to the inner circle. Your dedication to the game and the cause is noted.
            </p>

            {/* Active Plan Details Card */}
            <div className="bg-tan/40 border border-white/5 rounded-2xl p-10 mb-12 text-left relative overflow-hidden backdrop-blur-xl shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between mb-8">
                <span className="bg-olive/20 text-olive px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-olive/10">
                  VIP Privilege
                </span>
                <span className="flex items-center gap-2 text-[10px] uppercase font-bold opacity-40">
                  <Shield className="h-3 w-3" />
                  Verified
                </span>
              </div>

              <h2 className="text-3xl font-serif italic text-golf mb-2">
                {subscription?.plan_type || 'Monthly Access'}
              </h2>
              <p className="text-xs opacity-50 mb-8 font-medium">
                Recurring support via secured channels
              </p>

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-olive/5">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">Account Status</p>
                  <p className="text-olive font-bold flex items-center gap-2 text-sm italic">
                    <div className="w-1.5 h-1.5 rounded-full bg-olive animate-pulse" />
                    Distinguished
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">Next Occasion</p>
                  <p className="text-golf font-serif italic text-lg">
                    {subscription?.current_period_end 
                      ? new Date(subscription.current_period_end).toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' })
                      : 'Rolling'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 items-center">
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-4 bg-golf text-ivory px-12 py-4 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold hover:opacity-90 transition-all duration-500 shadow-2xl shadow-black/20"
              >
                Enter Clubhouse
                <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
              </Link>
              
              <button
                onClick={handleCancelSubscription}
                disabled={loading}
                className="text-[10px] uppercase tracking-widest font-bold opacity-30 hover:opacity-100 hover:text-red-700 transition-all disabled:opacity-10"
              >
                {loading ? 'Processing...' : 'Relinquish Membership'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-ivory text-golf flex items-center justify-center px-4">
        <div className="text-center animate-fade-in-up">
          <div className="inline-flex p-6 bg-tan border border-white/5 rounded-full mb-8">
            <Sparkles className="h-12 w-12 text-olive animate-float" />
          </div>
          <h1 className="text-5xl font-serif italic mb-4">Welcome</h1>
          <p className="text-sm uppercase tracking-[0.3em] opacity-60 mb-8">
            The transition is complete. Redirecting you...
          </p>
          <div className="flex justify-center opacity-20">
             <RefreshCw className="h-6 w-6 animate-spin stroke-[1px]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory text-golf font-sans selection:bg-tan/30 overflow-x-hidden">
      
      {/* Editorial Header */}
      <nav className="relative z-50 border-b border-golf/10 px-6 sm:px-12 py-10 flex justify-between items-end bg-ivory">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-40 mb-1 leading-none italic text-olive">Established 2026</span>
          <span className="text-xl font-display font-black leading-none tracking-tighter italic text-golf">Golf For Good</span>
        </div>
        <Link to="/" className="text-[11px] uppercase tracking-[0.2em] font-bold opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2">
          <ArrowLeft className="h-3 w-3 text-olive" />
          Return
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-24 sm:py-32">
        {/* Header */}
        <div className="text-center mb-24 animate-fade-in-up">
          <span className="inline-flex items-center gap-3 bg-tan/40 border border-white/10 text-olive px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 backdrop-blur-md">
            <Star className="h-3 w-3 fill-current" />
            The Patron's Pass
          </span>
          <h1 className="text-6xl sm:text-8xl font-serif italic leading-tight mb-8">
            Join the <br/> Legacy
          </h1>
          <p className="text-sm uppercase tracking-widest opacity-60 max-w-lg mx-auto font-medium leading-relaxed">
            Exclusive access to tournament draws, detailed performance metrics, and a direct line of impact to global charities.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-16 p-6 bg-red-50 border border-red-100 rounded-xl text-red-800 text-[11px] uppercase tracking-widest font-bold text-center animate-fade-in shadow-xl shadow-red-900/5">
            {error}
          </div>
        )}

        {/* Pricing Card */}
        <div className="max-w-md mx-auto animate-fade-in-up animation-delay-200">
           <div className="relative group">
              {/* Decorative shadow layer */}
              <div className="absolute inset-4 bg-olive/5 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
              
              <div className="bg-tan/40 border border-white/5 rounded-2xl p-10 sm:p-12 text-center backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-black/40">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <LandPlot className="h-24 w-24 stroke-[1px] text-golf" />
                </div>

                <h2 className="text-[11px] uppercase tracking-[0.4em] font-black opacity-30 mb-8">Sustaining Member</h2>
                
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-7xl font-display font-black tracking-tighter italic">₹5</span>
                  <span className="text-sm uppercase tracking-widest font-bold opacity-30">/mo</span>
                </div>
                <p className="text-[9px] uppercase tracking-widest font-bold opacity-40 mb-12 italic border-y border-olive/5 py-4">Secure monthly Contribution</p>

                {/* Features */}
                <div className="space-y-6 mb-12 text-left">
                  <PlanFeature icon={<Trophy className="h-4 w-4" />} text="Tournament Tier Eligibility" />
                  <PlanFeature icon={<Trophy className="h-4 w-4" />} text="Advanced Performance Analytics" />
                  <PlanFeature icon={<Heart className="h-4 w-4" />} text="10% Dedicated Charity Pool" />
                  <PlanFeature icon={<Shield className="h-4 w-4" />} text="Verified Transaction Trust" />
                </div>

                {/* CTA */}
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full bg-golf text-ivory py-5 rounded-full font-bold text-[11px] uppercase tracking-[0.3em] hover:opacity-90 transition-all duration-500 shadow-2xl shadow-black/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-4"
                >
                  {loading ? 'Commencing...' : (
                    <>
                      Secure with Razorpay
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-20 mt-8">
                  UPI • Cards • Trusted by High Plains
                </p>
              </div>
           </div>
        </div>

        {/* Global Statistics */}
        <div className="mt-32 max-w-xl mx-auto opacity-40 grayscale group hover:grayscale-0 transition-all duration-1000">
           <div className="grid grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <p className="text-2xl font-serif italic font-bold">500+</p>
                <p className="text-[9px] uppercase tracking-widest font-bold">Patrons</p>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-serif italic font-bold">₹120K</p>
                <p className="text-[9px] uppercase tracking-widest font-bold">Distributions</p>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-serif italic font-bold">₹48K</p>
                <p className="text-[9px] uppercase tracking-widest font-bold">Impact</p>
              </div>
           </div>
        </div>
      </main>
    </div>
  )
}

/* ─────── Helper Components ─────── */

function PlanFeature({ icon, text }) {
  return (
    <div className="flex items-center gap-4 py-1 border-b border-olive/5 last:border-0">
      <div className="text-olive/40 stroke-[1px]">
        {icon}
      </div>
      <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">{text}</span>
    </div>
  )
}

function TrustCard({ value, label }) {
  return (
    <div className="text-center bg-tan/20 border border-white/5 rounded-xl p-4 backdrop-blur-sm shadow-inner">
      <div className="text-lg font-bold text-golf">{value}</div>
      <div className="text-xs opacity-40 uppercase tracking-widest font-bold">{label}</div>
    </div>
  )
}