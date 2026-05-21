import React, { useEffect, useState } from 'react'
import { supabase, getCourses, addCourse, updateCourse, deleteCourse, getAnnouncements, addAnnouncement, deleteAnnouncement, getCalendar, updateCalendar, getUsers, updateUserRole } from '../../lib/supabase'

// ─── COUNTDOWN COMPONENT ─────────────────────────────────────────────────────
function ExamCountdown({ examDate }) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
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
    }, 1000)
    return () => clearInterval(interval)
  }, [examDate])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 12 }}>
      {[
        { label: 'Days', value: countdown.days },
        { label: 'Hours', value: countdown.hours },
        { label: 'Mins', value: countdown.minutes },
        { label: 'Secs', value: countdown.seconds },
      ].map((item, i) => (
        <div key={i} style={{ textAlign: 'center', padding: '10px', background: '#F4F3EE', borderRadius: 8 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--purple)' }}>{String(item.value).padStart(2, '0')}</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{item.label}</div>
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('courses') // courses | announcements | calendar | users
  const [courses, setCourses] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [calendar, setCalendar] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'addCourse' | 'editCourse' | ...
  const [formData, setFormData] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [c, a, cal, u] = await Promise.all([
      getCourses(),
      getAnnouncements(),
      getCalendar(),
      getUsers(),
    ])
    setCourses(c.data || [])
    setAnnouncements(a.data || [])
    setCalendar(cal.data)
    setUsers(u.data || [])
    setLoading(false)
  }

  // ─── COURSES ─────────────────────────────────────────────────────────────
  async function handleAddCourse() {
    if (!formData.code || !formData.title) {
      setError('Code and title required')
      return
    }
    const { error: err } = await addCourse({
      code: formData.code,
      title: formData.title,
      units: formData.units || 3,
      color: formData.color || '#534AB7',
      light: formData.light || '#EEEDFE',
      icon: formData.icon || 'ti-book',
      topics: formData.topics?.split(',').map(t => t.trim()) || [],
    })
    if (err) {
      setError(err.message)
    } else {
      setModal(null)
      setFormData({})
      await loadData()
    }
  }

  async function handleDeleteCourse(id) {
    if (confirm('Delete this course?')) {
      await deleteCourse(id)
      await loadData()
    }
  }

  // ─── ANNOUNCEMENTS ───────────────────────────────────────────────────────
  async function handleAddAnnouncement() {
    if (!formData.text) {
      setError('Text required')
      return
    }
    const { error: err } = await addAnnouncement({
      type: formData.type || 'info',
      text: formData.text,
      link: formData.link || null,
      link_label: formData.link_label || null,
      urgent: formData.urgent || false,
      active: true,
    })
    if (err) {
      setError(err.message)
    } else {
      setModal(null)
      setFormData({})
      await loadData()
    }
  }

  async function handleDeleteAnnouncement(id) {
    if (confirm('Delete this announcement?')) {
      await deleteAnnouncement(id)
      await loadData()
    }
  }

  // ─── CALENDAR ────────────────────────────────────────────────────────────
  async function handleUpdateCalendar() {
    if (!calendar?.id) return
    const { error: err } = await updateCalendar(calendar.id, {
      current_week: formData.current_week || calendar.current_week,
      exam_start_date: formData.exam_start_date || calendar.exam_start_date,
      first_exam: formData.first_exam || calendar.first_exam,
    })
    if (err) {
      setError(err.message)
    } else {
      setModal(null)
      setFormData({})
      await loadData()
    }
  }

  // ─── USERS ───────────────────────────────────────────────────────────────
  async function handleUpdateUserRole(userId, newRole) {
    const { error: err } = await updateUserRole(userId, newRole)
    if (err) {
      alert('Error: ' + err.message)
    } else {
      await loadData()
    }
  }

  // ─── RENDER ──────────────────────────────────────────────────────────────
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-title">Admin Panel</div>
        <div className="page-sub">Manage courses, announcements, calendar, and users</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        {['courses', 'announcements', 'calendar', 'users'].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', background: tab === t ? 'var(--purple)' : 'transparent',
            color: tab === t ? '#fff' : 'var(--muted)', cursor: 'pointer', fontWeight: 500, fontSize: 13,
            textTransform: 'capitalize', transition: 'all 0.15s',
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* COURSES */}
      {tab === 'courses' && (
        <div>
          <button onClick={() => { setModal('addCourse'); setFormData({}); setError('') }} style={{
            padding: '10px 16px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 8,
            cursor: 'pointer', fontWeight: 600, marginBottom: 16,
          }}>
            + Add Course
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {courses.map((c) => (
              <div key={c.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{c.code}</div>
                  <button onClick={() => handleDeleteCourse(c.id)} style={{
                    background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: 6, padding: '6px 12px',
                    cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  }}>Delete</button>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{c.title}</div>
                <div style={{ fontSize: 11, color: 'var(--hint)' }}>{c.units} units</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS */}
      {tab === 'announcements' && (
        <div>
          <button onClick={() => { setModal('addAnnouncement'); setFormData({}); setError('') }} style={{
            padding: '10px 16px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 8,
            cursor: 'pointer', fontWeight: 600, marginBottom: 16,
          }}>
            + New Announcement
          </button>
          <div style={{ display: 'grid', gap: 12 }}>
            {announcements.map((a) => (
              <div key={a.id} className="card" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Type: {a.type} {a.urgent ? '· Urgent' : ''}</div>
                </div>
                <button onClick={() => handleDeleteAnnouncement(a.id)} style={{
                  background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: 6, padding: '6px 12px',
                  cursor: 'pointer', fontSize: 12, fontWeight: 500, marginLeft: 8,
                }}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CALENDAR */}
      {tab === 'calendar' && (
        <div>
          {calendar && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Exam Countdown</div>
                <ExamCountdown examDate={calendar.exam_start_date} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
                <div>Current Week: {calendar.current_week} / {calendar.total_weeks}</div>
                <div>Exam Date: {calendar.exam_start_date}</div>
                <div>First Exam: {calendar.first_exam}</div>
              </div>
              <button onClick={() => { setModal('editCalendar'); setFormData({ current_week: calendar.current_week, exam_start_date: calendar.exam_start_date, first_exam: calendar.first_exam }); setError('') }} style={{
                padding: '10px 16px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 8,
                cursor: 'pointer', fontWeight: 600,
              }}>Edit Calendar</button>
            </div>
          )}
        </div>
      )}

      {/* USERS */}
      {tab === 'users' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {users.map((u) => (
            <div key={u.user_id} className="card" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{u.full_name || u.email}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.email}</div>
              </div>
              <select value={u.role} onChange={(e) => handleUpdateUserRole(u.user_id, e.target.value)} style={{
                padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer',
                background: 'var(--card)', color: 'var(--text)', fontSize: 12, fontWeight: 600,
              }}>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      {modal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div className="card" style={{ maxWidth: 500, width: '90%', padding: 24 }}>
            {error && <div style={{ padding: 10, background: '#FCEBEB', color: '#A32D2D', borderRadius: 6, marginBottom: 14, fontSize: 12 }}>{error}</div>}

            {modal === 'addCourse' && (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Add Course</div>
                <Input label="Code" placeholder="CSC 106" value={formData.code} onChange={(v) => setFormData({ ...formData, code: v })} />
                <Input label="Title" placeholder="Introduction to Programming" value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} />
                <Input label="Units" type="number" value={formData.units} onChange={(v) => setFormData({ ...formData, units: parseInt(v) })} />
                <Input label="Icon" placeholder="ti-code" value={formData.icon} onChange={(v) => setFormData({ ...formData, icon: v })} />
                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                  <button onClick={() => setModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleAddCourse} style={{ flex: 1, padding: '10px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Add</button>
                </div>
              </>
            )}

            {modal === 'addAnnouncement' && (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>New Announcement</div>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid var(--border)', marginBottom: 12, background: 'var(--card)', color: 'var(--text)' }}>
                  <option value="lesson">Lesson</option>
                  <option value="ticket">Ticket</option>
                  <option value="result">Result</option>
                  <option value="task">Task</option>
                  <option value="info">Info</option>
                </select>
                <Input label="Text" placeholder="Announcement text" value={formData.text} onChange={(v) => setFormData({ ...formData, text: v })} />
                <Input label="Link" placeholder="https://..." value={formData.link} onChange={(v) => setFormData({ ...formData, link: v })} />
                <Input label="Link Label" placeholder="Click here" value={formData.link_label} onChange={(v) => setFormData({ ...formData, link_label: v })} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.urgent} onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })} />
                  Mark as urgent
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleAddAnnouncement} style={{ flex: 1, padding: '10px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Post</button>
                </div>
              </>
            )}

            {modal === 'editCalendar' && (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Edit Academic Calendar</div>
                <Input label="Current Week" type="number" value={formData.current_week} onChange={(v) => setFormData({ ...formData, current_week: parseInt(v) })} />
                <Input label="Exam Start Date" type="date" value={formData.exam_start_date} onChange={(v) => setFormData({ ...formData, exam_start_date: v })} />
                <Input label="First Exam Course" placeholder="MTH 102" value={formData.first_exam} onChange={(v) => setFormData({ ...formData, first_exam: v })} />
                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                  <button onClick={() => setModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleUpdateCalendar} style={{ flex: 1, padding: '10px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Save</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── INPUT COMPONENT ─────────────────────────────────────────────────────────
function Input({ label, type = 'text', placeholder, value, onChange }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} style={{
        width: '100%', padding: '10px', borderRadius: 6, border: '1px solid var(--border)',
        background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none',
        boxSizing: 'border-box',
      }} onFocus={(e) => e.target.style.borderColor = 'var(--purple)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
    </div>
  )
}