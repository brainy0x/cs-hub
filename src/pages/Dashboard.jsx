import React, { useEffect, useState } from 'react'
import { COURSES, SUMMARIES, LEADERBOARD } from '../lib/data'
import { getCalendar } from '../lib/supabase'
import AnnouncementBanner from '../components/AnnouncementBanner'

// ─── LIVE COUNTDOWN COMPONENT ────────────────────────────────────────────────
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

export default function Dashboard({ onNav }) {
  const [calendar, setCalendar] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCalendar()
  }, [])

  async function loadCalendar() {
    const { data } = await getCalendar()
    setCalendar(data)
    setLoading(false)
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>

  const currentWeek = calendar?.current_week ?? 1
  const totalWeeks = calendar?.total_weeks ?? 15
  const examDate = calendar?.exam_start_date
  const firstExam = calendar?.first_exam

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-title">Good morning, Brainy 👋</div>
        <div className="page-sub">100 Level · Semester {calendar?.semester ?? 2} · Cybersecurity</div>
      </div>

      {/* ── ANNOUNCEMENT BANNER ── */}
      <AnnouncementBanner />

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        <StatCard icon="ti-calendar-week" color="var(--purple)" label="Academic week" value={`Week ${currentWeek}`} hint={`of ${totalWeeks}`} />
        <StatCard icon="ti-alarm" color="var(--amber)" label="Exam countdown" value={examDate ? <ExamCountdownBadge examDate={examDate} /> : 'N/A'} hint={`First paper: ${firstExam || 'TBA'}`} />
        <StatCard icon="ti-flame" color="var(--teal)" label="Quiz streak" value="5 🔥" hint="weeks in a row" />
      </div>

      {/* Week timeline */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, marginBottom: 10 }}>
          Semester {calendar?.semester ?? 2} progress — Week {currentWeek} of {totalWeeks}
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
              }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: isCurrent ? 'var(--purple)' : isPast ? 'var(--teal)' : 'var(--hint)' }}>W{w}</div>
                <div style={{ width: 5, height: 5, borderRadius: '50%', margin: '3px auto 0', background: isCurrent ? 'var(--purple)' : isPast ? 'var(--teal)' : 'var(--border)' }} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Two column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="card">
          <div className="sec-head">
            <div className="sec-title"><i className="ti ti-books" /> Courses</div>
            <span style={{ fontSize: 12, color: 'var(--purple)', cursor: 'pointer' }} onClick={() => onNav('courses')}>See all</span>
          </div>
          {COURSES.map(c => (
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
        <div className="card">
          <div className="sec-head">
            <div className="sec-title"><i className="ti ti-trophy" /> This week's leaderboard</div>
            <span style={{ fontSize: 12, color: 'var(--purple)', cursor: 'pointer' }} onClick={() => onNav('leaderboard')}>Full board</span>
          </div>
          {LEADERBOARD.slice(0, 5).map((s, i) => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: 12, fontWeight: 700, width: 18, textAlign: 'center', color: i === 0 ? 'var(--amber)' : 'var(--hint)' }}>{i + 1}</div>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: s.color, color: s.textColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600 }}>{s.initials}</div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{s.name} {s.isMe && <span style={{ fontSize: 10, color: 'var(--muted)' }}>(you)</span>}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple)' }}>{s.score}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summaries */}
      <div className="card">
        <div className="sec-head">
          <div className="sec-title"><i className="ti ti-file-description" /> Week {currentWeek} summaries</div>
          <span style={{ fontSize: 12, color: 'var(--purple)', cursor: 'pointer' }} onClick={() => onNav('summaries')}>All summaries</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {Object.entries(SUMMARIES).map(([code, s]) => (
            <div key={code} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 5 }}>{code} · Week {s.week}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.65 }}>{s.body.slice(0, 100)}...</div>
              <div className="prog-bg" style={{ marginTop: 8 }}>
                <div className="prog-fill" style={{ width: '60%', background: s.color }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--hint)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                {s.quizReady
                  ? <><i className="ti ti-bolt" style={{ color: s.color }} /><span style={{ color: s.color }}>Quiz available now</span></>
                  : <><i className="ti ti-clock" /> Quiz unlocks {s.quizUnlocks}</>}
              </div>
            </div>
          ))}
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
