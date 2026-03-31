import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LandPlot, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signUp } = useAuth()
  const navigate = useNavigate()

  // Password strength rules using regex
  const passwordRules = useMemo(() => [
    { label: 'Min 8 characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number (0-9)', met: /[0-9]/.test(password) },
    { label: 'Special char (!@#$)', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ], [password])

  const passwordStrength = useMemo(() => passwordRules.filter(r => r.met).length, [passwordRules])
  const isPasswordValid = passwordStrength === 5

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!agreeTerms) {
      setError('Please agree to the terms and conditions')
      return
    }

    if (!isPasswordValid) {
      setError('Please meet all password requirements')
      return
    }

    setLoading(true)

    try {
      await signUp(email, password, fullName)
      navigate('/subscription')
    } catch (err) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory text-golf font-sans selection:bg-tan/30 leading-relaxed">
      {/* Editorial Header */}
      <header className="relative z-50 border-b border-golf/10 px-6 sm:px-12 py-10 flex justify-between items-end bg-ivory">
        <Link to="/" className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-40 mb-1 leading-none italic text-olive">Established 2026</span>
          <span className="text-xl font-display font-black leading-none tracking-tighter italic text-golf">Golf For Good</span>
        </Link>
        <Link to="/login" className="text-[11px] uppercase tracking-[0.2em] font-bold border-b border-golf/40 pb-1 hover:border-golf transition-colors">
          Log In
        </Link>
      </header>

      {/* Signup Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-20 animate-fade-in-up">
        <div className="w-full max-w-md">
          <div className="bg-tan/40 border border-white/5 rounded-2xl p-10 backdrop-blur-xl shadow-2xl shadow-black/40">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-serif italic font-bold text-golf mb-4">
                Join the Legacy
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 italic">
                Start playing, giving, and winning today.
              </p>
            </div>

            {/* Benefits */}
            <div className="mb-10 space-y-2">
              <BenefitItem text="Enter unlimited golf scores" />
              <BenefitItem text="Win monthly cash prizes" />
              <BenefitItem text="Support charities with every round" />
            </div>

            {error && (
              <div className="mb-8 p-6 bg-red-950/40 border border-red-900/20 rounded-xl text-red-200 text-[10px] uppercase tracking-widest font-bold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-olive/40 mb-3 italic">
                  Identity
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-6 py-4 bg-ivory border border-white/10 rounded-full font-serif italic text-lg text-golf focus:border-olive outline-none transition-all duration-500 shadow-inner"
                  placeholder="Your Full Name"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-olive/40 mb-3 italic">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-6 py-4 bg-ivory border border-white/10 rounded-full font-serif italic text-lg text-golf focus:border-olive outline-none transition-all duration-500 shadow-inner"
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
                    className="w-full px-6 py-4 bg-ivory border border-white/10 rounded-full font-serif italic text-lg text-golf focus:border-olive outline-none transition-all duration-500 shadow-inner pr-16"
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

                {/* Strength Meter Bar */}
                {password.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1 bg-golf/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            passwordStrength <= 1 ? 'bg-red-900' :
                            passwordStrength <= 2 ? 'bg-orange-900' :
                            passwordStrength <= 3 ? 'bg-amber-700' :
                            passwordStrength <= 4 ? 'bg-olive/60' :
                            'bg-olive'
                          }`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <span className={`text-[9px] uppercase tracking-widest font-bold ${
                        passwordStrength <= 1 ? 'text-red-900' :
                        passwordStrength <= 2 ? 'text-orange-900' :
                        passwordStrength <= 3 ? 'text-amber-700' :
                        passwordStrength <= 4 ? 'text-olive/60' :
                        'text-olive'
                      }`}>
                        {passwordStrength <= 1 ? 'Weak' :
                         passwordStrength <= 2 ? 'Fair' :
                         passwordStrength <= 3 ? 'Good' :
                         passwordStrength <= 4 ? 'Strong' :
                         'Excellent'}
                      </span>
                    </div>

                    {/* Per-rule checklist */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      {passwordRules.map((rule, i) => (
                        <div key={i} className={`flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-widest transition-colors ${rule.met ? 'text-olive' : 'text-golf/10'}`}>
                          {rule.met ? <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-white/10 flex-shrink-0" />}
                          {rule.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 pt-4">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 bg-ivory border-golf/20 rounded text-olive focus:ring-olive"
                />
                <label htmlFor="terms" className="text-[10px] uppercase tracking-widest font-bold opacity-60">
                  I agree to the{' '}
                  <Link to="/" className="text-olive underline decoration-olive/30 underline-offset-4">Terms</Link>
                  {' '}and{' '}
                  <Link to="/" className="text-olive underline decoration-olive/30 underline-offset-4">Privacy Policy</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || (password.length > 0 && !isPasswordValid)}
                className="w-full bg-golf text-ivory py-5 rounded-full font-bold text-[11px] uppercase tracking-[0.3em] hover:opacity-90 transition-all duration-500 shadow-2xl shadow-black/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-4"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-ivory/30 border-t-ivory" />
                ) : (
                  <>
                    Secure Registry <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                Already have an account?{' '}
                <Link to="/login" className="text-olive underline decoration-olive/30 underline-offset-4 ml-2">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Component
function BenefitItem({ text }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-golf/5 last:border-0 opacity-60">
      <CheckCircle className="h-4 w-4 text-olive stroke-[2px]" />
      <span className="text-[11px] uppercase tracking-widest font-bold italic">{text}</span>
    </div>
  )
}