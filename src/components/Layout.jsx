import { NavLink } from 'react-router-dom'
import { Map, BarChart2, FileText, TrendingUp, Sliders } from 'lucide-react'

const nav = [
  { to: '/', icon: Map, label: 'Overview' },
  { to: '/state', icon: BarChart2, label: 'State Deep Dive' },
  { to: '/policies', icon: FileText, label: 'Policy Explorer' },
  { to: '/findings', icon: TrendingUp, label: 'Findings' },
  { to: '/simulator', icon: Sliders, label: 'Simulator' },
]

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 220, background: 'var(--bg)', borderRight: '0.5px solid var(--border)',
        padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: 4,
        position: 'sticky', top: 0, height: '100vh', flexShrink: 0
      }}>
        <div style={{ padding: '0 12px 24px' }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>CAW India</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Policy & Crime Research</div>
        </div>
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
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
          22 states · 2014–2022<br />45 national policies<br />R² = 0.983
        </div>
      </aside>
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
