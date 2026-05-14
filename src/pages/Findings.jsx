import { useState, useEffect, useRef } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
         ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend,
         ReferenceLine, Cell } from 'recharts'
import PageWrapper from '../components/PageWrapper'
import data from '../data/caw_data.json'

const { regression, correlations } = data

function useCountUp(target, duration=1800, decimals=0) {
  const [value, setValue] = useState(0)
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  useEffect(() => {
    if (!visible) return
    let start = null
    const animate = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(parseFloat((eased * target).toFixed(decimals)))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [visible, target])
  return { value, ref }
}

function HeroStat({ value, suffix='', prefix='', label, sublabel, color, decimals=0 }) {
  const { value: count, ref } = useCountUp(value, 1800, decimals)
  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '28px 20px' }}>
      <div style={{ fontSize: 48, fontWeight: 700, color, lineHeight: 1, marginBottom: 8 }}>
        {prefix}{decimals > 0 ? count.toFixed(decimals) : Math.round(count).toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{sublabel}</div>
    </div>
  )
}

const paradoxData = [
  { state: 'Uttar Pradesh', count_rank: 1, rate_rank: 11, avg_crime: 52290, avg_rate: 46.5, color: '#A32D2D' },
  { state: 'Maharashtra', count_rank: 2, rate_rank: 12, avg_crime: 34539, avg_rate: 57.6, color: '#E24B4A' },
  { state: 'Rajasthan', count_rank: 3, rate_rank: 6, avg_crime: 33622, avg_rate: 91.7, color: '#E24B4A' },
  { state: 'West Bengal', count_rank: 4, rate_rank: 8, avg_crime: 33618, avg_rate: 72.1, color: '#E24B4A' },
  { state: 'Delhi', count_rank: 13, rate_rank: 1, avg_crime: 13104, avg_rate: 155.4, color: '#7B0000' },
  { state: 'Assam', count_rank: 6, rate_rank: 2, avg_crime: 23749, avg_rate: 144.5, color: '#A32D2D' },
  { state: 'Kerala', count_rank: 19, rate_rank: 10, avg_crime: 4205, avg_rate: 64.8, color: '#854F0B' },
  { state: 'Bihar', count_rank: 10, rate_rank: 17, avg_crime: 16272, avg_rate: 28.3, color: '#888' },
]

const earlyMarriageData = [...data.state_averages]
  .filter(s => s.avg_early_marriage && s.avg_crime_rate)
  .sort((a,b) => b.avg_crime_rate - a.avg_crime_rate)
  .map(s => ({
    state: s.state.length > 12 ? s.state.slice(0,11)+'.' : s.state,
    crime_rate: parseFloat(s.avg_crime_rate.toFixed(1)),
    early_marriage: parseFloat(s.avg_early_marriage.toFixed(2)),
    fill: s.avg_crime_rate > 100 ? '#A32D2D' : s.avg_crime_rate > 50 ? '#E24B4A' : '#F09595'
  }))

const yearData = data.year_averages.map(y => ({
  year: y.year,
  crime: Math.round(y.avg_crime),
  policies: y.total_policies || 0
}))

const scatterData = data.panel
  .filter(d => d.early_marriage && d.Crime_Rate_100k)
  .map(d => ({ x: d.early_marriage, y: d.Crime_Rate_100k, state: d.state, year: d.year }))

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>{d.state}{d.year ? ' (' + d.year + ')' : ''}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color || 'var(--text-secondary)' }}>{p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</div>)}
    </div>
  )
}

const findings = [
  { number: 1, color: '#A32D2D', bg: '#FCEBEB', title: 'Geographic concentration', body: 'Uttar Pradesh averaged 52,290 cases annually — 55% above Maharashtra. Crime is heavily concentrated in 4-5 states, masking severe subnational heterogeneity in national statistics.' },
  { number: 2, color: '#A32D2D', bg: '#FCEBEB', title: 'Crime rose despite policy activity', body: 'Average state-level crime increased 36% from 2015 to 2022, coinciding with elevated policy activity. No inflection point after the Nirbhaya Act (2013).' },
  { number: 3, color: '#854F0B', bg: '#FAEEDA', title: 'Legislative volume near-zero correlation', body: 'Policy count — same-year, 1-year lagged, or 2-year lagged — shows negligible bivariate correlation with crime (r = -0.018 maximum). Legislative volume alone cannot explain outcomes.' },
  { number: 4, color: '#3B6D11', bg: '#EAF3DE', title: 'Structural deprivation outperforms policy', body: 'Infant mortality (r = +0.293) and early marriage (r = +0.281) are 15x stronger predictors than policy count. Socioeconomic conditions are more proximate determinants than legislation.' },
  { number: 5, color: '#A32D2D', bg: '#FCEBEB', title: 'The reporting effect confirmed', body: 'Fixed-effects model: Policy Count (b = 0.468, p < 0.001). More policies means more reported crime — awareness drives reporting, not actual crime increase. This is a well-documented criminological phenomenon.' },
  { number: 6, color: '#3B6D11', bg: '#EAF3DE', title: 'Early marriage — the strongest lever', body: 'Early marriage carries significant negative coefficient (b = -0.050, p = 0.016). States that reduced early marriage rates over time saw lower crime growth — the strongest structural policy lever identified.' },
]

export default function Findings() {
  const [activeScatter, setActiveScatter] = useState('early_marriage')
  const [paradoxView, setParadoxView] = useState('rate')

  return (
    <PageWrapper>
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 4, color: 'var(--text)' }}>Research Findings</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Six statistically grounded findings from panel regression across 22 states · 2014-2022 · R² = 0.949
        </p>
      </div>

      <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 14, marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '3px solid var(--red-600)' }}>
        <HeroStat value={52290} label="UP average annual cases" sublabel="Highest state by crime count" color="var(--red-600)" suffix=" cases" />
        <div style={{ borderLeft: '0.5px solid var(--border)', borderRight: '0.5px solid var(--border)' }}>
          <HeroStat value={155.4} label="Delhi crime rate per 100k" sublabel="Highest state by individual risk" color="#7B0000" decimals={1} />
        </div>
        <HeroStat value={0.050} label="Early marriage coefficient" sublabel="Strongest structural policy lever" color="var(--green-600)" prefix="-" decimals={3} />
      </div>

      <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>The Count vs Rate Paradox</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Same data, different rankings — two completely different policy problems
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['rate','count'].map(m => (
              <button key={m} onClick={() => setParadoxView(m)} style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
                border: '0.5px solid ' + (paradoxView===m ? 'var(--red-600)' : 'var(--border)'),
                background: paradoxView===m ? 'var(--red-50)' : 'transparent',
                color: paradoxView===m ? 'var(--red-600)' : 'var(--text-secondary)',
                fontWeight: paradoxView===m ? 500 : 400
              }}>{m === 'rate' ? 'By crime rate' : 'By crime count'}</button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
          {paradoxView === 'rate'
            ? 'Delhi ranks #1 by crime rate (155 per 100k women) but #13 by absolute count. UP is #1 by count but #11 by rate. Same data — completely different story.'
            : 'By absolute count, UP dominates with 52,290 cases. But UP has 230 million people — when normalized per woman, it drops out of the top 10.'
          }
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={[...paradoxData].sort((a,b) => a[paradoxView === 'rate' ? 'rate_rank' : 'count_rank'] - b[paradoxView === 'rate' ? 'rate_rank' : 'count_rank'])}
            margin={{ top: 4, right: 8, bottom: 20, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="state" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} angle={-25} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
              tickFormatter={v => paradoxView === 'rate' ? v.toFixed(0) : (v/1000).toFixed(0)+'k'} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={paradoxView === 'rate' ? 'avg_rate' : 'avg_crime'}
              name={paradoxView === 'rate' ? 'Crime rate per 100k' : 'Avg annual crime'} radius={[4,4,0,0]}>
              {paradoxData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Crime trend vs policy activity 2014-2022</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
            Crime rose consistently — no inflection point after major policy years
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={yearData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickFormatter={v => (v/1000).toFixed(0)+'k'} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={2013} stroke="var(--purple-600)" strokeDasharray="4 2" label={{ value: 'Nirbhaya Act', position: 'top', fontSize: 9, fill: 'var(--purple-600)' }} />
              <Line type="monotone" dataKey="crime" name="Avg crime" stroke="var(--red-600)" strokeWidth={2.5} dot={{ fill: 'var(--red-600)', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Early marriage vs crime rate by state</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
            Each dot is one state-year observation — clear positive relationship
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <ScatterChart margin={{ top: 4, right: 8, bottom: 16, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="x" name="Early marriage" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                label={{ value: 'Early marriage rate', position: 'insideBottom', offset: -10, fontSize: 10, fill: 'var(--text-secondary)' }} />
              <YAxis dataKey="y" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                tickFormatter={v => v.toFixed(0)} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={scatterData} fill="var(--red-600)" fillOpacity={0.4} r={3} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 16 }}>Correlation with crime count</div>
          {correlations.map(c => {
            const abs = Math.abs(c.r)
            const w = (abs / 0.293 * 100)
            const color = abs > 0.2 ? (c.r > 0 ? '#A32D2D' : '#3B6D11') : '#888780'
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
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Fixed-effects regression</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>R² = 0.949 · State + year FE · 176 obs · outcome = log(crime rate)</div>
          {[
            { label: 'Policy count', coef: 0.4682, p: '< 0.001', sig: '***', sc: '#A32D2D', note: 'Reporting effect' },
            { label: 'Policy lag 1yr', coef: 0.3402, p: '< 0.001', sig: '***', sc: '#A32D2D', note: '' },
            { label: 'Female literacy', coef: 0.0081, p: '0.416', sig: '', sc: '#888', note: 'Not significant' },
            { label: 'Infant mortality', coef: -0.0079, p: '0.082', sig: '*', sc: '#185FA5', note: 'Marginal' },
            { label: 'Early marriage', coef: -0.0498, p: '0.016', sig: '**', sc: '#3B6D11', note: 'Key lever' },
          ].map(row => (
            <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 55px 30px', gap: 6, padding: '8px 0', borderBottom: '0.5px solid var(--border)', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text)' }}>{row.label}</div>
                {row.note && <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{row.note}</div>}
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, textAlign: 'right', color: row.coef > 0 ? '#A32D2D' : '#3B6D11' }}>
                {row.coef > 0 ? '+' : ''}{row.coef.toFixed(4)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'right' }}>p={row.p}</div>
              <div style={{ fontSize: 12, color: row.sc, textAlign: 'right', fontWeight: 600 }}>{row.sig}</div>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>*** p&lt;0.01 · ** p&lt;0.05 · * p&lt;0.1</div>
        </div>
      </div>

      <div style={{ background: 'var(--amber-50)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '16px 20px', marginBottom: 16, borderLeft: '3px solid var(--amber-600)' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--amber-600)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Data transparency note
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Socioeconomic data (2020-2022) showed implausible values in some states due to COVID-19 disruptions to SRS survey operations. These were corrected using SRS 2019 values as anchor points with linear interpolation, validated against NFHS-5 (2019-21) state-level benchmarks. This correction primarily affected infant mortality values for 2022 in 8 states. All pre-2020 data remains as originally sourced.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {findings.map(f => (
          <div key={f.number} style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '18px 20px', borderLeft: '3px solid ' + f.color }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: f.bg, color: f.color }}>
                Finding {f.number}
              </span>
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
