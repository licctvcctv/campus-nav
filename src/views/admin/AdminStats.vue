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

const totalUsers = computed(() => stats.value.totalUsers || 0)
const totalPois = computed(() => stats.value.totalPOIs || 0)
const totalNavs = computed(() => stats.value.totalNavigations || 0)
const todayNavs = computed(() => stats.value.todayNavigations || 0)

// Daily navigation trend chart
const navTrendOption = computed(() => {
  const trend = stats.value.dailyNavs || []
  if (!trend.length) return null
  return {
    title: { text: '导航趋势（近7天）', left: 'center', textStyle: { color: '#e5e7eb', fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 50, bottom: 30 },
    xAxis: { type: 'category', data: trend.map((d: any) => d.date), axisLabel: { color: '#94a3b8' } },
    yAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.3)' } } },
    series: [{ type: 'line', data: trend.map((d: any) => d.count), smooth: true, areaStyle: { opacity: 0.15 }, lineStyle: { color: '#3b82f6' }, itemStyle: { color: '#3b82f6' } }],
  }
})

// Popular routes bar chart
const popularRoutesOption = computed(() => {
  const popular = stats.value.popularRoutes || []
  if (!popular.length) return null
  return {
    title: { text: '热门路线', left: 'center', textStyle: { color: '#e5e7eb', fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 100, right: 20, top: 50, bottom: 30 },
    xAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.3)' } } },
    yAxis: { type: 'category', data: popular.map((p: any) => p.route), axisLabel: { color: '#94a3b8' } },
    series: [{ type: 'bar', data: popular.map((p: any) => p.count), barWidth: '60%', itemStyle: { color: '#22c55e', borderRadius: [0, 4, 4, 0] } }],
  }
})

// Recent logs from stats response
const recentLogs = computed(() => {
  return stats.value.recentLogs || []
})

const logColumns: DataTableColumns = [
  { title: '用户', key: 'username', width: 120 },
  { title: '起点', key: 'start_poi', width: 160 },
  { title: '终点', key: 'end_poi', width: 160 },
  { title: '距离', key: 'distance', width: 100, render: (row: any) => row.distance ? `${row.distance}m` : '-' },
  { title: '时间', key: 'created_at', width: 180, render: (row: any) => row.created_at ? new Date(row.created_at).toLocaleString() : '-' },
]

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
          <n-card>
            <EChart v-if="navTrendOption" :option="navTrendOption" height="300px" />
            <n-empty v-else description="暂无数据" />
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card>
            <EChart v-if="popularRoutesOption" :option="popularRoutesOption" height="300px" />
            <n-empty v-else description="暂无数据" />
          </n-card>
        </n-grid-item>
      </n-grid>

      <!-- Recent nav logs -->
      <n-card title="最近导航记录">
        <template v-if="recentLogs.length || navLogs.length">
          <n-data-table
            :columns="logColumns"
            :data="recentLogs.length ? recentLogs : navLogs"
            :loading="loading"
            :bordered="false"
            striped
            :pagination="{ pageSize: 10 }"
            size="small"
          />
        </template>
        <n-empty v-else description="暂无数据" />
      </n-card>
    </n-space>
  </div>
</template>
