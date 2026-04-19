<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute as useVueRoute } from 'vue-router'
import { useMap } from '../composables/useMap'
import { useMarkers } from '../composables/useMarkers'
import { useRoute } from '../composables/useRoute'
import { useBuildings } from '../composables/useBuildings'
import MapToolbar from '../components/MapToolbar.vue'
import MapSearch from '../components/MapSearch.vue'
import MapRoute from '../components/MapRoute.vue'
import MapLegend from '../components/MapLegend.vue'

const mapContainer = ref<HTMLDivElement>()

const { map, is3D, initMap, toggle3D, locateToCenter } = useMap()
const { searchText, selectedType, renderMarkers, setNavigateCallback } = useMarkers(map)
const { startPoint, endPoint, routeInfo, routeSteps, poiOptions, planRoute, resetRoute, swapPoints } = useRoute(map)
const { showBuildings, render3DBuildings, toggleBuildings } = useBuildings(map)

// When user clicks "导航到这里" on a marker popup, set it as destination
setNavigateCallback((poiId: number) => {
  endPoint.value = poiId
})

const vueRoute = useVueRoute()

const init = () => {
  if (!mapContainer.value) return
  const m = initMap(mapContainer.value)
  m.on('load', () => {
    if (showBuildings.value) render3DBuildings()
    renderMarkers()
    // 从路由参数定位到指定POI
    const { lng, lat, zoom, poi } = vueRoute.query
    if (lng && lat) {
      m.flyTo({
        center: [Number(lng), Number(lat)],
        zoom: Number(zoom) || 18,
        duration: 800,
      })
    }
  })
}

watch([searchText, selectedType], () => {
  if (map.value) renderMarkers()
})

onMounted(() => nextTick(() => init()))
</script>

<template>
  <div style="position: relative; width: 100%; height: 100%">
    <div ref="mapContainer" style="width: 100%; height: 100%"></div>

    <!-- 左侧搜索 + 路径规划 -->
    <div style="position: absolute; top: 16px; left: 16px; z-index: 100; width: 320px">
      <MapSearch v-model:searchText="searchText" v-model:selectedType="selectedType" />
      <MapRoute
        v-model:startPoint="startPoint"
        v-model:endPoint="endPoint"
        :poiOptions="poiOptions"
        :routeInfo="routeInfo"
        :routeSteps="routeSteps"
        @planRoute="planRoute"
        @resetRoute="resetRoute"
        @swapPoints="swapPoints"
      />
    </div>

    <!-- 右侧3D控制 -->
    <MapToolbar
      :is3D="is3D"
      :showBuildings="showBuildings"
      @toggle3D="toggle3D"
      @toggleBuildings="toggleBuildings"
      @locateToCenter="locateToCenter"
    />

    <!-- 图例 -->
    <MapLegend />
  </div>
</template>
