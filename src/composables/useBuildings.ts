import { ref, type ShallowRef } from 'vue'
import type { Map as MLMap } from 'maplibre-gl'
import realBuildingsData from '../data/real_buildings.json'

const SOURCE_ID = 'campus-buildings'
const LAYER_MAIN = 'buildings-main'
const LAYER_MINOR = 'buildings-minor'
const LAYER_LINE = 'buildings-outline'

export function useBuildings(map: ShallowRef<MLMap | null>) {
  const showBuildings = ref(true)

  const render3DBuildings = () => {
    const m = map.value
    if (!m || m.getSource(SOURCE_ID)) return

    m.addSource(SOURCE_ID, {
      type: 'geojson',
      data: realBuildingsData as any,
    })

    // 主要建筑（有真名的）— 高不透明度 + 彩色
    m.addLayer({
      id: LAYER_MAIN,
      type: 'fill-extrusion',
      source: SOURCE_ID,
      filter: ['!', ['get', 'unnamed']],
      paint: {
        'fill-extrusion-color': ['get', 'color'],
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.88,
      },
    })

    // 次要建筑（位置推断的）— 低透明度 + 灰色
    m.addLayer({
      id: LAYER_MINOR,
      type: 'fill-extrusion',
      source: SOURCE_ID,
      filter: ['get', 'unnamed'],
      paint: {
        'fill-extrusion-color': '#90a4ae',
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.4,
      },
    })

    // 轮廓线
    m.addLayer({
      id: LAYER_LINE,
      type: 'line',
      source: SOURCE_ID,
      paint: {
        'line-color': ['case', ['get', 'unnamed'], '#b0bec5', ['get', 'color']],
        'line-width': 0.8,
        'line-opacity': 0.4,
      },
    })
  }

  const toggleBuildings = () => {
    const m = map.value
    if (!m) return
    showBuildings.value = !showBuildings.value
    const vis = showBuildings.value ? 'visible' : 'none'
    for (const id of [LAYER_MAIN, LAYER_MINOR, LAYER_LINE]) {
      if (m.getLayer(id)) m.setLayoutProperty(id, 'visibility', vis)
    }
  }

  return { showBuildings, render3DBuildings, toggleBuildings }
}
