<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { h } from 'vue'
import { NIcon } from 'naive-ui'
import {
  MapOutline,
  ListOutline,
  BarChartOutline,
  InformationCircleOutline,
  SchoolOutline,
  LogOutOutline,
  PersonCircleOutline,
  PeopleOutline,
  LocationOutline,
  MegaphoneOutline,
  StatsChartOutline,
} from '@vicons/ionicons5'
import { useAuth } from '../composables/useAuth'
import { getAnnouncements } from '../services/api'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)
const { username, isAdmin, logout } = useAuth()

const renderIcon = (icon: any) => () => h(NIcon, null, { default: () => h(icon) })

const menuOptions = computed(() => {
  const items: any[] = [
    { label: '校园地图', key: 'map', icon: renderIcon(MapOutline) },
    { label: 'POI管理', key: 'poi', icon: renderIcon(ListOutline) },
    { label: '数据统计', key: 'stats', icon: renderIcon(BarChartOutline) },
    { label: '关于系统', key: 'about', icon: renderIcon(InformationCircleOutline) },
  ]
  if (isAdmin.value) {
    items.push({
      label: '系统管理',
      key: 'admin',
      icon: renderIcon(StatsChartOutline),
      children: [
        { label: '用户管理', key: 'admin-users', icon: renderIcon(PeopleOutline) },
        { label: 'POI管理', key: 'admin-pois', icon: renderIcon(LocationOutline) },
        { label: '公告管理', key: 'admin-announcements', icon: renderIcon(MegaphoneOutline) },
        { label: '系统统计', key: 'admin-stats', icon: renderIcon(StatsChartOutline) },
      ],
    })
  }
  return items
})

const activeKey = computed(() => (route.name as string) || 'map')

const handleMenuUpdate = (key: string) => {
  router.push({ name: key })
}

function handleLogout() {
  logout()
  router.replace('/login')
}

// Announcements
const announcements = ref<any[]>([])
const dismissedIds = ref<Set<number>>(new Set())

onMounted(async () => {
  try {
    const res = await getAnnouncements()
    if (Array.isArray(res)) {
      announcements.value = res.filter((a: any) => a.active !== false)
    } else if (res.data) {
      announcements.value = res.data.filter((a: any) => a.active !== false)
    }
  } catch { /* ignore */ }
})

const visibleAnnouncements = computed(() =>
  announcements.value.filter(a => !dismissedIds.value.has(a.id))
)

function dismissAnnouncement(id: number) {
  dismissedIds.value.add(id)
}

function announcementType(type: string) {
  const map: Record<string, 'info' | 'warning' | 'success' | 'error'> = {
    info: 'info', warning: 'warning', success: 'success', error: 'error',
  }
  return map[type] || 'info'
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
        <div style="display: flex; align-items: center; gap: 12px">
          <n-tag type="info" size="small" :bordered="false">毕业设计</n-tag>
          <n-tag v-if="isAdmin" type="warning" size="small" :bordered="false">管理员</n-tag>
          <div style="display: flex; align-items: center; gap: 8px; color: #94a3b8; font-size: 13px">
            <n-icon :size="18"><PersonCircleOutline /></n-icon>
            <span>{{ username }}</span>
          </div>
          <n-button quaternary size="small" @click="handleLogout">
            <template #icon><n-icon><LogOutOutline /></n-icon></template>
            退出
          </n-button>
        </div>
      </n-layout-header>

      <!-- Announcement banners -->
      <div v-if="visibleAnnouncements.length" style="padding: 8px 24px 0">
        <n-alert
          v-for="ann in visibleAnnouncements"
          :key="ann.id"
          :type="announcementType(ann.type)"
          :title="ann.title"
          closable
          style="margin-bottom: 8px"
          @close="dismissAnnouncement(ann.id)"
        >
          {{ ann.content }}
        </n-alert>
      </div>

      <n-layout-content content-style="height: calc(100vh - 56px);" :native-scrollbar="false">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>
