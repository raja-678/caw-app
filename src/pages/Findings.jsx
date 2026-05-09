import { useState, useEffect, useRef } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import PageWrapper from '../components/PageWrapper'
import data from '../data/caw_data.json'

const { regression, correlations } = data
const maxCorr = Math.max(...correlations.map(c => Math.abs(c.r)))

function useCountUp(target, duration = 1500, decimals = 0) {
  const [value, setValue] = useState(0)
  const frameRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    startRef.current = null
    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp
      const progress = Math.min((timestamp - startRef.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(parseFloat((eased * target).toFixed(decimals)))
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration, decimals])

  return value
}

function AnimatedStat({ value, label, prefix = '', suffix = '', decimals = 0, color = 'var(--text)' }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  const count = useCountUp(visible ? value : 0, 1800, decimals)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '20px 22px', textAlign: 'center' }}>
      <div style={{ fontSize: 36, fontWeight: 600, color, lineHeight: 1, marginBottom: 8 }}>
        {prefix}{decimals > 0 ? count.toFixed(decimals) : Math.round(count).toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{label}</div>
    </div>
  )
}

const scatterData = {
  literacy: data.panel.filter(d => d.literacy).map(d => ({ x: d.literacy, y: d.crime, state: d.state, year: d.year })),
  early_marriage: data.panel.filter(d => d.early_marriage).map(d => ({ x: d.early_marriage, y: d.crime, state: d.state, year: d.year })),
  infant_mortality: data.panel.filter(d => d.infant_mortality).map(d => ({ x: d.infant_mortality, y: d.crime, state: d.state, year: d.year })),
  policies: data.panel.map(d => ({ x: d.policies, y: d.crime, state: d.state, year: d.year })),
}

const scatterOptions = [
  { key: 'early_marriage', label: 'Early marriage', xLabel: 'Early marriage rate', r: 0.281, color: '#A32D2D' },
  { key: 'infant_mortality', label: 'Infant mortality', xLabel: 'Infant mortality', r: 0.293, color: '#E24B4A' },
  { key: 'literacy', label: 'Female literacy', xLabel: 'Female literacy (%)', r: -0.218, color: '#3B6D11' },
  { key: 'policies', label: 'Policy count', xLabel: 'Policies enacted', r: -0.018, color: '#534AB7' },
]

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}>
        <div style={{ fontWeight: 500, marginBottom: 3, color: 'var(--text)' }}>{d.state} ({d.year})</div>
        <div style={{ color: 'var(--text-secondary)' }}>x: {typeof d.x === 'number' ? d.x.toFixed(1) : d.x}</div>
        <div style={{ color: '#A32D2D' }}>Crime: {Math.round(d.y).toLocaleString()}</div>
      </div>
    )
  }
  return null
}

const findings = [
  { number: 1, color: '#A32D2D', bg: '#FCEBEB', title: 'Geographic concentration', body: 'Uttar Pradesh averaged 52,290 cases annually — 55% above Maharashtra. Four states account for a disproportionate share of national crime burden.' },
  { number: 2, color: '#A32D2D', bg: '#FCEBEB', title: 'Crime rose despite policy activity', body: 'Average state-level crime increased 36% from 2015 to 2022, coinciding with elevated policy activity. No inflection point after the Nirbhaya Act.' },
  { number: 3, color: '#854F0B', bg: '#FAEEDA', title: 'Legislative volume near-zero correlation', body: 'Policy count — same-year, 1-year lagged, or 2-year lagged — shows negligible correlation with crime (r = -0.018 maximum).' },
  { number: 4, color: '#3B6D11', bg: '#EAF3DE', title: 'Structural deprivation outperforms policy', body: 'Infant mortality (r = +0.293) and early marriage (r = +0.281) are 15x stronger predictors than policy count.' },
  { number: 5, color: '#A32D2D', bg: '#FCEBEB', title: 'The reporting effect confirmed', body: 'Fixed-effects model: Policy Count (p < 0.001, b = 0.334). More policies means more reported crime — awareness drives reporting, not actual crime increase.' },
  { number: 6, color: '#3B6D11', bg: '#EAF3DE', title: 'Early marriage reduction predicts improvement', body: 'Early marriage carries significant negative coefficient (b = -0.041, p = 0.020). States reducing early marriage saw lower crime growth.' },
]

export default function Findings() {
  const [activeScatter, setActiveScatter] = useState('early_marriage')
  const active = scatterOptions.find(s => s.key === activeScatter)

  return (
    <PageWrapper>
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 4, color: 'var(--text)' }}>Research Findings</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Six statistically grounded findings from panel regression across 22 states and 9 years
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        <AnimatedStat value={52290} label="UP avg annual cases — highest state" suffix=" cases" color="#A32D2D" />
        <AnimatedStat value={36} label="% crime increase 2015 to 2022 despite policies" suffix="%" color="#E24B4A" />
        <AnimatedStat value={0.950} label="Model R-squared — fixed effects panel regression" prefix="" decimals={3} color="#534AB7" />
        <AnimatedStat value={0.293} label="Infant mortality correlation — strongest predictor" decimals={3} color="#3B6D11" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16, color: 'var(--text)' }}>Correlation with crime count</div>
          {correlations.map(c => {
            const abs = Math.abs(c.r)
            const w = (abs / maxCorr * 100)
            const isPos = c.r > 0
            const color = abs > 0.2 ? (isPos ? '#A32D2D' : '#3B6D11') : '#888780'
            return (
              <div key={c.variable} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.variable}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color }}>{c.r > 0 ? '+' : ''}{c.r.toFixed(3)}</span>
                </div>
                <div style={{ height: 10, background: 'var(--bg-tertiary)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: w+'%', height: '100%', background: color, borderRadius: 5, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, color: 'var(--text)' }}>Fixed-effects regression results</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>R² = {regression.r_squared} · State + year FE · 176 obs</div>
          {[
            { label: 'Policy count', coef: regression.policy_count, p: '< 0.001', sig: '***', sc: '#3B6D11' },
            { label: 'Policy lag 1yr', coef: regression.policy_lag1, p: '< 0.001', sig: '***', sc: '#3B6D11' },
            { label: 'Female literacy', coef: regression.female_literacy, p: '0.143', sig: '', sc: '#185FA5' },
            { label: 'Infant mortality', coef: regression.infant_mortality, p: '0.065', sig: '*', sc: '#185FA5' },
            { label: 'Early marriage', coef: regression.early_marriage, p: '0.020', sig: '**', sc: '#854F0B' },
          ].map(row => (
            <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 60px 30px', gap: 8, padding: '8px 0', borderBottom: '0.5px solid var(--border)', alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{row.label}</div>
              <div style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', color: row.coef > 0 ? '#A32D2D' : '#3B6D11' }}>
                {row.coef > 0 ? '+' : ''}{row.coef.toFixed(4)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'right' }}>p={row.p}</div>
              <div style={{ fontSize: 12, color: row.sc, textAlign: 'right', fontWeight: 600 }}>{row.sig}</div>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 10 }}>*** p&lt;0.01 · ** p&lt;0.05 · * p&lt;0.1</div>
        </div>
      </div>

      <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{active.label} vs Crime</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              r = {active.r > 0 ? '+' : ''}{active.r} · {Math.abs(active.r) > 0.2 ? 'meaningful correlation' : 'near-zero correlation'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {scatterOptions.map(s => (
              <button key={s.key} onClick={() => setActiveScatter(s.key)} style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
                border: '0.5px solid ' + (activeScatter === s.key ? s.color : 'var(--border)'),
                background: activeScatter === s.key ? s.color + '22' : 'transparent',
                color: activeScatter === s.key ? s.color : 'var(--text-secondary)',
                fontWeight: activeScatter === s.key ? 500 : 400
              }}>{s.label}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <ScatterChart margin={{ top: 4, right: 20, bottom: 20, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="x" name={active.xLabel} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
              label={{ value: active.xLabel, position: 'insideBottom', offset: -12, fontSize: 11, fill: 'var(--text-secondary)' }} />
            <YAxis dataKey="y" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={v => (v/1000).toFixed(0)+'k'} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={scatterData[activeScatter]} fill={active.color} fillOpacity={0.5} r={4} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {findings.map(f => (
          <div key={f.number} style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '18px 20px', borderLeft: '3px solid ' + f.color }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: f.bg, color: f.color }}>Finding {f.number}</span>
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
