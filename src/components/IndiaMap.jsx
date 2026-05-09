import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import data from '../data/caw_data.json'

const stateIndex = {}
data.state_averages.forEach(s => { stateIndex[s.state] = s })

const metrics = {
  crime: {
    label: 'Avg annual crime',
    get: s => s.avg_crime,
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
    get: s => s.avg_crime_rate,
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
    get: s => s.avg_literacy,
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
    get: s => s.avg_early_marriage,
    format: v => v.toFixed(2),
    getColor: v => {
      if (v > 4) return '#7B0000'
      if (v > 3) return '#A32D2D'
      if (v > 2) return '#E24B4A'
      return '#FCEBEB'
    }
  },
  infant_mortality: {
    label: 'Infant mortality rate',
    get: s => s.avg_infant_mortality,
    format: v => v.toFixed(1),
    getColor: v => {
      if (v > 45) return '#7B0000'
      if (v > 35) return '#A32D2D'
      if (v > 25) return '#E24B4A'
      return '#FCEBEB'
    }
  },
}

function getColor(state, metricKey) {
  const s = stateIndex[state]
  if (!s) return '#C8C8C0'
  const m = metrics[metricKey]
  if (!m) return '#C8C8C0'
  const v = m.get(s)
  if (v === null || v === undefined) return '#C8C8C0'
  return m.getColor(v)
}

export default function IndiaMap({ metric = 'crime_rate', onStateClick }) {
  const svgRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const [hoveredInset, setHoveredInset] = useState(null)
  const [geo, setGeo] = useState(null)

  useEffect(() => {
    fetch('/india.geojson').then(r => r.json()).then(setGeo)
  }, [])

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
      .attr('fill', d => getColor(d.properties.state, metric))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0.7)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('opacity', 0.78)
        const s = stateIndex[d.properties.state]
        const m = metrics[metric]
        if (!m) return
        setTooltip({
          x: event.offsetX, y: event.offsetY,
          state: d.properties.state,
          value: s ? m.format(m.get(s)) : 'No data',
          label: m.label, hasData: !!s,
          color: s ? m.getColor(m.get(s)) : '#E8E8E4'
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

  const m = metrics[metric]

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {!geo && (
        <div style={{ height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
          Loading map...
        </div>
      )}
      <svg ref={svgRef} width="100%" height="520" style={{ display: geo ? 'block' : 'none' }} />

      {geo && m && (
        <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {INSET_STATES.map(name => {
            const s = stateIndex[name]
            const val = s ? m.get(s) : null
            const color = s && val ? m.getColor(val) : '#E8E8E4'
            const isDark = ['#7B0000','#A32D2D','#2D5410','#3B6D11'].includes(color)
            return (
              <div
                key={name}
                onClick={() => { if (onStateClick) onStateClick(name) }}
                onMouseEnter={() => setHoveredInset(name)}
                onMouseLeave={() => setHoveredInset(null)}
                style={{
                  background: color,
                  border: '1.5px solid rgba(255,255,255,0.4)',
                  borderRadius: 8,
                  padding: '6px 10px',
                  fontSize: 11,
                  color: isDark ? '#ffffff' : '#1a1a1a',
                  minWidth: 110,
                  cursor: 'pointer',
                  boxShadow: hoveredInset === name ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 6px rgba(0,0,0,0.12)',
                  transform: hoveredInset === name ? 'translateY(-1px)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 2, fontSize: 10, opacity: 0.85 }}>{name}</div>
                <div style={{ fontWeight: 500, fontSize: 12 }}>{s && val ? m.format(val) : 'No data'}</div>
                <div style={{ fontSize: 9, opacity: 0.7, marginTop: 1 }}>Island territory</div>
              </div>
            )
          })}
        </div>
      )}

      {tooltip && (
        <div style={{
          position: 'absolute',
          left: Math.min(tooltip.x + 14, 320),
          top: Math.max(tooltip.y - 60, 8),
          background: 'var(--bg)',
          border: '1px solid var(--border-strong)',
          borderRadius: 10,
          padding: '10px 14px',
          pointerEvents: 'none',
          fontSize: 13,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 10,
          minWidth: 170,
          borderLeft: '3px solid ' + tooltip.color
        }}>
          <div style={{ fontWeight: 600, marginBottom: 5, color: 'var(--text)' }}>{tooltip.state}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginBottom: 3 }}>{tooltip.label}</div>
          <div style={{ fontWeight: 600, fontSize: 15, color: tooltip.color }}>{tooltip.value}</div>
        </div>
      )}
    </div>
  )
}
