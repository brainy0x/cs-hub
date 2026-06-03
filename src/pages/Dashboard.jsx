import React, { useEffect, useState } from 'react'
import { useLiveAnnouncements, useLiveCalendar, useLiveCourses, useLiveLeaderboard, useLiveSummaries, useUserQuizStats } from '../lib/liveData'
import AnnouncementBanner from '../components/AnnouncementBanner'

function ExamCountdownBadge({ examDate }) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime()
      const target = new Date(examDate).getTime()
      const diff = target - now

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      } else {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [examDate])

  return (
    <div style={{ fontSize: 13, lineHeight: 1.6 }}>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, color: 'var(--amber)' }}>
        {String(countdown.days).padStart(2, '0')}d {String(countdown.hours).padStart(2, '0')}h {String(countdown.minutes).padStart(2, '0')}m {String(countdown.seconds).padStart(2, '0')}s
      </div>
    </div>
  )
}

export default function Dashboard({ onNav, user, profile }) {
  const { calendar, loading } = useLiveCalendar()
  const { courses } = useLiveCourses()
  const { announcements } = useLiveAnnouncements()
  const { leaderboard } = useLiveLeaderboard()
  const { summaries } = useLiveSummaries()
  const { streak } = useUserQuizStats(user?.id)

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>

  const fullName = profile?.full_name || user?.user_metadata?.full_name || ''
  const firstName = fullName.split(' ')[0] || user?.email?.split('@')[0] || 'Student'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const currentWeek = calendar?.current_week ?? 1
  const totalWeeks = calendar?.total_weeks ?? 15
  const examDate = calendar?.exam_start_date
  const hasUpcomingExamDate = examDate && new Date(examDate).getTime() > Date.now()

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-title">{greeting}, {firstName}</div>
        <div className="page-sub">200 Level · Semester {calendar?.semester ?? 1} · Cybersecurity</div>
      </div>

      <AnnouncementBanner items={announcements} />

      <div className="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        <StatCard icon="ti-calendar-week" color="var(--purple)" label="Academic week" value={`Week ${currentWeek}`} hint={`of ${totalWeeks}`} />
        <StatCard icon="ti-alarm" color="var(--amber)" label="Exam timetable" value={hasUpcomingExamDate ? <ExamCountdownBadge examDate={examDate} /> : 'Not released'} hint={hasUpcomingExamDate ? 'Countdown starts from official date' : 'Waiting for official timetable'} />
        <StatCard icon="ti-flame" color="var(--teal)" label="Quiz streak" value={`${streak} days`} hint={streak > 0 ? 'daily quiz streak' : 'no quizzes yet'} />
      </div>

      <div className="card week-timeline" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, marginBottom: 10 }}>
          Semester {calendar?.semester ?? 1} progress — Week {currentWeek} of {totalWeeks}
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(w => {
            const isCurrent = w === currentWeek
            const isPast = w < currentWeek
            return (
              <div key={w} style={{
                flex: 1, textAlign: 'center', padding: '6px 2px',
                borderRadius: 6, border: `1px solid ${isCurrent ? 'var(--purple-mid)' : 'var(--border)'}`,
                background: isCurrent ? 'var(--purple-light)' : isPast ? '#F4F3EE' : 'transparent',
                boxShadow: isCurrent ? '0 0 0 2px rgba(83,74,183,0.10), 0 0 18px rgba(83,74,183,0.28)' : 'none',
              }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: isCurrent ? 'var(--purple)' : isPast ? 'var(--teal)' : 'var(--hint)' }}>W{w}</div>
                <div style={{ width: 5, height: 5, borderRadius: '50%', margin: '3px auto 0', background: isCurrent ? 'var(--purple)' : isPast ? 'var(--teal)' : 'var(--border)' }} />
              </div>
            )
          })}
        </div>
      </div>

      <div className="dashboard-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="card">
          <div className="sec-head">
            <div className="sec-title"><i className="ti ti-books" /> Courses</div>
            <span style={{ fontSize: 12, color: 'var(--purple)', cursor: 'pointer' }} onClick={() => onNav('courses')}>See all</span>
          </div>
          {courses.map(c => (
            <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{c.code}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.title}</div>
              </div>
              <span className="badge" style={{ background: c.light, color: c.color }}>{c.units} units</span>
            </div>
          ))}
        </div>
        <div className="card dashboard-leaderboard">
          <div className="sec-head">
            <div className="sec-title"><i className="ti ti-trophy" /> Leaderboard</div>
            <span style={{ fontSize: 12, color: 'var(--purple)', cursor: 'pointer' }} onClick={() => onNav('leaderboard')}>Full board</span>
          </div>
          {leaderboard.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              No quiz scores yet. Once students submit quizzes, rankings will appear here.
            </div>
          )}
          {leaderboard.slice(0, 5).map((s, i) => (
            <div key={s.user_id || s.full_name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < Math.min(leaderboard.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: 12, fontWeight: 700, width: 18, textAlign: 'center', color: i === 0 ? 'var(--amber)' : 'var(--hint)' }}>{i + 1}</div>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--purple-light)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600 }}>{(s.full_name || 'Student').slice(0, 2).toUpperCase()}</div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{s.full_name || 'Student'}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple)' }}>{s.avg_score ?? 0}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="sec-head">
          <div className="sec-title"><i className="ti ti-file-description" /> Week {currentWeek} summaries</div>
          <span style={{ fontSize: 12, color: 'var(--purple)', cursor: 'pointer' }} onClick={() => onNav('summaries')}>All summaries</span>
        </div>
        <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {summaries.filter((s) => s.week === currentWeek).map((s) => (
            <div key={`${s.course_code}-${s.week}`} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple)', marginBottom: 5 }}>{s.course_code} · Week {s.week}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.65 }}>{(s.body || '').slice(0, 120)}...</div>
            </div>
          ))}
          {summaries.filter((s) => s.week === currentWeek).length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: 16, color: 'var(--muted)', textAlign: 'center' }}>
              No summaries available for week {currentWeek} yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, color, label, value, hint }) {
  return (
    <div className="card">
      <div style={{ fontSize: 11, color, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 14 }} /> {label}
      </div>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--hint)', marginTop: 3 }}>{hint}</div>
    </div>
  )
}
