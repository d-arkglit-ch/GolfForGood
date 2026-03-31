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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <LandPlot className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">
              Golf<span className="text-primary-600">Charity</span>
            </span>
          </Link>
          <Link
            to="/dashboard"
            className="text-gray-500 hover:text-gray-900 transition flex items-center gap-1.5 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Profile</h1>

        <div className="space-y-8">
          
          {/* Subscription Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary-500" /> Subscription Status
            </h2>
            
            {isSubscribed ? (
               <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-primary-50 border border-primary-100 p-5 rounded-xl">
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse" />
                      <span className="font-bold text-primary-800 uppercase tracking-widest text-sm">Active Subscription</span>
                    </div>
                    <p className="text-primary-700 text-sm">You are currently on the {subscription?.plan_type || 'Monthly'} Plan.</p>
                 </div>
                 <div className="mt-4 sm:mt-0 text-left sm:text-right">
                    <p className="text-xs text-primary-600 uppercase font-semibold">Next Renewal</p>
                    <p className="font-bold text-primary-900">{new Date(subscription?.current_period_end).toLocaleDateString()}</p>
                 </div>
               </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 p-5 rounded-xl">
                 <div>
                    <span className="font-bold text-gray-700 uppercase tracking-widest text-sm">Inactive</span>
                    <p className="text-gray-500 text-sm mt-1">You do not have an active subscription.</p>
                 </div>
                 <Link to="/subscription" className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition">
                   Subscribe Now
                 </Link>
              </div>
            )}
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" /> Personal Details
            </h2>

            {saveMessage.text && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {saveMessage.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <p className="font-medium text-sm">{saveMessage.text}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-gray-400" /> Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-2">Email address cannot be changed for security reasons.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-gray-400" /> Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition"
                  placeholder="Your Name"
                  required
                />
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-gray-900/10 hover:-translate-y-0.5"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <Save className="h-5 w-5" /> Save Changes
                    </>
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
