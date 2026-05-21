import React, { useState } from 'react'
import { LEADERBOARD, COURSES } from '../lib/data'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const [filter, setFilter] = useState('All')
  const filters = ['All', ...COURSES.map(c => c.code)]

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-title">Leaderboard</div>
        <div className="page-sub">Week 9 · All courses combined · Updated live</div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ background: filter === f ? 'var(--purple-light)' : '#F4F3EE', color: filter === f ? 'var(--purple)' : 'var(--muted)', border: `1px solid ${filter === f ? 'var(--purple-mid)' : 'transparent'}`, borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: filter === f ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 90px 90px 80px', padding: '10px 16px', background: '#F4F3EE', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <div>Rank</div><div>Student</div><div>Score</div><div>Streak</div><div>Quizzes</div>
        </div>
        {LEADERBOARD.map((s, i) => (
          <div key={s.name} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 90px 90px 80px', padding: '13px 16px', borderTop: '1px solid var(--border)', alignItems: 'center', background: s.isMe ? 'var(--purple-light)' : 'transparent', transition: 'background 0.1s' }}
            onMouseEnter={e => { if (!s.isMe) e.currentTarget.style.background = '#FAFAF7' }}
            onMouseLeave={e => { if (!s.isMe) e.currentTarget.style.background = 'transparent' }}>
            <div style={{ fontSize: i < 3 ? 18 : 13, fontWeight: 700, color: 'var(--hint)', textAlign: 'center' }}>
              {i < 3 ? MEDALS[i] : i + 1}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: s.color, color: s.textColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{s.initials}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {s.name}
                  {s.isMe && <span style={{ fontSize: 10, background: 'var(--purple)', color: '#fff', padding: '2px 7px', borderRadius: 999, marginLeft: 6 }}>you</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>100L · Cybersecurity</div>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple)' }}>{s.score}%</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              <i className="ti ti-flame" style={{ color: 'var(--amber)', fontSize: 14 }} />{s.streak}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.quizzes}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: 'var(--hint)', textAlign: 'center' }}>
        🔒 Connect Supabase to show real-time scores
      </div>
    </div>
  )
}
