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
        {
          path: 'admin/users',
          name: 'admin-users',
          component: () => import('../views/admin/UserManage.vue'),
          meta: { admin: true },
        },
        {
          path: 'admin/pois',
          name: 'admin-pois',
          component: () => import('../views/admin/PoiManage.vue'),
          meta: { admin: true },
        },
        {
          path: 'admin/announcements',
          name: 'admin-announcements',
          component: () => import('../views/admin/AnnouncementManage.vue'),
          meta: { admin: true },
        },
        {
          path: 'admin/stats',
          name: 'admin-stats',
          component: () => import('../views/admin/AdminStats.vue'),
          meta: { admin: true },
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const { isLoggedIn, isAdmin } = useAuth()
  if (!to.meta.public && !isLoggedIn.value) {
    return { name: 'login' }
  }
  if (to.name === 'login' && isLoggedIn.value) {
    return { path: '/' }
  }
  if (to.meta.admin && !isAdmin.value) {
    return { path: '/' }
  }
})

export default router
