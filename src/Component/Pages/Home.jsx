import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Plus, ArrowRight } from 'lucide-react'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-ivory text-golf font-sans selection:bg-tan/30 overflow-x-hidden">
      {/* Editorial Header / Navigation */}
      <header className="relative z-50 border-b border-golf/10 px-6 sm:px-12 py-10 flex justify-between items-end bg-ivory">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-40 mb-1 leading-none italic text-olive">Established</span>
          <span className="text-xl font-display font-black leading-none tracking-tighter italic text-golf">2026</span>
        </div>

        {/* <nav className="hidden md:flex gap-12 text-[11px] uppercase tracking-[0.2em] font-semibold opacity-70">
          <Link to="/" className="hover:text-olive transition-colors">Membership</Link>
          <Link to="/" className="hover:text-olive transition-colors">Impact</Link>
          <Link to="/" className="hover:text-olive transition-colors">The Draw</Link>
          <Link to="/" className="hover:text-olive transition-colors">Archives</Link>
        </nav> */}

        <div className="flex gap-8 items-center">
          {user ? (
            <Link to="/dashboard" className="text-[11px] uppercase tracking-[0.2em] font-bold border-b border-golf/40 pb-1 hover:border-golf transition-colors">
              Enter Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-[11px] uppercase tracking-[0.2em] font-bold opacity-60 hover:opacity-100 transition-opacity">
                Log In
              </Link>
              <Link to="/signup" className="text-[11px] uppercase tracking-[0.2em] font-bold border-b border-olive/30 pb-1 hover:border-olive transition-colors">
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Hero Context */}
      <main className="px-6 sm:px-12 pt-16 pb-32 max-w-[1600px] mx-auto">
        
        {/* Decorative elements */}
        <div className="flex justify-center mb-12 opacity-20">
          <Plus className="h-8 w-8 stroke-[1px]" />
        </div>

        {/* The Big Headline */}
        <div className="text-center mb-20 relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-px h-24 bg-golf/10 hidden lg:block" />
          <h1 className="text-[12vw] lg:text-[10rem] font-serif font-light leading-[0.8] uppercase tracking-[-0.04em] flex flex-col items-center">
            <span className="block italic font-medium tracking-tight text-olive">Golf</span>
            <span className="block mt-4 lg:mt-8 tracking-[-0.08em] text-golf">FOR GOOD</span>
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-24 items-start">
             {/* Left Text Detail */}
             <div className="text-left order-2 lg:order-1 max-w-sm">
                <p className="text-sm leading-relaxed mb-8 opacity-80 uppercase tracking-wide">
                  Experience the intersection of tradition and purpose. Join an exclusive community of golfers making a tangible impact with every round.
                </p>
                <Link 
                  to="/signup" 
                  className="inline-flex items-center gap-4 group border border-olive/20 px-10 py-4 rounded-full text-xs uppercase tracking-[0.3em] font-bold hover:bg-olive hover:text-white transition-all duration-500"
                >
                  Join Us
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                </Link>
             </div>

             {/* Right Floating Badge */}
              <div className="text-right order-1 lg:order-2">
                <div className="inline-block text-left p-8 border border-white/5 bg-tan/40 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40">
                    <span className="block text-[10px] uppercase tracking-[0.3em] font-bold text-olive mb-3 underline decoration-olive/20 underline-offset-4 font-display italic">Winner matching</span>
                    <span className="block text-2xl font-serif italic font-bold text-golf">10% Dedicated Pool</span>
                    <span className="block text-[10px] mt-2 opacity-40 italic">Verified Charities Worldwide</span>
                </div>
              </div>
          </div>
        </div>

        {/* Editorial Imagery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[70vh] max-h-[800px]">
          <div className="relative group overflow-hidden rounded-sm bg-sand">
            <img 
              src="/golf-aerial.png" 
              alt="Aerial Golf Course" 
              className="w-full h-full object-cover grayscale-[0.2] group-hover:scale-105 transition-transform duration-1000 opacity-90"
            />
            <div className="absolute inset-0 bg-golf/5 group-hover:bg-transparent transition-colors duration-500" />
            <div className="absolute bottom-8 left-8 text-white z-10">
               <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 mb-1 block">Course Selection</span>
               <span className="text-2xl font-serif italic">The High Plains</span>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-sm bg-sand">
            <img 
              src="/golf-carts.png" 
              alt="Luxury Golf Carts" 
              className="w-full h-full object-cover grayscale-[0.2] group-hover:scale-105 transition-transform duration-1000 opacity-90"
            />
            <div className="absolute inset-0 bg-golf/5 group-hover:bg-transparent transition-colors duration-500" />
            <div className="absolute bottom-8 left-8 text-white z-10">
               <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 mb-1 block">The Experience</span>
               <span className="text-2xl font-serif italic text-white/90">Exclusive Access</span>
            </div>
          </div>
        </div>

        {/* Feature Detail Section */}
        <section className="mt-40 grid lg:grid-cols-3 gap-16 items-center">
            <div className="lg:col-span-1 space-y-8">
              <h2 className="text-4xl font-serif font-medium leading-tight">
                Crafted for those <br/> <span className="italic">who play with</span> <br/> heart.
              </h2>
              <p className="text-sm opacity-70 leading-relaxed max-w-xs font-medium uppercase tracking-tight">
                Our rolling 5-score system ensures every match is earned. Professional algorithms. Real impact. Real cash prizes.
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="p-12 border border-white/5 bg-tan/20 rounded-2xl shadow-inner backdrop-blur-sm space-y-4">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30 italic text-olive">Phase 01</span>
                    <h3 className="text-2xl font-serif bold italic text-golf">Global Giving</h3>
                    <p className="text-xs opacity-60 leading-relaxed italic">Admin-controlled active charities ensure focus and unified community support for worthy causes.</p>
                </div>
                <div className="p-12 border border-white/5 bg-tan/20 rounded-2xl shadow-inner backdrop-blur-sm space-y-4">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30 italic text-olive">Phase 02</span>
                    <h3 className="text-2xl font-serif bold italic text-golf">Monthly Draws</h3>
                    <p className="text-xs opacity-60 leading-relaxed italic">Match your historical performance against the draw. Top tiers win up to 40% of the membership pool.</p>
                </div>
            </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-golf/5 px-6 sm:px-12 py-16 flex flex-col items-center text-center gap-10">
          <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-[0.5em] font-bold opacity-30 mb-4 italic">Finest Charity Lottery</span>
              <h4 className="text-3xl font-serif italic tracking-tighter">Golf For Good</h4>
          </div>
          
          <div className="flex gap-8 text-[10px] uppercase tracking-[0.2em] font-bold opacity-40">
             <Link to="/" className="hover:opacity-100 transition-opacity">Privacy</Link>
             <Link to="/" className="hover:opacity-100 transition-opacity">Terms</Link>
             <Link to="/" className="hover:opacity-100 transition-opacity">Contact</Link>
          </div>

          <p className="text-[10px] opacity-30 uppercase tracking-[0.2em] mt-8">
            © 2026 Golf For Good • High Plains Association
          </p>
      </footer>
    </div>
  )
}