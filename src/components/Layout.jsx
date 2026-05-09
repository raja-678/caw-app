import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Map, BarChart2, FileText, TrendingUp, Sliders, Menu, X } from 'lucide-react'

const nav = [
  { to: '/', icon: Map, label: 'Overview' },
  { to: '/state', icon: BarChart2, label: 'State Deep Dive' },
  { to: '/policies', icon: FileText, label: 'Policy Explorer' },
  { to: '/findings', icon: TrendingUp, label: 'Findings' },
  { to: '/simulator', icon: Sliders, label: 'Simulator' },
]

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
            zIndex: 40, display: 'none'
          }}
          className="mobile-overlay"
        />
      )}

      <aside style={{
        width: 220, background: 'var(--bg)', borderRight: '0.5px solid var(--border)',
        padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: 4,
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.2s ease',
        flexShrink: 0
      }} className="sidebar">
        <div style={{ padding: '0 12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>CAW India</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Policy & Crime Research</div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: 4 }} className="close-btn">
            <X size={18} />
          </button>
        </div>
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
            borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500,
            color: isActive ? 'var(--purple-600)' : 'var(--text-secondary)',
            background: isActive ? 'var(--purple-50)' : 'transparent',
            transition: 'all 0.15s'
          })}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
        <div style={{ marginTop: 'auto', padding: '12px', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          22 states · 2014-2022<br />45 national policies<br />R2 = 0.983
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="main-wrap">
        <header style={{
          background: 'var(--bg)', borderBottom: '0.5px solid var(--border)',
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
          position: 'sticky', top: 0, zIndex: 30
        }} className="mobile-header">
          <button
            onClick={() => setOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--text)', padding: 4, display: 'flex', alignItems: 'center' }}
          >
            <Menu size={20} />
          </button>
          <div style={{ fontSize: 14, fontWeight: 500 }}>CAW India</div>
        </header>

        <main style={{ flex: 1, padding: '24px 16px', overflowY: 'auto' }} className="main-content">
          {children}
        </main>
      </div>

      <style>{
        @media (min-width: 768px) {
          .sidebar {
            position: sticky !important;
            transform: translateX(0) !important;
            height: 100vh;
          }
          .mobile-header { display: none !important; }
          .close-btn { display: none !important; }
          .main-wrap { flex: 1; }
          .main-content { padding: 32px !important; }
        }
        @media (max-width: 767px) {
          .mobile-overlay { display: block !important; }
        }
      }</style>
    </div>
  )
}
