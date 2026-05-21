import React, { useState } from 'react'

// ─── ANNOUNCEMENT DATA ────────────────────────────────────────────────────────
// TODO: Replace this with a Supabase fetch from the `announcements` table
// Each item: { id, type, text, link, linkLabel, urgent }
// type: 'lesson' | 'ticket' | 'result' | 'task' | 'info'
export const ANNOUNCEMENTS = [
  {
    id: 1,
    type: 'lesson',
    text: 'LIVE: MTH 102 — Differential Equations with Dr. Adeyemi',
    link: 'https://meet.google.com/placeholder',
    linkLabel: 'Join now',
    urgent: true,
  },
  {
    id: 2,
    type: 'ticket',
    text: 'COS 102 results not showing for some students — raise a ticket on the portal',
    link: 'https://portal.miva.university',
    linkLabel: 'Raise ticket',
    urgent: true,
  },
  {
    id: 3,
    type: 'task',
    text: 'Submit PHY 108 lab report by Friday 11:59 PM',
    link: null,
    linkLabel: null,
    urgent: false,
  },
  {
    id: 4,
    type: 'result',
    text: 'GST 112 CA scores now available — check your student portal',
    link: 'https://portal.miva.university',
    linkLabel: 'Check portal',
    urgent: false,
  },
  {
    id: 5,
    type: 'info',
    text: 'Week 10 live lessons timetable has been updated — check the calendar',
    link: null,
    linkLabel: null,
    urgent: false,
  },
]

// ─── TYPE CONFIG ──────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  lesson: { icon: 'ti-video',        color: '#0F6E56', bg: '#E1F5EE', label: 'LIVE'    },
  ticket: { icon: 'ti-alert-circle', color: '#A32D2D', bg: '#FCEBEB', label: 'ACTION'  },
  result: { icon: 'ti-report',       color: '#185FA5', bg: '#E6F1FB', label: 'RESULT'  },
  task:   { icon: 'ti-checkbox',     color: '#BA7517', bg: '#FAEEDA', label: 'TASK'    },
  info:   { icon: 'ti-info-circle',  color: '#534AB7', bg: '#EEEDFE', label: 'INFO'    },
}

// ─── MARQUEE STRIP ────────────────────────────────────────────────────────────
function MarqueeStrip({ items }) {
  // Duplicate items so the loop feels seamless
  const all = [...items, ...items]
  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      {/* Fade edges */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 40, background: 'linear-gradient(to right, #1a1a18, transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 40, background: 'linear-gradient(to left, #1a1a18, transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', gap: 0, animation: 'marquee 35s linear infinite', whiteSpace: 'nowrap' }}>
        {all.map((item, idx) => {
          const cfg = TYPE_CONFIG[item.type]
          return (
            <span key={`${item.id}-${idx}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 2rem' }}>
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: cfg.bg, color: cfg.color, fontWeight: 700, letterSpacing: '0.06em' }}>
                {cfg.label}
              </span>
              <span style={{ fontSize: 12, color: '#e8e6df' }}>{item.text}</span>
              {item.link && (
                <a href={item.link} target="_blank" rel="noreferrer"
                  style={{ fontSize: 11, color: cfg.color, fontWeight: 600, background: cfg.bg, padding: '2px 8px', borderRadius: 999, textDecoration: 'none' }}>
                  {item.link_label || item.linkLabel || 'Open'} →
                </a>
              )}
              <span style={{ color: '#444', marginLeft: 8 }}>◆</span>
            </span>
          )
        })}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

// ─── EXPANDED PANEL ───────────────────────────────────────────────────────────
function ExpandedPanel({ items, onClose }) {
  return (
    <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #2a2a28', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map(item => {
        const cfg = TYPE_CONFIG[item.type]
        return (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: '#242422' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`ti ${cfg.icon}`} style={{ fontSize: 14, color: cfg.color }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 999, background: cfg.bg, color: cfg.color, fontWeight: 700 }}>{cfg.label}</span>
                {item.urgent && <span style={{ fontSize: 10, color: '#A32D2D', fontWeight: 600 }}>● URGENT</span>}
              </div>
              <div style={{ fontSize: 12, color: '#c8c6c0' }}>{item.text}</div>
            </div>
            {item.link && (
              <a href={item.link} target="_blank" rel="noreferrer"
                style={{ fontSize: 11, color: cfg.color, fontWeight: 600, background: cfg.bg, padding: '4px 10px', borderRadius: 7, textDecoration: 'none', flexShrink: 0 }}>
                {item.link_label || item.linkLabel || 'Open'} →
              </a>
            )}
          </div>
        )
      })}
      <button onClick={onClose} style={{ alignSelf: 'flex-end', fontSize: 11, color: '#6b6a65', background: 'transparent', border: 'none', cursor: 'pointer', marginTop: 2 }}>
        Collapse ↑
      </button>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AnnouncementBanner({ items = ANNOUNCEMENTS }) {
  const [expanded, setExpanded] = useState(false)
  const urgentCount = items.filter(i => i.urgent).length

  if (!items.length) return null

  return (
    <div className="announcement-banner" style={{
      background: '#1a1a18',
      border: '1px solid #2a2a28',
      borderRadius: 10,
      marginBottom: 16,
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div className="announcement-banner__bar" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {/* Label pill */}
        <div className="announcement-banner__label" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', borderRight: '1px solid #2a2a28', flexShrink: 0 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#A32D2D', boxShadow: '0 0 6px #A32D2D', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#e8e6df', letterSpacing: '0.08em', fontFamily: 'var(--font-head)' }}>ANNOUNCEMENTS</span>
          {urgentCount > 0 && (
            <span style={{ fontSize: 10, background: '#A32D2D', color: '#fff', padding: '1px 6px', borderRadius: 999, fontWeight: 700 }}>
              {urgentCount} urgent
            </span>
          )}
        </div>

        {/* Marquee */}
        <div className="announcement-banner__marquee" style={{ flex: 1, padding: '8px 0', minWidth: 0 }}>
          <MarqueeStrip items={items} />
        </div>

        {/* Expand toggle */}
        <button onClick={() => setExpanded(e => !e)} style={{
          padding: '8px 12px', background: 'transparent',
          border: 'none', borderLeft: '1px solid #2a2a28', color: '#6b6a65', cursor: 'pointer',
          fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
        }}>
          <i className={`ti ${expanded ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: 14 }} />
        </button>
      </div>

      {/* Expanded list */}
      {expanded && <ExpandedPanel items={items} onClose={() => setExpanded(false)} />}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
