import { useState, useMemo, useEffect, useRef } from 'react'
import { Trophy, Sparkles, RefreshCw, Lock, AlertTriangle, CheckCircle, Crown, Star, Zap, Gift, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import authService from '../lib/supabase'

export default function LotteryDisplay({ scores, user }) {
  const [simulatedNumbers, setSimulatedNumbers] = useState(null)
  const [winningNumbers, setWinningNumbers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [justBecameEligible, setJustBecameEligible] = useState(false)
  
  // History state
  const [pastDraws, setPastDraws] = useState([])
  const [pastTickets, setPastTickets] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  
  const prevEligibleRef = useRef(false)

  // Current month key (e.g., '2026-03')
  const currentMonthKey = new Date().toISOString().slice(0, 7)

  // 1. Fetch locked numbers AND draw results for ALL months
  const fetchMonthlyData = async () => {
    if (!user?.id) return
    setLoading(true)

    const [ticketRes, drawRes] = await Promise.all([
      authService.supabase
        .from('user_lottery_numbers')
        .select('*')
        .eq('user_id', user.id),
      authService.supabase
        .from('monthly_draws')
        .select('*')
        .order('month_year', { ascending: false })
    ])

    const allTickets = ticketRes.data || []
    const allDraws = drawRes.data || []

    // Current month setup
    const currentTicket = allTickets.find(t => t.month_year === currentMonthKey)
    const currentDraw = allDraws.find(d => d.month_year === currentMonthKey)

    if (currentTicket) setSimulatedNumbers(currentTicket.numbers)
    if (currentDraw) setWinningNumbers(currentDraw.winning_numbers)

    // History setup (only past draws that have actually occurred)
    setPastDraws(allDraws.filter(d => d.month_year !== currentMonthKey))
    setPastTickets(allTickets.filter(t => t.month_year !== currentMonthKey))

    setLoading(false)
  }

  useEffect(() => {
    fetchMonthlyData()
  }, [user?.id, currentMonthKey])

  // 2. Check Eligibility (Scores THIS month)
  const scoresThisMonth = useMemo(() => {
    return scores.filter(s => s.date_played.startsWith(currentMonthKey))
  }, [scores, currentMonthKey])

  const eligible = scoresThisMonth.length >= 2

  // 3. Auto-detect when user just became eligible
  useEffect(() => {
    if (eligible && !prevEligibleRef.current) {
      setJustBecameEligible(true)
      const timer = setTimeout(() => setJustBecameEligible(false), 3000)
      return () => clearTimeout(timer)
    }
    prevEligibleRef.current = eligible
  }, [eligible])

  // 4. Calculate match results
  const matchResults = useMemo(() => {
    if (!simulatedNumbers || !winningNumbers) return null
    const matched = simulatedNumbers.filter(n => winningNumbers.includes(n))
    return {
      count: matched.length,
      matchedNumbers: matched
    }
  }, [simulatedNumbers, winningNumbers])

  // Prize tier info
  const getTierInfo = (count) => {
    switch (count) {
      case 5: return { label: 'JACKPOT WINNER', icon: <Crown className="h-5 w-5" />, color: 'amber', pool: '40%', emoji: '🏆' }
      case 4: return { label: 'TIER 2 WINNER', icon: <Zap className="h-5 w-5" />, color: 'primary', pool: '35%', emoji: '⚡' }
      case 3: return { label: 'TIER 3 WINNER', icon: <Gift className="h-5 w-5" />, color: 'blue', pool: '25%', emoji: '🎁' }
      default: return null
    }
  }

  // Display numbers: Locked Ticket OR Fallback empty/zeros
  const displayNumbers = simulatedNumbers || [0, 0, 0, 0, 0]

  // Generate and LOCK weighted numbers
  const handleSimulateAndLock = async () => {
    if (!eligible || simulatedNumbers || saving) return
    
    setSaving(true)
    const generated = new Set()
    const rangePool = []
    
    const pastScores = scores.slice(0, 5).map(s => s.score)
    pastScores.forEach(score => {
       if (score <= 10) rangePool.push([1, 10])
       else if (score <= 20) rangePool.push([11, 20])
       else if (score <= 30) rangePool.push([21, 30])
       else if (score <= 40) rangePool.push([31, 40])
       else rangePool.push([41, 45])
    })
    
    rangePool.push([1, 10], [11, 20], [21, 30], [31, 40], [41, 45])

    while (generated.size < 5) {
      const idx = Math.floor(Math.random() * rangePool.length)
      const [min, max] = rangePool[idx]
      const randomNum = Math.floor(Math.random() * (max - min + 1)) + min
      generated.add(randomNum)
    }

    const finalNumbers = Array.from(generated).sort((a, b) => a - b)

    const { error } = await authService.supabase
      .from('user_lottery_numbers')
      .upsert({
        user_id: user.id,
        month_year: currentMonthKey,
        numbers: finalNumbers,
      }, { onConflict: 'user_id, month_year' })

    if (error) {
      console.error('Failed to lock numbers:', error)
    } else {
      setSimulatedNumbers(finalNumbers)
    }
    
    setSaving(false)
  }

  // Next draw date
  const nextDrawDate = () => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex justify-center items-center h-full">
        <img src="/golf-green.gif" alt="Loading..." className="w-16 h-16 object-contain" />
      </div>
    )
  }

  const tier = matchResults ? getTierInfo(matchResults.count) : null

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full transition-all duration-500 ${justBecameEligible ? 'ring-2 ring-primary-400 ring-offset-2 shadow-lg shadow-primary-500/20' : ''} ${tier ? 'ring-2 ring-offset-2 shadow-lg ' + (tier.color === 'amber' ? 'ring-amber-400 shadow-amber-500/20' : tier.color === 'primary' ? 'ring-primary-400 shadow-primary-500/20' : 'ring-blue-400 shadow-blue-500/20') : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          Monthly Charity Draw
        </h2>
        <button
          onClick={fetchMonthlyData}
          className="text-gray-400 hover:text-primary-600 p-2 rounded-lg hover:bg-primary-50 transition-colors"
          title="Refresh draw status"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Winner Congratulation Banner */}
      {tier && (
        <div className={`mb-5 p-4 rounded-xl border-2 animate-fade-in-up ${
          tier.color === 'amber' ? 'bg-amber-50 border-amber-300' :
          tier.color === 'primary' ? 'bg-primary-50 border-primary-300' :
          'bg-blue-50 border-blue-300'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              tier.color === 'amber' ? 'bg-amber-100 text-amber-600' :
              tier.color === 'primary' ? 'bg-primary-100 text-primary-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {tier.icon}
            </div>
            <div>
              <h3 className={`font-extrabold text-lg ${
                tier.color === 'amber' ? 'text-amber-900' :
                tier.color === 'primary' ? 'text-primary-900' :
                'text-blue-900'
              }`}>
                {tier.emoji} {tier.label}!
              </h3>
              <p className={`text-sm font-medium ${
                tier.color === 'amber' ? 'text-amber-700' :
                tier.color === 'primary' ? 'text-primary-700' :
                'text-blue-700'
              }`}>
                You matched {matchResults.count} numbers! You win a share of the {tier.pool} prize pool.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Status Dashboard (only show if no winner banner) */}
      {!tier && (
        <div className={`mb-6 p-5 rounded-xl border transition-all duration-500 ${
          simulatedNumbers 
            ? winningNumbers 
              ? 'bg-gray-50 border-gray-200'  
              : 'bg-green-50 border-green-200' 
            : eligible
              ? `bg-primary-50 border-primary-200 ${justBecameEligible ? 'animate-pulse' : ''}`
              : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            {simulatedNumbers ? (
              winningNumbers ? (
                <AlertTriangle className="h-8 w-8 text-gray-400" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-600" />
              )
            ) : eligible ? (
              <Sparkles className="h-8 w-8 text-primary-600" />
            ) : (
               <AlertTriangle className="h-8 w-8 text-amber-500" />
            )}
            
            <div>
              <h3 className={`font-bold ${simulatedNumbers ? winningNumbers ? 'text-gray-700' : 'text-green-900' : eligible ? 'text-primary-900' : 'text-amber-900'}`}>
                {simulatedNumbers 
                  ? winningNumbers
                    ? `No prize this month (${matchResults?.count || 0} match${matchResults?.count !== 1 ? 'es' : ''})`
                    : "✓ Entered in this month's draw" 
                  : eligible 
                    ? "✓ Goal Reached! Generate your numbers." 
                    : scoresThisMonth.length === 1 
                      ? "⚠ Need 1 more score this month" 
                      : "Enter at least 2 scores this month to participate"}
              </h3>
              <p className={`text-sm mt-0.5 ${simulatedNumbers ? winningNumbers ? 'text-gray-500' : 'text-green-700' : eligible ? 'text-primary-700' : 'text-amber-700'}`}>
                {simulatedNumbers 
                  ? winningNumbers
                    ? 'Better luck next month! Keep entering your scores.'
                    : `Draw date: ${nextDrawDate()}`
                  : `Progress: ${scoresThisMonth.length}/2 scores entered in ${new Date().toLocaleDateString('en-US', { month: 'long' })}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Winning Numbers Section (if draw has happened) */}
      {winningNumbers && simulatedNumbers && (
        <div className="mb-5">
          <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider text-center">Official Winning Numbers</p>
          <div className="flex gap-2 justify-center">
            {winningNumbers.map((num, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-amber-500/30"
              >
                {num}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Wrapper */}
      <div className="flex-1 flex flex-col justify-center mb-6">
        <p className="text-sm font-medium text-gray-700 mb-4 text-center uppercase tracking-wider">
          {simulatedNumbers ? "Your Official Locked Numbers" : "Your Ticket"}
        </p>
        
        <div className="flex gap-2 sm:gap-3 justify-center mb-4">
          {displayNumbers.map((num, i) => {
            const isMatched = matchResults?.matchedNumbers?.includes(num)
            return (
              <div
                key={i}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 ${
                  isMatched
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/40 ring-2 ring-green-300 ring-offset-1 scale-110'
                    : simulatedNumbers 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
                      : 'bg-gray-50 text-gray-300 border-2 border-dashed border-gray-200'
                }`}
              >
                {num > 0 ? num : '-'}
              </div>
            )
          })}
        </div>

        {/* Generate / Locked button logic */}
        <div className="mt-6">
          {simulatedNumbers ? (
            <div className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-500 rounded-xl font-semibold text-sm">
              <Lock className="h-4 w-4" /> Valid for {new Date().toLocaleDateString('en-US', { month: 'long' })} Draw
            </div>
          ) : (
            <button
              onClick={handleSimulateAndLock}
              disabled={!eligible || saving}
              className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
            >
              {saving ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {eligible ? "Generate & Lock Official Ticket" : "Locked (Enter 2 scores to unlock)"}
            </button>
          )}
        </div>
      </div>

      {/* Prize Pool Info */}
      <div className="pt-5 border-t border-gray-100 mt-auto">
        <div className="flex justify-between text-xs sm:text-sm text-gray-500 mb-4">
           <span>5-match: <strong className="text-primary-600">40%</strong></span>
           <span>4-match: <strong className="text-primary-600">35%</strong></span>
           <span>3-match: <strong className="text-primary-600">25%</strong></span>
        </div>

        {/* Past Draws Toggle */}
        {pastDraws.length > 0 && (
          <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-100 transition"
            >
              <span className="flex items-center gap-2 text-gray-900">
                <Calendar className="h-4 w-4 text-primary-500" />
                View Past Draws
              </span>
              {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showHistory && (
              <div className="divide-y divide-gray-100 border-t border-gray-100">
                {pastDraws.map((draw) => {
                  const [year, month] = draw.month_year.split('-')
                  const dateObj = new Date(year, month - 1)
                  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  
                  const userTicket = pastTickets.find(t => t.month_year === draw.month_year)
                  
                  // Math match count
                  let matchCount = 0
                  if (userTicket) {
                    matchCount = userTicket.numbers.filter(n => draw.winning_numbers.includes(n)).length
                  }
                  
                  const tierInfo = getTierInfo(matchCount)

                  return (
                    <div key={draw.id} className="p-4 bg-white">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-gray-900 text-sm">{monthName}</span>
                        {tierInfo ? (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            tierInfo.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                            tierInfo.color === 'primary' ? 'bg-primary-100 text-primary-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {tierInfo.emoji} Won {tierInfo.pool}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">No prize</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">Winning Numbers</p>
                          <div className="flex gap-1">
                            {draw.winning_numbers.map((num, i) => (
                              <div key={i} className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-[10px] font-bold shadow-sm shadow-amber-500/20">
                                {num}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">Your Ticket</p>
                          {userTicket ? (
                            <div className="flex gap-1">
                              {userTicket.numbers.map((num, i) => {
                                const isMatched = draw.winning_numbers.includes(num)
                                return (
                                  <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    isMatched 
                                      ? 'bg-green-500 text-white shadow-sm' 
                                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                                  }`}>
                                    {num}
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic mt-1">No ticket generated</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}