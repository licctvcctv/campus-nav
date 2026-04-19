<script setup lang="ts">
defineProps<{
  poiOptions: Array<{ label: string; value: number }>
  routeInfo: string
  routeSteps: string[]
}>()

const startPoint = defineModel<number | null>('startPoint', { required: true })
const endPoint = defineModel<number | null>('endPoint', { required: true })

const emit = defineEmits<{
  planRoute: []
  resetRoute: []
  swapPoints: []
}>()
</script>

<template>
  <n-card
    size="small"
    :bordered="true"
    style="margin-top: 12px; background: rgba(24, 24, 28, 0.92); backdrop-filter: blur(10px)"
  >
    <template #header>
      <div style="display: flex; align-items: center; gap: 6px; font-size: 13px">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
        路径规划
      </div>
    </template>
    <n-space vertical :size="10">
      <div style="display: flex; align-items: center; gap: 6px">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e; flex-shrink: 0"></div>
        <n-select
          v-model:value="startPoint"
          :options="poiOptions"
          placeholder="选择起点"
          size="small"
          filterable
          clearable
          style="flex: 1"
        />
      </div>

      <!-- 交换按钮 -->
      <div style="display: flex; justify-content: center">
        <n-button quaternary circle size="tiny" @click="emit('swapPoints')" title="交换起终点">
          <template #icon>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="7 3 7 9 1 9" /><path d="M21 21 7 7" /><polyline points="17 21 17 15 23 15" /><path d="M3 3l14 14" />
            </svg>
          </template>
        </n-button>
      </div>

      <div style="display: flex; align-items: center; gap: 6px">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; flex-shrink: 0"></div>
        <n-select
          v-model:value="endPoint"
          :options="poiOptions"
          placeholder="选择终点"
          size="small"
          filterable
          clearable
          style="flex: 1"
        />
      </div>

      <n-space :size="8">
        <n-button type="primary" size="small" :disabled="!startPoint || !endPoint" @click="emit('planRoute')">
          开始规划
        </n-button>
        <n-button size="small" @click="emit('resetRoute')">重置</n-button>
      </n-space>

      <!-- 路线结果 -->
      <n-alert v-if="routeInfo" type="success" :bordered="false" size="small">
        {{ routeInfo }}
      </n-alert>

      <!-- 路线步骤 -->
      <div v-if="routeSteps.length" style="font-size: 12px; color: #94a3b8">
        <div
          v-for="(step, i) in routeSteps"
          :key="i"
          style="display: flex; align-items: center; gap: 6px; padding: 3px 0"
        >
          <div :style="{
            width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: '600', color: 'white',
            background: i === 0 ? '#22c55e' : i === routeSteps.length - 1 ? '#ef4444' : '#3b82f6',
          }">
            {{ i === 0 ? '起' : i === routeSteps.length - 1 ? '终' : i }}
          </div>
          <span>{{ step }}</span>
        </div>
      </div>
    </n-space>
  </n-card>
</template>
