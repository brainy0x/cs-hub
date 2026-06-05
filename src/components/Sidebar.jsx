import React from 'react'

const NAV2 = [
  { id: 'summaries', icon: 'ti-file-description', label: 'Summaries' },
  { id: 'calendar', icon: 'ti-calendar', label: 'Calendar' },
]

const TELEGRAM_URL = import.meta.env.VITE_TELEGRAM_URL
const WHATSAPP_URL = import.meta.env.VITE_WHATSAPP_URL

const s = {
  sidebar: { width: 260, background: 'var(--sidebar)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' },
  logo: { padding: '1.25rem 1rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 },
  logoIcon: { width: 32, height: 32, background: 'var(--purple)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 },
  logoText: { fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' },
  nav: { padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' },
  navLabel: { fontSize: 10, color: 'var(--hint)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 0.5rem 0.25rem' },
  item: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, fontSize: 13, color: 'var(--sidebar-text)', cursor: 'pointer', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', transition: 'all 0.2s ease', fontFamily: 'var(--font-body)' },
  bottom: { padding: '0.75rem', borderTop: '1px solid var(--border)' },
  pill: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, background: 'var(--sidebar-pill)' },
  themeButton: {
    marginTop: 10,
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--muted)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left',
  },
  av: { width: 28, height: 28, borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--purple)', flexShrink: 0 },
}

export default function Sidebar({ active, onNav, onSignOut, user, profile, isAdmin, announcementCount = 0, theme = 'light', onToggleTheme }) {
  const initials = user?.email?.slice(0, 2).toUpperCase() || 'ST'
  const name = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'

  const baseNav = [
    { id: 'dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard' },
    { id: 'courses', icon: 'ti-books', label: 'Courses' },
    { id: 'quiz', icon: 'ti-bolt', label: 'Weekly Quiz' },
    { id: 'leaderboard', icon: 'ti-trophy', label: 'Leaderboard' },
    { id: 'links', icon: 'ti-link', label: 'Links' },
    { id: 'announcements', icon: 'ti-speakerphone', label: 'Announcements', badge: announcementCount },
  ]

  const navItems = isAdmin ? [{ id: 'admin', icon: 'ti-lock', label: 'Admin' }, ...baseNav] : baseNav

  return (
    <aside style={s.sidebar}>
      <div style={s.logo}>
        <div style={s.logoIcon}><i className="ti ti-shield-lock" /></div>
        <div style={s.logoText}>CS<span style={{ color: 'var(--purple)' }}>Hub</span></div>
      </div>

      <nav style={s.nav}>
        {navItems.map(n => (
          <button key={n.id}
            className={`sidebar-item${active === n.id ? ' active' : ''}`}
            style={{ ...s.item, ...(active === n.id ? { background: 'var(--sidebar-active)', color: 'var(--purple)', fontWeight: 600 } : {}) }}
            onClick={() => onNav(n.id)}>
            <i className={`ti ${n.icon}`} style={{ fontSize: 16 }} />
            <span style={{ flex: 1 }}>{n.label}</span>
            {n.badge > 0 && (
              <span style={{ fontSize: 10, background: '#FCEBEB', color: '#A32D2D', fontWeight: 700, padding: '1px 6px', borderRadius: 999 }}>
                {n.badge}
              </span>
            )}
          </button>
        ))}

        <div style={s.navLabel}>Study</div>
        {NAV2.map(n => (
          <button key={n.id}
            className={`sidebar-item${active === n.id ? ' active' : ''}`}
            style={{ ...s.item, ...(active === n.id ? { background: 'var(--sidebar-active)', color: 'var(--purple)', fontWeight: 600 } : {}) }}
            onClick={() => onNav(n.id)}>
            <i className={`ti ${n.icon}`} style={{ fontSize: 16 }} />
            {n.label}
          </button>
        ))}

        {(TELEGRAM_URL || WHATSAPP_URL) && <div style={s.navLabel}>Community</div>}
        {TELEGRAM_URL && (
          <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" style={{ ...s.item, color: '#185FA5' }}>
            <i className="ti ti-brand-telegram" style={{ fontSize: 16 }} /> Telegram
          </a>
        )}
        {WHATSAPP_URL && (
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" style={{ ...s.item, color: 'var(--teal)' }}>
            <i className="ti ti-brand-whatsapp" style={{ fontSize: 16 }} /> WhatsApp
          </a>
        )}

        <div style={{ flex: 1 }} />

        <button className="sidebar-item" style={{ ...s.item, color: '#A32D2D' }} onClick={onSignOut}>
          <i className="ti ti-logout" style={{ fontSize: 16 }} /> Sign out
        </button>
      </nav>

      <div style={s.bottom}>
        <div style={s.pill}>
          <div style={s.av}>{initials}</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{name.split(' ')[0]}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>200L · Cyber</div>
          </div>
        </div>
        <button type="button" style={s.themeButton} onClick={onToggleTheme}>
          <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} style={{ fontSize: 14 }} />
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </aside>
  )
}
