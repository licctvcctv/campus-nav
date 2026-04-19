import { ref, shallowRef } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { campusCenter } from '../data/pois'

export function useMap() {
  const mapRef = shallowRef<maplibregl.Map | null>(null)
  const is3D = ref(true)
  const pitch = ref(55)
  const rotation = ref(-30)

  const initMap = (container: HTMLDivElement) => {
    const map = new maplibregl.Map({
      container,
      style: {
        version: 8,
        sources: {
          'carto-voyager': {
            type: 'raster',
            tiles: [
              'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://carto.com">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
          },
        },
        layers: [
          { id: 'carto-tiles', type: 'raster', source: 'carto-voyager' },
        ],
      },
      center: [campusCenter[0], campusCenter[1]],
      zoom: 16,
      pitch: pitch.value,
      bearing: rotation.value,
    })

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right')

    mapRef.value = map
    return map
  }

  const toggle3D = () => {
    const map = mapRef.value
    if (!map) return
    is3D.value = !is3D.value
    if (is3D.value) {
      map.easeTo({ pitch: pitch.value, bearing: rotation.value, duration: 500 })
    } else {
      map.easeTo({ pitch: 0, bearing: 0, duration: 500 })
    }
  }

  const rotateCW = () => {
    const map = mapRef.value
    if (!map) return
    rotation.value = (rotation.value + 30) % 360
    map.easeTo({ bearing: rotation.value, duration: 300 })
  }

  const rotateCCW = () => {
    const map = mapRef.value
    if (!map) return
    rotation.value = (rotation.value - 30) % 360
    map.easeTo({ bearing: rotation.value, duration: 300 })
  }

  const pitchUp = () => {
    const map = mapRef.value
    if (!map) return
    pitch.value = Math.min(85, pitch.value + 10)
    map.easeTo({ pitch: pitch.value, duration: 300 })
  }

  const pitchDown = () => {
    const map = mapRef.value
    if (!map) return
    pitch.value = Math.max(0, pitch.value - 10)
    map.easeTo({ pitch: pitch.value, duration: 300 })
  }

  const locateToCenter = () => {
    const map = mapRef.value
    if (!map) return
    map.flyTo({
      center: [campusCenter[0], campusCenter[1]],
      zoom: 16,
      pitch: is3D.value ? pitch.value : 0,
      bearing: is3D.value ? rotation.value : 0,
      duration: 800,
    })
  }

  return {
    map: mapRef,
    is3D, pitch, rotation,
    initMap, toggle3D, rotateCW, rotateCCW, pitchUp, pitchDown, locateToCenter,
  }
}
