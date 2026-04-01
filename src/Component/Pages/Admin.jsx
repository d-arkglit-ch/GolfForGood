import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import authService from '../../lib/supabase'
import {
  LogOut,
  ChevronRight,
  Calendar,
  Crown,
  Trophy,
  HeartHandshake,
  RefreshCw
} from 'lucide-react'

// Modular Components
import AdminStats from '../Admin/AdminStats'
import AdminDrawPanel from '../Admin/AdminDrawPanel'
import AdminCharityManager from '../Admin/AdminCharityManager'
import AdminUsersTable from '../Admin/AdminUsersTable'

export default function Admin() {
  const { user, signOut } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawNumbers, setDrawNumbers] = useState(null)
  const [drawAlreadyExists, setDrawAlreadyExists] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [winners, setWinners] = useState([])
  const [currentTickets, setCurrentTickets] = useState([])
  
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
      // Fetch profiles (with joined charity), subscriptions, scores, ALL draws, and ALL user tickets + Settings
      const [profilesRes, subsRes, scoresRes, drawsRes, ticketsRes] = await Promise.all([
        authService.supabase.from('profiles').select('*, charities(*)'), // Join with charities
        authService.supabase.from('subscriptions').select('*'),
        authService.supabase.from('scores').select('*').order('date_played', { ascending: false }),
        authService.supabase.from('monthly_draws').select('*').order('month_year', { ascending: false }),
        authService.supabase.from('user_lottery_numbers').select('*'),
      ])

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
          ticket: userTicket?.numbers || null,
          charity: profile.charities // The joined charity object
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
      .filter(r => r.matchCount >= 3)
      .sort((a, b) => b.matchCount - a.matchCount)

    setWinners(results)
  }

  const handleRunDraw = async () => {
    if (drawAlreadyExists || isDrawing) return
    setIsDrawing(true)
    
    const numbers = []
    while (numbers.length < 5) {
      const nextNum = Math.floor(Math.random() * 45) + 1
      if (!numbers.includes(nextNum)) {
        numbers.push(nextNum)
      }
    }
    const sortedNumbers = numbers.sort((a, b) => a - b)

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

    setTimeout(() => {
      setDrawNumbers(sortedNumbers)
      setDrawAlreadyExists(true)
      setIsDrawing(false)
      calculateWinners(sortedNumbers, allTickets, users)
    }, 800)
  }

  const getTierInfo = (matchCount) => {
    switch (matchCount) {
      case 5: return { label: 'JACKPOT', color: 'amber', icon: '🏆', pool: '40%' }
      case 4: return { label: 'TIER 2', color: 'primary', icon: '⚡', pool: '35%' }
      case 3: return { label: 'TIER 3', color: 'blue', icon: '🎁', pool: '25%' }
      default: return { label: 'NO PRIZE', color: 'gray', icon: '', pool: '0%' }
    }
  }

  return (
    <div className="min-h-screen bg-ivory text-golf font-sans selection:bg-tan/30 leading-relaxed">
      {/* Editorial Admin Header */}
      <nav className="relative z-50 border-b border-golf/10 px-6 sm:px-12 py-6 sm:py-10 flex justify-between items-end bg-ivory">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-40 mb-1 leading-none italic text-olive">Platform Controller</span>
          <span className="text-xl font-display font-black leading-none tracking-tighter italic text-golf">Golf For Good Admin</span>
        </div>
        <button
          onClick={signOut}
          className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 hover:opacity-100 hover:text-red-700 transition-all flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Exit
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-fade-in-up">
        {/* Statistics & Run Draw Column */}
        <div className="grid md:grid-cols-2 gap-8">
            <AdminStats users={users} allTickets={allTickets} />
            <AdminDrawPanel 
                currentMonthName={currentMonthName}
                handleRunDraw={handleRunDraw}
                isDrawing={isDrawing}
                drawAlreadyExists={drawAlreadyExists}
                drawNumbers={drawNumbers}
            />
        </div>

        <AdminCharityManager />

        {/* Winners Panel */}
        {drawNumbers && winners.length > 0 && (
          <div className="bg-sand/10 rounded-2xl border border-olive/10 overflow-hidden">
            <div className="px-8 py-8 border-b border-olive/5 bg-olive/[0.02]">
              <h2 className="text-3xl font-serif italic font-bold text-golf flex items-center gap-4">
                <Crown className="h-8 w-8 text-olive/40" />
                The Victor's Circle
              </h2>
            </div>
            <div className="divide-y divide-olive/5">
                {winners.map((winner) => {
                  const tier = getTierInfo(winner.matchCount)
                  return (
                    <div key={winner.userId} className="px-8 py-8 flex items-center justify-between hover:bg-olive/[0.01] transition">
                      <div className="flex items-center gap-6">
                        <div className="text-2xl">{tier.icon}</div>
                        <div>
                          <p className="text-lg font-serif italic font-bold text-golf">{winner.name}</p>
                          <p className="text-[10px] uppercase font-bold opacity-30 mt-1">{tier.label} Match</p>
                        </div>
                      </div>
                      <div className="text-[11px] uppercase font-bold tracking-widest text-olive border border-olive/20 px-6 py-2 rounded-full">
                        {tier.pool} Pool
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* User Statistics Table */}
        <AdminUsersTable 
            users={users} 
            loading={loading} 
            fetchAdminData={fetchAdminData} 
            drawNumbers={drawNumbers} 
        />
      </main>
    </div>
  )
}