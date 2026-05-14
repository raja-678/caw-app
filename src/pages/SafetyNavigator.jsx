import React, { useState, useEffect, useRef } from 'react'
import PageWrapper from '../components/PageWrapper'
import districts from '../data/districts.json'

const riskConfig = {
  'Very High': { color: '#7B0000', bg: '#FCEBEB', border: '#A32D2D', heat: '#ff0000' },
  'High':      { color: '#A32D2D', bg: '#FDF0F0', border: '#E24B4A', heat: '#ff4500' },
  'Moderate':  { color: '#854F0B', bg: '#FAEEDA', border: '#D4820A', heat: '#ff8c00' },
  'Low':       { color: '#3B6D11', bg: '#EAF3DE', border: '#68A83A', heat: '#ffd700' },
}

function RiskBadge({ level }) {
  const c = riskConfig[level] || riskConfig['Low']
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20,
      background: c.bg, color: c.color, border: '0.5px solid ' + c.border,
      display: 'inline-block', whiteSpace: 'nowrap'
    }}>{level} Risk</span>
  )
}

function RiskMeter({ score }) {
  const color = score >= 70 ? '#7B0000' : score >= 50 ? '#A32D2D' : score >= 30 ? '#D4820A' : '#3B6D11'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Risk Score</span>
        <span style={{ fontSize: 13, fontWeight: 600, color }}>{score.toFixed(1)}/100</span>
      </div>
      <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: score + '%', height: '100%', background: color, borderRadius: 4 }} />
      </div>
    </div>
  )
}

async function fetchCrimeNews(city) {
  const proxies = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://proxy.cors.sh/',
  ]
  const query = encodeURIComponent('crime women ' + city + ' India')
  const rssUrl = 'https://news.google.com/rss/search?q=' + query + '&hl=en-IN&gl=IN&ceid=IN:en'

  for (const proxy of proxies) {
    try {
      const url = proxy + encodeURIComponent(rssUrl)
      const res = await fetch(url, { headers: { 'x-requested-with': 'XMLHttpRequest' } })
      if (!res.ok) continue
      const text = await res.text()
      if (!text || text.length < 100) continue
      const parser = new DOMParser()
      const xml = parser.parseFromString(text, 'text/xml')
      const items = Array.from(xml.querySelectorAll('item')).slice(0, 8)
      const results = items.map(item => ({
        title: item.querySelector('title') ? item.querySelector('title').textContent.replace('<![CDATA[', '').replace(']]>', '').trim() : '',
        link: item.querySelector('link') ? item.querySelector('link').textContent.trim() : '#',
        date: item.querySelector('pubDate') ? new Date(item.querySelector('pubDate').textContent).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
        source: item.querySelector('source') ? item.querySelector('source').textContent : 'Google News'
      })).filter(item => item.title && item.title.length > 5)
      if (results.length > 0) return results
    } catch (e) {
      continue
    }
  }
  return []
}


function LeafletMap({ filtered, selectedDistrict, onSelect }) {
  const mapRef = React.useRef(null)
  const instanceRef = React.useRef(null)
  const markersRef = React.useRef([])

  const addMarkers = (map, L, data) => {
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    data.filter(d => d.lat && d.lng).forEach(d => {
      const score = d.risk_score || 0
      const c = riskConfig[d.risk_level] || riskConfig['Low']
      const radius = Math.max(5, score / 12)
      const circle = L.circleMarker([d.lat, d.lng], {
        radius,
        fillColor: c.heat,
        color: c.heat,
        weight: 0,
        opacity: 1,
        fillOpacity: 0.75
      })
      circle.bindTooltip(
        '<b>' + d.District + '</b><br>' + d.State + '<br>Risk: ' + score.toFixed(1) + '/100<br>Avg crime/yr: ' + Math.round(d.avg_crime).toLocaleString(),
        { direction: 'top' }
      )
      circle.on('click', () => onSelect(d))
      circle.addTo(map)
      markersRef.current.push(circle)
    })
  }

  React.useEffect(() => {
    if (instanceRef.current) return
    import('leaflet').then(mod => {
      const L = mod.default
      if (instanceRef.current || !mapRef.current) return
      const map = L.map(mapRef.current, { center: [20.5937, 78.9629], zoom: 5 })
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: 'CARTO', subdomains: 'abcd', maxZoom: 19
      }).addTo(map)
      instanceRef.current = { map, L }
      addMarkers(map, L, filtered)
    })
    return () => {
      if (instanceRef.current) {
        instanceRef.current.map.remove()
        instanceRef.current = null
      }
    }
  }, [])

  React.useEffect(() => {
    if (!instanceRef.current) return
    addMarkers(instanceRef.current.map, instanceRef.current.L, filtered)
  }, [filtered])

  React.useEffect(() => {
    if (!instanceRef.current || !selectedDistrict || !selectedDistrict.lat) return
    instanceRef.current.map.flyTo([selectedDistrict.lat, selectedDistrict.lng], 10, { duration: 1.2 })
  }, [selectedDistrict])

  return <div ref={mapRef} style={{ width: '100%', height: 500, borderRadius: 12 }} />
}

export default function SafetyNavigator() {
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [locating, setLocating] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState(null)
  const [news, setNews] = useState([])
  const [newsLoading, setNewsLoading] = useState(false)
  const [selectedState, setSelectedState] = useState('All')
  const [view, setView] = useState('map')
  const [selectedRisk, setSelectedRisk] = useState('All')
  const [sortBy, setSortBy] = useState('risk_score')

  const states = [...new Set(districts.map(d => d.State))].sort()
  const riskCounts = { 'Very High': 0, 'High': 0, 'Moderate': 0, 'Low': 0 }
  districts.forEach(d => { if (riskCounts[d.risk_level] !== undefined) riskCounts[d.risk_level]++ })

  const filtered = districts
    .filter(d => {
      const matchState = selectedState === 'All' || d.State === selectedState
      const matchRisk = selectedRisk === 'All' || d.risk_level === selectedRisk
      const matchSearch = !search ||
        d.District.toLowerCase().includes(search.toLowerCase()) ||
        d.State.toLowerCase().includes(search.toLowerCase())
      return matchState && matchRisk && matchSearch
    })
    .sort((a, b) => sortBy === 'risk_score' ? b.risk_score - a.risk_score : b.avg_crime - a.avg_crime)

  const getLocation = () => {
    setLocating(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch('https://nominatim.openstreetmap.org/reverse?lat=' + latitude + '&lon=' + longitude + '&format=json')
          const data = await res.json()
          const district = data.address && (data.address.county || data.address.city || data.address.state_district || '')
          const state = data.address && (data.address.state || '')
          setLocation({ latitude, longitude, district, state, display: data.display_name })
          const match = districts.find(d =>
            d.District.toLowerCase().includes((district || '').toLowerCase()) ||
            (district || '').toLowerCase().includes(d.District.toLowerCase())
          )
          if (match) {
            setSelectedDistrict(match)
            loadNews(match.District)
          }
        } catch {
          setLocationError('Could not identify your location. Please search manually.')
        }
        setLocating(false)
      },
      () => {
        setLocationError('Location access denied. Please search for your city manually.')
        setLocating(false)
      }
    )
  }

  const loadNews = async (city) => {
    setNewsLoading(true)
    const items = await fetchCrimeNews(city)
    setNews(items)
    setNewsLoading(false)
  }

  const handleDistrictSelect = (d) => {
    setSelectedDistrict(d)
    loadNews(d.District)
  }

  const trend = selectedDistrict && selectedDistrict.trend
  const trendLabel = trend > 10 ? 'Worsening' : trend < -10 ? 'Improving' : 'Stable'
  const trendColor = trend > 10 ? '#A32D2D' : trend < -10 ? '#3B6D11' : '#854F0B'

  const selectStyle = {
    fontSize: 13, padding: '7px 10px', borderRadius: 8,
    border: '0.5px solid var(--border-strong)', background: 'var(--bg)', color: 'var(--text)'
  }

  return (
    <PageWrapper>
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 4, color: 'var(--text)' }}>Safety Navigator</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          District risk scores from NCRB (2017-2023) with live news intelligence
        </p>
      </div>

      <div style={{
        background: 'var(--purple-50)', border: '0.5px solid var(--border)',
        borderRadius: 14, padding: '16px 20px', marginBottom: 20,
        borderLeft: '3px solid var(--purple-600)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--purple-600)', marginBottom: 3 }}>
              Detect your location
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {location ? location.display : 'Allow location access to see your area risk level instantly'}
            </div>
          </div>
          <button onClick={getLocation} disabled={locating} style={{
            fontSize: 13, padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
            background: 'var(--purple-600)', color: '#fff', border: 'none', fontWeight: 500,
            opacity: locating ? 0.7 : 1
          }}>
            {locating ? 'Locating...' : location ? 'Update Location' : 'Use My Location'}
          </button>
        </div>
        {locationError && (
          <div style={{ fontSize: 12, color: '#A32D2D', marginTop: 8 }}>{locationError}</div>
        )}
        {location && selectedDistrict && (
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
            Matched to: <strong style={{ color: 'var(--text)' }}>{selectedDistrict.District}, {selectedDistrict.State}</strong>
            {' '}<RiskBadge level={selectedDistrict.risk_level} />
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        {Object.entries(riskCounts).map(([level, count]) => {
          const c = riskConfig[level]
          return (
            <div key={level} onClick={() => setSelectedRisk(selectedRisk === level ? 'All' : level)}
              style={{
                background: selectedRisk === level ? c.bg : 'var(--bg)',
                border: '0.5px solid ' + (selectedRisk === level ? c.border : 'var(--border)'),
                borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s'
              }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: c.color }}>{count}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{level} Risk</div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <input placeholder="Search district or state..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...selectStyle, flex: 1, minWidth: 200, padding: '7px 12px' }} />
        <select value={selectedState} onChange={e => setSelectedState(e.target.value)} style={selectStyle}>
          <option value="All">All states</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
          <option value="risk_score">Sort by risk score</option>
          <option value="avg_crime">Sort by crime count</option>
        </select>
        <button onClick={() => { setSearch(''); setSelectedState('All'); setSelectedRisk('All') }}
          style={{ ...selectStyle, cursor: 'pointer', color: 'var(--text-secondary)' }}>Clear</button>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
        Showing {filtered.length} of {districts.length} districts
      </div>

      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 4, borderRadius: 8, marginBottom: 12, width: 'fit-content' }}>
        {['map', 'list'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            fontSize: 12, padding: '5px 14px', borderRadius: 6, cursor: 'pointer', border: 'none',
            background: view === v ? 'var(--bg)' : 'transparent',
            color: view === v ? 'var(--text)' : 'var(--text-secondary)',
            fontWeight: view === v ? 500 : 400
          }}>{v === 'map' ? 'Heatmap' : 'List view'}</button>
        ))}
      </div>

      {view === 'map' && (
        <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ padding: '10px 14px', borderBottom: '0.5px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {filtered.filter(d => d.lat && d.lng).length} districts on map
            </span>
            {[['#ff0000','Very High'],['#ff4500','High'],['#ff8c00','Moderate'],['#ffd700','Low']].map(([color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{label}</span>
              </div>
            ))}
          </div>
          <LeafletMap filtered={filtered} selectedDistrict={selectedDistrict} onSelect={handleDistrictSelect} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedDistrict ? '1fr 380px' : '1fr', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: selectedDistrict ? '1fr' : 'repeat(3,1fr)', gap: 8, alignContent: 'start' }}>
          {filtered.slice(0, 60).map((d, i) => {
            const c = riskConfig[d.risk_level] || riskConfig['Low']
            const isSelected = selectedDistrict && selectedDistrict.District === d.District && selectedDistrict.State === d.State
            return (
              <div key={i} onClick={() => handleDistrictSelect(d)}
                style={{
                  background: isSelected ? 'var(--bg-secondary)' : 'var(--bg)',
                  border: '0.5px solid ' + (isSelected ? c.border : 'var(--border)'),
                  borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                  transition: 'all 0.15s', borderLeft: '3px solid ' + c.border
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{d.District}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.State}</div>
                  </div>
                  <RiskBadge level={d.risk_level} />
                </div>
                <RiskMeter score={d.risk_score} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 6, padding: '5px 8px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Avg crime/yr</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{Math.round(d.avg_crime).toLocaleString()}</div>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 6, padding: '5px 8px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Avg rape/yr</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: d.avg_rape > 100 ? '#A32D2D' : 'var(--text)' }}>{Math.round(d.avg_rape)}</div>
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length > 60 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
              Showing top 60 — refine filters to see more
            </div>
          )}
        </div>

        {selectedDistrict && (
          <div style={{
            background: 'var(--bg)', border: '0.5px solid var(--border)',
            borderRadius: 14, padding: '20px 22px',
            position: 'sticky', top: 20, maxHeight: '90vh', overflowY: 'auto', alignSelf: 'start'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{selectedDistrict.District}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{selectedDistrict.State}</div>
                <RiskBadge level={selectedDistrict.risk_level} />
              </div>
              <button onClick={() => setSelectedDistrict(null)}
                style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--text-secondary)', cursor: 'pointer' }}>x</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <RiskMeter score={selectedDistrict.risk_score} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Trend 2017-2023</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: trendColor }}>
                  {trend > 0 ? '+' : ''}{trend && trend.toFixed(1)}%
                </div>
                <div style={{ fontSize: 11, color: trendColor }}>{trendLabel}</div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Data years</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{selectedDistrict.years_available}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>2017-2023</div>
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 10 }}>Crime breakdown (annual avg)</div>
            {[
              { label: 'Total Crime', value: Math.round(selectedDistrict.avg_crime) },
              { label: 'Rape cases', value: Math.round(selectedDistrict.avg_rape) },
              { label: 'Dowry Deaths', value: Math.round(selectedDistrict.avg_dowry) },
              { label: 'Kidnapping', value: Math.round(selectedDistrict.avg_kidnapping) },
              { label: 'Cruelty by Husband', value: Math.round(selectedDistrict.avg_cruelty) },
              { label: 'Domestic Violence', value: Math.round(selectedDistrict.avg_domestic_violence) },
              { label: 'Cyber Crime', value: Math.round(selectedDistrict.avg_cyber) },
            ].map(ct => (
              <div key={ct.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ct.label}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{ct.value.toLocaleString()}</span>
              </div>
            ))}

            <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 16, marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Recent news</div>
                <button onClick={() => loadNews(selectedDistrict.District)}
                  style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, cursor: 'pointer',
                    border: '0.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)' }}>
                  Refresh
                </button>
              </div>
              {newsLoading ? (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', padding: 16 }}>
                  Fetching recent news...
                </div>
              ) : news.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', padding: 16 }}>
                  No recent news found
                </div>
              ) : (
                <div>
                  {news.map((item, i) => (
                    <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'block', padding: '10px 0', borderBottom: '0.5px solid var(--border)', textDecoration: 'none' }}>
                      <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, marginBottom: 4 }}>{item.title}</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.source}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>· {item.date}</span>
                      </div>
                    </a>
                  ))}
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.5 }}>
                    News from Google News. Headlines are unverified.
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--amber-50)', borderRadius: 8, borderLeft: '3px solid var(--amber-600)' }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--amber-600)', marginBottom: 3 }}>Important disclaimer</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Risk scores are based on NCRB reported crime data (2017-2023) and do not represent real-time conditions. Always trust your own judgment and local knowledge.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </PageWrapper>
  )
}
