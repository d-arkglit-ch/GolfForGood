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
    <div className="min-h-screen bg-ivory text-golf font-sans selection:bg-tan/30">
      {/* Editorial Admin Header */}
      <nav className="relative z-50 border-b border-golf/10 px-6 sm:px-12 py-6 sm:py-10 flex flex-col sm:flex-row justify-between items-center sm:items-end bg-ivory gap-6 sm:gap-0">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-40 mb-1 leading-none italic text-olive">Platform Controller</span>
          <span className="text-xl font-display font-black leading-none tracking-tighter italic text-golf">Golf For Good Admin</span>
        </div>
        <button
          onClick={signOut}
          className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 hover:opacity-100 hover:text-red-700 transition-all flex items-center gap-2"
        >
          <LogOut className="h-4 w-4 text-olive" />
          Exit
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-fade-in-up">
        
        {/* Top Section: Dashboard Stats & Draw Panel */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Stats Summary */}
          <div className="bg-sand/10 rounded-2xl border border-olive/10 p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-serif italic font-bold text-golf mb-8 flex items-center gap-3">
              <Users className="h-6 w-6 text-olive/60" />
              Platform Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 border border-olive/5 rounded-xl">
                <div className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">Total Patrons</div>
                <div className="text-3xl sm:text-4xl font-display italic font-black text-golf">{users.length}</div>
              </div>
              <div className="p-4 border border-olive/5 rounded-xl">
                <div className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">Active Subs</div>
                <div className="text-3xl sm:text-4xl font-display italic font-black text-olive">
                  {users.filter(u => u.subscription?.status === 'active').length}
                </div>
              </div>
              <div className="p-4 border border-olive/5 rounded-xl">
                <div className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">Monthly Entry</div>
                <div className="text-3xl sm:text-4xl font-display italic font-black text-golf">
                  {allTickets.length}
                </div>
              </div>
            </div>
          </div>

          {/* Draw Panel */}
          <div className="bg-sand/10 rounded-2xl border border-olive/10 p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-serif italic font-bold text-golf flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-olive/60" />
                  The Monthly Draw
                </h2>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mt-1 italic">{currentMonthName}</p>
              </div>
              <button
                onClick={handleRunDraw}
                disabled={isDrawing || drawAlreadyExists}
                className={`px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold transition flex items-center gap-2 disabled:opacity-50 ${
                  drawAlreadyExists
                    ? 'bg-olive text-white cursor-not-allowed opacity-20'
                    : 'bg-olive hover:bg-olive/90 text-white shadow-xl shadow-olive/20'
                }`}
              >
                {isDrawing ? <RefreshCw className="h-3 w-3 animate-spin" /> : drawAlreadyExists ? <Lock className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                {drawAlreadyExists ? 'Drawn' : isDrawing ? 'Rolling...' : 'Ignite Draw'}
              </button>
            </div>

            <div className="bg-sand/5 rounded-2xl border border-olive/5 p-10 flex flex-col items-center justify-center min-h-[180px] transition-all">
              {drawNumbers ? (
                <div className="text-center animate-fade-in-up">
                  <p className="text-[10px] text-olive/40 mb-6 font-bold uppercase tracking-[0.3em] font-display">Authenticated Sequence</p>
                  <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
                    {drawNumbers.map((num, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-ivory text-olive border border-olive/20 flex items-center justify-center text-xl sm:text-2xl font-serif italic font-black shadow-2xl shadow-olive/5 animate-fade-in-up"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                  {drawAlreadyExists && (
                    <p className="text-[10px] text-olive font-bold uppercase tracking-widest mt-8 flex items-center justify-center gap-2 opacity-40">
                      <CheckCircle className="h-3 w-3" />
                      Legacy Locked
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center opacity-30">
                  <LandPlot className="h-10 w-10 mx-auto mb-4 stroke-[1px]" />
                  <p className="text-[11px] uppercase tracking-[0.2em] font-bold">Awaiting Selection</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Charity Settings Panel */}
        <div className="bg-sand/10 rounded-2xl border border-olive/10 p-8">
          <div className="flex flex-col md:flex-row gap-8 md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif italic font-bold text-golf flex items-center gap-3 mb-2">
                <HeartHandshake className="h-6 w-6 text-olive/60" />
                Active Patronage
              </h2>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                Current platform beneficiary: <span className="text-golf underline decoration-olive/30">{activeCharity}</span>
              </p>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <input 
                type="text" 
                value={charityInput}
                onChange={(e) => setCharityInput(e.target.value)}
                placeholder="Benevolence Name..."
                className="flex-1 md:w-80 px-6 py-3 bg-ivory border border-olive/10 rounded-full text-[11px] uppercase tracking-widest font-bold outline-none focus:border-olive transition-all shadow-inner shadow-olive/5"
              />
              <button 
                onClick={handleUpdateCharity}
                disabled={savingCharity || !charityInput.trim() || charityInput === activeCharity}
                className="px-8 py-3 bg-olive text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-full hover:bg-olive/90 transition shadow-xl shadow-olive/10 disabled:opacity-20 flex items-center gap-2 whitespace-nowrap"
              >
                {savingCharity ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Set Beneficiary'}
              </button>
            </div>
          </div>
        </div>

        {/* Winners Panel */}
        {drawNumbers && (
          <div className="bg-sand/10 rounded-2xl border border-olive/10 overflow-hidden animate-fade-in-up">
            <div className="px-8 py-8 border-b border-olive/5 bg-olive/[0.02]">
              <h2 className="text-3xl font-serif italic font-bold text-golf flex items-center gap-4">
                <Crown className="h-8 w-8 text-olive/40" />
                The Victor's Circle
                <span className="ml-auto text-[10px] uppercase font-bold tracking-[0.3em] opacity-30">
                  {winners.length} Accomplished
                </span>
              </h2>
            </div>

            {winners.length === 0 ? (
              <div className="px-8 py-20 text-center opacity-40">
                <Trophy className="h-12 w-12 mx-auto mb-4 stroke-[1px]" />
                <p className="text-[11px] uppercase tracking-[0.2em] font-bold">No 3+ matches found for this period.</p>
                <p className="text-[10px] italic mt-2">The pool accumulates for the following draw.</p>
              </div>
            ) : (
              <div className="divide-y divide-olive/5">
                {winners.map((winner, idx) => {
                  const tier = getTierInfo(winner.matchCount)
                  return (
                    <div key={winner.userId} className="px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-8 hover:bg-olive/[0.02] transition duration-700">
                      {/* Rank */}
                      <div className="flex items-center gap-6 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner ${
                          winner.matchCount === 5 ? 'bg-olive text-white' :
                          'bg-sand text-golf'
                        }`}>
                          {tier.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xl font-serif italic font-bold text-golf leading-tight truncate">{winner.name}</p>
                          <p className="text-[9px] uppercase tracking-widest font-black opacity-30 mt-1">Ref: {winner.userId.slice(0, 8)}</p>
                        </div>
                      </div>

                      {/* Their ticket with matched numbers highlighted */}
                      <div className="flex gap-2">
                        {winner.numbers.map((num, i) => (
                          <div
                            key={i}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-1000 ${
                              winner.matchedNumbers.includes(num)
                                ? 'bg-olive text-white border-olive scale-110 shadow-lg shadow-olive/20'
                                : 'bg-ivory text-golf/30 border-olive/5'
                            }`}
                          >
                            {num}
                          </div>
                        ))}
                      </div>

                      {/* Prize tier badge */}
                      <div className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap border shadow-sm ${
                        winner.matchCount === 5 ? 'bg-ivory text-olive border-olive/30 shadow-olive/10' :
                        'bg-sand/30 text-golf/60 border-olive/10'
                      }`}>
                        {tier.label} — {tier.pool} Distribution
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
          <div className="bg-sand/10 rounded-2xl border border-olive/10 overflow-hidden mt-12">
            <div className="px-8 py-8 border-b border-olive/5 flex justify-between items-center bg-olive/[0.02]">
              <h2 className="text-2xl font-serif italic font-bold text-golf flex items-center gap-4">
                <Calendar className="h-6 w-6 text-olive/40" />
                Chronicles
              </h2>
            </div>
            <div className="divide-y divide-olive/5">
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
                  <div key={draw.id} className="px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-olive/[0.01] transition">
                    <div className="flex flex-col">
                      <span className="text-lg font-serif italic font-bold text-golf leading-tight">{monthName}</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-30 mt-1">{monthTickets.length} Participants • {winnerCount} Victories</span>
                    </div>
                    
                    <div className="flex gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
                      {draw.winning_numbers.map((num, i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-ivory text-golf flex items-center justify-center text-xs font-bold border border-olive/5 shadow-inner">
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
        <div className="bg-sand/10 rounded-2xl border border-olive/10 overflow-hidden shadow-2xl shadow-olive/5 mb-24">
          <div className="px-8 py-8 border-b border-olive/5 flex justify-between items-center bg-ivory">
            <h2 className="text-3xl font-serif italic font-bold text-golf">Patron Directory</h2>
            <button
               onClick={fetchAdminData}
               className="text-olive/40 hover:text-olive transition flex items-center gap-2 text-[10px] uppercase font-black tracking-widest"
            >
              <RefreshCw className="h-3 w-3" />
              Synchronize
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.3em] font-black text-olive italic">
                <tr>
                  <th className="px-8 py-5 border-b border-olive/5 min-w-[200px]">Identity</th>
                  <th className="px-8 py-5 border-b border-olive/5 min-w-[150px]">Standing</th>
                  <th className="px-8 py-5 border-b border-olive/5 min-w-[250px]">Recent Performance</th>
                  <th className="px-8 py-5 border-b border-olive/5 min-w-[150px]">Sequence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-olive/5">
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
                    <tr key={u.id} className="hover:bg-olive/[0.01] transition duration-500 group">
                      <td className="px-8 py-8">
                        <div className="text-lg font-serif italic font-bold text-golf leading-tight">{u.full_name || 'Anonymous Patron'}</div>
                        <div className="text-[9px] uppercase tracking-widest font-black opacity-20 mt-1">UID: {u.id.slice(0, 12)}</div>
                      </td>
                      <td className="px-8 py-8">
                        {u.subscription?.status === 'active' ? (
                          <span className="inline-flex items-center gap-2 bg-olive/[0.05] text-olive border border-olive/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                            <div className="w-1 h-1 rounded-full bg-olive animate-pulse" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 bg-sand/20 text-golf/30 border border-olive/5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                             Dormant
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-8">
                        {u.scores.length > 0 ? (
                          <div className="flex gap-2">
                            {u.scores.map((score, idx) => (
                              <span 
                                key={score.id}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs transition-all duration-700 ${
                                  idx === 0 
                                  ? 'bg-olive text-white shadow-xl shadow-olive/20' 
                                  : 'bg-ivory border border-olive/10 text-golf/50 group-hover:border-olive/30'
                                }`}
                                title={new Date(score.date_played).toLocaleDateString()}
                              >
                                {score.score}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] uppercase font-bold tracking-widest opacity-20 italic">No Recent Rounds</span>
                        )}
                      </td>
                      <td className="px-8 py-8">
                        {u.ticket ? (
                          <div className="flex gap-2">
                            {u.ticket.map((num, i) => (
                              <div
                                key={i}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  drawNumbers?.includes(num)
                                    ? 'bg-olive text-white'
                                    : 'bg-sand/30 text-golf/30 border border-olive/5'
                                }`}
                              >
                                {num}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] uppercase font-bold tracking-widest opacity-10">Undetermined</span>
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