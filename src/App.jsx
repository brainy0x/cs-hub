import React, { useEffect, useState } from 'react'
import { supabase, getProfile } from './lib/supabase'
import { useLiveAnnouncements } from './lib/liveData'
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
  dashboard: Dashboard,
  courses: Courses,
  quiz: Quiz,
  leaderboard: Leaderboard,
  summaries: Summaries,
  calendar: Calendar,
  announcements: Announcements,
  admin: AdminDashboard,
}

export default function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [ready, setReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [page, setPage] = useState(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : ''
    return hash && PAGES[hash] ? hash : 'dashboard'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { announcements } = useLiveAnnouncements()

  async function loadProfile(currentUser) {
    if (!currentUser) {
      setProfile(null)
      setIsAdmin(false)
      return
    }
    const { data } = await getProfile(currentUser.id)
    setProfile(data)
    setIsAdmin(data?.role === 'admin')
  }

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      await loadProfile(currentUser)
      setReady(true)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      loadProfile(currentUser)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash && PAGES[hash]) {
        setPage(hash)
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleAuth = (currentUser) => {
    setUser(currentUser)
    loadProfile(currentUser)
  }

  const handleNavigate = (pageKey) => {
    if (!PAGES[pageKey]) return
    setPage(pageKey)
    window.location.hash = pageKey
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setIsAdmin(false)
    handleNavigate('dashboard')
  }

  if (!ready) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-head)', color: 'var(--muted)', gap: 10 }}>
      <i className="ti ti-shield-lock" style={{ fontSize: 22, color: 'var(--purple)' }} />
      Loading CS Hub...
    </div>
  )

  if (!user) return <AuthPage onAuth={handleAuth} />

  const Page = PAGES[page] || Dashboard

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }} className="app-root">
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

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
          <Sidebar
            active={page}
            onNav={(p) => {
              if (PAGES[p]) {
                setPage(p)
                window.location.hash = p
              }
              setSidebarOpen(false)
            }}
            onSignOut={handleSignOut}
            user={user}
            profile={profile}
            isAdmin={isAdmin}
            announcementCount={announcements.length}
          />
        </div>

        <main className="main-content">
          <Page onNav={handleNavigate} user={user} profile={profile} />
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
