import { useState, useMemo } from 'react'
import PageWrapper from '../components/PageWrapper'
import policies from '../data/policies.json'

const categories = ['All', ...new Set(policies.map(p => p.category))]
const years = ['All', ...[...new Set(policies.map(p => p.year))].sort()]
const types = ['All', ...new Set(policies.map(p => p.type))]

const categoryColors = {
  'A. Legal and Regulatory Framework': { color: 'var(--red-600)', bg: 'var(--red-50)' },
  'B. Schemes and Programs': { color: 'var(--blue-600)', bg: 'var(--blue-50)' },
  'C. Institutional and Policy Reforms': { color: 'var(--purple-600)', bg: 'var(--purple-50)' },
}

function getCat(cat) {
  return categoryColors[cat] || { color: 'var(--amber-600)', bg: 'var(--amber-50)' }
}

export default function PolicyExplorer() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [year, setYear] = useState('All')
  const [type, setType] = useState('All')
  const [selected, setSelected] = useState(null)
  const [hover, setHover] = useState(null)

  const filtered = useMemo(() => policies.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.ministry.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || p.category === category
    const matchYear = year === 'All' || p.year === parseInt(year)
    const matchType = type === 'All' || p.type === type
    return matchSearch && matchCat && matchYear && matchType
  }), [search, category, year, type])

  const byCat = useMemo(() => {
    const counts = {}
    policies.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1 })
    return counts
  }, [])

  const byYear = useMemo(() => {
    const counts = {}
    filtered.forEach(p => { counts[p.year] = (counts[p.year] || 0) + 1 })
    return counts
  }, [filtered])

  const selectStyle = {
    fontSize: 13, padding: '7px 10px', borderRadius: 'var(--radius-md)',
    border: '0.5px solid var(--border-strong)', background: 'var(--bg)', color: 'var(--text)'
  }

  return (
    <PageWrapper>
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 4 }}>Policy Explorer</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Browse all 45 national policies and interventions for women safety · 2013-2023
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {Object.entries(byCat).map(([cat, count]) => {
          const c = getCat(cat)
          const isActive = category === cat
          return (
            <div
              key={cat}
              onClick={() => setCategory(isActive ? 'All' : cat)}
              onMouseEnter={() => setHover(cat)}
              onMouseLeave={() => setHover(null)}
              style={{
                background: isActive ? c.bg : 'var(--bg)',
                border: '0.5px solid ' + (isActive ? c.color : 'var(--border)'),
                borderRadius: 'var(--radius-lg)', padding: '14px 16px', cursor: 'pointer',
                transition: 'var(--transition)',
                boxShadow: hover === cat ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                transform: hover === cat ? 'translateY(-1px)' : 'translateY(0)',
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 500, color: c.color }}>{count}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                {cat.replace(/^[A-C]\. /, '')}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input placeholder="Search policies or ministry..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...selectStyle, flex: 1, minWidth: 200, padding: '7px 12px' }} />
        <select value={year} onChange={e => setYear(e.target.value)} style={selectStyle}>
          {years.map(y => <option key={y} value={y}>{y === 'All' ? 'All years' : y}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
          {types.map(t => <option key={t} value={t}>{t === 'All' ? 'All types' : t}</option>)}
        </select>
        <button onClick={() => { setSearch(''); setCategory('All'); setYear('All'); setType('All') }}
          style={{ ...selectStyle, cursor: 'pointer', color: 'var(--text-secondary)' }}>
          Clear
        </button>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
        Showing {filtered.length} of {policies.length} policies
        {Object.keys(byYear).length > 0 && (
          <span style={{ marginLeft: 12 }}>
            {Object.entries(byYear).sort((a,b) => a[0]-b[0]).map(([y,c]) => (
              <span key={y} style={{ marginRight: 8 }}>{y}: {c}</span>
            ))}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 && (
            <div style={{
              background: 'var(--bg)', border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '32px', textAlign: 'center',
              color: 'var(--text-secondary)', fontSize: 13,
              boxShadow: 'var(--shadow-sm)'
            }}>No policies match your filters</div>
          )}
          {filtered.map((p, i) => {
            const c = getCat(p.category)
            const isSelected = selected === p
            const cardKey = 'policy:' + i
            return (
              <div
                key={i}
                onClick={() => setSelected(isSelected ? null : p)}
                onMouseEnter={() => setHover(cardKey)}
                onMouseLeave={() => setHover(null)}
                style={{
                  background: isSelected ? c.bg : 'var(--bg)',
                  border: '0.5px solid ' + (isSelected ? c.color : 'var(--border)'),
                  borderRadius: 'var(--radius-lg)', padding: '14px 16px',
                  cursor: 'pointer', transition: 'var(--transition)',
                  boxShadow: hover === cardKey ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  transform: hover === cardKey ? 'translateY(-1px)' : 'translateY(0)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 5, lineHeight: 1.4 }}>
                      {p.name}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 20,
                        background: c.bg, color: c.color, fontWeight: 500
                      }}>{p.type}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {p.ministry.split('|')[0].trim()}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 500, color: c.color,
                    background: c.bg, padding: '4px 10px', borderRadius: 'var(--radius-md)', flexShrink: 0
                  }}>{p.year}</div>
                </div>
              </div>
            )
          })}
        </div>

        {selected && (
          <div style={{
            background: 'var(--bg)', border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '20px 22px',
            position: 'sticky', top: 0, alignSelf: 'start', maxHeight: '80vh', overflowY: 'auto'
            , boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 500, flex: 1, lineHeight: 1.4, paddingRight: 12 }}>
                {selected.name}
              </div>
              <button onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', fontSize: 18, color: 'var(--text-secondary)', cursor: 'pointer', flexShrink: 0 }}>
                x
              </button>
            </div>
            {[
              { label: 'Year', value: selected.year },
              { label: 'Category', value: selected.category.replace(/^[A-C]\. /, '') },
              { label: 'Subcategory', value: selected.subcategory },
              { label: 'Type', value: selected.type },
              { label: 'Ministry', value: selected.ministry },
            ].map(row => (
              <div key={row.label} style={{ padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 3 }}>{row.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{row.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </PageWrapper>
  )
}
