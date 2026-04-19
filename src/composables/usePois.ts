import { ref, readonly } from 'vue'
import { pois as staticPois, type POI } from '../data/pois'
import * as api from '../services/api'

const poiList = ref<POI[]>([...staticPois])
const loaded = ref(false)

async function fetchPois() {
  try {
    const res = await api.getPois()
    // 无论返回多少条（包括0条），只要接口成功就用接口数据
    if (res.success && Array.isArray(res.data)) {
      poiList.value = res.data
    } else if (Array.isArray(res)) {
      poiList.value = res
    }
  } catch {
    // 接口不通时保留静态数据
  }
  loaded.value = true
}

/** 强制刷新全局POI数据，管理页增删改后必须调用 */
async function refreshPois() {
  loaded.value = false
  await fetchPois()
}

export function usePois() {
  if (!loaded.value) fetchPois()
  return { pois: readonly(poiList), refreshPois, loaded: readonly(loaded) }
}
