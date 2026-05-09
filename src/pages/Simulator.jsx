import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import PageWrapper from '../components/PageWrapper'
import data from '../data/caw_data.json'

const { regression } = data

const nationalAvg = {
  policies: 2.44,
  literacy: 68.4,
  early_marriage: 2.8,
  infant_mortality: 36.2,
}

function predict(policies, literacy, earlyMarriage, infantMortality) {
  const log = regression.intercept
    + regression.policy_count * policies
    + regression.female_literacy * literacy
    + regression.early_marriage * earlyMarriage
    + regression.infant_mortality * infantMortality
  return Math.round(Math.exp(log))
}

const baselineCrime = predict(
  nationalAvg.policies,
  nationalAvg.literacy,
  nationalAvg.early_marriage,
  nationalAvg.infant_mortality
)

const scenarios = [
  { label: 'Kerala model', desc: 'High literacy, low early marriage', policies: 3, literacy: 92, earlyMarriage: 1.4, infantMortality: 12, color: 'var(--green-600)', bg: 'var(--green-50)' },
  { label: 'National average', desc: 'Current average across 22 states', policies: 2.44, literacy: 68.4, earlyMarriage: 2.8, infantMortality: 36.2, color: 'var(--purple-600)', bg: 'var(--purple-50)' },
  { label: 'UP model', desc: 'Low literacy, high early marriage', policies: 3, literacy: 59, earlyMarriage: 3.8, infantMortality: 49, color: 'var(--red-600)', bg: 'var(--red-50)' },
]

const drivers = [
  { key: 'early_marriage', label: 'Early marriage', coef: -0.0398, color: 'var(--green-600)' },
  { key: 'infant_mortality', label: 'Infant mortality', coef: 0.0042, color: 'var(--red-400)' },
  { key: 'literacy', label: 'Female literacy', coef: 0.0175, color: 'var(--amber-600)' },
  { key: 'policies', label: 'Policy count', coef: 0.9553, color: 'var(--purple-600)' },
]

export default function Simulator() {
  const [policies, setPolicies] = useState(nationalAvg.policies)
  const [literacy, setLiteracy] = useState(nationalAvg.literacy)
  const [earlyMarriage, setEarlyMarriage] = useState(nationalAvg.early_marriage)
  const [infantMortality, setInfantMortality] = useState(nationalAvg.infant_mortality)
  const [hover, setHover] = useState(null)

  const predicted = predict(policies, literacy, earlyMarriage, infantMortality)
  const delta = predicted - baselineCrime
  const pct = ((delta / baselineCrime) * 100).toFixed(1)
  const isUp = delta > 0

  const chartData = [
    { name: 'Your scenario', crime: predicted, fill: isUp ? 'var(--red-600)' : 'var(--green-600)' },
    { name: 'National avg', crime: baselineCrime, fill: 'var(--purple-600)' },
    { name: 'Kerala model', crime: predict(3, 92, 1.4, 12), fill: 'var(--green-600)' },
    { name: 'UP model', crime: predict(3, 59, 3.8, 49), fill: 'var(--red-400)' },
  ]

  const sliders = [
    { label: 'Policies enacted', value: policies, set: setPolicies, min: 0, max: 12, step: 1, nat: nationalAvg.policies, fmt: v => Math.round(v) },
    { label: 'Female literacy %', value: literacy, set: setLiteracy, min: 40, max: 95, step: 0.5, nat: nationalAvg.literacy, fmt: v => v.toFixed(1) + '%' },
    { label: 'Early marriage rate', value: earlyMarriage, set: setEarlyMarriage, min: 1, max: 6, step: 0.1, nat: nationalAvg.early_marriage, fmt: v => v.toFixed(1) },
    { label: 'Infant mortality', value: infantMortality, set: setInfantMortality, min: 10, max: 70, step: 1, nat: nationalAvg.infant_mortality, fmt: v => Math.round(v) },
  ]

  return (
    <PageWrapper>
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 4 }}>Policy Simulator</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Adjust structural indicators to predict crime outcomes — powered by fixed-effects regression (R² = 0.983)
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {scenarios.map(s => (
          <div
            key={s.label}
            onClick={() => {
              setPolicies(s.policies); setLiteracy(s.literacy)
              setEarlyMarriage(s.earlyMarriage); setInfantMortality(s.infantMortality)
            }}
            onMouseEnter={() => setHover(s.label)}
            onMouseLeave={() => setHover(null)}
            style={{
              background: s.bg, border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '14px 16px', cursor: 'pointer',
              boxShadow: hover === s.label ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              transform: hover === s.label ? 'translateY(-1px)' : 'translateY(0)',
              transition: 'var(--transition)'
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 500, color: s.color, marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{s.desc}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: s.color }}>
              ~{predict(s.policies, s.literacy, s.earlyMarriage, s.infantMortality).toLocaleString()} cases
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{
          background: 'var(--bg)', border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '22px 24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Adjust variables</div>
            <button onClick={() => {
              setPolicies(nationalAvg.policies); setLiteracy(nationalAvg.literacy)
              setEarlyMarriage(nationalAvg.early_marriage); setInfantMortality(nationalAvg.infant_mortality)
            }} style={{
              fontSize: 12, padding: '5px 12px', borderRadius: 'var(--radius-md)',
              border: '0.5px solid var(--border-strong)', background: 'transparent',
              color: 'var(--text-secondary)', cursor: 'pointer'
              , transition: 'var(--transition)'
            }}>Reset</button>
          </div>

          {sliders.map(sl => (
            <div key={sl.label} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text)' }}>{sl.label}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{sl.fmt(sl.value)}</span>
              </div>
              <input type="range" min={sl.min} max={sl.max} step={sl.step} value={sl.value}
                onChange={e => sl.set(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--purple-600)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{sl.min}</span>
                <span style={{ fontSize: 10, color: 'var(--purple-600)' }}>nat. avg: {sl.fmt(sl.nat)}</span>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{sl.max}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'var(--bg)', border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '22px',
            textAlign: 'center', flex: '0 0 auto'
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Predicted annual crime count
            </div>
            <div style={{ fontSize: 44, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>
              {predicted.toLocaleString()}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 14px', borderRadius: 20,
              background: isUp ? 'var(--red-50)' : 'var(--green-50)',
              color: isUp ? 'var(--red-600)' : 'var(--green-600)',
              fontSize: 13, fontWeight: 500
            }}>
              {isUp ? '▲' : '▼'} {Math.abs(pct)}% {isUp ? 'above' : 'below'} national baseline
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.6 }}>
              Based on regression coefficients · R² = 0.983
            </div>
          </div>

          <div style={{
            background: 'var(--bg)', border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '18px 20px', flex: 1
          }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Scenario comparison</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                <YAxis tickFormatter={v => (v/1000).toFixed(0)+'k'} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                <Tooltip formatter={(v) => [Math.round(v).toLocaleString(), 'Crime']}
                  contentStyle={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text)', boxShadow: 'var(--shadow-md)' }} />
                <Bar dataKey="crime" radius={[4,4,0,0]}>
                  {chartData.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
    </PageWrapper>
  )
}
