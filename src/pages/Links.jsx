import React from 'react'
import { useLiveLinks } from '../lib/liveData'

const CATEGORY_META = {
  website: { label: 'School Website', icon: 'ti-world', accent: 'var(--purple)' },
  portal: { label: 'Student Portal', icon: 'ti-lock-open', accent: 'var(--teal)' },
  support: { label: 'Support', icon: 'ti-headphones', accent: 'var(--amber)' },
  community: { label: 'Community', icon: 'ti-users', accent: 'var(--blue)' },
}

export default function Links() {
  const { links, loading } = useLiveLinks()
  const activeLinks = links.filter((link) => link.active)
  const grouped = activeLinks.reduce((acc, link) => {
    const category = link.category || 'support'
    acc[category] = acc[category] || []
    acc[category].push(link)
    return acc
  }, {})

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-title">School links</div>
        <div className="page-sub">Quick access to the website, portal, support, and community resources.</div>
      </div>

      {loading && <div style={{ color: 'var(--muted)' }}>Loading links...</div>}

      {!loading && activeLinks.length === 0 && (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
          No links are available yet. Add your resources from the admin panel.
        </div>
      )}

      <div style={{ display: 'grid', gap: 18 }}>
        {Object.keys(CATEGORY_META).map((category) => {
          const items = grouped[category] || []
          if (!items.length) return null
          const meta = CATEGORY_META[category]
          return (
            <section key={category} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: meta.accent, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 18 }}>
                  <i className={`ti ${meta.icon}`} />
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{meta.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Tap a card to open the resource in a new tab.</div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                {items.map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="link-card" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    padding: '18px 20px', borderRadius: 16, background: 'var(--card)', border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text)', transition: 'transform 0.2s ease, border-color 0.2s ease',
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{link.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{link.description || link.url}</div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: meta.accent, fontSize: 12, fontWeight: 700 }}>
                      Open
                      <i className="ti ti-arrow-right" />
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
