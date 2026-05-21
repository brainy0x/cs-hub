import React from 'react'
import { useLiveCalendar } from '../lib/liveData'

function getEvents(calendar) {
  const currentWeek = calendar?.current_week ?? 1
  const totalWeeks = calendar?.total_weeks ?? 15
  const semesterProgress = Math.min(100, Math.max(0, Math.round((currentWeek / totalWeeks) * 100)))

  return [
    { week: 'Now', sub: `Week ${currentWeek}`, color: 'var(--teal)', title: 'Lecture period continues', desc: `Week ${currentWeek} content delivery and weekly quizzes active` },
    { week: `${semesterProgress}%`, sub: 'Done', color: 'var(--purple)', title: 'Semester progress', desc: `Week ${currentWeek} of ${totalWeeks}` },
    { week: 'TBA', sub: 'Exam', color: 'var(--amber)', title: 'Exam timetable not released', desc: 'Official exam dates and paper order will appear here when announced.' },
  ]
}

export default function Calendar() {
  const { calendar } = useLiveCalendar()
  const events = getEvents(calendar)

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-title">Academic calendar</div>
        <div className="page-sub">Semester {calendar?.semester ?? 2} · {calendar?.session ?? '2023/2024'} session</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {events.map(e => (
          <div key={e.title} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, borderLeft: `3px solid ${e.color}` }}>
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
    </div>
  )
}
