import { Router } from 'express'
import { queryAll, queryOne, execute, saveDB } from '../db.js'
import { authMiddleware, adminMiddleware } from '../middleware.js'

// Public router — mounted at /api/nav-logs
export const publicRouter = Router()

// Admin router — mounted at /api/admin/nav-logs
export const adminRouter = Router()

// Admin stats router — mounted at /api/admin/stats
export const statsRouter = Router()

// POST /api/nav-logs — authenticated
publicRouter.post('/', authMiddleware, (req, res) => {
  try {
    const { start_poi, end_poi, distance, duration } = req.body

    execute(
      'INSERT INTO nav_logs (user_id, start_poi, end_poi, distance, duration) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, start_poi || '', end_poi || '', distance || 0, duration || 0]
    )
    saveDB()

    res.json({ success: true, message: '导航记录已保存' })
  } catch (err) {
    console.error('Create nav log error:', err)
    res.status(500).json({ success: false, message: '保存导航记录失败' })
  }
})

// GET /api/admin/nav-logs — admin
adminRouter.use(authMiddleware, adminMiddleware)
adminRouter.get('/', (req, res) => {
  try {
    const logs = queryAll(`
      SELECT nl.*, u.username
      FROM nav_logs nl
      LEFT JOIN users u ON nl.user_id = u.id
      ORDER BY nl.created_at DESC
      LIMIT 100
    `)
    res.json({ success: true, data: logs })
  } catch (err) {
    console.error('List nav logs error:', err)
    res.status(500).json({ success: false, message: '获取导航记录失败' })
  }
})

// GET /api/admin/stats — admin dashboard stats
statsRouter.use(authMiddleware, adminMiddleware)
statsRouter.get('/', (req, res) => {
  try {
    const totalUsers = queryOne('SELECT COUNT(*) as count FROM users')
    const totalPOIs = queryOne('SELECT COUNT(*) as count FROM pois')
    const totalNavs = queryOne('SELECT COUNT(*) as count FROM nav_logs')

    // Popular routes (top 10)
    const popularRoutes = queryAll(`
      SELECT start_poi, end_poi, COUNT(*) as count
      FROM nav_logs
      GROUP BY start_poi, end_poi
      ORDER BY count DESC
      LIMIT 10
    `)

    // Recent navigations (last 7 days, grouped by day)
    const dailyNavs = queryAll(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM nav_logs
      WHERE created_at >= DATE('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date
    `)

    res.json({
      success: true,
      data: {
        totalUsers: totalUsers.count,
        totalPOIs: totalPOIs.count,
        totalNavigations: totalNavs.count,
        popularRoutes,
        dailyNavs
      }
    })
  } catch (err) {
    console.error('Stats error:', err)
    res.status(500).json({ success: false, message: '获取统计数据失败' })
  }
})
