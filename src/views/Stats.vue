<script setup lang="ts">
import { computed } from 'vue'
import { TYPE_COLORS, TYPE_ICONS } from '../data/pois'
import EChart from '../components/EChart.vue'
import { usePois } from '../composables/usePois'

const { pois } = usePois()

const typeData = computed(() => {
  const map = new Map<string, number>()
  pois.value.forEach(p => map.set(p.type, (map.get(p.type) || 0) + 1))
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
})

const pieOption = computed(() => ({
  title: { text: 'POI类型分布', left: 'center', textStyle: { color: '#e5e7eb' } },
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { bottom: 10, textStyle: { color: '#94a3b8' } },
  series: [{
    type: 'pie',
    radius: ['40%', '65%'],
    avoidLabelOverlap: true,
    itemStyle: { borderRadius: 6, borderColor: '#1e1e2e', borderWidth: 2 },
    label: { color: '#94a3b8' },
    data: typeData.value.map(d => ({
      name: `${TYPE_ICONS[d.name] || ''} ${d.name}`,
      value: d.value,
      itemStyle: { color: TYPE_COLORS[d.name] || '#3b82f6' },
    })),
  }],
}))

const barOption = computed(() => ({
  title: { text: 'POI数量统计', left: 'center', textStyle: { color: '#e5e7eb' } },
  tooltip: { trigger: 'axis' },
  grid: { left: 60, right: 20, top: 50, bottom: 40 },
  xAxis: {
    type: 'category',
    data: typeData.value.map(d => d.name),
    axisLabel: { color: '#94a3b8', rotate: 30 },
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#94a3b8' },
    splitLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.3)' } },
  },
  series: [{
    type: 'bar',
    data: typeData.value.map(d => ({
      value: d.value,
      itemStyle: { color: TYPE_COLORS[d.name] || '#3b82f6', borderRadius: [4, 4, 0, 0] },
    })),
    barWidth: '50%',
  }],
}))

const scatterOption = computed(() => ({
  title: { text: 'POI地理分布', left: 'center', textStyle: { color: '#e5e7eb' } },
  tooltip: {
    trigger: 'item',
    formatter: (p: any) => `${p.data[2]}<br/>经度: ${p.data[0].toFixed(4)}<br/>纬度: ${p.data[1].toFixed(4)}`,
  },
  grid: { left: 80, right: 30, top: 50, bottom: 50 },
  xAxis: {
    type: 'value', name: '经度',
    nameTextStyle: { color: '#94a3b8' },
    axisLabel: { color: '#94a3b8', formatter: (v: number) => v.toFixed(3) },
    splitLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.3)' } },
  },
  yAxis: {
    type: 'value', name: '纬度',
    nameTextStyle: { color: '#94a3b8' },
    axisLabel: { color: '#94a3b8', formatter: (v: number) => v.toFixed(3) },
    splitLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.3)' } },
  },
  series: [{
    type: 'scatter',
    symbolSize: 14,
    data: pois.value.map(p => [p.lng, p.lat, p.name, p.type]),
    itemStyle: {
      color: (p: any) => TYPE_COLORS[p.data[3]] || '#3b82f6',
    },
  }],
}))
</script>

<template>
  <div style="padding: 24px">
    <n-space vertical :size="20">
      <n-grid :cols="4" :x-gap="16">
        <n-grid-item>
          <n-card size="small">
            <n-statistic label="POI总数" :value="pois.length" tabular-nums>
              <template #prefix><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></template>
              <template #suffix>个</template>
            </n-statistic>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card size="small">
            <n-statistic label="POI类型" :value="typeData.length" tabular-nums>
              <template #prefix><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></template>
              <template #suffix>种</template>
            </n-statistic>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card size="small">
            <n-statistic label="教学设施" :value="pois.filter(p => p.type === '教学楼' || p.type === '教学区').length" tabular-nums>
              <template #prefix><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg></template>
              <template #suffix>个</template>
            </n-statistic>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card size="small">
            <n-statistic label="生活设施" :value="pois.filter(p => p.type === '食堂' || p.type === '宿舍' || p.type === '生活服务').length" tabular-nums>
              <template #prefix><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V9l9-6 9 6v12"/><path d="M9 21v-6h6v6"/></svg></template>
              <template #suffix>个</template>
            </n-statistic>
          </n-card>
        </n-grid-item>
      </n-grid>

      <n-grid :cols="2" :x-gap="16">
        <n-grid-item>
          <n-card><EChart :option="pieOption" height="360px" /></n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card><EChart :option="barOption" height="360px" /></n-card>
        </n-grid-item>
      </n-grid>

      <n-card>
        <EChart :option="scatterOption" height="400px" />
      </n-card>
    </n-space>
  </div>
</template>
