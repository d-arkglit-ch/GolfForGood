import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import authService from '../../lib/supabase'
import { LandPlot, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const authData = await signIn(email, password)
      
      // Determine user role immediately upon login to route correctly
      try {
        const profileData = await authService.getProfile(authData.user.id)
        if (profileData?.is_admin) {
          navigate('/admin')
          return
        }
      } catch (profileError) {
        console.warn('Could not fetch profile during login router:', profileError)
      }

      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory text-golf font-sans selection:bg-tan/30 leading-relaxed">
      <header className="relative z-50 border-b border-golf/10 px-6 sm:px-12 py-10 flex justify-between items-end bg-ivory">
        <div className="flex flex-col text-left">
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-40 mb-1 leading-none italic text-olive">Established</span>
          <span className="text-xl font-display font-black leading-none tracking-tighter italic text-golf">2026</span>
        </div>

        <nav className="hidden md:flex gap-12 text-[11px] uppercase tracking-[0.2em] font-semibold opacity-40 italic">
          <Link to="/" className="hover:text-olive transition-colors underline decoration-olive/20 underline-offset-4">Return Home</Link>
        </nav>

        <div className="flex gap-8 items-center">
          <Link to="/signup" className="text-[11px] uppercase tracking-[0.2em] font-bold border-b border-golf/40 pb-1 hover:border-golf transition-colors">
            Initiate Membership
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="p-8">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-display font-black italic text-golf mb-4">
                Access Portal
              </h1>
              <p className="text-[11px] uppercase tracking-[0.2em] opacity-60">
                Sign in to enter scores and view your lottery numbers
              </p>
            </div>

            {error && (
              <div className="mb-8 p-6 bg-red-950/40 border border-red-900/20 rounded-xl text-red-100 text-[10px] uppercase tracking-widest font-bold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-olive/40 mb-3 italic">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-6 py-4 bg-transparent border border-golf/10 rounded-full font-serif italic text-lg text-golf focus:border-olive outline-none transition-all duration-500 shadow-inner"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-olive/40 mb-3 italic">
                  Secret Sequence
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-6 py-4 bg-transparent border border-golf/10 rounded-full font-serif italic text-lg text-golf focus:border-olive outline-none transition-all duration-500 shadow-inner pr-16"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-olive/30 hover:text-olive transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-golf text-ivory py-5 rounded-full font-bold text-[11px] uppercase tracking-[0.4em] hover:opacity-90 transition-all duration-500 shadow-2xl shadow-black/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-4"
              >
                {loading ? (
                   <div className="animate-spin rounded-full h-4 w-4 border-2 border-ivory/30 border-t-ivory" />
                ) : (
                  <>
                    Secure Entry <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                New Prospect?{' '}
                <Link to="/signup" className="text-olive underline decoration-olive/30 underline-offset-4 ml-2">
                  Initiate Membership
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}