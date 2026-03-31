import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Trophy,
  Heart,
  LandPlot,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Users,
  TrendingUp,
  Shield,
  Star,
  Zap,
  DollarSign,
  Gift,
} from 'lucide-react'

export default function Home() {
  const { user, isSubscribed } = useAuth()

  return (
    <div className="min-h-screen bg-surface-950 text-white overflow-hidden">
      {/* Ambient background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-500/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-600/5 rounded-full blur-[150px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative bg-gradient-to-br from-primary-400 to-primary-600 p-2 rounded-xl">
                  <LandPlot className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight">
                Golf<span className="text-primary-400">Charity</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {user ? (
                <Link
                  to="/dashboard"
                  className="group relative bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:from-primary-400 hover:to-primary-500 transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 flex items-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-surface-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="group relative bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:from-primary-400 hover:to-primary-500 transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 flex items-center gap-2"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-28 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 text-primary-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            <span>Monthly draws • Real prizes • Real impact</span>
          </div>

          {/* Main Heading */}
          <h1 className="animate-fade-in-up animation-delay-100 text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            Play Golf.{' '}
            <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-accent-400 bg-clip-text text-transparent animate-gradient">
              Give Back.
            </span>
            <br />
            Win Big.
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up animation-delay-200 text-lg sm:text-xl text-surface-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Enter your golf scores, support charities you care about, and compete
            in monthly prize draws. Your game fuels a greater purpose.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up animation-delay-300 flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link
                to="/dashboard"
                className="group relative bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-primary-400 hover:to-primary-500 transition-all duration-300 shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5 flex items-center gap-2.5"
              >
                Enter Scores Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="group relative bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-primary-400 hover:to-primary-500 transition-all duration-300 shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5 flex items-center gap-2.5"
                >
                  Start Playing
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="group text-surface-300 hover:text-white px-8 py-4 rounded-2xl text-lg font-medium border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300 flex items-center gap-2.5"
                >
                  I have an account
                </Link>
              </>
            )}
          </div>

          <p className="animate-fade-in-up animation-delay-400 mt-5 text-sm text-surface-500 flex items-center justify-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            $10/month • Cancel anytime • Secure payments via Stripe
          </p>
        </div>

        {/* Floating stats cards */}
        <div className="animate-fade-in-up animation-delay-500 max-w-4xl mx-auto mt-16 grid grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            value="500+"
            label="Active Players"
            delay="0"
          />
          <StatCard
            icon={<DollarSign className="h-5 w-5" />}
            value="$12K"
            label="Prizes Awarded"
            delay="1"
          />
          <StatCard
            icon={<Heart className="h-5 w-5" />}
            value="$4.8K"
            label="Donated to Charity"
            delay="2"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-primary-400 text-sm font-semibold tracking-wider uppercase mb-3">
              Simple & Rewarding
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-surface-400 max-w-xl mx-auto">
              Three simple steps to start winning prizes and making a difference
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <StepCard
              icon={<LandPlot className="h-6 w-6" />}
              number="01"
              title="Enter Your Scores"
              description="Submit your last 5 rounds in Stableford format. We maintain your rolling average automatically."
              gradient="from-primary-500/20 to-primary-600/20"
              iconBg="from-primary-400 to-primary-600"
              delay={0}
            />
            <StepCard
              icon={<Heart className="h-6 w-6" />}
              number="02"
              title="Support Charities"
              description="10% of your subscription goes directly to a charity of your choice. You can always give more."
              gradient="from-rose-500/20 to-pink-600/20"
              iconBg="from-rose-400 to-pink-600"
              delay={1}
            />
            <StepCard
              icon={<Trophy className="h-6 w-6" />}
              number="03"
              title="Win Monthly Prizes"
              description="Your scores generate lottery numbers. Match in our monthly draw and win real cash prizes."
              gradient="from-accent-500/20 to-amber-600/20"
              iconBg="from-accent-400 to-amber-600"
              delay={2}
            />
          </div>
        </div>
      </section>

      {/* Prize Pool Breakdown */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            {/* Decorative accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-accent-500/10 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary-500/10 to-transparent rounded-tr-full" />

            <div className="relative">
              <div className="text-center mb-12">
                <span className="inline-block text-accent-400 text-sm font-semibold tracking-wider uppercase mb-3">
                  Prize Distribution
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Real Money. Real Winners.
                </h2>
                <p className="text-surface-400 max-w-lg mx-auto">
                  Every month's subscription pool is split into three prize tiers
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <PrizeCard
                  tier="5-Number Match"
                  percentage="40%"
                  highlight="Jackpot rolls over!"
                  icon={<Star className="h-5 w-5" />}
                  color="accent"
                />
                <PrizeCard
                  tier="4-Number Match"
                  percentage="35%"
                  highlight="Split among winners"
                  icon={<Zap className="h-5 w-5" />}
                  color="primary"
                />
                <PrizeCard
                  tier="3-Number Match"
                  percentage="25%"
                  highlight="Split among winners"
                  icon={<Gift className="h-5 w-5" />}
                  color="primary"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Why GolfCharity */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-primary-400 text-sm font-semibold tracking-wider uppercase mb-3">
              Built Different
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why GolfCharity?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <FeatureCard
              icon={<TrendingUp className="h-5 w-5" />}
              title="Fair Rolling System"
              description="Rolling 5-score system keeps competition fair and rewards consistency."
            />
            <FeatureCard
              icon={<Trophy className="h-5 w-5" />}
              title="Jackpot Rollovers"
              description="40% of the pool goes to jackpot — it rolls over if no one wins."
            />
            <FeatureCard
              icon={<Heart className="h-5 w-5" />}
              title="Verified Charities"
              description="Support verified charities with every round you play."
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5" />}
              title="Secure & Modern"
              description="Simple, premium interface — no golf clichés, just great design."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-10 sm:p-16 text-center overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-6 left-8 w-3 h-3 bg-white/30 rounded-full animate-float" />
              <div className="absolute top-12 right-16 w-2 h-2 bg-white/20 rounded-full animate-float animation-delay-200" />
              <div className="absolute bottom-10 left-1/4 w-2.5 h-2.5 bg-white/25 rounded-full animate-float animation-delay-400" />
              <div className="absolute bottom-16 right-1/3 w-2 h-2 bg-white/20 rounded-full animate-float animation-delay-600" />
            </div>

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Play for Good?
              </h2>
              <p className="text-primary-100/80 mb-10 text-lg max-w-lg mx-auto leading-relaxed">
                Join hundreds of golfers supporting charities and winning prizes
                every single month.
              </p>

              {user ? (
                <Link
                  to="/dashboard"
                  className="group inline-flex items-center gap-2.5 bg-white text-primary-700 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-primary-50 transition-all duration-300 shadow-xl hover:-translate-y-0.5"
                >
                  {isSubscribed ? 'Enter Your Scores' : 'Subscribe Now'}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-2.5 bg-white text-primary-700 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-primary-50 transition-all duration-300 shadow-xl hover:-translate-y-0.5"
                >
                  Create Free Account
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary-400 to-primary-600 p-1.5 rounded-lg">
              <LandPlot className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-surface-400">
              Golf<span className="text-primary-400">Charity</span>
            </span>
          </div>
          <p className="text-sm text-surface-600">
            © 2026 GolfCharity. Built for Digital Heroes selection.
          </p>
        </div>
      </footer>
    </div>
  )
}

/* ─────── Helper Components ─────── */

function StatCard({ icon, value, label }) {
  return (
    <div className="glass rounded-2xl p-5 sm:p-6 text-center hover:bg-white/[0.08] transition-colors duration-300 group">
      <div className="text-primary-400 mb-2 flex justify-center group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{value}</div>
      <div className="text-xs sm:text-sm text-surface-400 font-medium">{label}</div>
    </div>
  )
}

function StepCard({ icon, number, title, description, gradient, iconBg }) {
  return (
    <div className={`group relative bg-gradient-to-br ${gradient} rounded-2xl p-7 border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex items-center gap-3 mb-5">
        <div className={`bg-gradient-to-br ${iconBg} p-2.5 rounded-xl text-white shadow-lg`}>
          {icon}
        </div>
        <span className="text-surface-500 text-sm font-bold tracking-wider">{number}</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-2.5">{title}</h3>
      <p className="text-surface-400 leading-relaxed text-sm">{description}</p>
    </div>
  )
}

function PrizeCard({ tier, percentage, highlight, icon, color }) {
  const isAccent = color === 'accent'
  return (
    <div className={`group relative rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${
      isAccent
        ? 'bg-accent-500/10 border-accent-500/20 hover:border-accent-500/40'
        : 'bg-primary-500/10 border-primary-500/20 hover:border-primary-500/40'
    }`}>
      <div className={`inline-flex p-2 rounded-lg mb-4 ${
        isAccent ? 'bg-accent-500/20 text-accent-400' : 'bg-primary-500/20 text-primary-400'
      }`}>
        {icon}
      </div>
      <div className={`text-4xl font-extrabold mb-1 ${
        isAccent ? 'text-accent-400' : 'text-primary-400'
      }`}>
        {percentage}
      </div>
      <div className="text-white font-semibold mb-1">{tier}</div>
      <div className={`text-xs font-medium ${
        isAccent ? 'text-accent-300/70' : 'text-primary-300/70'
      }`}>
        {highlight}
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group flex gap-4 p-5 rounded-2xl border border-white/5 hover:border-primary-500/20 hover:bg-primary-500/5 transition-all duration-300">
      <div className="flex-shrink-0 bg-primary-500/10 text-primary-400 p-2.5 rounded-xl h-fit group-hover:bg-primary-500/20 transition-colors duration-300">
        {icon}
      </div>
      <div>
        <h3 className="text-white font-semibold mb-1">{title}</h3>
        <p className="text-surface-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}