import { ref, computed } from 'vue'

import { API_BASE } from '../config'

const API = `${API_BASE}/api`
const token = ref(localStorage.getItem('token') || '')
const username = ref(localStorage.getItem('username') || '')
const role = ref(localStorage.getItem('role') || 'user')
const isLoggedIn = ref(!!token.value)

const isAdmin = computed(() => role.value === 'admin')

function setAuth(t: string, u: string, r: string) {
  token.value = t
  username.value = u
  role.value = r || 'user'
  isLoggedIn.value = true
  localStorage.setItem('token', t)
  localStorage.setItem('username', u)
  localStorage.setItem('role', role.value)
}

function clearAuth() {
  token.value = ''
  username.value = ''
  role.value = 'user'
  isLoggedIn.value = false
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('role')
}

export function useAuth() {
  async function login(user: string, pass: string) {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass }),
    })
    const data = await res.json()
    if (data.success) setAuth(data.token, data.username, data.role)
    return data
  }

  async function register(user: string, pass: string) {
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass }),
    })
    const data = await res.json()
    if (data.success) setAuth(data.token, data.username, data.role)
    return data
  }

  async function checkAuth() {
    if (!token.value) return false
    try {
      const res = await fetch(`${API}/me`, {
        headers: { Authorization: `Bearer ${token.value}` },
      })
      const data = await res.json()
      if (!data.success) { clearAuth(); return false }
      username.value = data.username
      role.value = data.role || 'user'
      localStorage.setItem('role', role.value)
      return true
    } catch { clearAuth(); return false }
  }

  function logout() { clearAuth() }

  return { token, username, role, isLoggedIn, isAdmin, login, register, logout, checkAuth }
}
