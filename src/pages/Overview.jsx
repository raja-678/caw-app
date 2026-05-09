import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IndiaMap from '../components/IndiaMap'
import data from '../data/caw_data.json'

const metrics = [
  { key: 'crime', label: 'Crime count' },
  { key: 'literacy', label: 'Female literacy' },
  { key: 'early_marriage', label: 'Early marriage' },
  { key: 'infant_mortality', label: 'Infant mortality' },
]

const legend = {
  crime: { colors: ['#FCEBEB','#F09595','#E24B4A','#A32D2D'], labels: ['< 5k','5k-15k','15k-40k','> 40k'] },
  literacy: { colors: ['#A32D2D','#F09595','#E24B4A','#FCEBEB'], labels: ['< 60%','60-70%','70-80%','> 80%'] },
  early_marriage: { colors: ['#EAF3DE','#FAEEDA','#F09595','#A32D2D'], labels: ['< 2','2-3','3-4','> 4'] },
  infant_mortality: { colors: ['#EAF3DE','#FAEEDA','#F09595','#A32D2D'], labels: ['< 25','25-35','35-45','> 45'] },
}

const topStates = [...data.state_averages]
  .sort((a, b) => b.avg_crime - a.avg_crime).slice(0, 6)
const maxCrime = topStates[0].avg_crime

const summaryMetrics = [
  { label: 'States analysed', value: '22' },
  { label: 'Years covered', value: '2014-2022' },
  { label: 'Policies tracked', value: '45' },
  { label: 'Model R2', value: '0.983' },
]

export default function Overview() {
  const [metric, setMetric] = useState('crime')
  const navigate = useNavigate()

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 4 }}>Crime Against Women in India</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Policy interventions, structural determinants, and the reporting effect · 22 states · 2014-2022
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {summaryMetrics.map(m => (
          <div key={m.label} style={{
            background: 'var(--bg)', border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '16px 18px'
          }}>
            <div style={{ fontSize: 22, fontWeight: 500 }}>{m.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, marginBottom: 16 }}>
        <div style={{
          background: 'var(--bg)', border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px 22px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>India - click any state to explore</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {metrics.map(m => (
                <button
                  key={m.key}
                  onClick={() => setMetric(m.key)}
                  style={{
                    fontSize: 11, padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
                    border: '0.5px solid ' + (metric === m.key ? '#534AB7' : 'rgba(0,0,0,0.12)'),
                    background: metric === m.key ? '#EEEDFE' : 'transparent',
                    color: metric === m.key ? '#534AB7' : '#6b6b6b',
                    fontWeight: metric === m.key ? 500 : 400
                  }}
                >{m.label}</button>
              ))}
            </div>
          </div>

          <IndiaMap metric={metric} onStateClick={() => navigate('/state')} />

          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            {legend[metric].colors.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: c, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#6b6b6b' }}>{legend[metric].labels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'var(--bg)', border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '18px 20px', flex: 1
          }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Top states by crime</div>
            {topStates.map(s => (
              <div key={s.state} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                <div style={{ width: 88, fontSize: 11, color: '#6b6b6b', flexShrink: 0,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.state}</div>
                <div style={{ flex: 1, height: 7, background: '#f1f0ec', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: (s.avg_crime / maxCrime * 100) + '%', height: '100%', background: '#A32D2D', borderRadius: 4 }} />
                </div>
                <div style={{ width: 46, fontSize: 10, color: '#6b6b6b', textAlign: 'right', flexShrink: 0 }}>
                  {Math.round(s.avg_crime / 1000)}k
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: '#FCEBEB', border: '0.5px solid rgba(0,0,0,0.12)',
            borderRadius: 'var(--radius-lg)', padding: '16px 18px',
            borderLeft: '3px solid #A32D2D'
          }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#A32D2D', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reporting effect</div>
            <div style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.6 }}>
              More policies means more reported crime (p less than 0.001) - awareness, not failure
            </div>
          </div>

          <div style={{
            background: '#EAF3DE', border: '0.5px solid rgba(0,0,0,0.12)',
            borderRadius: 'var(--radius-lg)', padding: '16px 18px',
            borderLeft: '3px solid #3B6D11'
          }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#3B6D11', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Structural lever</div>
            <div style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.6 }}>
              Reducing early marriage predicts lower crime growth (p = 0.022)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
