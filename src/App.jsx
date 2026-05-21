import React, { useState, useEffect } from 'react'
import { supabase, getProfile } from './lib/supabase'
import Sidebar from './components/Sidebar'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import Quiz from './pages/Quiz'
import Leaderboard from './pages/Leaderboard'
import Summaries from './pages/Summaries'
import Calendar from './pages/Calendar'
import Announcements from './pages/Announcements'
import AdminDashboard from './pages/admin/AdminDashboard'

const PAGES = {
  dashboard:     Dashboard,
  courses:       Courses,
  quiz:          Quiz,
  leaderboard:   Leaderboard,
  summaries:     Summaries,
  calendar:      Calendar,
  announcements: Announcements,
  admin:         AdminDashboard,
}

export default function App() {
  const [user, setUser]   = useState(null)
  const [ready, setReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [page, setPage]   = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Check existing session on mount and load profile admin flag
  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const { data: profile } = await getProfile(currentUser.id)
        setIsAdmin(profile?.role === 'admin')
      } else {
        setIsAdmin(false)
      }
      setReady(true)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (!u) {
        setIsAdmin(false)
      } else {
        getProfile(u.id)
          .then(({ data }) => setIsAdmin(data?.role === 'admin'))
          .catch(() => setIsAdmin(false))
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Called by AuthPage when user signs in/up
  const handleAuth = (u) => {
    setUser(u)
    if (!u) { setIsAdmin(false); return }
    getProfile(u.id)
      .then(({ data }) => setIsAdmin(data?.role === 'admin'))
      .catch(() => setIsAdmin(false))
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    setPage('dashboard')
  }

  // Loading splash
  if (!ready) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-head)', color: 'var(--muted)', gap: 10 }}>
      <i className="ti ti-shield-lock" style={{ fontSize: 22, color: 'var(--purple)' }} />
      Loading CS Hub...
    </div>
  )

  // Not logged in → show auth
  if (!user) return <AuthPage onAuth={handleAuth} />

  const Page = PAGES[page] || Dashboard

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }} className="app-root">
      {/* Mobile header */}
      <div className="mobile-header">
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700 }}>
          CS<span style={{ color: 'var(--purple)' }}>Hub</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="menu-toggle" style={{
          background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text)',
        }}>
          <i className={`ti ${sidebarOpen ? 'ti-x' : 'ti-menu-2'}`} />
        </button>
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Mobile overlay */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
          <Sidebar active={page} onNav={(p) => { setPage(p); setSidebarOpen(false); }} onSignOut={handleSignOut} user={user} isAdmin={isAdmin} />
        </div>

        {/* Main content */}
        <main className="main-content">
          <Page onNav={setPage} user={user} />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: var(--card);
            border-bottom: 1px solid var(--border);
          }
          
          .menu-toggle { display: block !important; }
          
          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.3);
            z-index: 999;
          }
          
          .sidebar-wrapper {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            width: 220px;
          }
          
          .sidebar-wrapper.open {
            transform: translateX(0);
          }
          
          .main-content {
            padding: 1rem !important;
            max-width: 100vw !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-header { display: none; }
          .sidebar-overlay { display: none; }
          .sidebar-wrapper {
            position: relative !important;
            transform: none !important;
            width: auto !important;
          }
          .main-content {
            max-width: calc(100vw - 220px);
          }
        }
      `}</style>
    </div>
  )
}
