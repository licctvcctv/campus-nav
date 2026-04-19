import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('../views/Layout.vue'),
      children: [
        { path: '', name: 'map', component: () => import('../views/MapView.vue'), meta: { public: true } },
        { path: 'poi', name: 'poi', component: () => import('../views/PoiList.vue'), meta: { public: true } },
        { path: 'stats', name: 'stats', component: () => import('../views/Stats.vue'), meta: { public: true } },
        { path: 'about', name: 'about', component: () => import('../views/About.vue'), meta: { public: true } },
        { path: 'admin/users', name: 'admin-users', component: () => import('../views/admin/UserManage.vue'), meta: { admin: true } },
        { path: 'admin/pois', name: 'admin-pois', component: () => import('../views/admin/PoiManage.vue'), meta: { admin: true } },
        { path: 'admin/announcements', name: 'admin-announcements', component: () => import('../views/admin/AnnouncementManage.vue'), meta: { admin: true } },
        { path: 'admin/stats', name: 'admin-stats', component: () => import('../views/admin/AdminStats.vue'), meta: { admin: true } },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const { isLoggedIn, isAdmin, checkAuth } = useAuth()

  // 非公开页面必须登录
  if (!to.meta.public && !to.meta.admin && !isLoggedIn.value) {
    return { name: 'login' }
  }

  // 管理页面：二次校验token有效性和角色（防止localStorage篡改）
  if (to.meta.admin) {
    if (!isLoggedIn.value) return { name: 'login' }
    const valid = await checkAuth()
    if (!valid || !isAdmin.value) return { path: '/' }
  }

  // 已登录用户跳过登录页
  if (to.name === 'login' && isLoggedIn.value) {
    return { path: '/' }
  }
})

export default router
