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
  LogOut,
  Crown,
  AlertTriangle,
  CheckCircle,
  Lock,
  Calendar,
  HeartHandshake
} from 'lucide-react'

export default function Admin() {
  const { user, signOut } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawNumbers, setDrawNumbers] = useState(null)
  const [drawAlreadyExists, setDrawAlreadyExists] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [winners, setWinners] = useState([])
  const [currentTickets, setCurrentTickets] = useState([])
  
  // Settings state
  const [activeCharity, setActiveCharity] = useState('Loading...')
  const [charityInput, setCharityInput] = useState('')
  const [savingCharity, setSavingCharity] = useState(false)

  // History state
  const [pastDraws, setPastDraws] = useState([])
  const [allTickets, setAllTickets] = useState([])

  const currentMonthKey = new Date().toISOString().slice(0, 7)
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      // Fetch profiles, subscriptions, scores, ALL draws, and ALL user tickets + Settings
      const [profilesRes, subsRes, scoresRes, drawsRes, ticketsRes, settingsRes] = await Promise.all([
        authService.supabase.from('profiles').select('*'),
        authService.supabase.from('subscriptions').select('*'),
        authService.supabase.from('scores').select('*').order('date_played', { ascending: false }),
        authService.supabase.from('monthly_draws').select('*').order('month_year', { ascending: false }),
        authService.supabase.from('user_lottery_numbers').select('*'),
        authService.supabase.from('platform_settings').select('*').eq('id', 1).single()
      ])

      if (settingsRes.data) {
        setActiveCharity(settingsRes.data.active_charity)
        setCharityInput(settingsRes.data.active_charity)
      } else {
        setActiveCharity('Not Configured')
      }

      const profiles = profilesRes.data || []
      const subs = subsRes.data || []
      const scores = scoresRes.data || []
      
      const allDrawsData = drawsRes.data || []
      const allTicketsData = ticketsRes.data || []

      // Segregate data
      const currentDraw = allDrawsData.find(d => d.month_year === currentMonthKey)
      const thisMonthTickets = allTicketsData.filter(t => t.month_year === currentMonthKey)

      setPastDraws(allDrawsData.filter(d => d.month_year !== currentMonthKey))
      setAllTickets(allTicketsData)
      setCurrentTickets(thisMonthTickets)

      // Combine user data (for current month table)
      const combinedUsers = profiles.map(profile => {
        const userSub = subs.find(s => s.user_id === profile.id)
        const userScores = scores.filter(s => s.user_id === profile.id).slice(0, 5)
        const userTicket = thisMonthTickets.find(t => t.user_id === profile.id)
        
        return {
          ...profile,
          subscription: userSub,
          scores: userScores,
          ticket: userTicket?.numbers || null
        }
      })

      setUsers(combinedUsers)

      // Check if draw already exists for this month
      if (currentDraw?.winning_numbers) {
        setDrawNumbers(currentDraw.winning_numbers)
        setDrawAlreadyExists(true)
        // Calculate current month winners
        calculateWinners(currentDraw.winning_numbers, thisMonthTickets, combinedUsers)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCharity = async () => {
    if (!charityInput.trim()) return
    setSavingCharity(true)
    const { error } = await authService.supabase
      .from('platform_settings')
      .upsert({ id: 1, active_charity: charityInput.trim() }, { onConflict: 'id' })
    
    if (!error) {
      setActiveCharity(charityInput.trim())
    } else {
      console.error('Failed to change charity', error)
    }
    setSavingCharity(false)
  }

  // Calculate winners by comparing each user's ticket against winning numbers
  const calculateWinners = (winningNums, tickets, usersList) => {
    const results = tickets
      .map(ticket => {
        const matchCount = ticket.numbers.filter(n => winningNums.includes(n)).length
        const userProfile = usersList.find(u => u.id === ticket.user_id)
        return {
          userId: ticket.user_id,
          name: userProfile?.full_name || 'Unknown',
          numbers: ticket.numbers,
          matchCount,
          matchedNumbers: ticket.numbers.filter(n => winningNums.includes(n))
        }
      })
      .filter(r => r.matchCount >= 3) // Only show 3+ matches
      .sort((a, b) => b.matchCount - a.matchCount) // Sort by match count descending

    setWinners(results)
  }

  const handleRunDraw = async () => {
    if (drawAlreadyExists || isDrawing) return

    setIsDrawing(true)
    
    // Generate 5 unique random numbers between 1-45 (completely fair, no weighting)
    const numbers = []
    while (numbers.length < 5) {
      const nextNum = Math.floor(Math.random() * 45) + 1
      if (!numbers.includes(nextNum)) {
        numbers.push(nextNum)
      }
    }
    const sortedNumbers = numbers.sort((a, b) => a - b)

    // Persist to database
    const { error } = await authService.supabase
      .from('monthly_draws')
      .upsert({
        month_year: currentMonthKey,
        winning_numbers: sortedNumbers,
        drawn_by: user.id
      }, { onConflict: 'month_year' })

    if (error) {
      console.error('Failed to save draw:', error)
      setIsDrawing(false)
      return
    }

    // Animate the reveal with a small delay
    setTimeout(() => {
      setDrawNumbers(sortedNumbers)
      setDrawAlreadyExists(true)
      setIsDrawing(false)
      // Calculate winners with existing tickets
      calculateWinners(sortedNumbers, allTickets, users)
    }, 800)
  }

  // Prize tier helper
  const getTierInfo = (matchCount) => {
    switch (matchCount) {
      case 5: return { label: 'JACKPOT', color: 'amber', icon: '🏆', pool: '40%' }
      case 4: return { label: 'TIER 2', color: 'primary', icon: '⚡', pool: '35%' }
      case 3: return { label: 'TIER 3', color: 'blue', icon: '🎁', pool: '25%' }
      default: return { label: 'NO PRIZE', color: 'gray', icon: '', pool: '0%' }
    }
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
        
        {/* Top Section: Dashboard Stats & Draw Panel */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Stats Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col justify-center">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary-500" />
              Platform Overview — {currentMonthName}
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex flex-col items-start hover:border-gray-200 transition">
                <div className="text-sm font-medium text-gray-500 mb-1">Total Users</div>
                <div className="text-3xl font-extrabold text-gray-900">{users.length}</div>
              </div>
              <div className="bg-primary-50/50 p-5 rounded-xl border border-primary-100 flex flex-col items-start hover:border-primary-200 transition">
                <div className="text-sm font-semibold text-primary-700 mb-1">Subscribers</div>
                <div className="text-3xl font-extrabold text-primary-700">
                  {users.filter(u => u.subscription?.status === 'active').length}
                </div>
              </div>
              <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-100 flex flex-col items-start hover:border-amber-200 transition">
                <div className="text-sm font-semibold text-amber-700 mb-1">Tickets</div>
                <div className="text-3xl font-extrabold text-amber-700">
                  {allTickets.length}
                </div>
              </div>
            </div>
          </div>

          {/* Draw Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  Monthly Draw
                </h2>
                <p className="text-sm text-gray-500 mt-1">{currentMonthName}</p>
              </div>
              <button
                onClick={handleRunDraw}
                disabled={isDrawing || drawAlreadyExists}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50 shadow-md ${
                  drawAlreadyExists
                    ? 'bg-gray-100 text-gray-500 shadow-none cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/20'
                }`}
              >
                {isDrawing ? <RefreshCw className="h-4 w-4 animate-spin" /> : drawAlreadyExists ? <Lock className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                {drawAlreadyExists ? 'Draw Complete' : isDrawing ? 'Drawing...' : 'Run Draw'}
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
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-amber-500/30 animate-fade-in-up"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                  {drawAlreadyExists && (
                    <p className="text-xs text-green-600 mt-4 flex items-center justify-center gap-1 font-medium">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Permanently saved to database
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium">No draw has been run for {currentMonthName} yet.</p>
                  <p className="text-gray-400 text-sm mt-1">Click "Run Draw" to generate the official winning numbers.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Charity Settings Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
                <HeartHandshake className="h-6 w-6 text-rose-500" />
                Active Platform Charity
              </h2>
              <p className="text-sm text-gray-500">
                Current active charity: <strong className="text-gray-900">{activeCharity}</strong>
              </p>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <input 
                type="text" 
                value={charityInput}
                onChange={(e) => setCharityInput(e.target.value)}
                placeholder="Enter charity name..."
                className="flex-1 md:w-64 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
              />
              <button 
                onClick={handleUpdateCharity}
                disabled={savingCharity || !charityInput.trim() || charityInput === activeCharity}
                className="px-6 py-2 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition shadow-md shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {savingCharity ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Set Active'}
              </button>
            </div>
          </div>
        </div>

        {/* Winners Panel */}
        {drawNumbers && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Crown className="h-6 w-6 text-amber-500" />
                Winners — {currentMonthName}
                <span className="ml-auto text-sm font-medium text-gray-500">
                  {winners.length} winner{winners.length !== 1 ? 's' : ''}
                </span>
              </h2>
            </div>

            {winners.length === 0 ? (
              <div className="px-8 py-12 text-center text-gray-500">
                <Trophy className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No winners this month (no 3+ number matches)</p>
                <p className="text-sm text-gray-400 mt-1">The jackpot rolls over to next month!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {winners.map((winner, idx) => {
                  const tier = getTierInfo(winner.matchCount)
                  return (
                    <div key={winner.userId} className="px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-gray-50/50 transition">
                      {/* Rank */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          winner.matchCount === 5 ? 'bg-amber-100 text-amber-700' :
                          winner.matchCount === 4 ? 'bg-primary-100 text-primary-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {tier.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{winner.name}</p>
                          <p className="text-xs text-gray-400 font-mono">ID: {winner.userId.slice(0, 8)}</p>
                        </div>
                      </div>

                      {/* Their ticket with matched numbers highlighted */}
                      <div className="flex gap-1.5">
                        {winner.numbers.map((num, i) => (
                          <div
                            key={i}
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                              winner.matchedNumbers.includes(num)
                                ? 'bg-green-500 text-white shadow-sm shadow-green-500/30'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            {num}
                          </div>
                        ))}
                      </div>

                      {/* Prize tier badge */}
                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
                        winner.matchCount === 5 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        winner.matchCount === 4 ? 'bg-primary-100 text-primary-800 border border-primary-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {tier.label} — {tier.pool} pool
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Draw History Panel */}
        {pastDraws.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-gray-400" />
                Past Draws History
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {pastDraws.map((draw) => {
                const [year, month] = draw.month_year.split('-')
                const dateObj = new Date(year, month - 1)
                const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                
                const monthTickets = allTickets.filter(t => t.month_year === draw.month_year)
                
                const winnerCount = monthTickets.filter(t => {
                  const matches = t.numbers.filter(n => draw.winning_numbers.includes(n)).length
                  return matches >= 3
                }).length

                return (
                  <div key={draw.id} className="px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{monthName}</span>
                      <span className="text-sm text-gray-500">{monthTickets.length} tickets • {winnerCount} winners</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {draw.winning_numbers.map((num, i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-bold border border-gray-200 shadow-sm">
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

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
                  <th className="px-8 py-4 border-b border-gray-100">Ticket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-16 text-center text-gray-400">
                      <img src="/golf-green.gif" alt="Loading..." className="w-12 h-12 mx-auto mb-3 object-contain" />
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
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition duration-150">
                      <td className="px-8 py-5">
                        <div className="font-bold text-gray-900 text-base">{u.full_name || 'Anonymous'}</div>
                        <div className="text-xs text-gray-400 mt-1 font-mono uppercase tracking-wider">ID: {u.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-8 py-5">
                        {u.subscription?.status === 'active' ? (
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
                        {u.scores.length > 0 ? (
                          <div className="flex gap-2">
                            {u.scores.map((score, idx) => (
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
                            {Array.from({ length: 5 - u.scores.length }).map((_, i) => (
                              <span key={`empty-${i}`} className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 flex items-center justify-center text-gray-300 text-sm">
                                -
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-sm">No scores submitted yet</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        {u.ticket ? (
                          <div className="flex gap-1.5">
                            {u.ticket.map((num, i) => (
                              <div
                                key={i}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                  drawNumbers?.includes(num)
                                    ? 'bg-green-500 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                                }`}
                              >
                                {num}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-sm">No ticket</span>
                        )}
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