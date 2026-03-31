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
      case 5: return { label: 'LEGACY TRIUMPH', icon: <Crown className="h-5 w-5" />, color: 'olive', pool: '40%', emoji: '🏆' }
      case 4: return { label: 'ELITE MATCH', icon: <Zap className="h-5 w-5" />, color: 'olive', pool: '35%', emoji: '⚡' }
      case 3: return { label: 'PATRON HONOR', icon: <Gift className="h-5 w-5" />, color: 'golf', pool: '25%', emoji: '🎁' }
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
      <div className="bg-ivory rounded-2xl border border-white/5 p-12 flex justify-center items-center h-full">
         <div className="animate-spin rounded-full h-8 w-8 border-2 border-olive/30 border-t-olive" />
      </div>
    )
  }

  const tier = matchResults ? getTierInfo(matchResults.count) : null

  return (
    <div className={`bg-sand/10 rounded-2xl border border-olive/10 p-8 flex flex-col h-full transition-all duration-700 shadow-2xl shadow-olive/5 ${justBecameEligible ? 'ring-2 ring-olive/20 ring-offset-4' : ''} ${tier ? 'ring-2 ring-olive ring-offset-4 shadow-olive/20' : ''}`}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl sm:text-2xl font-serif italic font-bold text-golf flex items-center gap-4">
          <Trophy className="h-6 w-6 text-olive/40" />
          The Legacy Draw
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
        <div className={`mb-8 p-6 rounded-2xl border-2 animate-fade-in-up shadow-2xl ${
          tier.color === 'olive' ? 'bg-olive text-white border-white/20' :
          'bg-golf text-white border-white/20'
        }`}>
          <div className="flex items-center gap-4">
            <div className="bg-golf/10 p-3 rounded-full backdrop-blur-md">
              {tier.icon}
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-2xl">
                {tier.emoji} {tier.label}!
              </h3>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 mt-1">
                Sequence Match Detected! You are entitled to a share of the {tier.pool} pool.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Status Dashboard (only show if no winner banner) */}
      {!tier && (
        <div className={`mb-10 p-6 rounded-2xl border transition-all duration-700 shadow-inner ${
          simulatedNumbers 
            ? winningNumbers 
              ? 'bg-ivory/50 border-olive/5'  
              : 'bg-olive text-white border-white/20' 
            : eligible
              ? `bg-pastel-olive/20 border-olive/20 ${justBecameEligible ? 'animate-pulse' : ''}`
              : 'bg-sand/30 border-olive/10 opacity-60'
        }`}>
          <div className="flex items-center gap-4">
            {simulatedNumbers ? (
              winningNumbers ? (
                <AlertTriangle className="h-6 w-6 opacity-40" />
              ) : (
                <CheckCircle className="h-6 w-6 text-white" />
              )
            ) : eligible ? (
              <Sparkles className="h-6 w-6 text-olive" />
            ) : (
               <AlertTriangle className="h-6 w-6 text-olive/40" />
            )}
            
            <div className="flex-1">
              <h3 className={`text-[10px] uppercase font-black tracking-widest leading-relaxed ${simulatedNumbers ? winningNumbers ? 'text-golf/40' : 'text-white' : 'text-olive'}`}>
                {simulatedNumbers 
                  ? winningNumbers
                    ? `${matchResults?.count || 0} Matches Found`
                    : "Admission Authenticated" 
                  : eligible 
                    ? "Eligibility Confirmed" 
                    : scoresThisMonth.length === 1 
                      ? "Admission Pending (1 Round Remaining)" 
                      : "Minimum Rounds Not Achieved"}
              </h3>
               <p className={`text-lg font-serif italic font-bold mt-1 ${simulatedNumbers ? winningNumbers ? 'text-golf/20' : 'text-white/80' : 'text-golf'}`}>
                  {simulatedNumbers 
                    ? winningNumbers
                      ? 'Better luck next cycle.'
                      : `The next draw commences: ${nextDrawDate()}`
                    : `Current Standing: ${scoresThisMonth.length} / 2 Rounds`}
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
      <div className="flex-1 flex flex-col justify-center mb-8">
        <p className="text-[10px] uppercase font-bold text-golf/30 mb-6 text-center tracking-[0.3em] font-display">
          {simulatedNumbers ? "Official Sequence Authenticated" : "Provisional Ticket"}
        </p>
        
        <div className="flex gap-3 sm:gap-4 justify-center mb-8">
          {displayNumbers.map((num, i) => {
            const isMatched = matchResults?.matchedNumbers?.includes(num)
            return (
              <div
                key={i}
                className={`w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-lg sm:text-2xl font-serif italic font-black transition-all duration-1000 transform ${
                  isMatched
                    ? 'bg-olive text-white shadow-2xl shadow-olive/30 ring-2 ring-white/20 scale-110'
                    : simulatedNumbers 
                      ? 'bg-tan text-golf border border-white/5 shadow-xl shadow-black/20' 
                      : 'bg-tan/20 text-golf/5 border-2 border-dashed border-white/5'
                }`}
              >
                {num > 0 ? num : '-'}
              </div>
            )
          })}
        </div>

        {/* Generate / Locked button logic */}
        <div className="mt-8">
          {simulatedNumbers ? (
            <div className="w-full flex items-center justify-center gap-3 py-4 bg-ivory border border-olive/10 text-olive font-black text-[10px] uppercase tracking-widest rounded-full opacity-40">
              <Lock className="h-4 w-4" /> Locked for the {new Date().toLocaleDateString('en-US', { month: 'long' })} Draw
            </div>
          ) : (
            <button
              onClick={handleSimulateAndLock}
              disabled={!eligible || saving}
              className="w-full py-5 bg-olive text-white rounded-full text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-olive/90 transition-all duration-500 disabled:opacity-20 flex items-center justify-center gap-3 shadow-2xl shadow-olive/20"
            >
              {saving ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {eligible ? "Seal & Authenticate Sequence" : "Rounds Incomplete"}
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
                    <div key={draw.id} className="p-8 bg-tan mb-4 rounded-2xl border border-white/5 shadow-lg">
                      <div className="flex justify-between items-center mb-6">
                        <span className="font-serif italic font-bold text-golf text-lg">{monthName}</span>
                        {tierInfo ? (
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${
                            tierInfo.color === 'olive' ? 'bg-olive/20 text-olive border-olive/30' :
                            'bg-golf/20 text-golf border-golf/30'
                          }`}>
                            {tierInfo.emoji} Won {tierInfo.pool}
                          </span>
                        ) : (
                          <span className="text-[9px] uppercase tracking-widest font-bold opacity-30">Archive Only</span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">Winning Numbers</p>
                          <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                            {draw.winning_numbers.map((num, i) => (
                              <div key={i} className="w-8 h-8 rounded-full bg-olive text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-olive/20 border border-white/10">
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