<script setup lang="ts">
import * as echarts from 'echarts'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  option: Record<string, unknown>
  height?: string
}>()

const chartEl = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

onMounted(() => {
  if (!chartEl.value) return
  chart = echarts.init(chartEl.value, 'dark')
  chart.setOption(props.option)
  new ResizeObserver(() => chart?.resize()).observe(chartEl.value)
})

watch(() => props.option, () => chart?.setOption(props.option, true), { deep: true })

onBeforeUnmount(() => { chart?.dispose(); chart = null })
</script>

<template>
  <div ref="chartEl" :style="{ width: '100%', height: height || '100%' }" />
</template>
