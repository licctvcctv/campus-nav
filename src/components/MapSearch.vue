<script setup lang="ts">
import { POI_TYPES } from '../data/pois'

const searchText = defineModel<string>('searchText', { required: true })
const selectedType = defineModel<string>('selectedType', { required: true })
</script>

<template>
  <n-card size="small" :bordered="true" style="background: rgba(24, 24, 28, 0.92); backdrop-filter: blur(10px)">
    <n-space vertical :size="12">
      <n-input v-model:value="searchText" placeholder="搜索POI（名称/描述）" clearable size="small">
        <template #prefix>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </template>
      </n-input>
      <n-space :size="6" style="flex-wrap: wrap">
        <n-tag
          v-for="t in POI_TYPES"
          :key="t"
          :type="selectedType === t ? 'info' : 'default'"
          :bordered="selectedType !== t"
          size="small"
          style="cursor: pointer"
          @click="selectedType = t"
        >{{ t }}</n-tag>
      </n-space>
    </n-space>
  </n-card>
</template>
