import { ref, type ShallowRef } from 'vue'
import maplibregl from 'maplibre-gl'
import { pois, TYPE_COLORS } from '../data/pois'
import { createMarkerSvg } from '../data/icons'

export function useMarkers(map: ShallowRef<maplibregl.Map | null>) {
  let markers: maplibregl.Marker[] = []
  const searchText = ref('')
  const selectedType = ref('全部')

  const getFilteredPois = () => {
    return pois.filter(p => {
      const matchType = selectedType.value === '全部' || p.type === selectedType.value
      const matchSearch = !searchText.value ||
        p.name.includes(searchText.value) ||
        p.description.includes(searchText.value)
      return matchType && matchSearch
    })
  }

  const renderMarkers = () => {
    const m = map.value
    if (!m) return

    markers.forEach(mk => mk.remove())
    markers = []

    const filtered = getFilteredPois()
    filtered.forEach(poi => {
      const color = TYPE_COLORS[poi.type] || '#3b82f6'

      // 标记容器
      const el = document.createElement('div')
      el.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;'
      el.innerHTML = `
        ${createMarkerSvg(poi.type, color, 32)}
        <div style="
          margin-top:2px;padding:1px 6px;border-radius:3px;
          background:rgba(0,0,0,0.72);color:#fff;font-size:10px;
          white-space:nowrap;font-weight:500;
        ">${poi.name}</div>
      `

      // 弹窗
      const popup = new maplibregl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div style="padding:8px;min-width:180px;font-family:system-ui,sans-serif;">
            <h4 style="margin:0 0 6px;font-size:14px;color:#1e293b;font-weight:600;">${poi.name}</h4>
            <span style="padding:2px 8px;border-radius:4px;font-size:11px;
              background:${color}18;color:${color};font-weight:500;">${poi.type}</span>
            <p style="margin:6px 0 4px;color:#64748b;font-size:12px;">${poi.description}</p>
            <p style="margin:0;color:#94a3b8;font-size:11px;font-family:monospace;">
              ${poi.lng.toFixed(6)}, ${poi.lat.toFixed(6)}
            </p>
          </div>
        `)

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([poi.lng, poi.lat])
        .setPopup(popup)
        .addTo(m)

      markers.push(marker)
    })
  }

  return { searchText, selectedType, renderMarkers }
}
