<script setup lang="ts">
const legendItems: [string, string][] = [
  ['教学楼', '#3b82f6'],
  ['图书馆', '#f59e0b'],
  ['食堂', '#ef4444'],
  ['宿舍', '#8b5cf6'],
  ['校园建筑', '#06b6d4'],
  ['其他', '#64748b'],
]
</script>

<template>
  <div style="position: absolute; bottom: 24px; left: 16px; z-index: 100">
    <n-card size="small" style="background: rgba(24, 24, 28, 0.88); backdrop-filter: blur(10px); font-size: 11px">
      <template #header><span style="font-size: 11px">3D建筑（OSM真实轮廓 · 50栋）</span></template>
      <n-space :size="8" style="flex-wrap: wrap">
        <span v-for="[label, color] in legendItems" :key="label" style="display: flex; align-items: center; gap: 4px">
          <span :style="{ width: '8px', height: '8px', borderRadius: '2px', background: color, display: 'inline-block' }"></span>
          {{ label }}
        </span>
      </n-space>
    </n-card>
  </div>
</template>
