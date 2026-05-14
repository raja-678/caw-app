import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Map, BarChart2, FileText, TrendingUp, Sliders, Menu, X, Moon, Sun, Shield } from 'lucide-react'
import '../styles/layout.css'

const nav = [
  { to: '/', icon: Map, label: 'Overview' },
  { to: '/state', icon: BarChart2, label: 'State Deep Dive' },
  { to: '/policies', icon: FileText, label: 'Policy Explorer' },
  { to: '/findings', icon: TrendingUp, label: 'Findings' },
  { to: '/simulator', icon: Sliders, label: 'Simulator' },
  { to: '/safety', icon: Shield, label: 'Safety Navigator' },
]

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div
        className={'mobile-overlay' + (open ? ' open' : '')}
        onClick={() => setOpen(false)}
      />

      <aside
        className={'sidebar' + (open ? ' open' : '')}
        style={{
          width: 232, background: 'var(--bg)',
          borderRight: '0.5px solid var(--border)',
          padding: '24px 12px', display: 'flex',
          flexDirection: 'column', gap: 4,
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ height: 3, background: 'linear-gradient(90deg, var(--purple-600), var(--red-600))' }} />

        <div style={{ padding: '14px 12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--purple-600)', boxShadow: 'var(--shadow-sm)' }} />
              <div style={{ fontSize: 15, fontWeight: 600 }}>CAW India</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Policy & Crime Research</div>
          </div>
          <button className="close-btn" onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: 4, cursor: 'pointer', transition: 'var(--transition)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '0 12px 6px', fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Sections
        </div>

        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}
            onMouseEnter={() => setHovered(to)}
            onMouseLeave={() => setHovered(null)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500,
              color: isActive ? 'var(--purple-600)' : 'var(--text-secondary)',
              background: isActive
                ? 'var(--purple-50)'
                : (hovered === to ? (dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)') : 'transparent'),
              transition: 'var(--transition)'
            })}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        <div style={{ marginTop: 'auto', padding: 12 }}>
          <button
            onClick={() => setDark(d => !d)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '8px 12px', borderRadius: 'var(--radius-md)',
              border: '0.5px solid var(--border)', background: 'transparent',
              color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
              marginBottom: 12,
              transition: 'var(--transition)'
            }}
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            22 states · 2014-2022<br />45 national policies<br />R² = 0.983
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header className="mobile-header" style={{
          background: 'var(--bg)', borderBottom: '0.5px solid var(--border)',
          padding: '12px 16px', alignItems: 'center', gap: 12,
          position: 'sticky', top: 0, zIndex: 30,
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text)', padding: 4, cursor: 'pointer', display: 'flex', transition: 'var(--transition)' }}>
              <Menu size={20} />
            </button>
            <div style={{ fontSize: 14, fontWeight: 500 }}>CAW India</div>
          </div>
          <button onClick={() => setDark(d => !d)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: 4, cursor: 'pointer', display: 'flex', transition: 'var(--transition)' }}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="main-content" style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
