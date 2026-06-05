import React, { useEffect, useState } from 'react'
import { useLiveSummaries } from '../../lib/liveData'
import { getCourses, addCourse, updateCourse, deleteCourse, getAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement, getCalendar, updateCalendar, getUsers, updateUserRole, getQuizQuestions, addQuizQuestion, updateQuizQuestion, deleteQuizQuestion, addSummary, updateSummary, deleteSummary } from '../../lib/supabase'

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
  const [quizQuestions, setQuizQuestions] = useState([])
  const { summaries: liveSummaries } = useLiveSummaries()
  const [summaries, setSummaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'addCourse' | 'editCourse' | ...
  const [formData, setFormData] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (Array.isArray(liveSummaries)) {
      setSummaries(liveSummaries)
    }
  }, [liveSummaries])

  async function loadData() {
    setLoading(true)
    const [c, a, cal, u, q] = await Promise.all([
      getCourses(),
      getAnnouncements(),
      getCalendar(),
      getUsers(),
      getQuizQuestions(),
    ])
    setCourses(c.data || [])
    setAnnouncements(a.data || [])
    setCalendar(cal.data)
    setUsers(u.data || [])
    setQuizQuestions(q.data || [])
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

  async function handleEditCourse() {
    if (!formData.id || !formData.code || !formData.title) {
      setError('Code and title required')
      return
    }
    const { error: err } = await updateCourse(formData.id, {
      code: formData.code,
      title: formData.title,
      units: formData.units || 3,
      color: formData.color || '#534AB7',
      light: formData.light || '#EEEDFE',
      icon: formData.icon || 'ti-book',
      topics: Array.isArray(formData.topics) ? formData.topics : formData.topics?.split(',').map(t => t.trim()).filter(Boolean) || [],
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

  async function handleEditAnnouncement() {
    if (!formData.id || !formData.text) {
      setError('Text required')
      return
    }
    const { error: err } = await updateAnnouncement(formData.id, {
      type: formData.type || 'info',
      text: formData.text,
      link: formData.link || null,
      link_label: formData.link_label || null,
      urgent: Boolean(formData.urgent),
      active: formData.active !== false,
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

  // ─── SUMMARIES ─────────────────────────────────────────────────────────────
  async function handleAddSummary() {
    if (!formData.course_code || !formData.week || !formData.title || !formData.body) {
      setError('Course, week, title, and body are required')
      return
    }
    const { error: err } = await addSummary({
      course_code: formData.course_code,
      week: Number(formData.week),
      title: formData.title,
      body: formData.body,
      topics: formData.topics?.split(',').map((t) => t.trim()).filter(Boolean) || [],
      quiz_ready: Boolean(formData.quiz_ready),
      quiz_unlocks: formData.quiz_unlocks || null,
    })
    if (err) {
      setError(err.message)
    } else {
      setModal(null)
      setFormData({})
      await loadData()
    }
  }

  async function handleEditSummary() {
    if (!formData.id || !formData.course_code || !formData.week || !formData.title || !formData.body) {
      setError('Course, week, title, and body are required')
      return
    }
    const { error: err } = await updateSummary(formData.id, {
      course_code: formData.course_code,
      week: Number(formData.week),
      title: formData.title,
      body: formData.body,
      topics: formData.topics?.split(',').map((t) => t.trim()).filter(Boolean) || [],
      quiz_ready: Boolean(formData.quiz_ready),
      quiz_unlocks: formData.quiz_unlocks || null,
    })
    if (err) {
      setError(err.message)
    } else {
      setModal(null)
      setFormData({})
      await loadData()
    }
  }

  async function handleDeleteSummary(id) {
    if (confirm('Delete this summary?')) {
      await deleteSummary(id)
      await loadData()
    }
  }

  // ─── QUIZ QUESTIONS ─────────────────────────────────────────────────────
  function questionPayload() {
    return {
      course_code: formData.course_code,
      week: Number(formData.week || calendar?.current_week || 1),
      question: formData.question,
      options: [formData.option_a, formData.option_b, formData.option_c, formData.option_d].map(o => o?.trim()).filter(Boolean),
      answer_index: Number(formData.answer_index || 0),
    }
  }

  function validateQuestion(payload) {
    if (!payload.course_code || !payload.question) return 'Course and question are required'
    if (payload.options.length !== 4) return 'All four options are required'
    if (payload.answer_index < 0 || payload.answer_index > 3) return 'Correct answer must be A, B, C, or D'
    return ''
  }

  async function handleAddQuestion() {
    const payload = questionPayload()
    const message = validateQuestion(payload)
    if (message) { setError(message); return }
    const { error: err } = await addQuizQuestion(payload)
    if (err) {
      setError(err.message)
    } else {
      setModal(null)
      setFormData({})
      await loadData()
    }
  }

  async function handleEditQuestion() {
    const payload = questionPayload()
    const message = validateQuestion(payload)
    if (message) { setError(message); return }
    const { error: err } = await updateQuizQuestion(formData.id, payload)
    if (err) {
      setError(err.message)
    } else {
      setModal(null)
      setFormData({})
      await loadData()
    }
  }

  async function handleDeleteQuestion(id) {
    if (confirm('Delete this quiz question?')) {
      await deleteQuizQuestion(id)
      await loadData()
    }
  }

  // ─── CALENDAR ────────────────────────────────────────────────────────────
  async function handleUpdateCalendar() {
    if (!calendar?.id) return
    const { error: err } = await updateCalendar(calendar.id, {
      semester: Number(formData.semester || calendar.semester),
      level: formData.level || calendar.level,
      programme: formData.programme || calendar.programme,
      current_week: Number(formData.current_week || calendar.current_week),
      semester_start_date: formData.semester_start_date === '' ? null : formData.semester_start_date || calendar.semester_start_date,
      exam_start_date: formData.exam_start_date === '' ? null : formData.exam_start_date || calendar.exam_start_date,
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
  const hasUpcomingExamDate = calendar?.exam_start_date && new Date(calendar.exam_start_date).getTime() > Date.now()

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-title">Admin Panel</div>
        <div className="page-sub">Manage courses, quiz questions, announcements, calendar, and users</div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs" style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        {['courses', 'questions', 'announcements', 'summaries', 'calendar', 'users'].map((t) => (
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{c.code}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setModal('editCourse'); setFormData({ ...c, topics: c.topics?.join(', ') || '' }); setError('') }} style={{
                      background: 'var(--purple-light)', color: 'var(--purple)', border: 'none', borderRadius: 6, padding: '6px 10px',
                      cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    }}>Edit</button>
                    <button onClick={() => handleDeleteCourse(c.id)} style={{
                      background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: 6, padding: '6px 10px',
                      cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    }}>Delete</button>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{c.title}</div>
                <div style={{ fontSize: 11, color: 'var(--hint)' }}>{c.units} units</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUESTIONS */}
      {tab === 'questions' && (
        <div>
          <button onClick={() => { setModal('addQuestion'); setFormData({ week: calendar?.current_week || 1, course_code: courses[0]?.code || '', answer_index: 0 }); setError('') }} style={{
            padding: '10px 16px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 8,
            cursor: 'pointer', fontWeight: 600, marginBottom: 16,
          }}>
            + Add Question
          </button>
          <div style={{ display: 'grid', gap: 12 }}>
            {quizQuestions.length === 0 && (
              <div className="card" style={{ padding: 16, color: 'var(--muted)', fontSize: 13 }}>No quiz questions yet.</div>
            )}
            {quizQuestions.map((q) => (
              <div key={q.id} className="card admin-list-row" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 700, marginBottom: 4 }}>{q.course_code} · Week {q.week}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{q.question}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{q.options?.length || 0} options · Answer {String.fromCharCode(65 + (q.answer_index || 0))}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => { setModal('editQuestion'); setFormData({ id: q.id, course_code: q.course_code, week: q.week, question: q.question, option_a: q.options?.[0] || '', option_b: q.options?.[1] || '', option_c: q.options?.[2] || '', option_d: q.options?.[3] || '', answer_index: q.answer_index }); setError('') }} style={{
                    background: 'var(--purple-light)', color: 'var(--purple)', border: 'none', borderRadius: 6, padding: '6px 10px',
                    cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  }}>Edit</button>
                  <button onClick={() => handleDeleteQuestion(q.id)} style={{
                    background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: 6, padding: '6px 10px',
                    cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  }}>Delete</button>
                </div>
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
              <div key={a.id} className="card admin-list-row" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Type: {a.type} {a.urgent ? '· Urgent' : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => { setModal('editAnnouncement'); setFormData(a); setError('') }} style={{
                    background: 'var(--purple-light)', color: 'var(--purple)', border: 'none', borderRadius: 6, padding: '6px 10px',
                    cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  }}>Edit</button>
                  <button onClick={() => handleDeleteAnnouncement(a.id)} style={{
                    background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: 6, padding: '6px 10px',
                    cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'summaries' && (
        <div>
          <button onClick={() => { setModal('addSummary'); setFormData({ week: calendar?.current_week || 1, quiz_ready: false }); setError('') }} style={{
            padding: '10px 16px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 8,
            cursor: 'pointer', fontWeight: 600, marginBottom: 16,
          }}>
            + Add Summary
          </button>
          <div style={{ display: 'grid', gap: 12 }}>
            {summaries.length === 0 && (
              <div className="card" style={{ padding: 16, color: 'var(--muted)', fontSize: 13 }}>No summaries yet.</div>
            )}
            {summaries.map((s) => (
              <div key={s.id} className="card admin-list-row" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 700, marginBottom: 4 }}>{s.course_code} · Week {s.week}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Topics: {(s.topics || []).join(', ') || 'None'} · Quiz ready: {s.quiz_ready ? 'Yes' : 'No'}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => { setModal('editSummary'); setFormData({ ...s, topics: (s.topics || []).join(', ') }); setError('') }} style={{
                    background: 'var(--purple-light)', color: 'var(--purple)', border: 'none', borderRadius: 6, padding: '6px 10px',
                    cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  }}>Edit</button>
                  <button onClick={() => handleDeleteSummary(s.id)} style={{
                    background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: 6, padding: '6px 10px',
                    cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  }}>Delete</button>
                </div>
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
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Exam Timetable</div>
                {hasUpcomingExamDate
                  ? <ExamCountdown examDate={calendar.exam_start_date} />
                  : <div style={{ padding: 12, background: '#F4F3EE', borderRadius: 8, color: 'var(--muted)', fontSize: 12 }}>Not released yet</div>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
                <div>Level: {calendar.level || '200L'}</div>
                <div>Programme: {calendar.programme || 'Cybersecurity Engineering'}</div>
                <div>Semester: {calendar.semester}</div>
                <div>Current Week: {calendar.current_week} / {calendar.total_weeks}</div>
                <div>Semester Start: {calendar.semester_start_date || 'Not set'}</div>
                <div>Exam Timetable: {hasUpcomingExamDate ? calendar.exam_start_date : 'Not released'}</div>
              </div>
              <button onClick={() => { setModal('editCalendar'); setFormData({ semester: calendar.semester, level: calendar.level || '200L', programme: calendar.programme || 'Cybersecurity Engineering', current_week: calendar.current_week, semester_start_date: calendar.semester_start_date || '', exam_start_date: calendar.exam_start_date || '' }); setError('') }} style={{
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
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000,
          padding: '6vh 16px', overflowY: 'auto', height: 'max-content',
        }}>
          <div className="card admin-modal" style={{ maxWidth: 500, width: '90%', padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            {error && <div style={{ padding: 10, background: '#FCEBEB', color: '#A32D2D', borderRadius: 6, marginBottom: 14, fontSize: 12 }}>{error}</div>}

            {(modal === 'addCourse' || modal === 'editCourse') && (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{modal === 'editCourse' ? 'Edit Course' : 'Add Course'}</div>
                <Input label="Code" placeholder="CSC 106" value={formData.code} onChange={(v) => setFormData({ ...formData, code: v })} />
                <Input label="Title" placeholder="Introduction to Programming" value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} />
                <Input label="Units" type="number" value={formData.units} onChange={(v) => setFormData({ ...formData, units: parseInt(v) })} />
                <Input label="Icon" placeholder="ti-code" value={formData.icon} onChange={(v) => setFormData({ ...formData, icon: v })} />
                <Input label="Topics" placeholder="Functions, Arrays, Pointers" value={formData.topics} onChange={(v) => setFormData({ ...formData, topics: v })} />
                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                  <button onClick={() => setModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={modal === 'editCourse' ? handleEditCourse : handleAddCourse} style={{ flex: 1, padding: '10px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>{modal === 'editCourse' ? 'Save' : 'Add'}</button>
                </div>
              </>
            )}

            {(modal === 'addQuestion' || modal === 'editQuestion') && (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{modal === 'editQuestion' ? 'Edit Question' : 'Add Question'}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', marginBottom: 4 }}>Course</div>
                    <select value={formData.course_code ?? ''} onChange={(e) => setFormData({ ...formData, course_code: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                      <option value="">Select course</option>
                      {courses.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                    </select>
                  </div>
                  <Input label="Week" type="number" value={formData.week} onChange={(v) => setFormData({ ...formData, week: parseInt(v) })} />
                </div>
                <Input label="Question" placeholder="Type the question" value={formData.question} onChange={(v) => setFormData({ ...formData, question: v })} />
                <Input label="Option A" value={formData.option_a} onChange={(v) => setFormData({ ...formData, option_a: v })} />
                <Input label="Option B" value={formData.option_b} onChange={(v) => setFormData({ ...formData, option_b: v })} />
                <Input label="Option C" value={formData.option_c} onChange={(v) => setFormData({ ...formData, option_c: v })} />
                <Input label="Option D" value={formData.option_d} onChange={(v) => setFormData({ ...formData, option_d: v })} />
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', marginBottom: 4 }}>Correct answer</div>
                  <select value={formData.answer_index ?? 0} onChange={(e) => setFormData({ ...formData, answer_index: parseInt(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                    <option value={0}>A</option>
                    <option value={1}>B</option>
                    <option value={2}>C</option>
                    <option value={3}>D</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                  <button onClick={() => setModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={modal === 'editQuestion' ? handleEditQuestion : handleAddQuestion} style={{ flex: 1, padding: '10px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>{modal === 'editQuestion' ? 'Save' : 'Add'}</button>
                </div>
              </>
            )}

            {(modal === 'addAnnouncement' || modal === 'editAnnouncement') && (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{modal === 'editAnnouncement' ? 'Edit Announcement' : 'New Announcement'}</div>
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
                  <button onClick={modal === 'editAnnouncement' ? handleEditAnnouncement : handleAddAnnouncement} style={{ flex: 1, padding: '10px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>{modal === 'editAnnouncement' ? 'Save' : 'Post'}</button>
                </div>
              </>
            )}

            {(modal === 'addSummary' || modal === 'editSummary') && (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{modal === 'editSummary' ? 'Edit Summary' : 'Add Summary'}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10, marginBottom: 12 }}>
                  <select value={formData.course_code ?? ''} onChange={(e) => setFormData({ ...formData, course_code: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                    <option value="">Select course</option>
                    {courses.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                  </select>
                  <Input label="Week" type="number" value={formData.week} onChange={(v) => setFormData({ ...formData, week: parseInt(v) })} />
                </div>
                <Input label="Title" placeholder="Summary title" value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} />
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', marginBottom: 4 }}>Body</div>
                  <textarea value={formData.body || ''} onChange={(e) => setFormData({ ...formData, body: e.target.value })} rows={6} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', resize: 'vertical' }} />
                </div>
                <Input label="Topics" placeholder="Example: networks, cryptography" value={formData.topics} onChange={(v) => setFormData({ ...formData, topics: v })} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={Boolean(formData.quiz_ready)} onChange={(e) => setFormData({ ...formData, quiz_ready: e.target.checked })} />
                  Quiz ready
                </label>
                <Input label="Quiz unlocks" placeholder="Monday, Wednesday" value={formData.quiz_unlocks} onChange={(v) => setFormData({ ...formData, quiz_unlocks: v })} />
                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                  <button onClick={() => setModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={modal === 'editSummary' ? handleEditSummary : handleAddSummary} style={{ flex: 1, padding: '10px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>{modal === 'editSummary' ? 'Save' : 'Add'}</button>
                </div>
              </>
            )}

            {modal === 'editCalendar' && (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Edit Academic Calendar</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Input label="Semester" type="number" value={formData.semester} onChange={(v) => setFormData({ ...formData, semester: parseInt(v) })} />
                  <Input label="Level" placeholder="200L" value={formData.level} onChange={(v) => setFormData({ ...formData, level: v })} />
                </div>
                <Input label="Programme" placeholder="Cybersecurity Engineering" value={formData.programme} onChange={(v) => setFormData({ ...formData, programme: v })} />
                <Input label="Current Week" type="number" value={formData.current_week} onChange={(v) => setFormData({ ...formData, current_week: parseInt(v) })} />
                <Input label="Semester Start Date" type="date" value={formData.semester_start_date} onChange={(v) => setFormData({ ...formData, semester_start_date: v })} />
                <Input label="Exam Start Date (optional)" type="date" value={formData.exam_start_date} onChange={(v) => setFormData({ ...formData, exam_start_date: v })} />
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
      <input type={type} placeholder={placeholder} value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={{
        width: '100%', padding: '10px', borderRadius: 6, border: '1px solid var(--border)',
        background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none',
        boxSizing: 'border-box',
      }} onFocus={(e) => e.target.style.borderColor = 'var(--purple)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
    </div>
  )
}
