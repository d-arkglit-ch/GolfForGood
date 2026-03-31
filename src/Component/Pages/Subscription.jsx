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
  const { user, profile, isSubscribed, refreshSubscription } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  // Pre-load the script for a faster checkout opening experience
  useEffect(() => {
    loadRazorpayScript()
  }, [])

  if (isSubscribed) {
    return (
      <div className="min-h-screen bg-surface-950 text-white">
        <nav className="border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="bg-gradient-to-br from-primary-400 to-primary-600 p-2 rounded-xl">
                <LandPlot className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Golf<span className="text-primary-400">Charity</span>
              </span>
            </Link>
          </div>
        </nav>

        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex p-4 bg-primary-500/10 rounded-2xl mb-6">
              <Check className="h-10 w-10 text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold mb-3">You're a VIP Member!</h1>
            <p className="text-surface-400 mb-8">
              Thank you for supporting GolfCharity. Your active plan details are below.
            </p>

            {/* Active Plan Details Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 mb-10 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-2xl rounded-full" />
              
              <div className="flex items-center justify-between mb-6">
                <span className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  Active Plan
                </span>
                <span className="flex items-center gap-1.5 text-sm text-surface-400">
                  <Shield className="h-4 w-4" />
                  Secured
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">
                {subscription?.plan_type || 'Monthly Access'}
              </h2>
              <p className="text-surface-400 text-sm mb-6">
                Billed automatically via Razorpay
              </p>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                <div>
                  <p className="text-surface-500 text-xs uppercase font-semibold tracking-wider mb-1">Status</p>
                  <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </p>
                </div>
                <div>
                  <p className="text-surface-500 text-xs uppercase font-semibold tracking-wider mb-1">Next Billing</p>
                  <p className="text-white font-medium">
                    {subscription?.current_period_end 
                      ? new Date(subscription.current_period_end).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                      : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-primary-400 hover:to-primary-500 transition-all duration-300 shadow-xl shadow-primary-500/30"
            >
              Go to Dashboard
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

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
      // Note: If testing locally with Vite without 'vercel dev', this call might fail 
      // if you haven't set up a proxy. In production on Vercel, /api works perfectly.
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
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        subscription_id: data.subscriptionId,
        name: 'Golf Charity',
        description: 'Monthly ₹5 Subscription',
        image: 'https://cdn.lucide.dev/icons/land-plot.svg', // Simple logo
        handler: async function (response) {
          // 3. SUCCESS CALLBACK! 
          // Razorpay returns razorpay_payment_id, razorpay_subscription_id, razorpay_signature
          
          const { error: subError } = await authService.supabase
            .from('subscriptions')
            .upsert({
              user_id: user.id,
              status: 'active',
              plan_type: 'Monthly ₹5',
              amount: 500, // 500 = ₹5.00
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
          color: '#10b981', // Tailwind primary-500
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

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-surface-950 text-white flex items-center justify-center px-4">
        <div className="text-center animate-fade-in-up">
          <div className="inline-flex p-5 bg-primary-500/10 rounded-full mb-6 animate-pulse-glow">
            <Sparkles className="h-12 w-12 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Welcome to GolfCharity! 🎉</h1>
          <p className="text-surface-400 text-lg mb-2">
            Your Razorpay subscription is now active!
          </p>
          <p className="text-surface-500 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-950 text-white overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent-500/6 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative bg-gradient-to-br from-primary-400 to-primary-600 p-2 rounded-xl">
                <LandPlot className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold">
              Golf<span className="text-primary-400">Charity</span>
            </span>
          </Link>
          <Link
            to="/"
            className="text-surface-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-16 sm:py-20">
        {/* Header */}
        <div className="text-center mb-14 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 bg-accent-500/10 border border-accent-500/20 text-accent-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4" />
            Simple pricing, big impact
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Activate Your Pass
          </h1>
          <p className="text-surface-400 text-lg max-w-xl mx-auto">
            Subscribe to enter your scores, compete in monthly draws, and support local charities!
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center animate-fade-in flex flex-col items-center">
            <span className="font-bold">Error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Pricing Card */}
        <div className="max-w-md mx-auto animate-fade-in-up animation-delay-200">
          <div className="relative glass rounded-3xl p-8 sm:p-10 border border-primary-500/20 hover:border-primary-500/40 transition-colors duration-300">
            {/* Popular badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-primary-500/30">
                MVP ACCESS
              </span>
            </div>

            {/* Plan header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Monthly</h2>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-extrabold text-white">₹5</span>
                <span className="text-surface-400 text-lg">/month</span>
              </div>
              <p className="text-surface-500 text-sm mt-2">Auto-renews securely via Razorpay</p>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 mb-8" />

            {/* Features */}
            <div className="space-y-4 mb-10">
              <PlanFeature icon={<Trophy className="h-4 w-4" />} text="Enter monthly prize draws" />
              <PlanFeature icon={<Zap className="h-4 w-4" />} text="Track exact score history algorithms" />
              <PlanFeature icon={<Heart className="h-4 w-4" />} text="10% minimum guaranteed to charity" />
              <PlanFeature icon={<Star className="h-4 w-4" />} text="Jackpot rollover (40% pool)" />
              <PlanFeature icon={<Shield className="h-4 w-4" />} text="100% SECURE payments via Razorpay" />
            </div>

            {/* CTA */}
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="group w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-emerald-400 hover:to-emerald-500 transition-all duration-300 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Pay with Razorpay
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-surface-500 mt-4 flex items-center justify-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Secured by Razorpay • UPI & Cards accepted
            </p>
          </div>
        </div>

        {/* Trust signals */}
        <div className="mt-14 animate-fade-in-up animation-delay-400">
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <TrustCard value="500+" label="Players" />
            <TrustCard value="₹120K" label="Won" />
            <TrustCard value="₹48K" label="Donated" />
          </div>
        </div>
      </main>
    </div>
  )
}

/* ─────── Helper Components ─────── */

function PlanFeature({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 bg-primary-500/10 text-primary-400 p-1.5 rounded-lg">
        {icon}
      </div>
      <span className="text-surface-300 text-sm">{text}</span>
    </div>
  )
}

function TrustCard({ value, label }) {
  return (
    <div className="text-center glass rounded-xl p-4">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-xs text-surface-500">{label}</div>
    </div>
  )
}