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
    <div className="auth-container">
      <div className="auth-wrapper">

        {/* Logo */}
        <div className="auth-header">
          <div className="auth-logo-icon">
            <i className="ti ti-shield-lock" />
          </div>
          <div className="auth-title">
            CS<span>Hub</span>
          </div>
          <div className="auth-subtitle">Miva Open University · Cybersecurity</div>
        </div>

        {/* Card */}
        <div className="card auth-card">
          
          {/* Tab toggle */}
          <div className="auth-tabs">
            {['login', 'signup'].map(m => (
              <button 
                key={m} 
                onClick={() => { setMode(m); setError(''); setSuccess('') }} 
                className={`auth-tab-btn ${mode === m ? 'active' : ''}`}
              >
                {m === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="auth-fields">
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
            <div className="auth-alert error">
              <i className="ti ti-alert-circle" /> {error}
            </div>
          )}
          {success && (
            <div className="auth-alert success">
              <i className="ti ti-circle-check" /> {success}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} className="auth-submit-btn">
            {loading
              ? <><i className="ti ti-loader-2 loading-spinner" /> {mode === 'login' ? 'Logging in...' : 'Creating account...'}</>
              : mode === 'login' ? 'Log in to CS Hub' : 'Create account'
            }
          </button>

          {/* Note */}
          <div className="auth-footer-note">
            {mode === 'login'
              ? 'Only @miva.edu.ng emails are accepted.'
              : 'Your account will be verified via your Miva email.'
            }
          </div>
        </div>
      </div>

      <style>{`
        /* --- ANIMATIONS --- */
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }

        /* --- BASE LAYOUT --- */
        .auth-container {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-body);
          padding: 1rem;
        }

        .auth-wrapper {
          width: 100%;
          max-width: 420px;
        }

        /* --- HEADER --- */
        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-logo-icon {
          width: 48px;
          height: 48px;
          background: var(--purple);
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .auth-logo-icon i {
          font-size: 24px;
          color: #fff;
        }

        .auth-title {
          font-family: var(--font-head);
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        
        .auth-title span {
          color: var(--purple);
        }

        .auth-subtitle {
          font-size: 12px;
          color: var(--muted);
          margin-top: 4px;
        }

        /* --- CARD & TABS --- */
        .auth-card {
          padding: 2rem;
          background: var(--card-bg, #fff); /* Fallback if var(--card-bg) isn't set globally */
          border-radius: 12px;
        }

        .auth-tabs {
          display: flex;
          background: #F4F3EE;
          border-radius: 9px;
          padding: 3px;
          margin-bottom: 24px;
        }

        .auth-tab-btn {
          flex: 1;
          padding: 10px 0; /* Slightly larger touch target */
          border-radius: 7px;
          border: none;
          cursor: pointer;
          font-family: var(--font-head);
          font-size: 13px;
          font-weight: 600;
          background: transparent;
          color: var(--muted);
          transition: all 0.15s;
        }

        .auth-tab-btn.active {
          background: var(--card);
          color: var(--text);
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        /* --- FORM FIELDS --- */
        .auth-fields {
          display: flex;
          flex-direction: column;
          gap: 16px; /* Increased gap slightly for touch screens */
        }

        /* --- ALERTS --- */
        .auth-alert {
          margin-top: 16px;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 12px;
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .auth-alert i {
          font-size: 15px;
          flex-shrink: 0;
        }

        .auth-alert.error {
          background: #FCEBEB;
          border: 1px solid #F5C2C2;
          color: #A32D2D;
        }

        .auth-alert.success {
          background: #E1F5EE;
          border: 1px solid #B4E4D5;
          color: #0F6E56;
        }

        /* --- BUTTON --- */
        .auth-submit-btn {
          width: 100%;
          margin-top: 24px;
          padding: 14px; /* Increased padding for better thumb tapping */
          border-radius: 10px;
          border: none;
          background: var(--purple);
          color: #fff;
          font-family: var(--font-head);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .auth-submit-btn:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        .auth-footer-note {
          margin-top: 16px;
          font-size: 11px;
          color: var(--hint);
          text-align: center;
          line-height: 1.6;
        }

        /* --- MOBILE OVERRIDES --- */
        @media (max-width: 480px) {
          .auth-card {
            padding: 1.5rem; /* Reduce padding on small screens to save space */
          }
          
          .auth-header {
            margin-bottom: 24px;
          }
        }
      `}</style>
    </div>
  )
}

function Field({ label, icon, type, placeholder, value, onChange, onEnter }) {
  return (
    <div className="field-container">
      <div className="field-label">{label}</div>
      <div className="field-input-wrapper">
        <i className={`ti ${icon} field-icon`} />
        <input 
          type={type} 
          placeholder={placeholder} 
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onEnter?.()}
          className="field-input"
        />
      </div>

      <style>{`
        .field-container {
          width: 100%;
        }

        .field-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--muted);
          margin-bottom: 6px;
        }

        .field-input-wrapper {
          position: relative;
        }

        .field-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          color: var(--hint);
          pointer-events: none;
        }

        .field-input {
          width: 100%;
          padding: 12px 12px 12px 36px; /* 12px vertical padding gives ~44px height */
          border: 1px solid var(--border);
          border-radius: 9px;
          font-size: 13px;
          font-family: var(--font-body);
          background: var(--bg);
          color: var(--text);
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box; /* Ensure padding doesn't break width */
        }

        .field-input:focus {
          border-color: var(--purple);
        }

        /* Prevent auto-zoom on iOS Safari when tapping inputs */
        @media (max-width: 480px) {
          .field-input {
            font-size: 16px; 
          }
        }
      `}</style>
    </div>
  )
}