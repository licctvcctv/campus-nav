<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import EChart from '../../components/EChart.vue'
import { getStats, getNavLogs } from '../../services/api'

const message = useMessage()
const stats = ref<any>({})
const navLogs = ref<any[]>([])
const loading = ref(false)

async function fetchData() {
  loading.value = true
  try {
    const [statsRes, logsRes] = await Promise.all([getStats(), getNavLogs()])
    stats.value = statsRes.data || statsRes || {}
    const logs = logsRes.data || logsRes || []
    navLogs.value = Array.isArray(logs) ? logs.slice(0, 20) : []
  } catch { message.error('获取统计数据失败') }
  loading.value = false
}

// KPI values
const totalUsers = computed(() => stats.value.totalUsers || 0)
const totalPois = computed(() => stats.value.totalPois || 0)
const totalNavs = computed(() => stats.value.totalNavigations || 0)
const todayNavs = computed(() => stats.value.todayNavigations || 0)

// Navigation trend chart (last 7 days)
const navTrendOption = computed(() => {
  const trend = stats.value.navTrend || []
  const days = trend.length ? trend.map((d: any) => d.date) : getLast7Days()
  const values = trend.length ? trend.map((d: any) => d.count) : generateMockData()
  return {
    title: { text: '导航趋势（近7天）', left: 'center', textStyle: { color: '#e5e7eb', fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 50, bottom: 30 },
    xAxis: { type: 'category', data: days, axisLabel: { color: '#94a3b8' } },
    yAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.3)' } } },
    series: [{ type: 'line', data: values, smooth: true, areaStyle: { opacity: 0.15 }, lineStyle: { color: '#3b82f6' }, itemStyle: { color: '#3b82f6' } }],
  }
})

// Popular POIs bar chart
const popularPoisOption = computed(() => {
  const popular = stats.value.popularPois || []
  const names = popular.length ? popular.map((p: any) => p.name) : ['图书馆', '食堂A', '教学楼B', '体育馆', '宿舍']
  const values = popular.length ? popular.map((p: any) => p.count) : [42, 35, 28, 20, 15]
  return {
    title: { text: '热门目的地', left: 'center', textStyle: { color: '#e5e7eb', fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 80, right: 20, top: 50, bottom: 30 },
    xAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.3)' } } },
    yAxis: { type: 'category', data: names, axisLabel: { color: '#94a3b8' } },
    series: [{ type: 'bar', data: values, barWidth: '60%', itemStyle: { color: '#22c55e', borderRadius: [0, 4, 4, 0] } }],
  }
})

// User registration trend
const userTrendOption = computed(() => {
  const trend = stats.value.userTrend || []
  const days = trend.length ? trend.map((d: any) => d.date) : getLast7Days()
  const values = trend.length ? trend.map((d: any) => d.count) : [2, 1, 3, 0, 2, 1, 4]
  return {
    title: { text: '用户注册趋势', left: 'center', textStyle: { color: '#e5e7eb', fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 50, bottom: 30 },
    xAxis: { type: 'category', data: days, axisLabel: { color: '#94a3b8' } },
    yAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.3)' } } },
    series: [{ type: 'bar', data: values, barWidth: '50%', itemStyle: { color: '#8b5cf6', borderRadius: [4, 4, 0, 0] } }],
  }
})

const logColumns: DataTableColumns = [
  { title: 'ID', key: 'id', width: 60, align: 'center' },
  { title: '用户', key: 'username', width: 120 },
  { title: '起点', key: 'start_name', width: 160 },
  { title: '终点', key: 'end_name', width: 160 },
  { title: '距离', key: 'distance', width: 100, render: (row: any) => row.distance ? `${row.distance}m` : '-' },
  { title: '时间', key: 'created_at', width: 180, render: (row: any) => row.created_at ? new Date(row.created_at).toLocaleString() : '-' },
]

function getLast7Days() {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    days.push(`${d.getMonth() + 1}/${d.getDate()}`)
  }
  return days
}

function generateMockData() {
  return Array.from({ length: 7 }, () => Math.floor(Math.random() * 30) + 5)
}

onMounted(fetchData)
</script>

<template>
  <div style="padding: 24px">
    <n-space vertical :size="20">
      <!-- KPI Cards -->
      <n-grid :cols="4" :x-gap="16">
        <n-grid-item>
          <n-card size="small"><n-statistic label="用户总数" :value="totalUsers" /></n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card size="small"><n-statistic label="POI总数" :value="totalPois" /></n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card size="small"><n-statistic label="导航总次数" :value="totalNavs" /></n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card size="small"><n-statistic label="今日导航" :value="todayNavs" /></n-card>
        </n-grid-item>
      </n-grid>

      <!-- Charts -->
      <n-grid :cols="2" :x-gap="16">
        <n-grid-item>
          <n-card><EChart :option="navTrendOption" height="300px" /></n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card><EChart :option="popularPoisOption" height="300px" /></n-card>
        </n-grid-item>
      </n-grid>

      <n-card>
        <EChart :option="userTrendOption" height="280px" />
      </n-card>

      <!-- Recent nav logs -->
      <n-card title="最近导航记录">
        <n-data-table :columns="logColumns" :data="navLogs" :loading="loading" :bordered="false" striped :pagination="{ pageSize: 10 }" size="small" />
      </n-card>
    </n-space>
  </div>
</template>
