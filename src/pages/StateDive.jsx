import { useState } from 'react'
import data from '../data/caw_data.json'

const states = [...data.state_averages].sort((a, b) => a.state.localeCompare(b.state))

const getRisk = (crime) => {
  if (crime > 40000) return { label: 'Very high risk', color: '#A32D2D', bg: '#FCEBEB' }
  if (crime > 15000) return { label: 'High risk', color: '#E24B4A', bg: '#FCEBEB' }
  if (crime > 5000) return { label: 'Moderate risk', color: '#854F0B', bg: '#FAEEDA' }
  return { label: 'Low risk', color: '#3B6D11', bg: '#EAF3DE' }
}

const nationalAvg = {
  avg_crime: Math.round(data.state_averages.reduce((s, d) => s + d.avg_crime, 0) / data.state_averages.length),
  avg_literacy: (data.state_averages.reduce((s, d) => s + d.avg_literacy, 0) / data.state_averages.length).toFixed(1),
  avg_early_marriage: (data.state_averages.reduce((s, d) => s + d.avg_early_marriage, 0) / data.state_averages.length).toFixed(2),
  avg_infant_mortality: (data.state_averages.reduce((s, d) => s + d.avg_infant_mortality, 0) / data.state_averages.length).toFixed(1),
}

function StatCard({ label, value, national, unit = '', higher_is_bad = true }) {
  const v = parseFloat(value)
  const n = parseFloat(national)
  const worse = higher_is_bad ? v > n : v < n
  return (
    <div style={{
      background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '14px 16px'
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)' }}>{value}{unit}</div>
      <div style={{ fontSize: 11, marginTop: 4, color: worse ? '#A32D2D' : '#3B6D11' }}>
        {worse ? '▲' : '▼'} National avg: {national}{unit}
      </div>
    </div>
  )
}

function YearChart({ stateData }) {
  const max = Math.max(...stateData.map(d => d.crime))
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 14 }}>
        Crime trend 2014–2022
      </div>
      {stateData.map(d => (
        <div key={d.year} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0 }}>{d.year}</div>
          <div style={{ flex: 1, height: 10, background: 'var(--bg-tertiary)', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{
              width: (d.crime / max * 100) + '%', height: '100%',
              background: '#A32D2D', borderRadius: 5,
              transition: 'width 0.4s ease'
            }} />
          </div>
          <div style={{ width: 56, fontSize: 11, color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>
            {d.crime.toLocaleString()}
          </div>
          <div style={{ width: 56, fontSize: 11, color: 'var(--purple-600)', textAlign: 'right', flexShrink: 0 }}>
            {d.policies} pol.
          </div>
        </div>
      ))}
    </div>
  )
}

export default function StateDive() {
  const [selected, setSelected] = useState(states[0].state)
  const stateAvg = states.find(s => s.state === selected)
  const statePanel = data.panel.filter(d => d.state === selected).sort((a, b) => a.year - b.year)
  const risk = getRisk(stateAvg.avg_crime)
  const rank = [...data.state_averages].sort((a, b) => b.avg_crime - a.avg_crime).findIndex(s => s.state === selected) + 1

  return (
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
        borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)' }}>{selected}</div>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <StatCard
            label="Avg annual crime"
            value={Math.round(stateAvg.avg_crime).toLocaleString()}
            national={Math.round(nationalAvg.avg_crime).toLocaleString()}
            higher_is_bad={true}
          />
          <StatCard
            label="Female literacy %"
            value={stateAvg.avg_literacy.toFixed(1)}
            national={nationalAvg.avg_literacy}
            unit="%"
            higher_is_bad={false}
          />
          <StatCard
            label="Early marriage rate"
            value={stateAvg.avg_early_marriage.toFixed(2)}
            national={nationalAvg.avg_early_marriage}
            higher_is_bad={true}
          />
          <StatCard
            label="Infant mortality"
            value={stateAvg.avg_infant_mortality.toFixed(1)}
            national={nationalAvg.avg_infant_mortality}
            higher_is_bad={true}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{
          background: 'var(--bg)', border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px 22px'
        }}>
          <YearChart stateData={statePanel} />
        </div>

        <div style={{
          background: 'var(--bg)', border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px 22px'
        }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 14 }}>
            Socioeconomic profile vs national average
          </div>
          {[
            { label: 'Female literacy', state: stateAvg.avg_literacy, national: parseFloat(nationalAvg.avg_literacy), unit: '%', max: 100, higher_is_bad: false },
            { label: 'Early marriage', state: stateAvg.avg_early_marriage, national: parseFloat(nationalAvg.avg_early_marriage), unit: '', max: 6, higher_is_bad: true },
            { label: 'Infant mortality', state: stateAvg.avg_infant_mortality, national: parseFloat(nationalAvg.avg_infant_mortality), unit: '', max: 80, higher_is_bad: true },
            { label: 'Avg policies/yr', state: stateAvg.avg_policies, national: 2.44, unit: '', max: 12, higher_is_bad: false },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>
                  {item.state.toFixed(1)}{item.unit}
                </span>
              </div>
              <div style={{ position: 'relative', height: 8, background: 'var(--bg-tertiary)', borderRadius: 4 }}>
                <div style={{
                  width: (item.state / item.max * 100) + '%', height: '100%',
                  background: item.higher_is_bad
                    ? (item.state > item.national ? '#A32D2D' : '#3B6D11')
                    : (item.state > item.national ? '#3B6D11' : '#A32D2D'),
                  borderRadius: 4, transition: 'width 0.4s ease'
                }} />
                <div style={{
                  position: 'absolute', top: -2, left: (item.national / item.max * 100) + '%',
                  width: 2, height: 12, background: '#534AB7', borderRadius: 1
                }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 3 }}>
                Purple line = national average ({item.national.toFixed(1)}{item.unit})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
