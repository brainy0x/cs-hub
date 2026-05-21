import React, { useState } from 'react'
import { useLiveAnnouncements } from '../lib/liveData'

const TYPE_CONFIG = {
  lesson: { icon: 'ti-video',        color: '#0F6E56', bg: '#E1F5EE', label: 'LIVE'    },
  ticket: { icon: 'ti-alert-circle', color: '#A32D2D', bg: '#FCEBEB', label: 'ACTION'  },
  result: { icon: 'ti-report',       color: '#185FA5', bg: '#E6F1FB', label: 'RESULT'  },
  task:   { icon: 'ti-checkbox',     color: '#BA7517', bg: '#FAEEDA', label: 'TASK'    },
  info:   { icon: 'ti-info-circle',  color: '#534AB7', bg: '#EEEDFE', label: 'INFO'    },
}

const FILTERS = ['all', 'lesson', 'task', 'ticket', 'result', 'info']

export default function Announcements() {
  const [filter, setFilter] = useState('all')
  const [dismissed, setDismissed] = useState([])
  const { announcements } = useLiveAnnouncements()

  const visible = announcements.filter(a =>
    !dismissed.includes(a.id) && (filter === 'all' || a.type === filter)
  )

  const urgentCount = announcements.filter(a => a.urgent && !dismissed.includes(a.id)).length

  return (
    <div className="fade-up">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="page-title">Announcements</div>
          {urgentCount > 0 && (
            <span style={{ fontSize: 11, background: '#FCEBEB', color: '#A32D2D', padding: '3px 10px', borderRadius: 999, fontWeight: 700 }}>
              {urgentCount} urgent
            </span>
          )}
        </div>
        <div className="page-sub">Weekly info, tasks, live lessons and action items</div>
      </div>

      {/* Filter tabs */}
      <div className="filter-row" style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500,
            border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-body)',
            background: filter === f ? 'var(--purple)' : 'var(--card)',
            color: filter === f ? '#fff' : 'var(--muted)',
            textTransform: 'capitalize',
          }}>
            {f === 'all' ? 'All' : TYPE_CONFIG[f]?.label}
          </button>
        ))}
      </div>

      {/* Urgent section */}
      {filter === 'all' && visible.some(a => a.urgent) && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#A32D2D', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#A32D2D', animation: 'pulse 2s infinite' }} />
            Needs your attention
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visible.filter(a => a.urgent).map(a => (
              <AnnouncementCard key={a.id} item={a} onDismiss={() => setDismissed(d => [...d, a.id])} />
            ))}
          </div>
        </div>
      )}

      {/* All / filtered */}
      <div>
        {filter === 'all' && visible.some(a => !a.urgent) && (
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            General
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visible.filter(a => filter !== 'all' || !a.urgent).map(a => (
            <AnnouncementCard key={a.id} item={a} onDismiss={() => setDismissed(d => [...d, a.id])} />
          ))}
        </div>
      </div>

      {visible.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--hint)' }}>
          <i className="ti ti-checks" style={{ fontSize: 36, display: 'block', marginBottom: 10 }} />
          <div style={{ fontSize: 14, fontWeight: 500 }}>All clear!</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>No announcements here.</div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}

function AnnouncementCard({ item, onDismiss }) {
  const cfg = TYPE_CONFIG[item.type]
  return (
    <div style={{
      background: 'var(--card)', border: `1px solid ${item.urgent ? '#F5C2C2' : 'var(--border)'}`,
      borderLeft: `3px solid ${cfg.color}`, borderRadius: 10,
      padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 14,
      boxShadow: item.urgent ? '0 1px 8px rgba(163,45,45,0.07)' : 'var(--shadow)',
    }}>
      {/* Icon */}
      <div style={{ width: 36, height: 36, borderRadius: 9, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <i className={`ti ${cfg.icon}`} style={{ fontSize: 18, color: cfg.color }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: cfg.bg, color: cfg.color, fontWeight: 700, letterSpacing: '0.06em' }}>
            {cfg.label}
          </span>
          {item.urgent && (
            <span style={{ fontSize: 10, color: '#A32D2D', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#A32D2D' }} /> URGENT
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{item.text}</div>
        {item.link && (
          <a href={item.link} target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10,
            fontSize: 12, fontWeight: 600, color: cfg.color, background: cfg.bg,
            padding: '5px 12px', borderRadius: 7, textDecoration: 'none',
          }}>
            {item.link_label || item.linkLabel || 'Open'} <i className="ti ti-arrow-up-right" style={{ fontSize: 12 }} />
          </a>
        )}
      </div>

      {/* Dismiss */}
      <button onClick={onDismiss} title="Dismiss" style={{
        background: 'transparent', border: 'none', color: 'var(--hint)',
        cursor: 'pointer', fontSize: 16, padding: 4, flexShrink: 0,
      }}>
        <i className="ti ti-x" />
      </button>
    </div>
  )
}
