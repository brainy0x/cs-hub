import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({ fullName: '', email: '', password: '', matric: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validateMiva = (email) => email.trim().toLowerCase().endsWith('@miva.edu.ng')

  async function handleSubmit() {
    setError('')
    setSuccess('')

    if (!validateMiva(form.email)) {
      setError('Only @miva.edu.ng email addresses are allowed.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (mode === 'signup' && !form.fullName.trim()) {
      setError('Please enter your full name.')
      return
    }

    setLoading(true)

    if (mode === 'login') {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      })
      if (err) { setError(err.message); setLoading(false); return }
      onAuth(data.user)
    } else {
      const { data, error: err } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: { full_name: form.fullName.trim(), matric_no: form.matric.trim() }
        }
      })
      if (err) { setError(err.message); setLoading(false); return }
      setSuccess('Account created! Check your Miva email to confirm your account.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)', padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, background: 'var(--purple)', borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <i className="ti ti-shield-lock" style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>
            CS<span style={{ color: 'var(--purple)' }}>Hub</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Miva Open University · Cybersecurity</div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {/* Tab toggle */}
          <div style={{ display: 'flex', background: '#F4F3EE', borderRadius: 9, padding: 3, marginBottom: 24 }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{
                flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 600,
                background: mode === m ? 'var(--card)' : 'transparent',
                color: mode === m ? 'var(--text)' : 'var(--muted)',
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}>
                {m === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'signup' && (
              <Field label="Full name" icon="ti-user" type="text" placeholder="Oluwapekarere Adeyinka"
                value={form.fullName} onChange={v => update('fullName', v)} />
            )}
            <Field label="Miva email" icon="ti-mail" type="email" placeholder="you@miva.edu.ng"
              value={form.email} onChange={v => update('email', v)} />
              
            <Field label="Password" icon="ti-lock" type="password" placeholder="Min. 6 characters"
              value={form.password} onChange={v => update('password', v)}
              onEnter={handleSubmit} />
          </div>

          {/* Error / success */}
          {error && (
            <div style={{ marginTop: 14, padding: '10px 12px', background: '#FCEBEB', border: '1px solid #F5C2C2', borderRadius: 8, fontSize: 12, color: '#A32D2D', display: 'flex', gap: 8, alignItems: 'center' }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 15, flexShrink: 0 }} /> {error}
            </div>
          )}
          {success && (
            <div style={{ marginTop: 14, padding: '10px 12px', background: '#E1F5EE', border: '1px solid #B4E4D5', borderRadius: 8, fontSize: 12, color: '#0F6E56', display: 'flex', gap: 8, alignItems: 'center' }}>
              <i className="ti ti-circle-check" style={{ fontSize: 15, flexShrink: 0 }} /> {success}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', marginTop: 20, padding: '12px', borderRadius: 10, border: 'none',
            background: 'var(--purple)', color: '#fff', fontFamily: 'var(--font-head)',
            fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {loading
              ? <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> {mode === 'login' ? 'Logging in...' : 'Creating account...'}</>
              : mode === 'login' ? 'Log in to CS Hub' : 'Create account'
            }
          </button>

          {/* Note */}
          <div style={{ marginTop: 14, fontSize: 11, color: 'var(--hint)', textAlign: 'center', lineHeight: 1.6 }}>
            {mode === 'login'
              ? 'Only @miva.edu.ng emails are accepted.'
              : 'Your account will be verified via your Miva email.'
            }
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function Field({ label, icon, type, placeholder, value, onChange, onEnter }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', marginBottom: 5 }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <i className={`ti ${icon}`} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: 'var(--hint)', pointerEvents: 'none' }} />
        <input type={type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onEnter?.()}
          style={{
            width: '100%', padding: '10px 12px 10px 34px',
            border: '1px solid var(--border)', borderRadius: 9,
            fontSize: 13, fontFamily: 'var(--font-body)',
            background: 'var(--bg)', color: 'var(--text)', outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--purple)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>
    </div>
  )
}
