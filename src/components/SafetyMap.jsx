import { useEffect, useRef } from 'react'

export default function SafetyMap({ districts, selectedDistrict, onDistrictClick }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (mapInstanceRef.current) return

    // Dynamically import leaflet
    const L = window.L
    if (!L) return

    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: 'OpenStreetMap, CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map)

    mapInstanceRef.current = map
    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const L = window.L
    const map = mapInstanceRef.current
    if (!L || !map || !districts.length) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    districts.forEach(d => {
      if (!d.lat || !d.lng) return
      const score = d.risk_score || 0
      const radius = Math.max(6, score / 8)
      const color = score >= 70 ? '#ff0000' : score >= 50 ? '#ff4500' : score >= 30 ? '#ff8c00' : '#ffd700'
      const opacity = 0.6 + (score / 250)

      const circle = L.circleMarker([d.lat, d.lng], {
        radius,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 0.8,
        fillOpacity: opacity
      })

      circle.bindTooltip(
        '<strong>' + d.District + '</strong><br>' + d.State + '<br>Risk: ' + score.toFixed(1) + '/100',
        { permanent: false, direction: 'top' }
      )

      circle.on('click', () => onDistrictClick(d))
      circle.addTo(map)
      markersRef.current.push(circle)
    })
  }, [districts])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedDistrict?.lat) return
    map.flyTo([selectedDistrict.lat, selectedDistrict.lng], 9, { duration: 1.2 })
  }, [selectedDistrict])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 480, borderRadius: 12, overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 480 }} />
    </div>
  )
}
