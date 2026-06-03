import React from 'react'
import { useLiveCalendar, useLiveSummaries } from '../lib/liveData'

export default function Summaries({ onNav }) {
  const { calendar } = useLiveCalendar()
  const { summaries, loading } = useLiveSummaries()
  const currentWeek = calendar?.current_week ?? 1

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-title">Study summaries</div>
        <div className="page-sub">Week {currentWeek} · Live study summaries</div>
      </div>

      {loading ? (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>Loading summaries…</div>
      ) : summaries.length === 0 ? (
        <div style={{ padding: 20, color: 'var(--muted)' }}>No summaries are available yet. Check back after the admin adds course summaries.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {summaries.map((s) => (
            <div key={s.id} className="card">
              <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 999, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', background: s.light || 'var(--border)', color: s.color || 'var(--text)', display: 'inline-block', marginBottom: 10 }}>
                {s.course_code} · Week {s.week}
              </span>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.75 }}>{s.body}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 12 }}>
                {(s.topics || []).map((t) => <span key={t} className="topic-tag">{t}</span>)}
              </div>
              <button onClick={() => onNav('quiz')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: s.color || 'var(--text)', fontWeight: 500, marginTop: 14, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)' }}>
                <i className="ti ti-bolt" /> Take this week's quiz
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
