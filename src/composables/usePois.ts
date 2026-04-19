import { ref, readonly } from 'vue'
import { pois as staticPois, type POI } from '../data/pois'
import * as api from '../services/api'

const poiList = ref<POI[]>([...staticPois])
const loaded = ref(false)

async function fetchPois() {
  try {
    const res = await api.getPois()
    if (res.success && Array.isArray(res.data) && res.data.length) {
      poiList.value = res.data
    } else if (Array.isArray(res) && res.length) {
      poiList.value = res
    }
  } catch { /* fallback to static */ }
  loaded.value = true
}

function refreshPois() { return fetchPois() }

export function usePois() {
  if (!loaded.value) fetchPois()
  return { pois: readonly(poiList), refreshPois }
}
