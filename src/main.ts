import { createApp } from 'vue'
import naive from 'naive-ui'
import App from './App.vue'
import router from './router'
import { useAuth } from './composables/useAuth'
import './style.css'

const app = createApp(App)
app.use(router)
app.use(naive)

// 应用启动时校验 token 有效性（过期/被降权自动清除）
const { checkAuth } = useAuth()
checkAuth().finally(() => {
  app.mount('#app')
})
