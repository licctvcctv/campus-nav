import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../views/Layout.vue'),
      children: [
        { path: '', name: 'map', component: () => import('../views/MapView.vue') },
        { path: 'poi', name: 'poi', component: () => import('../views/PoiList.vue') },
        { path: 'stats', name: 'stats', component: () => import('../views/Stats.vue') },
        { path: 'about', name: 'about', component: () => import('../views/About.vue') },
      ],
    },
  ],
})

export default router
