<script setup lang="ts">
defineProps<{
  is3D: boolean
  showBuildings: boolean
}>()

const emit = defineEmits<{
  toggle3D: []
  toggleBuildings: []
  locateToCenter: []
}>()
</script>

<template>
  <div style="position: absolute; bottom: 24px; right: 16px; z-index: 100">
    <n-card size="small" style="background: rgba(24, 24, 28, 0.92); backdrop-filter: blur(10px)">
      <n-space vertical :size="6" align="center">
        <!-- 2D/3D -->
        <n-tooltip placement="left">
          <template #trigger>
            <n-button circle size="small" :type="is3D ? 'info' : 'default'" @click="emit('toggle3D')">
              <template #icon>
                <svg v-if="is3D" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5"/><path d="M12 12v9"/><path d="M12 12L4 7.5"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18"/><path d="M12 3v18"/></svg>
              </template>
            </n-button>
          </template>
          切换 2D/3D 视图
        </n-tooltip>

        <!-- 建筑开关 -->
        <n-tooltip placement="left">
          <template #trigger>
            <n-button circle size="small" :type="showBuildings ? 'warning' : 'default'" @click="emit('toggleBuildings')">
              <template #icon>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg>
              </template>
            </n-button>
          </template>
          {{ showBuildings ? '隐藏' : '显示' }}3D建筑
        </n-tooltip>

        <n-divider style="margin: 2px 0" />

        <!-- 回到中心 -->
        <n-tooltip placement="left">
          <template #trigger>
            <n-button circle size="small" @click="emit('locateToCenter')">
              <template #icon>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>
              </template>
            </n-button>
          </template>
          回到校园中心
        </n-tooltip>
      </n-space>
    </n-card>
  </div>
</template>
