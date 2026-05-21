import React from 'react'
import { ACADEMIC } from '../lib/data'

const EVENTS = [
  { week: 'Now', sub: `Week ${ACADEMIC.currentWeek}`, color: 'var(--teal)', title: 'Lecture period continues', desc: 'Weeks 9–12 — core content delivery, weekly quizzes active' },
  { week: 'W13', sub: '~3 wks', color: 'var(--blue)', title: 'Revision week begins', desc: 'No new content. Quiz vault opens with past questions.' },
  { week: 'W14', sub: '~5 wks', color: 'var(--amber)', title: 'Exam period starts', desc: 'MTH 102 → CSC 106 → PHY 102 → COS 102 → GST 112 → PHY 108' },
  { week: 'W15', sub: 'End', color: 'var(--purple)', title: 'Semester closes', desc: 'Results released 4–6 weeks after final paper. SIWES placement begins.' },
]

export default function Calendar() {
  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-title">Academic calendar</div>
        <div className="page-sub">Semester 2 · 2023/2024 session</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {EVENTS.map(e => (
          <div key={e.week} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, borderLeft: `3px solid ${e.color}` }}>
            <div style={{ textAlign: 'center', minWidth: 52 }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: e.week === 'Now' ? 18 : 20, fontWeight: 700, color: e.color }}>{e.week}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>{e.sub}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{e.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{e.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Exam order</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['MTH 102', 'CSC 106', 'PHY 102', 'COS 102', 'GST 112', 'PHY 108'].map((c, i) => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ background: 'var(--purple-light)', color: 'var(--purple)', padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{c}</span>
              {i < 5 && <i className="ti ti-arrow-right" style={{ color: 'var(--hint)', fontSize: 13 }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
