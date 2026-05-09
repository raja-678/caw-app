import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import data from '../data/caw_data.json'

const stateIndex = {}
data.state_averages.forEach(s => { stateIndex[s.state] = s })

const metrics = {
  crime: { label: 'Avg annual crime', get: s => s.avg_crime, format: v => Math.round(v).toLocaleString(), colors: ['var(--red-50)','var(--red-200)','var(--red-400)','var(--red-600)'], thresholds: [5000,15000,40000] },
  crime_rate: { label: 'Crime rate per 100k women', get: s => s.avg_crime_rate, format: v => v ? v.toFixed(1) : 'N/A', colors: ['var(--red-50)','var(--red-200)','var(--red-400)','var(--red-600)'], thresholds: [50,100,150] },
  literacy: { label: 'Female literacy', get: s => s.avg_literacy, format: v => v.toFixed(1)+'%', colors: ['var(--red-600)','var(--red-400)','var(--red-200)','var(--red-50)'], thresholds: [60,70,80] },
  early_marriage: { label: 'Early marriage', get: s => s.avg_early_marriage, format: v => v.toFixed(2), colors: ['var(--green-50)','var(--amber-50)','var(--red-200)','var(--red-600)'], thresholds: [2,3,4] },
  infant_mortality: { label: 'Infant mortality', get: s => s.avg_infant_mortality, format: v => v.toFixed(1), colors: ['var(--green-50)','var(--amber-50)','var(--red-200)','var(--red-600)'], thresholds: [25,35,45] },
}

function getColor(state, metric) {
  const s = stateIndex[state]
  if (!s) return 'var(--bg-tertiary)'
  const m = metrics[metric]
  if (!m) return 'var(--bg-tertiary)'
  const v = m.get(s)
  if (!v) return 'var(--bg-tertiary)'
  if (v < m.thresholds[0]) return m.colors[0]
  if (v < m.thresholds[1]) return m.colors[1]
  if (v < m.thresholds[2]) return m.colors[2]
  return m.colors[3]
}

export default function IndiaMap({ metric = 'crime_rate', onStateClick }) {
  const svgRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
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
      .attr('stroke', 'var(--bg)')
      .attr('stroke-width', 0.8)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('opacity', 0.75)
        const s = stateIndex[d.properties.state]
        const m = metrics[metric]
        if (!m) return
        setTooltip({
          x: event.offsetX, y: event.offsetY,
          state: d.properties.state,
          value: s ? m.format(m.get(s)) : 'No data',
          label: m.label, hasData: !!s
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

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {!geo && (
        <div style={{ height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
          Loading map...
        </div>
      )}
      <svg ref={svgRef} width="100%" height="520" style={{ display: geo ? 'block' : 'none' }} />
      {tooltip && (
        <div style={{
          position: 'absolute', left: tooltip.x + 12, top: tooltip.y - 10,
          background: 'var(--bg)', border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: '8px 12px', pointerEvents: 'none',
          fontSize: 13, boxShadow: 'var(--shadow-md)', zIndex: 10, minWidth: 170
        }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{tooltip.state}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{tooltip.label}</div>
          <div style={{ fontWeight: 500, fontSize: 15, marginTop: 2 }}>{tooltip.value}</div>
        </div>
      )}
    </div>
  )
}
