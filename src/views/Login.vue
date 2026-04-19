<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { SchoolOutline } from '@vicons/ionicons5'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const message = useMessage()
const { login, register } = useAuth()

const tab = ref('login')
const form = ref({ username: '', password: '', confirmPwd: '' })
const loading = ref(false)

async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    return message.warning('请填写用户名和密码')
  }
  loading.value = true
  const res = await login(form.value.username, form.value.password)
  loading.value = false
  if (res.success) {
    message.success('登录成功')
    router.replace('/')
  } else {
    message.error(res.message)
  }
}

async function handleRegister() {
  if (!form.value.username || !form.value.password) {
    return message.warning('请填写用户名和密码')
  }
  if (form.value.password !== form.value.confirmPwd) {
    return message.warning('两次密码不一致')
  }
  loading.value = true
  const res = await register(form.value.username, form.value.password)
  loading.value = false
  if (res.success) {
    message.success('注册成功，已自动登录')
    router.replace('/')
  } else {
    message.error(res.message)
  }
}

function onKeyEnter() {
  tab.value === 'login' ? handleLogin() : handleRegister()
}
</script>

<template>
  <div class="login-page" @keyup.enter="onKeyEnter">
    <div class="login-card-wrapper">
      <n-card class="login-card" :bordered="false">
        <div class="logo-area">
          <div class="logo-icon">
            <n-icon :size="32" color="#fff"><SchoolOutline /></n-icon>
          </div>
          <h2 class="logo-title">校园导航系统</h2>
          <p class="logo-sub">哈尔滨商业大学 · 毕业设计</p>
        </div>

        <n-tabs v-model:value="tab" type="segment" animated>
          <n-tab-pane name="login" tab="登录">
            <n-form style="margin-top: 12px">
              <n-form-item label="用户名">
                <n-input v-model:value="form.username" placeholder="请输入用户名" clearable />
              </n-form-item>
              <n-form-item label="密码">
                <n-input v-model:value="form.password" type="password" show-password-on="click" placeholder="请输入密码" />
              </n-form-item>
              <n-button type="primary" block strong :loading="loading" @click="handleLogin">
                登 录
              </n-button>
            </n-form>
          </n-tab-pane>

          <n-tab-pane name="register" tab="注册">
            <n-form style="margin-top: 12px">
              <n-form-item label="用户名">
                <n-input v-model:value="form.username" placeholder="请输入用户名（至少2位）" clearable />
              </n-form-item>
              <n-form-item label="密码">
                <n-input v-model:value="form.password" type="password" show-password-on="click" placeholder="请输入密码（至少4位）" />
              </n-form-item>
              <n-form-item label="确认密码">
                <n-input v-model:value="form.confirmPwd" type="password" show-password-on="click" placeholder="请再次输入密码" />
              </n-form-item>
              <n-button type="primary" block strong :loading="loading" @click="handleRegister">
                注 册
              </n-button>
            </n-form>
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0c4a6e 100%);
  position: relative;
  overflow: hidden;
}
.login-page::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(circle at 30% 70%, rgba(6,182,212,0.08) 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, rgba(59,130,246,0.06) 0%, transparent 50%);
  animation: drift 20s ease-in-out infinite alternate;
}
@keyframes drift {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(-2%, 2%) rotate(3deg); }
}
.login-card-wrapper { position: relative; z-index: 1; width: 100%; max-width: 400px; padding: 0 16px; }
.login-card {
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 8px 4px;
}
.logo-area { text-align: center; margin-bottom: 20px; }
.logo-icon {
  width: 60px; height: 60px; margin: 0 auto 12px;
  border-radius: 16px;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 24px rgba(6,182,212,0.25);
}
.logo-title { font-size: 20px; font-weight: 700; color: #f1f5f9; margin: 0 0 4px; }
.logo-sub { font-size: 13px; color: #94a3b8; margin: 0; }
</style>
