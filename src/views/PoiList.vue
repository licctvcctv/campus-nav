<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NTag, NButton } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { POI_TYPES, TYPE_COLORS } from '../data/pois'
import { SVG_ICONS } from '../data/icons'
import { useRouter } from 'vue-router'
import { usePois } from '../composables/usePois'

const router = useRouter()
const searchText = ref('')
const filterType = ref('全部')
const { pois } = usePois()

const filteredPois = computed(() => {
  return pois.value.filter(p => {
    const matchType = filterType.value === '全部' || p.type === filterType.value
    const matchSearch = !searchText.value || p.name.includes(searchText.value) || p.description.includes(searchText.value)
    return matchType && matchSearch
  })
})

const typeStats = computed(() => {
  const map = new Map<string, number>()
  pois.value.forEach(p => map.set(p.type, (map.get(p.type) || 0) + 1))
  return Array.from(map.entries()).map(([type, count]) => ({ type, count }))
})

const inlineSvg = (type: string, size = 16) => {
  const raw = SVG_ICONS[type] || SVG_ICONS['地标']
  return raw
    .replace('width="24"', `width="${size}"`)
    .replace('height="24"', `height="${size}"`)
    .replace('stroke="currentColor"', `stroke="${TYPE_COLORS[type] || '#94a3b8'}"`)
}

const columns: DataTableColumns = [
  { title: 'ID', key: 'id', width: 60, align: 'center' },
  {
    title: '名称',
    key: 'name',
    width: 200,
    render: (row: any) => h('span', {
      style: 'font-weight:500;display:flex;align-items:center;gap:6px',
      innerHTML: `${inlineSvg(row.type)} ${escapeHtml(row.name)}`,
    }),
  },
  {
    title: '类型',
    key: 'type',
    width: 120,
    render: (row: any) => h(NTag, {
      size: 'small',
      bordered: false,
      color: { color: TYPE_COLORS[row.type] + '22', textColor: TYPE_COLORS[row.type] },
    }, { default: () => row.type }),
  },
  { title: '描述', key: 'description' },
  { title: '经度', key: 'lng', width: 120, render: (row: any) => row.lng.toFixed(6) },
  { title: '纬度', key: 'lat', width: 120, render: (row: any) => row.lat.toFixed(6) },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row: any) => h(NButton, {
      size: 'small', quaternary: true, type: 'primary',
      onClick: () => router.push({ name: 'map', query: { lng: row.lng, lat: row.lat, zoom: 18, poi: row.name } }),
    }, { default: () => '在地图中查看' }),
  },
]

function escapeHtml(str: string): string {
  const el = document.createElement('span')
  el.textContent = str
  return el.innerHTML
}
</script>

<template>
  <div style="padding: 24px">
    <n-space vertical :size="20">
      <!-- KPI -->
      <n-grid :cols="6" :x-gap="12">
        <n-grid-item v-for="s in typeStats" :key="s.type">
          <n-card size="small">
            <n-statistic :label="s.type" :value="s.count" tabular-nums>
              <template #prefix>
                <span v-html="inlineSvg(s.type, 20)"></span>
              </template>
              <template #suffix>个</template>
            </n-statistic>
          </n-card>
        </n-grid-item>
      </n-grid>

      <!-- 筛选 -->
      <n-card size="small">
        <n-space :size="12" align="center">
          <n-input v-model:value="searchText" placeholder="搜索POI名称/描述" clearable style="width: 240px" size="small">
            <template #prefix>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </template>
          </n-input>
          <n-select v-model:value="filterType" :options="POI_TYPES.map(t => ({ label: t, value: t }))" style="width: 160px" size="small" />
          <n-tag size="small" :bordered="false">共 {{ filteredPois.length }} 条记录</n-tag>
        </n-space>
      </n-card>

      <!-- 数据表格 -->
      <n-card title="POI数据列表">
        <n-data-table :columns="columns" :data="filteredPois" :bordered="false" striped :pagination="{ pageSize: 15 }" size="small" />
      </n-card>
    </n-space>
  </div>
</template>
