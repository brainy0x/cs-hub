import React from 'react'
import { useLiveLeaderboard } from '../lib/liveData'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const { leaderboard, loading } = useLiveLeaderboard()

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-title">Leaderboard</div>
        <div className="page-sub">Week 9 · All courses combined · Updated live</div>
      </div>
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
        {leaderboard.map((s, i) => (
          <div key={s.user_id || i} className="leaderboard-row" style={{ display: 'grid', gridTemplateColumns: '50px 1fr 90px 90px 80px', padding: '13px 16px', borderTop: '1px solid var(--border)', alignItems: 'center', background: i === 0 ? 'var(--purple-light)' : 'transparent', transition: 'background 0.1s' }}
            onMouseEnter={e => { if (i !== 0) e.currentTarget.style.background = '#FAFAF7' }}
            onMouseLeave={e => { if (i !== 0) e.currentTarget.style.background = 'transparent' }}>
            <div style={{ fontSize: i < 3 ? 18 : 13, fontWeight: 700, color: 'var(--hint)', textAlign: 'center' }}>
              {i < 3 ? MEDALS[i] : i + 1}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--purple-light)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{(s.full_name || 'ST').slice(0, 2).toUpperCase()}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {s.full_name || 'Student'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.matric_no || '100L · Cybersecurity'}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple)' }}>{s.avg_score ?? 0}%</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              <i className="ti ti-flame" style={{ color: 'var(--amber)', fontSize: 14 }} />{s.streak}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.quizzes_taken}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
