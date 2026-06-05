import React, { useEffect, useState } from 'react'
import { calculateDailyStreak, useLiveLeaderboard, useLiveCalendar } from '../lib/liveData'
import { getUserQuizAttempts, resetLeaderboard } from '../lib/supabase'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ user, profile }) {
  const { leaderboard, loading } = useLiveLeaderboard()
  const { calendar } = useLiveCalendar()
  const currentWeek = calendar?.current_week ?? 1
  const level = calendar?.level || '200L'
  const programme = calendar?.programme || 'Cybersecurity'
  const userId = user?.id
  const isAdmin = profile?.role === 'admin'
  const userInLeaderboard = userId && leaderboard.some((row) => String(row.user_id) === String(userId))
  const [userRow, setUserRow] = useState(null)
  const [resetting, setResetting] = useState(false)
  const [resetMessage, setResetMessage] = useState('')

  useEffect(() => {
    if (!userId || userInLeaderboard) {
      setUserRow(null)
      return
    }

    async function loadUserRow() {
      const { data, error } = await getUserQuizAttempts(userId)
      if (error || !data?.length) {
        setUserRow(null)
        return
      }

      const avg = Math.round((data.reduce((sum, attempt) => sum + ((attempt.score || 0) / (attempt.total || 1)), 0) / data.length) * 1000) / 10
      setUserRow({
        user_id: userId,
        full_name: profile?.full_name || user?.email?.split('@')[0] || 'You',
        matric_no: profile?.matric_no || 'Your account',
        streak: calculateDailyStreak(data),
        avg_score: avg,
        quizzes_taken: data.length,
      })
    }

    loadUserRow()
  }, [userId, userInLeaderboard, profile, user?.email])

  const displayRows = userRow ? [...leaderboard, userRow] : leaderboard

  async function handleReset() {
    setResetMessage('')
    setResetting(true)
    const { error } = await resetLeaderboard()
    if (error) {
      setResetMessage(`Could not reset leaderboard: ${error.message}`)
    } else {
      setResetMessage('Leaderboard reset to 0% for all users.')
    }
    setResetting(false)
  }

  return (
    <div className="fade-up">
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div>
          <div className="page-title">Leaderboard</div>
          <div className="page-sub">Week {currentWeek} · All courses combined · Updated live</div>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={handleReset} disabled={resetting} style={{
              background: resetting ? 'var(--border)' : 'var(--purple)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 16px',
              fontSize: 12,
              fontWeight: 700,
              cursor: resetting ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-head)',
            }}>
              {resetting ? 'Resetting…' : 'Reset leaderboard'}
            </button>
          </div>
        )}
      </div>
      {resetMessage && (
        <div style={{ marginBottom: 16, fontSize: 12, color: resetMessage.startsWith('Could') ? '#A32D2D' : 'var(--purple)' }}>
          {resetMessage}
        </div>
      )}
      {!loading && user && !userInLeaderboard && (
        <div style={{ marginBottom: 16, fontSize: 12, color: 'var(--muted)' }}>
          Your quiz score was recorded. If your row does not appear yet, refresh after the leaderboard updates.
        </div>
      )}
      {/* Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 90px 90px 80px', padding: '10px 16px', background: '#F4F3EE', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <div>Rank</div><div>Student</div><div>Score</div><div>Streak</div><div>Quizzes</div>
        </div>
        {loading && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Loading leaderboard...</div>
        )}
        {!loading && leaderboard.length === 0 && (
          <div style={{ padding: '2.5rem 1.25rem', textAlign: 'center', color: 'var(--muted)' }}>
            <i className="ti ti-trophy-off" style={{ fontSize: 34, display: 'block', marginBottom: 10, color: 'var(--hint)' }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>No scores yet</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Take a quiz and your real ranking will show here.</div>
          </div>
        )}
        {displayRows.map((s, i) => {
          const isCurrentUser = userId && s.user_id && String(s.user_id) === String(userId)
          return (
            <div key={s.user_id || i} className="leaderboard-row" style={{
              display: 'grid',
              gridTemplateColumns: '50px 1fr 90px 90px 80px',
              padding: '13px 16px',
              borderTop: '1px solid var(--border)',
              alignItems: 'center',
              background: isCurrentUser ? 'rgba(34, 139, 230, 0.12)' : i === 0 ? 'var(--purple-light)' : 'transparent',
              boxShadow: isCurrentUser ? 'inset 3px 0 0 0 var(--purple)' : 'none',
              transition: 'background 0.1s, box-shadow 0.1s',
            }}
              onMouseEnter={e => { if (!isCurrentUser && i !== 0) e.currentTarget.style.background = '#FAFAF7' }}
              onMouseLeave={e => { if (!isCurrentUser && i !== 0) e.currentTarget.style.background = 'transparent' }}>
              <div style={{ fontSize: i < 3 ? 18 : 13, fontWeight: 700, color: 'var(--hint)', textAlign: 'center' }}>
                {isCurrentUser && !userInLeaderboard ? 'You' : i < 3 ? MEDALS[i] : i + 1}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--purple-light)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{(s.full_name || 'ST').slice(0, 2).toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {s.full_name || 'Student'}
                    {isCurrentUser && <span style={{ fontSize: 11, color: 'var(--purple)', fontWeight: 700, background: '#F4E9FF', padding: '1px 6px', borderRadius: 999 }}>You</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.matric_no || `${level} · ${programme}`}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple)' }}>{s.avg_score ?? 0}%</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                <i className="ti ti-flame" style={{ color: 'var(--amber)', fontSize: 14 }} />{s.streak}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.quizzes_taken}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
