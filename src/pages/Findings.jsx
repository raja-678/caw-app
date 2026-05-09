import { useState } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts'
import PageWrapper from '../components/PageWrapper'
import data from '../data/caw_data.json'

const { regression, correlations } = data
const maxCorr = Math.max(...correlations.map(c => Math.abs(c.r)))

const scatterData = {
  literacy: data.panel.filter(d => d.literacy).map(d => ({ x: d.literacy, y: d.crime, state: d.state, year: d.year })),
  early_marriage: data.panel.filter(d => d.early_marriage).map(d => ({ x: d.early_marriage, y: d.crime, state: d.state, year: d.year })),
  infant_mortality: data.panel.filter(d => d.infant_mortality).map(d => ({ x: d.infant_mortality, y: d.crime, state: d.state, year: d.year })),
  policies: data.panel.map(d => ({ x: d.policies, y: d.crime, state: d.state, year: d.year })),
}

const scatterOptions = [
  { key: 'literacy', label: 'Female Literacy vs Crime', xLabel: 'Female literacy (%)', r: -0.218, color: 'var(--green-600)', bg: 'var(--green-50)' },
  { key: 'early_marriage', label: 'Early Marriage vs Crime', xLabel: 'Early marriage rate', r: 0.281, color: 'var(--red-600)', bg: 'var(--red-50)' },
  { key: 'infant_mortality', label: 'Infant Mortality vs Crime', xLabel: 'Infant mortality', r: 0.293, color: 'var(--red-400)', bg: 'var(--red-50)' },
  { key: 'policies', label: 'Policy Count vs Crime', xLabel: 'Policies enacted', r: -0.018, color: 'var(--purple-600)', bg: 'var(--purple-50)' },
]

const CustomScatterTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div style={{
        background: 'var(--bg)', border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: '8px 12px',
        boxShadow: 'var(--shadow-md)', fontSize: 12
      }}>
        <div style={{ fontWeight: 500, marginBottom: 3 }}>{d.state} ({d.year})</div>
        <div style={{ color: 'var(--text-secondary)' }}>x: {typeof d.x === 'number' ? d.x.toFixed(1) : d.x}</div>
        <div style={{ color: 'var(--red-600)' }}>Crime: {Math.round(d.y).toLocaleString()}</div>
      </div>
    )
  }
  return null
}

const findings = [
  { number: 1, color: 'var(--red-600)', bg: 'var(--red-50)', title: 'Geographic concentration', body: 'Uttar Pradesh averaged 52,290 cases annually — 55% above Maharashtra. Four states account for a disproportionate share of national crime burden.' },
  { number: 2, color: 'var(--red-600)', bg: 'var(--red-50)', title: 'Crime rose despite policy activity', body: 'Average state-level crime increased 36% from 2015 to 2022, coinciding with elevated policy activity. No visible inflection point after the Nirbhaya Act (2013).' },
  { number: 3, color: 'var(--amber-600)', bg: 'var(--amber-50)', title: 'Legislative volume near-zero correlation', body: 'Policy count — same-year, 1-year lagged, or 2-year lagged — shows negligible correlation with crime (r = -0.018 maximum).' },
  { number: 4, color: 'var(--green-600)', bg: 'var(--green-50)', title: 'Structural deprivation outperforms policy', body: 'Infant mortality (r = +0.293) and early marriage (r = +0.281) are 15x stronger predictors than policy count.' },
  { number: 5, color: 'var(--red-600)', bg: 'var(--red-50)', title: 'The reporting effect', body: 'Fixed-effects model: Policy Count (p < 0.001, b = 0.955). More policies means more reported crime — awareness drives reporting, not actual crime increase.' },
  { number: 6, color: 'var(--green-600)', bg: 'var(--green-50)', title: 'Early marriage reduction predicts improvement', body: 'Early marriage carries significant negative coefficient (b = -0.040, p = 0.022) in the fixed-effects model. Strongest structural policy lever identified.' },
]

export default function Findings() {
  const [activeScatter, setActiveScatter] = useState('early_marriage')
  const [hover, setHover] = useState(null)
  const active = scatterOptions.find(s => s.key === activeScatter)

  return (
    <PageWrapper>
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 4 }}>Research Findings</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Six statistically grounded findings from panel regression across 22 states and 9 years
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{
          background: 'var(--bg)', border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px 22px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
            Correlation with crime count
          </div>
          {correlations.map((c, i) => {
            const abs = Math.abs(c.r)
            const w = (abs / maxCorr * 100)
            const isPos = c.r > 0
            const color = abs > 0.2 ? (isPos ? 'var(--red-600)' : 'var(--green-600)') : 'var(--text-tertiary)'
            return (
              <div key={c.variable} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.variable}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color }}>{c.r > 0 ? '+' : ''}{c.r.toFixed(3)}</span>
                </div>
                <div style={{ height: 10, background: 'var(--bg-tertiary)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{
                    width: w + '%', height: '100%', background: color, borderRadius: 5,
                    transition: 'width 0.6s ease'
                  }} />
                </div>
              </div>
            )
          })}
        </div>

        <div style={{
          background: 'var(--bg)', border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px 22px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
            Fixed-effects regression results
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
            R² = {regression.r_squared} · State + year fixed effects · 176 observations
          </div>
          {[
            { label: 'Policy count', coef: regression.policy_count, p: '< 0.001', sig: '★★★', sigColor: 'var(--green-600)' },
            { label: 'Policy lag 1yr', coef: regression.policy_lag1, p: '< 0.001', sig: '★★★', sigColor: 'var(--green-600)' },
            { label: 'Female literacy', coef: regression.female_literacy, p: '0.075', sig: '★', sigColor: 'var(--blue-600)' },
            { label: 'Infant mortality', coef: regression.infant_mortality, p: '0.067', sig: '★', sigColor: 'var(--blue-600)' },
            { label: 'Early marriage', coef: regression.early_marriage, p: '0.022', sig: '★★', sigColor: 'var(--amber-600)' },
          ].map(row => (
            <div key={row.label} style={{
              display: 'grid', gridTemplateColumns: '1fr 80px 70px 36px',
              gap: 8, padding: '9px 0',
              borderBottom: '0.5px solid var(--border)', alignItems: 'center'
            }}>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{row.label}</div>
              <div style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', color: row.coef > 0 ? 'var(--red-600)' : 'var(--green-600)' }}>
                {row.coef > 0 ? '+' : ''}{row.coef.toFixed(4)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right' }}>p = {row.p}</div>
              <div style={{ fontSize: 12, color: row.sigColor, textAlign: 'right' }}>{row.sig}</div>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 10 }}>
            ★★★ p&lt;0.01 · ★★ p&lt;0.05 · ★ p&lt;0.1
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--bg)', border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px 22px', marginBottom: 16,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{active.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              r = {active.r > 0 ? '+' : ''}{active.r} · {Math.abs(active.r) > 0.2 ? 'meaningful correlation' : 'near-zero correlation'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {scatterOptions.map(s => (
              <button key={s.key} onClick={() => setActiveScatter(s.key)} style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
                border: '0.5px solid ' + (activeScatter === s.key ? s.color : 'var(--border)'),
                background: activeScatter === s.key ? s.bg : 'transparent',
                color: activeScatter === s.key ? s.color : 'var(--text-secondary)',
                fontWeight: activeScatter === s.key ? 500 : 400,
                transition: 'var(--transition)'
              }}>{s.xLabel}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <ScatterChart margin={{ top: 4, right: 20, bottom: 20, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="x" name={active.xLabel} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
              label={{ value: active.xLabel, position: 'insideBottom', offset: -12, fontSize: 11, fill: 'var(--text-secondary)' }} />
            <YAxis dataKey="y" name="Crime" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
              tickFormatter={v => (v / 1000).toFixed(0) + 'k'} />
            <Tooltip content={<CustomScatterTooltip />} />
            <Scatter data={scatterData[activeScatter]} fill={active.color} fillOpacity={0.5} r={4} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {findings.map(f => (
          <div
            key={f.number}
            onMouseEnter={() => setHover(f.number)}
            onMouseLeave={() => setHover(null)}
            style={{
              background: 'var(--bg)', border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '18px 20px',
              borderLeft: '3px solid ' + f.color,
              boxShadow: hover === f.number ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              transform: hover === f.number ? 'translateY(-1px)' : 'translateY(0)',
              transition: 'var(--transition)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20,
                background: f.bg, color: f.color
              }}>Finding {f.number}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.body}</div>
          </div>
        ))}
      </div>
    </div>
    </PageWrapper>
  )
}
