import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import data from '../data/caw_data.json'

const stateIndex = {}
data.state_averages.forEach(s => { stateIndex[s.state] = s })

const yearStateIndex = {}
data.panel.forEach(d => {
  if (!yearStateIndex[d.year]) yearStateIndex[d.year] = {}
  yearStateIndex[d.year][d.state] = d
})

const metrics = {
  crime: {
    label: 'Annual crime count',
    get: (s, year) => yearStateIndex[year]?.[s.state]?.crime || s.avg_crime,
    getAvg: s => s.avg_crime,
    format: v => Math.round(v).toLocaleString() + ' cases',
    getColor: v => {
      if (v > 40000) return '#7B0000'
      if (v > 25000) return '#A32D2D'
      if (v > 15000) return '#E24B4A'
      if (v > 5000) return '#F09595'
      return '#FCEBEB'
    }
  },
  crime_rate: {
    label: 'Crime rate per 100k women',
    get: (s, year) => {
      const d = yearStateIndex[year]?.[s.state]
      return d?.Crime_Rate_100k || s.avg_crime_rate
    },
    getAvg: s => s.avg_crime_rate,
    format: v => v ? v.toFixed(1) + ' per 100k' : 'No data',
    getColor: v => {
      if (!v) return '#E8E8E4'
      if (v > 150) return '#7B0000'
      if (v > 100) return '#A32D2D'
      if (v > 50) return '#E24B4A'
      return '#FCEBEB'
    }
  },
  literacy: {
    label: 'Female literacy rate',
    get: (s, year) => s.avg_literacy,
    getAvg: s => s.avg_literacy,
    format: v => v.toFixed(1) + '%',
    getColor: v => {
      if (v > 80) return '#2D5410'
      if (v > 70) return '#3B6D11'
      if (v > 60) return '#68A83A'
      return '#EAF3DE'
    }
  },
  early_marriage: {
    label: 'Early marriage rate',
    get: (s, year) => {
      const d = yearStateIndex[year]?.[s.state]
      return d?.early_marriage || s.avg_early_marriage
    },
    getAvg: s => s.avg_early_marriage,
    format: v => v ? v.toFixed(2) : 'N/A',
    getColor: v => {
      if (v > 4) return '#7B0000'
      if (v > 3) return '#A32D2D'
      if (v > 2) return '#E24B4A'
      return '#FCEBEB'
    }
  },
  infant_mortality: {
    label: 'Infant mortality rate',
    get: (s, year) => {
      const d = yearStateIndex[year]?.[s.state]
      return d?.infant_mortality || s.avg_infant_mortality
    },
    getAvg: s => s.avg_infant_mortality,
    format: v => v ? v.toFixed(1) : 'N/A',
    getColor: v => {
      if (v > 45) return '#7B0000'
      if (v > 35) return '#A32D2D'
      if (v > 25) return '#E24B4A'
      return '#FCEBEB'
    }
  },
}

function getColorForState(state, metricKey, year) {
  const s = stateIndex[state]
  if (!s) return '#C8C8C0'
  const m = metrics[metricKey]
  if (!m) return '#C8C8C0'
  const v = m.get(s, year)
  if (v === null || v === undefined) return '#C8C8C0'
  return m.getColor(v)
}

const YEARS = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022]

export default function IndiaMap({ metric = 'crime_rate', onStateClick }) {
  const svgRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const [geo, setGeo] = useState(null)
  const [year, setYear] = useState(2022)
  const [playing, setPlaying] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    fetch('/india.geojson').then(r => r.json()).then(setGeo)
  }, [])

  const updateColors = useCallback((currentYear) => {
    if (!svgRef.current) return
    d3.select(svgRef.current)
      .selectAll('path')
      .transition()
      .duration(400)
      .attr('fill', d => getColorForState(d.properties.state, metric, currentYear))
  }, [metric])

  useEffect(() => {
    if (!geo || !svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    const w = svgRef.current.clientWidth || 500
    const h = 520
    const projection = d3.geoMercator().center([82, 22]).scale(w * 1.15).translate([w/2, h/2])
    const path = d3.geoPath().projection(projection)
    const g = svg.append('g')

    g.selectAll('path')
      .data(geo.features)
      .join('path')
      .attr('d', path)
      .attr('fill', d => getColorForState(d.properties.state, metric, year))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0.7)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('opacity', 0.75)
        const s = stateIndex[d.properties.state]
        const m = metrics[metric]
        if (!m || !s) return
        const v = m.get(s, year)
        setTooltip({
          x: event.offsetX, y: event.offsetY,
          state: d.properties.state,
          value: v ? m.format(v) : 'No data',
          label: m.label,
          color: v ? m.getColor(v) : '#E8E8E4'
        })
      })
      .on('mousemove', function(event) {
        setTooltip(t => t ? { ...t, x: event.offsetX, y: event.offsetY } : t)
      })
      .on('mouseleave', function() {
        d3.select(this).attr('opacity', 1)
        setTooltip(null)
      })
      .on('click', function(event, d) {
        if (onStateClick) onStateClick(d.properties.state)
      })
  }, [geo, metric])

  useEffect(() => {
    updateColors(year)
  }, [year, metric, updateColors])

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setYear(y => {
          if (y >= 2022) { setPlaying(false); return 2022 }
          return y + 1
        })
      }, 800)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing])

  const m = metrics[metric]

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {!geo && (
        <div style={{ height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
          Loading map...
        </div>
      )}
      <svg ref={svgRef} width="100%" height="520" style={{ display: geo ? 'block' : 'none' }} />

      {geo && (
        <div style={{
          marginTop: 16, padding: '12px 16px',
          background: 'var(--bg-secondary)', borderRadius: 10,
          border: '0.5px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <button
              onClick={() => {
                if (year >= 2022) setYear(2014)
                setPlaying(p => !p)
              }}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--purple-600)', border: 'none',
                color: '#fff', fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {playing ? '⏸' : '▶'}
            </button>
            <div style={{ flex: 1 }}>
              <input
                type="range" min={2014} max={2022} step={1} value={year}
                onChange={e => { setPlaying(false); setYear(parseInt(e.target.value)) }}
                style={{ width: '100%', accentColor: 'var(--purple-600)' }}
              />
            </div>
            <div style={{
              fontSize: 18, fontWeight: 600, color: 'var(--purple-600)',
              minWidth: 44, textAlign: 'right'
            }}>{year}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {YEARS.map(y => (
              <button key={y} onClick={() => { setPlaying(false); setYear(y) }}
                style={{
                  fontSize: 10, padding: '2px 6px', borderRadius: 4,
                  border: 'none', cursor: 'pointer',
                  background: year === y ? 'var(--purple-600)' : 'transparent',
                  color: year === y ? '#fff' : 'var(--text-secondary)',
                  fontWeight: year === y ? 600 : 400
                }}>{y}</button>
            ))}
          </div>
        </div>
      )}

      {tooltip && (
        <div style={{
          position: 'absolute',
          left: Math.min(tooltip.x + 14, 320),
          top: Math.max(tooltip.y - 60, 8),
          background: 'var(--bg)',
          border: '1px solid var(--border-strong)',
          borderRadius: 10, padding: '10px 14px',
          pointerEvents: 'none', fontSize: 13,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 10, minWidth: 170,
          borderLeft: '3px solid ' + tooltip.color
        }}>
          <div style={{ fontWeight: 600, marginBottom: 5, color: 'var(--text)' }}>{tooltip.state}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginBottom: 3 }}>{tooltip.label}</div>
          <div style={{ fontWeight: 600, fontSize: 15, color: tooltip.color }}>{tooltip.value}</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 3 }}>Year: {year}</div>
        </div>
      )}
    </div>
  )
}
