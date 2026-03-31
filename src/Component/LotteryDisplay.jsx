import { useState, useMemo, useEffect } from 'react'
import { Trophy, Calendar, Sparkles, RefreshCw, Lock, AlertTriangle, CheckCircle } from 'lucide-react'
import authService from '../lib/supabase'

export default function LotteryDisplay({ scores, user }) {
  const [simulatedNumbers, setSimulatedNumbers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Current month key (e.g., '2026-03')
  const currentMonthKey = new Date().toISOString().slice(0, 7)

  // 1. Fetch locked numbers for this month on mount
  useEffect(() => {
    if (!user?.id) return

    const fetchMonthlyTicket = async () => {
      setLoading(true)
      const { data, error } = await authService.supabase
        .from('user_lottery_numbers')
        .select('numbers')
        .eq('user_id', user.id)
        .eq('month_year', currentMonthKey)
        .single()

      if (data?.numbers) {
        setSimulatedNumbers(data.numbers)
      }
      setLoading(false)
    }

    fetchMonthlyTicket()
  }, [user?.id, currentMonthKey])

  // 2. Check Eligibility (Scores THIS month)
  const scoresThisMonth = useMemo(() => {
    return scores.filter(s => s.date_played.startsWith(currentMonthKey))
  }, [scores, currentMonthKey])

  const eligible = scoresThisMonth.length >= 2

  // Display numbers: Locked Ticket OR Fallback empty/zeros
  const displayNumbers = simulatedNumbers || [0, 0, 0, 0, 0]

  // 3. Generate and LOCK weighted numbers
  const handleSimulateAndLock = async () => {
    if (!eligible || simulatedNumbers || saving) return
    
    setSaving(true)
    const generated = new Set()
    const rangePool = []
    
    // Weight by their last 5 total scores (historical performance factor)
    const pastScores = scores.slice(0, 5).map(s => s.score)
    pastScores.forEach(score => {
       if (score <= 10) rangePool.push([1, 10])
       else if (score <= 20) rangePool.push([11, 20])
       else if (score <= 30) rangePool.push([21, 30])
       else if (score <= 40) rangePool.push([31, 40])
       else rangePool.push([41, 45])
    })
    
    // Baseline chance
    rangePool.push([1, 10], [11, 20], [21, 30], [31, 40], [41, 45])

    // Generate 5 unique
    while (generated.size < 5) {
      const idx = Math.floor(Math.random() * rangePool.length)
      const [min, max] = rangePool[idx]
      const randomNum = Math.floor(Math.random() * (max - min + 1)) + min
      generated.add(randomNum)
    }

    const finalNumbers = Array.from(generated).sort((a, b) => a - b)

    // SAVE TO DATABASE
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

  // Next draw formatting
  const nextDrawDate = () => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0) // Last day of current month
    return nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex justify-center items-center">
        <RefreshCw className="h-6 w-6 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Trophy className="h-6 w-6 text-amber-500" />
        Monthly Charity Draw
      </h2>

      {/* Dynamic Status Dashboard */}
      <div className={`mb-6 p-5 rounded-xl border ${
        simulatedNumbers 
          ? 'bg-green-50 border-green-200' 
          : eligible
            ? 'bg-primary-50 border-primary-200'
            : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          {simulatedNumbers ? (
            <CheckCircle className="h-8 w-8 text-green-600" />
          ) : eligible ? (
            <Sparkles className="h-8 w-8 text-primary-600" />
          ) : (
             <AlertTriangle className="h-8 w-8 text-amber-500" />
          )}
          
          <div>
            <h3 className={`font-bold ${simulatedNumbers ? 'text-green-900' : eligible ? 'text-primary-900' : 'text-amber-900'}`}>
              {simulatedNumbers 
                ? "✓ Entered in this month's draw" 
                : eligible 
                  ? "✓ Goal Reached! Generate your numbers." 
                  : scoresThisMonth.length === 1 
                    ? "⚠ Need 1 more score this month" 
                    : "Enter at least 2 scores this month to participate"}
            </h3>
            <p className={`text-sm mt-0.5 ${simulatedNumbers ? 'text-green-700' : eligible ? 'text-primary-700' : 'text-amber-700'}`}>
              {simulatedNumbers 
                ? `Draw date: ${nextDrawDate()}`
                : `Progress: ${scoresThisMonth.length}/2 scores entered in ${new Date().toLocaleDateString('en-US', { month: 'long' })}`}
            </p>
          </div>
        </div>
      </div>

      {/* Ticket Wrapper */}
      <div className="flex-1 flex flex-col justify-center mb-6">
        <p className="text-sm font-medium text-gray-700 mb-4 text-center uppercase tracking-wider">
          {simulatedNumbers ? "Your Official Locked Numbers" : "Your Ticket"}
        </p>
        
        <div className="flex gap-2 sm:gap-3 justify-center mb-4">
          {displayNumbers.map((num, i) => (
            <div
              key={i}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 ${
                simulatedNumbers 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
                  : 'bg-gray-50 text-gray-300 border-2 border-dashed border-gray-200'
              }`}
            >
              {num > 0 ? num : '-'}
            </div>
          ))}
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
        <div className="flex justify-between text-xs sm:text-sm text-gray-500">
           <span>5-match: <strong className="text-primary-600">40%</strong></span>
           <span>4-match: <strong className="text-primary-600">35%</strong></span>
           <span>3-match: <strong className="text-primary-600">25%</strong></span>
        </div>
      </div>
    </div>
  )
}