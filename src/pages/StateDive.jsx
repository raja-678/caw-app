import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import PageWrapper from '../components/PageWrapper'
import data from '../data/caw_data.json'

const states = [...data.state_averages].sort((a, b) => a.state.localeCompare(b.state))

const getRisk = (crime) => {
  if (crime > 40000) return { label: 'Very high risk', color: '#A32D2D', bg: '#FCEBEB' }
  if (crime > 15000) return { label: 'High risk', color: '#E24B4A', bg: '#FCEBEB' }
  if (crime > 5000) return { label: 'Moderate risk', color: '#854F0B', bg: '#FAEEDA' }
  return { label: 'Low risk', color: '#3B6D11', bg: '#EAF3DE' }
}

const nationalAvg = {
  avg_crime: Math.round(data.state_averages.reduce((s,d) => s+d.avg_crime,0)/data.state_averages.length),
  avg_crime_rate: (data.state_averages.filter(s=>s.avg_crime_rate).reduce((s,d) => s+d.avg_crime_rate,0)/data.state_averages.filter(s=>s.avg_crime_rate).length).toFixed(1),
  avg_literacy: (data.state_averages.reduce((s,d) => s+d.avg_literacy,0)/data.state_averages.length).toFixed(1),
  avg_early_marriage: (data.state_averages.reduce((s,d) => s+d.avg_early_marriage,0)/data.state_averages.length).toFixed(2),
  avg_infant_mortality: (data.state_averages.reduce((s,d) => s+d.avg_infant_mortality,0)/data.state_averages.length).toFixed(1),
}

function StatCard({ label, val1, val2, national, unit='', higherIsBad=true }) {
  const v1 = parseFloat(val1)
  const v2 = parseFloat(val2)
  const n = parseFloat(national)
  const worse1 = higherIsBad ? v1 > n : v1 < n
  const worse2 = higherIsBad ? v2 > n : v2 < n
  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, color: worse1 ? '#A32D2D' : '#3B6D11' }}>{val1}{unit}</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>State 1</div>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, color: worse2 ? '#A32D2D' : '#3B6D11' }}>{val2}{unit}</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>State 2</div>
        </div>
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 6 }}>National avg: {national}{unit}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text)' }}>{label}</div>
        {payload.map(p => (
          <div key={p.name} style={{ fontSize: 12, color: p.color, marginBottom: 2 }}>
            {p.name}: {Math.round(p.value).toLocaleString()}
          </div>
        ))}
      </div>
    )
  }
  return null
}

const selectStyle = {
  fontSize: 14, padding: '10px 14px', borderRadius: 8,
  border: '0.5px solid var(--border-strong)', background: 'var(--bg)',
  color: 'var(--text)', width: '100%'
}

export default function StateDive() {
  const [state1, setState1] = useState('Delhi')
  const [state2, setState2] = useState('Uttar Pradesh')
  const [mode, setMode] = useState('single')

  const s1avg = states.find(s => s.state === state1)
  const s2avg = states.find(s => s.state === state2)

  const s1panel = data.panel.filter(d => d.state === state1).sort((a,b) => a.year-b.year)
  const s2panel = data.panel.filter(d => d.state === state2).sort((a,b) => a.year-b.year)

  const compareData = s1panel.map((d,i) => ({
    year: d.year,
    [state1]: d.crime,
    [state2]: s2panel[i]?.crime || 0
  }))

  const risk1 = getRisk(s1avg?.avg_crime || 0)
  const risk2 = getRisk(s2avg?.avg_crime || 0)
  const rank1 = [...data.state_averages].sort((a,b) => b.avg_crime-a.avg_crime).findIndex(s=>s.state===state1)+1
  const rank2 = [...data.state_averages].sort((a,b) => b.avg_crime-a.avg_crime).findIndex(s=>s.state===state2)+1

  return (
    <PageWrapper>
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 4 }}>State Deep Dive</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Explore individual state profiles or compare two states side by side
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['single','compare'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            fontSize: 13, padding: '7px 18px', borderRadius: 20, cursor: 'pointer',
            border: '0.5px solid ' + (mode===m ? 'var(--purple-600)' : 'var(--border)'),
            background: mode===m ? 'var(--purple-50)' : 'transparent',
            color: mode===m ? 'var(--purple-600)' : 'var(--text-secondary)',
            fontWeight: mode===m ? 500 : 400
          }}>{m === 'single' ? 'Single state' : 'Compare two states'}</button>
        ))}
      </div>

      {mode === 'single' ? (
        <div>
          <div style={{ marginBottom: 20 }}>
            <select value={state1} onChange={e => setState1(e.target.value)} style={{ ...selectStyle, width: 260 }}>
              {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
            </select>
          </div>

          {s1avg && (
            <>
              <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)' }}>{state1}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: risk1.bg, color: risk1.color }}>{risk1.label}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Ranked #{rank1} of 22 by crime volume</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                  {[
                    { label: 'Avg annual crime', val: Math.round(s1avg.avg_crime).toLocaleString(), nat: Math.round(nationalAvg.avg_crime).toLocaleString(), bad: true },
                    { label: 'Crime rate per 100k', val: s1avg.avg_crime_rate?.toFixed(1) || 'N/A', nat: nationalAvg.avg_crime_rate, bad: true },
                    { label: 'Female literacy', val: s1avg.avg_literacy?.toFixed(1), nat: nationalAvg.avg_literacy, unit: '%', bad: false },
                    { label: 'Early marriage', val: s1avg.avg_early_marriage?.toFixed(2), nat: nationalAvg.avg_early_marriage, bad: true },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 14px' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)' }}>{item.val}{item.unit||''}</div>
                      <div style={{ fontSize: 11, marginTop: 4, color: item.bad ? (parseFloat(item.val) > parseFloat(item.nat) ? '#A32D2D' : '#3B6D11') : (parseFloat(item.val) > parseFloat(item.nat) ? '#3B6D11' : '#A32D2D') }}>
                        nat. avg: {item.nat}{item.unit||''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, color: 'var(--text)' }}>Crime trend 2014-2022</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>Annual reported crimes</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={s1panel} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={v => (v/1000).toFixed(0)+'k'} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="crime" name={state1} stroke="#A32D2D" strokeWidth={2.5} dot={{ fill: '#A32D2D', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>State 1</div>
              <select value={state1} onChange={e => setState1(e.target.value)} style={selectStyle}>
                {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>State 2</div>
              <select value={state2} onChange={e => setState2(e.target.value)} style={selectStyle}>
                {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
              </select>
            </div>
          </div>

          {s1avg && s2avg && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[state1, state2].map((st, i) => {
                  const avg = i === 0 ? s1avg : s2avg
                  const risk = i === 0 ? risk1 : risk2
                  const rank = i === 0 ? rank1 : rank2
                  return (
                    <div key={st} style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
                      <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>{st}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: risk.bg, color: risk.color }}>{risk.label}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>#{rank} of 22</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                          { label: 'Avg crime', val: Math.round(avg.avg_crime).toLocaleString() },
                          { label: 'Rate/100k', val: avg.avg_crime_rate?.toFixed(1) || 'N/A' },
                          { label: 'Literacy', val: avg.avg_literacy?.toFixed(1) + '%' },
                          { label: 'Early marriage', val: avg.avg_early_marriage?.toFixed(2) },
                        ].map(item => (
                          <div key={item.label} style={{ background: 'var(--bg-secondary)', borderRadius: 6, padding: '8px 10px' }}>
                            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{item.label}</div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginTop: 2 }}>{item.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, color: 'var(--text)' }}>Crime trend comparison 2014-2022</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>Annual reported crimes — hover for details</div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={compareData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={v => (v/1000).toFixed(0)+'k'} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey={state1} stroke="#A32D2D" strokeWidth={2.5} dot={{ fill: '#A32D2D', r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey={state2} stroke="#534AB7" strokeWidth={2.5} dot={{ fill: '#534AB7', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14, color: 'var(--text)' }}>Head to head comparison</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
                  <StatCard label="Avg annual crime" val1={Math.round(s1avg.avg_crime).toLocaleString()} val2={Math.round(s2avg.avg_crime).toLocaleString()} national={Math.round(nationalAvg.avg_crime).toLocaleString()} higherIsBad={true} />
                  <StatCard label="Crime rate per 100k" val1={s1avg.avg_crime_rate?.toFixed(1)||'N/A'} val2={s2avg.avg_crime_rate?.toFixed(1)||'N/A'} national={nationalAvg.avg_crime_rate} higherIsBad={true} />
                  <StatCard label="Female literacy" val1={s1avg.avg_literacy?.toFixed(1)} val2={s2avg.avg_literacy?.toFixed(1)} national={nationalAvg.avg_literacy} unit="%" higherIsBad={false} />
                  <StatCard label="Early marriage rate" val1={s1avg.avg_early_marriage?.toFixed(2)} val2={s2avg.avg_early_marriage?.toFixed(2)} national={nationalAvg.avg_early_marriage} higherIsBad={true} />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
    </PageWrapper>
  )
}
