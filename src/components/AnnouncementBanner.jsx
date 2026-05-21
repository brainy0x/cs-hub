import React, { useState } from 'react'

// ─── ANNOUNCEMENT DATA ────────────────────────────────────────────────────────
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
    link: 'https://sis.miva.university',
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
  const all = [...items, ...items]
  return (
    <div className="marquee-container-inner">
      <div className="marquee-fade-left" />
      <div className="marquee-fade-right" />
      <div className="marquee-track">
        {all.map((item, idx) => {
          const cfg = TYPE_CONFIG[item.type]
          return (
            <span key={`${item.id}-${idx}`} className="marquee-item">
              <span className="marquee-badge" style={{ background: cfg.bg, color: cfg.color }}>
                {cfg.label}
              </span>
              <span className="marquee-text">{item.text}</span>
              {item.link && (
                <a href={item.link} target="_blank" rel="noreferrer" className="marquee-link"
                  style={{ color: cfg.color, background: cfg.bg }}>
                  {item.linkLabel} →
                </a>
              )}
              <span className="marquee-divider">◆</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

// ─── EXPANDED PANEL ───────────────────────────────────────────────────────────
function ExpandedPanel({ items, onClose }) {
  return (
    <div className="expanded-panel">
      {items.map(item => {
        const cfg = TYPE_CONFIG[item.type]
        return (
          <div key={item.id} className="expanded-item">
            <div className="expanded-icon" style={{ background: cfg.bg }}>
              <i className={`ti ${cfg.icon}`} style={{ color: cfg.color }} />
            </div>
            
            <div className="expanded-content">
              <div className="expanded-meta">
                <span className="expanded-badge" style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.label}
                </span>
                {item.urgent && <span className="urgent-text">● URGENT</span>}
              </div>
              <div className="expanded-text">{item.text}</div>
            </div>

            {item.link && (
              <a href={item.link} target="_blank" rel="noreferrer" className="expanded-action"
                style={{ color: cfg.color, background: cfg.bg }}>
                {item.linkLabel} →
              </a>
            )}
          </div>
        )
      })}
      <button onClick={onClose} className="collapse-btn">
        Collapse ↑
      </button>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AnnouncementBanner({ items = ANNOUNCEMENTS }) {
  const [expanded, setExpanded] = useState(false)
  const urgentCount = items.filter(i => i.urgent).length

  return (
    <div className="announcement-banner">
      {/* Top bar */}
      <div className="banner-top">
        {/* Label pill */}
        <div className="label-pill">
          <div className="pulsing-dot" />
          <span className="label-text">ANNOUNCEMENTS</span>
          {urgentCount > 0 && (
            <span className="urgent-badge">
              {urgentCount} urgent
            </span>
          )}
        </div>

        {/* Marquee */}
        <div className="marquee-wrapper">
          <MarqueeStrip items={items} />
        </div>

        {/* Expand toggle */}
        <button className="expand-toggle" onClick={() => setExpanded(e => !e)}>
          <i className={`ti ${expanded ? 'ti-chevron-up' : 'ti-chevron-down'}`} />
        </button>
      </div>

      {/* Expanded list */}
      {expanded && <ExpandedPanel items={items} onClose={() => setExpanded(false)} />}

      <style>{`
        /* --- ANIMATIONS --- */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* --- BASE LAYOUT --- */
        .announcement-banner {
          background: #1a1a18;
          border: 1px solid #2a2a28;
          border-radius: 10px;
          margin-bottom: 16px;
          overflow: hidden;
          width: 100%;
        }

        .banner-top {
          display: flex;
          align-items: stretch;
          min-height: 44px; /* Better touch target height */
        }

        .label-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px;
          border-right: 1px solid #2a2a28;
          flex-shrink: 0;
        }

        .pulsing-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #A32D2D;
          box-shadow: 0 0 6px #A32D2D;
          animation: pulse 2s infinite;
          flex-shrink: 0;
        }

        .label-text {
          font-size: 11px;
          font-weight: 700;
          color: #e8e6df;
          letter-spacing: 0.08em;
          font-family: var(--font-head, sans-serif);
        }

        .urgent-badge {
          font-size: 10px;
          background: #A32D2D;
          color: #fff;
          padding: 2px 6px;
          border-radius: 999px;
          font-weight: 700;
          white-space: nowrap;
        }

        /* --- MARQUEE --- */
        .marquee-wrapper {
          flex: 1;
          min-width: 0; /* CRITICAL: Prevents flex children from stretching parent on mobile */
          display: flex;
          align-items: center;
        }

        .marquee-container-inner {
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        .marquee-fade-left {
          position: absolute; left: 0; top: 0; bottom: 0; width: 40px;
          background: linear-gradient(to right, #1a1a18, transparent);
          z-index: 2; pointer-events: none;
        }

        .marquee-fade-right {
          position: absolute; right: 0; top: 0; bottom: 0; width: 40px;
          background: linear-gradient(to left, #1a1a18, transparent);
          z-index: 2; pointer-events: none;
        }

        .marquee-track {
          display: flex;
          gap: 0;
          animation: marquee 25s linear infinite;
          white-space: nowrap;
          width: max-content;
        }

        .marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 2rem;
        }

        .marquee-badge {
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 999px;
          font-weight: 700;
          letter-spacing: 0.06em;
        }

        .marquee-text {
          font-size: 12px;
          color: #e8e6df;
        }

        .marquee-link {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 999px;
          text-decoration: none;
        }

        .marquee-divider {
          color: #444;
          margin-left: 8px;
        }

        /* --- CONTROLS --- */
        .expand-toggle {
          padding: 10px 14px;
          background: transparent;
          border: none;
          border-left: 1px solid #2a2a28;
          color: #6b6a65;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 14px;
        }

        .expand-toggle:hover {
          background: #242422;
          color: #e8e6df;
        }

        /* --- EXPANDED PANEL --- */
        .expanded-panel {
          padding: 0.75rem 1rem;
          border-top: 1px solid #2a2a28;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .expanded-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 8px;
          background: #242422;
        }

        .expanded-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 14px;
        }

        .expanded-content {
          flex: 1;
          min-width: 0;
        }

        .expanded-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }

        .expanded-badge {
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 999px;
          font-weight: 700;
        }

        .urgent-text {
          font-size: 10px;
          color: #A32D2D;
          font-weight: 600;
        }

        .expanded-text {
          font-size: 12px;
          color: #c8c6c0;
          line-height: 1.4;
        }

        .expanded-action {
          font-size: 11px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 7px;
          text-decoration: none;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .collapse-btn {
          align-self: flex-end;
          font-size: 11px;
          color: #6b6a65;
          background: transparent;
          border: none;
          cursor: pointer;
          margin-top: 4px;
          padding: 4px 8px;
        }

        /* --- MOBILE OVERRIDES --- */
        @media (max-width: 640px) {
          .label-text {
            display: none; /* Hide 'ANNOUNCEMENTS' text to give marquee space */
          }
          
          .label-pill {
            padding: 8px 10px;
          }

          .marquee-item {
            padding: 0 1.25rem;
          }

          /* Allow the action button to wrap below the text on very narrow screens */
          .expanded-item {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .expanded-content {
            flex: 1 1 calc(100% - 40px); /* 100% width minus icon width and gap */
          }

          .expanded-action {
            margin-left: 38px; /* Indent to match the text alignment */
            margin-top: 4px;
          }
        }
      `}</style>
    </div>
  )
}
