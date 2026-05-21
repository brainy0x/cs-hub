import React from 'react'
import { SUMMARIES } from '../lib/data'

export default function Summaries({ onNav }) {
  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-title">Study summaries</div>
        <div className="page-sub">Week 9 · AI-generated from course syllabi</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
        {Object.entries(SUMMARIES).map(([code, s]) => (
          <div key={code} className="card">
            <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 999, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', background: s.light, color: s.color, display: 'inline-block', marginBottom: 10 }}>
              {code} · Week {s.week}
            </span>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{s.title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.75 }}>{s.body}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 12 }}>
              {s.topics.map(t => <span key={t} className="topic-tag">{t}</span>)}
            </div>
            <button onClick={() => onNav('quiz')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: s.color, fontWeight: 500, marginTop: 14, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)' }}>
              <i className="ti ti-bolt" /> Take this week's quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
