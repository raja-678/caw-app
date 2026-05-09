import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import PageWrapper from '../components/PageWrapper'
import data from '../data/caw_data.json'

const states = [...data.state_averages].sort((a, b) => a.state.localeCompare(b.state))

const getRisk = (crime) => {
  if (crime > 40000) return { label: 'Very high risk', color: 'var(--red-600)', bg: 'var(--red-50)' }
  if (crime > 15000) return { label: 'High risk', color: 'var(--red-400)', bg: 'var(--red-50)' }
  if (crime > 5000) return { label: 'Moderate risk', color: 'var(--amber-600)', bg: 'var(--amber-50)' }
  return { label: 'Low risk', color: 'var(--green-600)', bg: 'var(--green-50)' }
}

const nationalAvg = {
  avg_crime: Math.round(data.state_averages.reduce((s, d) => s + d.avg_crime, 0) / data.state_averages.length),
  avg_literacy: (data.state_averages.reduce((s, d) => s + d.avg_literacy, 0) / data.state_averages.length).toFixed(1),
  avg_early_marriage: (data.state_averages.reduce((s, d) => s + d.avg_early_marriage, 0) / data.state_averages.length).toFixed(2),
  avg_infant_mortality: (data.state_averages.reduce((s, d) => s + d.avg_infant_mortality, 0) / data.state_averages.length).toFixed(1),
}

function StatCard({ label, value, national, unit = '', higherIsBad = true }) {
  const v = parseFloat(value)
  const n = parseFloat(national)
  const worse = higherIsBad ? v > n : v < n
  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)' }}>{value}{unit}</div>
      <div style={{ fontSize: 11, marginTop: 4, color: worse ? 'var(--red-600)' : 'var(--green-600)' }}>
        {worse ? '▲' : '▼'} National avg: {national}{unit}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg)', border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: '10px 14px',
        boxShadow: 'var(--shadow-md)',
        color: 'var(--text)'
      }}>
        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 13, color: 'var(--red-600)' }}>
          {Math.round(payload[0].value).toLocaleString()} cases
        </div>
        {payload[1] && (
          <div style={{ fontSize: 12, color: 'var(--purple-600)', marginTop: 2 }}>
            {payload[1].value} policies enacted
          </div>
        )}
      </div>
    )
  }
  return null
}

export default function StateDive() {
  const [selected, setSelected] = useState(states[0].state)
  const stateAvg = states.find(s => s.state === selected)
  const statePanel = data.panel
    .filter(d => d.state === selected)
    .sort((a, b) => a.year - b.year)
    .map(d => ({ year: d.year, crime: d.crime, policies: d.policies || 0 }))
  const risk = getRisk(stateAvg.avg_crime)
  const rank = [...data.state_averages]
    .sort((a, b) => b.avg_crime - a.avg_crime)
    .findIndex(s => s.state === selected) + 1

  return (
    <PageWrapper>
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 4 }}>State Deep Dive</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Select any state to explore its crime profile, socioeconomic indicators, and policy exposure
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{
            fontSize: 15, padding: '10px 14px', borderRadius: 'var(--radius-md)',
            border: '0.5px solid var(--border-strong)', background: 'var(--bg)',
            color: 'var(--text)', width: 260
          }}
        >
          {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
        </select>
      </div>

      <div style={{
        background: 'var(--bg)', border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 16,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 500 }}>{selected}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{
                fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20,
                background: risk.bg, color: risk.color
              }}>{risk.label}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Ranked #{rank} of 22 states by crime volume
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          <StatCard label="Avg annual crime"
            value={Math.round(stateAvg.avg_crime).toLocaleString()}
            national={Math.round(nationalAvg.avg_crime).toLocaleString()}
            higherIsBad={true} />
          <StatCard label="Female literacy"
            value={stateAvg.avg_literacy.toFixed(1)} national={nationalAvg.avg_literacy}
            unit="%" higherIsBad={false} />
          <StatCard label="Early marriage rate"
            value={stateAvg.avg_early_marriage.toFixed(2)} national={nationalAvg.avg_early_marriage}
            higherIsBad={true} />
          <StatCard label="Infant mortality"
            value={stateAvg.avg_infant_mortality.toFixed(1)} national={nationalAvg.avg_infant_mortality}
            higherIsBad={true} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{
          background: 'var(--bg)', border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px 22px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Crime trend 2014-2022</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Annual reported crimes — hover for details
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={statePanel} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                tickFormatter={v => (v / 1000).toFixed(0) + 'k'} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="crime" stroke="var(--red-600)" strokeWidth={2.5}
                dot={{ fill: 'var(--red-600)', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          background: 'var(--bg)', border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px 22px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Socioeconomic profile vs national average
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Purple line marks national average
          </div>
          {[
            { label: 'Female literacy', val: stateAvg.avg_literacy, nat: parseFloat(nationalAvg.avg_literacy), unit: '%', max: 100, bad: false },
            { label: 'Early marriage', val: stateAvg.avg_early_marriage, nat: parseFloat(nationalAvg.avg_early_marriage), unit: '', max: 6, bad: true },
            { label: 'Infant mortality', val: stateAvg.avg_infant_mortality, nat: parseFloat(nationalAvg.avg_infant_mortality), unit: '', max: 80, bad: true },
            { label: 'Avg policies/yr', val: stateAvg.avg_policies, nat: 2.44, unit: '', max: 12, bad: false },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>
                  {item.val.toFixed(1)}{item.unit}
                </span>
              </div>
              <div style={{ position: 'relative', height: 10, background: 'var(--bg-tertiary)', borderRadius: 5 }}>
                <div style={{
                  width: Math.min((item.val / item.max * 100), 100) + '%',
                  height: '100%', borderRadius: 5,
                  background: item.bad
                    ? (item.val > item.nat ? 'var(--red-600)' : 'var(--green-600)')
                    : (item.val > item.nat ? 'var(--green-600)' : 'var(--red-600)'),
                  transition: 'width 0.4s ease'
                }} />
                <div style={{
                  position: 'absolute', top: -3, left: Math.min((item.nat / item.max * 100), 100) + '%',
                  width: 2, height: 16, background: 'var(--purple-600)', borderRadius: 1
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </PageWrapper>
  )
}
