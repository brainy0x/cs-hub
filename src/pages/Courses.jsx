import React from 'react'
import { useLiveCalendar, useLiveCourses } from '../lib/liveData'

export default function Courses() {
  const { courses } = useLiveCourses()
  const { calendar } = useLiveCalendar()
  const currentWeek = calendar?.current_week ?? 1
  const totalWeeks = calendar?.total_weeks ?? 15
  const semesterProgress = Math.min(100, Math.max(0, Math.round((currentWeek / totalWeeks) * 100)))
  const totalUnits = courses.reduce((sum, course) => sum + (Number(course.units) || 0), 0)

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-title">Courses</div>
        <div className="page-sub">Semester {calendar?.semester ?? 2} · 100 Level · {totalUnits} credit units total</div>
      </div>
      <div className="course-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
        {courses.map(c => (
          <div key={c.code} className="card" style={{ transition: 'border-color 0.15s', cursor: 'default' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--purple-mid)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 700, color: c.color }}>{c.code}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{c.title}</div>
                <span className="badge" style={{ background: c.light, color: c.color, marginTop: 6 }}>{c.units} units</span>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: c.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`ti ${c.icon}`} style={{ fontSize: 20, color: c.color }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 5 }}>
                <span>Week {currentWeek} of {totalWeeks}</span>
                <span style={{ fontWeight: 600, color: c.color }}>{semesterProgress}%</span>
              </div>
              <div className="prog-bg" style={{ height: 6 }}>
                <div className="prog-fill" style={{ width: `${semesterProgress}%`, background: c.color, height: 6 }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 12 }}>
              {(c.topics || []).map(t => <span key={t} className="topic-tag">{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
