import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import authService from '../../lib/supabase'
import {
  LandPlot,
  Users,
  Trophy,
  RefreshCw,
  Sparkles,
  ChevronRight,
  LogOut
} from 'lucide-react'

export default function Admin() {
  const { signOut } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawNumbers, setDrawNumbers] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      // Fetch profiles, subscriptions, and scores
      const [profilesRes, subsRes, scoresRes] = await Promise.all([
        authService.supabase.from('profiles').select('*'),
        authService.supabase.from('subscriptions').select('*'),
        authService.supabase.from('scores').select('*').order('date_played', { ascending: false })
      ])

      const profiles = profilesRes.data || []
      const subs = subsRes.data || []
      const scores = scoresRes.data || []

      // Combine data mapping relation via user_id -> profile.id
      const combinedUsers = profiles.map(profile => {
        const userSub = subs.find(s => s.user_id === profile.id)
        const userScores = scores.filter(s => s.user_id === profile.id).slice(0, 5)
        
        return {
          ...profile,
          subscription: userSub,
          scores: userScores
        }
      })

      setUsers(combinedUsers)
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSimulateDraw = () => {
    setIsDrawing(true)
    setTimeout(() => {
      const numbers = []
      // Select 5 unique random numbers between 1 and 45
      while (numbers.length < 5) {
        const nextNum = Math.floor(Math.random() * 45) + 1
        if (!numbers.includes(nextNum)) {
          numbers.push(nextNum)
        }
      }
      setDrawNumbers(numbers.sort((a, b) => a - b))
      setIsDrawing(false)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LandPlot className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">
              Golf<span className="text-primary-600">Charity</span>
              <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full uppercase tracking-widest font-bold">Admin</span>
            </span>
          </Link>
          <button
            onClick={signOut}
            className="text-gray-500 hover:text-gray-900 transition flex items-center gap-2 text-sm font-medium"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in-up">
        
        {/* Top Section: Dashboard Stats & Simulate Draw */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Stats Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col justify-center">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary-500" />
              Platform Overview
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex flex-col items-start hover:border-gray-200 transition">
                <div className="text-sm font-medium text-gray-500 mb-1">Total Users</div>
                <div className="text-4xl font-extrabold text-gray-900">{users.length}</div>
              </div>
              <div className="bg-primary-50/50 p-5 rounded-xl border border-primary-100 flex flex-col items-start hover:border-primary-200 transition">
                <div className="text-sm font-semibold text-primary-700 mb-1">Active Subscribers</div>
                <div className="text-4xl font-extrabold text-primary-700">
                  {users.filter(u => u.subscription?.status === 'active').length}
                </div>
              </div>
            </div>
          </div>

          {/* Simulate Draw Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="h-6 w-6 text-amber-500" />
                Monthly Draw Simulation
              </h2>
              <button
                onClick={handleSimulateDraw}
                disabled={isDrawing}
                className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50 shadow-md shadow-primary-500/20"
              >
                {isDrawing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {drawNumbers ? 'Reroll Draw' : 'Run Draw'}
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center min-h-[160px] transition-all">
              {drawNumbers ? (
                <div className="text-center animate-fade-in-up">
                  <p className="text-xs text-gray-500 mb-3 font-bold uppercase tracking-widest">Official Winning Numbers</p>
                  <div className="flex gap-3 justify-center">
                    {drawNumbers.map((num, i) => (
                      <div
                        key={i}
                        className="w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-primary-500/30"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center font-medium">Click "Run Draw" to generate winning numbers for the month.</p>
              )}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <h2 className="text-xl font-bold text-gray-900">User Management</h2>
            <button
               onClick={fetchAdminData}
               className="text-gray-500 hover:text-primary-600 transition flex items-center gap-1.5 text-sm font-semibold"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider text-xs font-bold">
                <tr>
                  <th className="px-8 py-4 border-b border-gray-100">User Details</th>
                  <th className="px-8 py-4 border-b border-gray-100">Status</th>
                  <th className="px-8 py-4 border-b border-gray-100">Latest 5 Scores</th>
                  <th className="px-8 py-4 border-b border-gray-100 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-16 text-center text-gray-400">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-primary-500" />
                      Loading user database...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-16 text-center text-gray-500">
                      No users found in the database.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition duration-150">
                      <td className="px-8 py-5">
                        <div className="font-bold text-gray-900 text-base">{user.full_name || 'Anonymous'}</div>
                        <div className="text-xs text-gray-400 mt-1 font-mono uppercase tracking-wider">ID: {user.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-8 py-5">
                        {user.subscription?.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        {user.scores.length > 0 ? (
                          <div className="flex gap-2">
                            {user.scores.map((score, idx) => (
                              <span 
                                key={score.id}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                                  idx === 0 
                                  ? 'bg-primary-100 text-primary-700 border-2 border-primary-200 shadow-sm' 
                                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                                title={new Date(score.date_played).toLocaleDateString()}
                              >
                                {score.score}
                              </span>
                            ))}
                            {/* Empty placeholders if less than 5 */}
                            {Array.from({ length: 5 - user.scores.length }).map((_, i) => (
                              <span key={`empty-${i}`} className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 flex items-center justify-center text-gray-300 text-sm">
                                -
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-sm">No scores submitted yet</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="text-primary-600 hover:text-primary-800 font-bold text-sm inline-flex items-center gap-1 transition-colors">
                          Manage <ChevronRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}