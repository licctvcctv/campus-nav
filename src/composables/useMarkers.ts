import { ref, type ShallowRef } from 'vue'
import maplibregl from 'maplibre-gl'
import { TYPE_COLORS } from '../data/pois'
import { createMarkerSvg } from '../data/icons'
import { usePois } from './usePois'

export function useMarkers(map: ShallowRef<maplibregl.Map | null>) {
  let markers: maplibregl.Marker[] = []
  const searchText = ref('')
  const selectedType = ref('全部')
  const { pois } = usePois()

  /** Emitted when user clicks "导航到这里" in a popup */
  let onNavigateTo: ((poiId: number) => void) | null = null
  function setNavigateCallback(cb: (poiId: number) => void) { onNavigateTo = cb }

  const getFilteredPois = () => {
    return pois.value.filter(p => {
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

      const el = document.createElement('div')
      el.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;'

      const markerHtml = createMarkerSvg(poi.type, color, 32)
      const labelDiv = document.createElement('div')
      labelDiv.style.cssText = `margin-top:2px;padding:1px 6px;border-radius:3px;
        background:rgba(0,0,0,0.72);color:#fff;font-size:10px;
        white-space:nowrap;font-weight:500;`
      labelDiv.textContent = poi.name

      const iconWrapper = document.createElement('div')
      iconWrapper.innerHTML = markerHtml
      el.appendChild(iconWrapper)
      el.appendChild(labelDiv)

      // Build popup content safely
      const popupEl = document.createElement('div')
      popupEl.style.cssText = 'padding:8px;min-width:180px;font-family:system-ui,sans-serif;'

      const h4 = document.createElement('h4')
      h4.style.cssText = 'margin:0 0 6px;font-size:14px;color:#1e293b;font-weight:600;'
      h4.textContent = poi.name

      const tag = document.createElement('span')
      tag.style.cssText = `padding:2px 8px;border-radius:4px;font-size:11px;
        background:${color}18;color:${color};font-weight:500;`
      tag.textContent = poi.type

      const desc = document.createElement('p')
      desc.style.cssText = 'margin:6px 0 4px;color:#64748b;font-size:12px;'
      desc.textContent = poi.description

      const coords = document.createElement('p')
      coords.style.cssText = 'margin:0 0 6px;color:#94a3b8;font-size:11px;font-family:monospace;'
      coords.textContent = `${poi.lng.toFixed(6)}, ${poi.lat.toFixed(6)}`

      const navBtn = document.createElement('button')
      navBtn.textContent = '导航到这里'
      navBtn.style.cssText = `width:100%;padding:4px 0;border:none;border-radius:4px;
        background:#3b82f6;color:#fff;font-size:12px;cursor:pointer;`
      navBtn.addEventListener('click', () => { if (onNavigateTo) onNavigateTo(poi.id) })

      popupEl.appendChild(h4)
      popupEl.appendChild(tag)
      popupEl.appendChild(desc)
      popupEl.appendChild(coords)
      popupEl.appendChild(navBtn)

      const popup = new maplibregl.Popup({ offset: 25, closeButton: false })
        .setDOMContent(popupEl)

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([poi.lng, poi.lat])
        .setPopup(popup)
        .addTo(m)

      markers.push(marker)
    })
  }

  return { searchText, selectedType, renderMarkers, setNavigateCallback }
}
