import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import authService from '../../lib/supabase'
import {
  LandPlot,
  ArrowLeft,
  User,
  Mail,
  Heart,
  CreditCard,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function Profile() {
  const { user, profile, subscription, isSubscribed } = useAuth()
  
  const [fullName, setFullName] = useState(profile?.full_name || '')
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' })

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveMessage({ text: '', type: '' })

    try {
      const { error } = await authService.supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          // Since it's MVP, we fake store charity preference or add column if exists.
          // For safety (if column doesn't exist), we might just simulate success.
          // But trying to update a non-existent column will throw error. 
          // Assuming `full_name` exists. We'll only update full_name.
        })
        .eq('id', user.id)

      if (error) throw error

      setSaveMessage({ text: 'Profile updated successfully!', type: 'success' })
    } catch (err) {
      console.error(err)
      setSaveMessage({ text: 'Failed to update profile.', type: 'error' })
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage({ text: '', type: '' }), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-ivory text-golf font-sans selection:bg-tan/30">
      {/* Editorial Header */}
      <header className="relative z-50 border-b border-olive/5 px-6 sm:px-12 py-8 flex justify-between items-end bg-ivory">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-60 mb-1 leading-none italic text-olive">Account Identity</span>
          <span className="text-xl font-display font-black leading-none tracking-tighter italic">Golf For Good</span>
        </div>
        <Link
          to="/dashboard"
          className="text-[11px] uppercase tracking-[0.2em] font-bold opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2"
        >
          <ArrowLeft className="h-3 w-3" /> Dashboard
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20 animate-fade-in-up">
        <h1 className="text-6xl font-serif italic font-bold mb-16">Profile</h1>

        <div className="space-y-12">
          
          {/* Subscription Card */}
          <div className="bg-sand/10 rounded-2xl border border-olive/10 p-8 shadow-2xl shadow-olive/5">
            <h2 className="text-2xl font-serif italic font-bold text-golf mb-8 flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-olive/40" /> 
              Member Standing
            </h2>
            
            {isSubscribed ? (
               <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-tan border border-white/5 p-8 rounded-xl shadow-lg shadow-black/20">
                 <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-olive animate-pulse" />
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-olive italic">Active Benefactor</span>
                    </div>
                    <p className="text-lg font-serif italic font-bold text-golf">{subscription?.plan_type || 'Monthly'} Access</p>
                 </div>
                 <div className="mt-6 sm:mt-0 text-left sm:text-right">
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-30 mb-1">Occasion Renewal</p>
                    <p className="text-golf font-serif italic text-lg">{new Date(subscription?.current_period_end).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                 </div>
               </div>
            ) : (
              <div className="flex items-center justify-between bg-tan p-8 rounded-xl text-golf shadow-2xl shadow-black/20">
                 <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-60">Status</span>
                    <p className="text-2xl font-serif italic font-bold mt-1">Associate</p>
                 </div>
                 <Link to="/subscription" className="bg-golf text-ivory px-8 py-3 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold hover:opacity-90 transition-all">
                   Join Legacy
                 </Link>
              </div>
            )}
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="bg-sand/10 rounded-2xl border border-olive/10 p-8 shadow-2xl shadow-olive/5">
            <h2 className="text-2xl font-serif italic font-bold text-golf mb-8 flex items-center gap-3">
              <User className="h-5 w-5 text-olive/40" /> 
              Persona Details
            </h2>

            {saveMessage.text && (
              <div className={`mb-8 p-6 rounded-xl flex items-center justify-center gap-4 text-[10px] uppercase tracking-widest font-bold shadow-xl ${saveMessage.type === 'success' ? 'bg-olive text-white shadow-olive/20' : 'bg-red-800 text-white shadow-red-900/20'}`}>
                {saveMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {saveMessage.text}
              </div>
            )}

            <div className="space-y-12">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-olive/40 mb-3 italic">
                  Digital Correspondence
                </label>
                <div 
                  className="w-full px-6 py-4 bg-ivory/50 border border-olive/5 rounded-full text-golf/30 font-serif italic"
                >
                  {user?.email || ''}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-olive/40 mb-3 italic">
                  Patron Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-6 py-4 bg-ivory border border-olive/10 rounded-full font-serif italic text-lg text-golf focus:border-olive outline-none transition-all duration-500 shadow-inner shadow-olive/5"
                  placeholder="Your Name"
                  required
                />
              </div>

              <div className="pt-8 flex justify-center">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-olive text-white px-12 py-4 rounded-full text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-olive/90 transition-all duration-500 shadow-2xl shadow-olive/20 disabled:opacity-30"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  ) : (
                    'Authenticate Changes'
                  )}
                </button>
              </div>
            </div>
          </form>

        </div>
      </main>
    </div>
  )
}
