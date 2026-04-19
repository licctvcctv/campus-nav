import { ref, computed, type ShallowRef } from 'vue'
import maplibregl from 'maplibre-gl'
import { TYPE_ICONS } from '../data/pois'
import { findShortestPath } from './useVisibilityGraph'
import { logNavigation } from '../services/api'
import { usePois } from './usePois'
import { useAuth } from './useAuth'

const ROUTE_SOURCE = 'route-line'
const ROUTE_LAYER = 'route-line-layer'
const ROUTE_DASH = 'route-line-dash'

export function useRoute(map: ShallowRef<maplibregl.Map | null>) {
  const startPoint = ref<number | null>(null)
  const endPoint = ref<number | null>(null)
  const routeInfo = ref('')
  const routeSteps = ref<string[]>([])
  const { pois } = usePois()
  const { isLoggedIn } = useAuth()

  let startMarker: maplibregl.Marker | null = null
  let endMarker: maplibregl.Marker | null = null

  const poiOptions = computed(() =>
    pois.value.map(p => ({
      label: `${TYPE_ICONS[p.type] || '\u{1F4CD}'} ${p.name}`,
      value: p.id,
    }))
  )

  const clearRoute = () => {
    const m = map.value
    if (!m) return
    startMarker?.remove(); startMarker = null
    endMarker?.remove(); endMarker = null
    for (const id of [ROUTE_LAYER, ROUTE_DASH]) {
      if (m.getLayer(id)) m.removeLayer(id)
    }
    if (m.getSource(ROUTE_SOURCE)) m.removeSource(ROUTE_SOURCE)
    routeInfo.value = ''
    routeSteps.value = []
  }

  const planRoute = () => {
    const m = map.value
    if (!m || !startPoint.value || !endPoint.value) return
    if (startPoint.value === endPoint.value) {
      routeInfo.value = '起点和终点不能相同'
      return
    }

    const startPoi = pois.value.find(p => p.id === startPoint.value)
    const endPoi = pois.value.find(p => p.id === endPoint.value)
    if (!startPoi || !endPoi) return

    clearRoute()

    const result = findShortestPath(
      [startPoi.lng, startPoi.lat],
      [endPoi.lng, endPoi.lat],
    )

    if (!result || result.coordinates.length < 2) {
      const coords: [number, number][] = [[startPoi.lng, startPoi.lat], [endPoi.lng, endPoi.lat]]
      drawRoute(m, coords, true)
      const dist = result?.distance ?? estimateDistance(startPoi, endPoi)
      routeInfo.value = `直线距离 ${formatDist(dist)}，步行约 ${Math.ceil(dist / 80)} 分钟（直线估算）`
      routeSteps.value = [`从 ${startPoi.name} 出发`, `到达 ${endPoi.name}`]
    } else {
      drawRoute(m, result.coordinates, false)
      const walkTime = Math.ceil(result.distance / 80)
      routeInfo.value = `距离 ${formatDist(result.distance)}，步行约 ${walkTime} 分钟${result.adjustedStart || result.adjustedEnd ? '（已自动避开建筑内部）' : ''}`

      const steps = [`从 ${startPoi.name} 出发`]
      const seenPoiIds = new Set<number>()
      for (let i = 1; i < result.coordinates.length - 1; i++) {
        const [lng, lat] = result.coordinates[i]
        const nearby = findNearestIntermediatePoi(lng, lat, startPoi.id, endPoi.id)
        if (nearby && !seenPoiIds.has(nearby.id)) {
          steps.push(`经过 ${nearby.name}`)
          seenPoiIds.add(nearby.id)
        }
      }
      steps.push(`到达 ${endPoi.name}`)
      routeSteps.value = steps
    }

    const startAnchor = result?.start ?? [startPoi.lng, startPoi.lat]
    const endAnchor = result?.end ?? [endPoi.lng, endPoi.lat]
    startMarker = createCircleMarker('起', '#22c55e')
      .setLngLat(startAnchor).addTo(m)
    endMarker = createCircleMarker('终', '#ef4444')
      .setLngLat(endAnchor).addTo(m)

    const allCoords = result?.coordinates ?? [[startPoi.lng, startPoi.lat], [endPoi.lng, endPoi.lat]]
    const bounds = allCoords.reduce(
      (b, c) => b.extend(c),
      new maplibregl.LngLatBounds(allCoords[0], allCoords[0]),
    )
    m.fitBounds(bounds, { padding: { top: 80, bottom: 80, left: 360, right: 80 }, duration: 600 })

    // Log navigation — skip for guest users
    if (isLoggedIn.value) {
      const dist = result?.distance ?? estimateDistance(startPoi, endPoi)
      logNavigation({
        start_poi: startPoi.name,
        end_poi: endPoi.name,
        start_poi_id: startPoi.id,
        end_poi_id: endPoi.id,
        distance: dist,
      }).catch((err: any) => console.warn('导航日志记录失败:', err))
    }
  }

  function findNearestIntermediatePoi(lng: number, lat: number, startId: number, endId: number) {
    let best: (typeof pois.value)[number] | null = null
    let bestDistance = Infinity
    for (const poi of pois.value) {
      if (poi.id === startId || poi.id === endId) continue
      const distance = Math.hypot(poi.lng - lng, poi.lat - lat)
      if (distance < 0.0003 && distance < bestDistance) {
        best = poi
        bestDistance = distance
      }
    }
    return best
  }

  const resetRoute = () => { startPoint.value = null; endPoint.value = null; clearRoute() }
  const swapPoints = () => { const t = startPoint.value; startPoint.value = endPoint.value; endPoint.value = t }

  return { startPoint, endPoint, routeInfo, routeSteps, poiOptions, planRoute, resetRoute, swapPoints }
}

function drawRoute(m: maplibregl.Map, coords: [number, number][], dashed: boolean) {
  m.addSource(ROUTE_SOURCE, {
    type: 'geojson',
    data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } },
  })
  if (dashed) {
    m.addLayer({
      id: ROUTE_DASH, type: 'line', source: ROUTE_SOURCE,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#94a3b8', 'line-width': 3, 'line-dasharray': [3, 3] },
    })
  } else {
    m.addLayer({
      id: ROUTE_DASH, type: 'line', source: ROUTE_SOURCE,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#1e40af', 'line-width': 8, 'line-opacity': 0.3 },
    })
    m.addLayer({
      id: ROUTE_LAYER, type: 'line', source: ROUTE_SOURCE,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#3b82f6', 'line-width': 4, 'line-opacity': 0.95 },
    })
  }
}

function createCircleMarker(text: string, color: string): maplibregl.Marker {
  const el = document.createElement('div')
  const inner = document.createElement('div')
  inner.style.cssText = `width:30px;height:30px;border-radius:50%;background:${color};
    border:3px solid white;box-shadow:0 2px 8px ${color}66;
    display:flex;align-items:center;justify-content:center;
    color:white;font-size:13px;font-weight:bold;`
  inner.textContent = text
  el.appendChild(inner)
  return new maplibregl.Marker({ element: el })
}

function formatDist(d: number): string {
  return d >= 1000 ? (d / 1000).toFixed(1) + ' km' : d + ' m'
}

function estimateDistance(a: { lng: number; lat: number }, b: { lng: number; lat: number }): number {
  const R = 6371000, toRad = (d: number) => d * Math.PI / 180
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)))
}
