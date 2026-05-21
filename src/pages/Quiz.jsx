import React, { useState, useEffect, useRef } from 'react'
import { QUIZ_DATA, COURSES } from '../lib/data'

const LETTERS = ['A', 'B', 'C', 'D']

export default function Quiz({ onNav }) {
  const [selected, setSelected] = useState(null)
  const [phase, setPhase] = useState('select') // select | active | result
  const [qIndex, setQIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const timerRef = useRef(null)

  const questions = selected ? QUIZ_DATA[selected] : []

  useEffect(() => {
    if (phase !== 'active') return
    setTimeLeft(60)
    setAnswered(false)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); autoNext(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, qIndex])

  function autoNext() {
    setAnswered(true)
    setTimeout(() => advance(), 1500)
  }

  function answer(i) {
    if (answered) return
    clearInterval(timerRef.current)
    setAnswered(true)
    if (i === questions[qIndex].ans) setScore(s => s + 1)
  }

  function advance() {
    if (qIndex + 1 < questions.length) {
      setQIndex(q => q + 1)
    } else {
      setPhase('result')
    }
  }

  function reset() {
    setSelected(null); setPhase('select'); setQIndex(0)
    setScore(0); setAnswered(false); setTimeLeft(60)
    clearInterval(timerRef.current)
  }

  const pct = Math.round((score / (questions.length || 1)) * 100)
  const q = questions[qIndex]

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-title">Weekly Quiz</div>
        <div className="page-sub">Week 9 · Pick a course and test yourself</div>
      </div>

      <div style={{ maxWidth: 620 }}>
        {/* Course selection */}
        {phase === 'select' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
              {COURSES.filter(c => QUIZ_DATA[c.code]).map(c => (
                <button key={c.code} onClick={() => setSelected(c.code)}
                  style={{ background: selected === c.code ? c.light : 'var(--card)', border: `1px solid ${selected === c.code ? c.color : 'var(--border)'}`, borderRadius: 10, padding: '1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-head)', color: c.color }}>{c.code}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{c.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--hint)', marginTop: 6 }}>5 questions · 60s each</div>
                </button>
              ))}
            </div>
            <button disabled={!selected} onClick={() => setPhase('active')}
              style={{ background: selected ? 'var(--purple)' : '#E8E6DF', color: selected ? '#fff' : 'var(--hint)', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-head)', cursor: selected ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-bolt" /> Start Quiz
            </button>
          </>
        )}

        {/* Active quiz */}
        {phase === 'active' && q && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Question {qIndex + 1} of {questions.length}</div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: timeLeft <= 10 ? 'var(--red)' : 'var(--amber)' }}>
                0:{String(timeLeft).padStart(2, '0')}
              </div>
            </div>
            {/* Progress dots */}
            <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
              {questions.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < qIndex ? 'var(--teal)' : i === qIndex ? 'var(--purple)' : 'var(--border)' }} />
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 600, lineHeight: 1.6, marginBottom: 20 }}>{q.q}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.opts.map((opt, i) => {
                let bg = 'var(--card)', border = 'var(--border)', color = 'var(--text)'
                if (answered) {
                  if (i === q.ans) { bg = 'var(--teal-light)'; border = 'var(--teal)'; color = 'var(--teal)' }
                }
                return (
                  <button key={i} onClick={() => answer(i)} disabled={answered}
                    style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 16px', fontSize: 13, color, cursor: answered ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', transition: 'all 0.15s', fontFamily: 'var(--font-body)' }}
                    onMouseEnter={e => { if (!answered) { e.currentTarget.style.background = 'var(--purple-light)'; e.currentTarget.style.borderColor = 'var(--purple-mid)' } }}
                    onMouseLeave={e => { if (!answered) { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.borderColor = 'var(--border)' } }}>
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

        {/* Result */}
        {phase === 'result' && (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>{pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪'}</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 44, fontWeight: 700, color: 'var(--purple)' }}>{score}/{questions.length}</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 6 }}>
              {pct >= 80 ? 'Excellent! Score submitted to leaderboard.' : pct >= 60 ? 'Good effort! Keep practising.' : 'Keep going — review the summary and retry!'}
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
