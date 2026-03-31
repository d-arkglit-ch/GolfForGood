import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import authService from '../lib/supabase'

export default function ScoreEntry({ userId, onScoreChange }) {
  const [scores, setScores] = useState([])
  const [newScore, setNewScore] = useState('')
  const [newDate, setNewDate] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editScore, setEditScore] = useState('')
  const [editDate, setEditDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadScores = useCallback(async () => {
    try {
      const { data, error } = await authService.supabase
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .order('date_played', { ascending: false })
      
      if (error) throw error
      setScores(data || [])
    } catch (_err) {
      setError('Failed to load scores')
    }
  }, [userId])

  // Load scores on mount
  useEffect(() => {
    loadScores()
  }, [userId, loadScores])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newScore || !newDate) return

    const scoreNum = parseInt(newScore)
    if (scoreNum < 1 || scoreNum > 45) {
      setError('Score must be between 1 and 45')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Rolling 5 logic: if already at 5 scores, delete the oldest before adding
      if (scores.length >= 5) {
        const oldest = scores[scores.length - 1] // scores are sorted newest-first
        const { error: delError } = await authService.supabase
          .from('scores')
          .delete()
          .eq('id', oldest.id)
        if (delError) throw delError
      }

      const { error } = await authService.supabase
        .from('scores')
        .insert({
          user_id: userId,
          score: scoreNum,
          date_played: newDate
        })

      if (error) throw error

      // Reset form
      setNewScore('')
      setNewDate('')
      
      // Reload scores
      await loadScores()
      if (onScoreChange) onScoreChange()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const { error } = await authService.supabase
        .from('scores')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadScores()
      if (onScoreChange) onScoreChange()
    } catch (_err) {
      setError('Failed to delete score')
    }
  }

  const startEdit = (score) => {
    setEditingId(score.id)
    setEditScore(score.score.toString())
    setEditDate(score.date_played)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditScore('')
    setEditDate('')
  }

  const handleUpdate = async (id) => {
    const scoreNum = parseInt(editScore)
    if (scoreNum < 1 || scoreNum > 45) {
      setError('Score must be between 1 and 45')
      return
    }

    try {
      const { error } = await authService.supabase
        .from('scores')
        .update({
          score: scoreNum,
          date_played: editDate
        })
        .eq('id', id)

      if (error) throw error
      
      setEditingId(null)
      await loadScores()
      if (onScoreChange) onScoreChange()
    } catch (_err) {
      setError('Failed to update score')
    }
  }

  return (
    <div className="bg-sand rounded-2xl border border-white/5 p-8 shadow-2xl shadow-black/20">
      <h2 className="text-2xl font-serif italic font-bold text-golf mb-8 flex items-center justify-between">
         The Patron's Record
        <span className="text-[10px] uppercase font-black tracking-widest opacity-30 bg-tan px-3 py-1 rounded-full border border-white/5">
          {scores.length} / 5 Logged
        </span>
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Add Score Form */}
      <form onSubmit={handleAdd} className="mb-10 flex gap-4">
        <input
          type="number"
          min="1"
          max="45"
          value={newScore}
          onChange={(e) => setNewScore(e.target.value)}
          placeholder="Score (1-45)"
          className="flex-1 px-6 py-3 bg-ivory border border-olive/10 rounded-full text-[11px] uppercase tracking-widest font-bold outline-none focus:border-olive transition-all shadow-inner shadow-olive/5"
          required
        />
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="flex-1 px-6 py-3 bg-ivory border border-olive/10 rounded-full text-[11px] uppercase tracking-widest font-bold outline-none focus:border-olive transition-all shadow-inner shadow-olive/5"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-olive text-white px-8 py-3 rounded-full hover:bg-olive/90 transition shadow-xl shadow-olive/10 disabled:opacity-20 flex items-center justify-center min-w-[56px]"
        >
          {loading ? (
             <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </button>
      </form>

      {scores.length >= 5 && (
        <p className="mb-6 text-[10px] uppercase font-bold tracking-widest text-olive/60 bg-olive/[0.03] p-4 rounded-xl border border-olive/5 italic text-center">
          Legacy limit reached. Subsequent entries will archive the oldest record.
        </p>
      )}

      {/* Scores List */}
      <div className="space-y-3">
        {scores.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No scores entered yet</p>
        ) : (
          scores.map((score, index) => (
            <div
              key={score.id}
              className={`flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl border transition-all duration-700 hover:shadow-lg hover:shadow-black/5 gap-6 sm:gap-0 ${
                index === 0 ? 'bg-tan border-white/10' : 'bg-sand border-white/5'
              }`}
            >
              {editingId === score.id ? (
                <>
                  <div className="flex gap-2 flex-1">
                    <input
                      type="number"
                      min="1"
                      max="45"
                      value={editScore}
                      onChange={(e) => setEditScore(e.target.value)}
                      className="w-24 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(score.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-6">
                    <span className={`text-4xl font-serif italic font-black ${index === 0 ? 'text-olive' : 'text-golf/20'}`}>
                      {score.score}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-30">
                        {new Date(score.date_played).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      {index === 0 && (
                        <span className="text-[8px] uppercase font-black tracking-[0.3em] text-olive mt-1">
                          Most Recent Achievement
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(score)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(score.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}