const BASE = 'http://localhost:3456'

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token') || ''
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function request<T = any>(url: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    ...opts,
    headers: { ...authHeaders(), ...(opts.headers as Record<string, string> || {}) },
  })
  return res.json()
}

// --- Users ---
export const getUsers = () => request('/api/admin/users')
export const updateUser = (id: number, data: Record<string, any>) =>
  request(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteUser = (id: number) =>
  request(`/api/admin/users/${id}`, { method: 'DELETE' })

// --- POIs ---
export const getPois = () => request('/api/pois')
export const createPoi = (data: Record<string, any>) =>
  request('/api/pois', { method: 'POST', body: JSON.stringify(data) })
export const updatePoi = (id: number, data: Record<string, any>) =>
  request(`/api/pois/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deletePoi = (id: number) =>
  request(`/api/pois/${id}`, { method: 'DELETE' })

// --- Announcements ---
export const getAnnouncements = () => request('/api/announcements')
export const getAdminAnnouncements = () => request('/api/admin/announcements')
export const createAnnouncement = (data: Record<string, any>) =>
  request('/api/admin/announcements', { method: 'POST', body: JSON.stringify(data) })
export const updateAnnouncement = (id: number, data: Record<string, any>) =>
  request(`/api/admin/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteAnnouncement = (id: number) =>
  request(`/api/admin/announcements/${id}`, { method: 'DELETE' })

// --- Nav logs & stats ---
export const logNavigation = (data: Record<string, any>) =>
  request('/api/nav-logs', { method: 'POST', body: JSON.stringify(data) })
export const getNavLogs = () => request('/api/admin/nav-logs')
export const getStats = () => request('/api/admin/stats')
