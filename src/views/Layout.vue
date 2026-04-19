<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { h } from 'vue'
import { NIcon } from 'naive-ui'
import {
  MapOutline,
  ListOutline,
  BarChartOutline,
  InformationCircleOutline,
  SchoolOutline,
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)

const renderIcon = (icon: any) => () => h(NIcon, null, { default: () => h(icon) })

const menuOptions = [
  { label: '校园地图', key: 'map', icon: renderIcon(MapOutline) },
  { label: 'POI管理', key: 'poi', icon: renderIcon(ListOutline) },
  { label: '数据统计', key: 'stats', icon: renderIcon(BarChartOutline) },
  { label: '关于系统', key: 'about', icon: renderIcon(InformationCircleOutline) },
]

const activeKey = computed(() => (route.name as string) || 'map')

const handleMenuUpdate = (key: string) => {
  router.push({ name: key })
}
</script>

<template>
  <n-layout has-sider style="height: 100vh">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="220"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div style="padding: 16px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.09)">
        <div style="min-width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #06b6d4, #3b82f6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 14px">
          <n-icon :size="20"><SchoolOutline /></n-icon>
        </div>
        <span v-if="!collapsed" style="font-size: 14px; font-weight: 600; white-space: nowrap">校园导航系统</span>
      </div>
      <n-menu
        :options="menuOptions"
        :value="activeKey"
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="20"
        @update:value="handleMenuUpdate"
      />
    </n-layout-sider>

    <n-layout>
      <n-layout-header bordered style="height: 56px; padding: 0 24px; display: flex; align-items: center; justify-content: space-between">
        <span style="font-size: 16px; font-weight: 600">
          哈尔滨商业大学 - 校园导航与POI查询系统
        </span>
        <n-tag type="info" size="small" :bordered="false">GIS课程设计</n-tag>
      </n-layout-header>

      <n-layout-content content-style="height: calc(100vh - 56px);" :native-scrollbar="false">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>
