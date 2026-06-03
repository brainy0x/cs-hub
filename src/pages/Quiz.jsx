import React, { useEffect, useMemo, useRef, useState } from 'react'
import { calculateDailyStreak, useLiveCalendar, useLiveCourses, useLiveQuizQuestions } from '../lib/liveData'
import { getUserQuizAttempts, submitScore, updateProfileStreak } from '../lib/supabase'

const LETTERS = ['A', 'B', 'C', 'D']

function normalizeQuestion(q) {
  return {
    id: q.id,
    q: q.question,
    opts: q.options || [],
    ans: q.answer_index,
  }
}

export default function Quiz({ onNav, user }) {
  const { courses } = useLiveCourses()
  const { calendar } = useLiveCalendar()
  const currentWeek = calendar?.current_week ?? 1
  const { questions: allQuestions, loading } = useLiveQuizQuestions(null, currentWeek)
  const [selected, setSelected] = useState(null)
  const [phase, setPhase] = useState('select')
  const [qIndex, setQIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [timeLeft, setTimeLeft] = useState(60)
  const timerRef = useRef(null)

  const questionsByCourse = useMemo(() => {
    return allQuestions.reduce((acc, question) => {
      acc[question.course_code] = acc[question.course_code] || []
      acc[question.course_code].push(normalizeQuestion(question))
      return acc
    }, {})
  }, [allQuestions])

  const availableCourses = courses.filter(c => questionsByCourse[c.code]?.length)
  const questions = selected ? questionsByCourse[selected] || [] : []
  const q = questions[qIndex]
  const pct = Math.round((score / (questions.length || 1)) * 100)

  useEffect(() => {
    if (phase !== 'active') return
    setTimeLeft(60)
    setAnswered(false)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          autoNext()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, qIndex])

  useEffect(() => {
    if (phase !== 'result' || submitted || !user?.id || !selected || !questions.length) return
    async function saveScore() {
      const { error } = await submitScore(user.id, selected, currentWeek, score, questions.length)
      if (error) {
        setSubmitError(error.message)
        return
      }
      const { data } = await getUserQuizAttempts(user.id)
      await updateProfileStreak(user.id, calculateDailyStreak(data || []))
      setSubmitted(true)
    }
    saveScore()
  }, [phase, submitted, user?.id, selected, currentWeek, score, questions.length])

  function autoNext() {
    setAnswered(true)
    setTimeout(() => advance(), 1200)
  }

  function answer(i) {
    if (answered) return
    clearInterval(timerRef.current)
    setAnswered(true)
    if (i === q.ans) setScore(s => s + 1)
  }

  function advance() {
    if (qIndex + 1 < questions.length) {
      setQIndex(q => q + 1)
    } else {
      setPhase('result')
    }
  }

  function reset() {
    setSelected(null)
    setPhase('select')
    setQIndex(0)
    setScore(0)
    setAnswered(false)
    setSubmitted(false)
    setSubmitError('')
    setTimeLeft(60)
    clearInterval(timerRef.current)
  }

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-title">Weekly Quiz</div>
        <div className="page-sub">Week {currentWeek} · Pick a course and test yourself</div>
      </div>

      <div style={{ maxWidth: 680 }}>
        {phase === 'select' && (
          <>
            {loading && <div className="card" style={{ color: 'var(--muted)' }}>Loading quizzes...</div>}
            {!loading && availableCourses.length === 0 && (
              <div className="card" style={{ textAlign: 'center', color: 'var(--muted)' }}>
                <i className="ti ti-clipboard-off" style={{ fontSize: 34, color: 'var(--hint)', display: 'block', marginBottom: 10 }} />
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>No quiz questions yet</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>When questions are added from admin, they will show here.</div>
              </div>
            )}
            <div className="quiz-course-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
              {availableCourses.map(c => (
                <button key={c.code} onClick={() => setSelected(c.code)}
                  style={{ background: selected === c.code ? c.light : 'var(--card)', border: `1px solid ${selected === c.code ? c.color : 'var(--border)'}`, borderRadius: 10, padding: '1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-head)', color: c.color }}>{c.code}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{c.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--hint)', marginTop: 6 }}>{questionsByCourse[c.code].length} questions · 60s each</div>
                </button>
              ))}
            </div>
            {availableCourses.length > 0 && (
              <button disabled={!selected} onClick={() => setPhase('active')}
                style={{ background: selected ? 'var(--purple)' : '#E8E6DF', color: selected ? '#fff' : 'var(--hint)', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-head)', cursor: selected ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-bolt" /> Start Quiz
              </button>
            )}
          </>
        )}

        {phase === 'active' && q && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Question {qIndex + 1} of {questions.length}</div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: timeLeft <= 10 ? 'var(--red)' : 'var(--amber)' }}>
                0:{String(timeLeft).padStart(2, '0')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
              {questions.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < qIndex ? 'var(--teal)' : i === qIndex ? 'var(--purple)' : 'var(--border)' }} />
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 600, lineHeight: 1.6, marginBottom: 20 }}>{q.q}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.opts.map((opt, i) => {
                const correct = answered && i === q.ans
                return (
                  <button key={i} onClick={() => answer(i)} disabled={answered}
                    style={{ background: correct ? 'var(--teal-light)' : 'var(--card)', border: `1px solid ${correct ? 'var(--teal)' : 'var(--border)'}`, borderRadius: 10, padding: '12px 16px', fontSize: 13, color: correct ? 'var(--teal)' : 'var(--text)', cursor: answered ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', transition: 'all 0.15s', fontFamily: 'var(--font-body)' }}>
                    <span style={{ width: 24, height: 24, borderRadius: 6, background: '#F4F3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{LETTERS[i]}</span>
                    {opt}
                  </button>
                )
              })}
            </div>
            {answered && (
              <button onClick={advance} style={{ marginTop: 16, background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-head)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {qIndex + 1 < questions.length ? <><i className="ti ti-arrow-right" /> Next</> : <><i className="ti ti-check" /> Finish</>}
              </button>
            )}
          </div>
        )}

        {phase === 'result' && (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 44, fontWeight: 700, color: 'var(--purple)' }}>{score}/{questions.length}</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 6 }}>
              {submitted ? 'Score submitted to leaderboard.' : submitError ? `Could not submit score: ${submitError}` : 'Submitting score...'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
              <button onClick={reset} style={{ background: '#F4F3EE', color: 'var(--text)', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-head)' }}>
                Try again
              </button>
              <button onClick={() => onNav('leaderboard')} style={{ background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-head)' }}>
                View leaderboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
