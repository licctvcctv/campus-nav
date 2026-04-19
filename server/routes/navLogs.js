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
// Frontend sends: { start_name, end_name, start_poi_id, end_poi_id, distance }
// DB columns:     user_id, start_poi, end_poi, distance, duration
publicRouter.post('/', authMiddleware, (req, res) => {
  try {
    const { start_name, end_name, start_poi, end_poi, start_poi_id, end_poi_id, distance, duration } = req.body

    // Accept both frontend naming (start_name/end_name) and direct naming (start_poi/end_poi)
    const startPoi = start_name || start_poi || ''
    const endPoi = end_name || end_poi || ''

    execute(
      'INSERT INTO nav_logs (user_id, start_poi, end_poi, distance, duration) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, startPoi, endPoi, distance || 0, duration || 0]
    )
    saveDB()

    res.json({ success: true, message: '导航记录已保存' })
  } catch (err) {
    console.error('Create nav log error:', err)
    res.status(500).json({ success: false, message: '保存导航记录失败' })
  }
})

// GET /api/admin/nav-logs — admin
// Frontend table expects: id, username, start_name, end_name, distance, created_at
adminRouter.use(authMiddleware, adminMiddleware)
adminRouter.get('/', (req, res) => {
  try {
    const logs = queryAll(`
      SELECT nl.id, nl.user_id, nl.start_poi, nl.end_poi, nl.distance, nl.duration, nl.created_at,
             u.username,
             nl.start_poi as start_name,
             nl.end_poi as end_name
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
// Frontend expects: totalUsers, totalPois, totalNavigations, todayNavigations,
//                   navTrend (array of {date, count}), popularPois (array of {name, count}),
//                   userTrend (array of {date, count})
statsRouter.use(authMiddleware, adminMiddleware)
statsRouter.get('/', (req, res) => {
  try {
    const totalUsers = queryOne('SELECT COUNT(*) as count FROM users')
    const totalPOIs = queryOne('SELECT COUNT(*) as count FROM pois')
    const totalNavs = queryOne('SELECT COUNT(*) as count FROM nav_logs')
    const todayNavs = queryOne("SELECT COUNT(*) as count FROM nav_logs WHERE DATE(created_at) = DATE('now')")

    // Navigation trend (last 7 days)
    const navTrend = queryAll(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM nav_logs
      WHERE created_at >= DATE('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date
    `)

    // Popular destinations (top 5 end_poi by count)
    const popularPois = queryAll(`
      SELECT end_poi as name, COUNT(*) as count
      FROM nav_logs
      WHERE end_poi != ''
      GROUP BY end_poi
      ORDER BY count DESC
      LIMIT 5
    `)

    // Popular routes (top 5 start→end pairs)
    const popularRoutes = queryAll(`
      SELECT start_poi || ' → ' || end_poi as route, COUNT(*) as count
      FROM nav_logs
      GROUP BY start_poi, end_poi
      ORDER BY count DESC
      LIMIT 5
    `)

    // User registration trend (last 7 days)
    const userTrend = queryAll(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= DATE('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date
    `)

    // Recent navigation logs with username
    const recentLogs = queryAll(`
      SELECT nl.id, nl.start_poi, nl.end_poi, nl.distance, nl.created_at,
             u.username,
             nl.start_poi as start_name,
             nl.end_poi as end_name
      FROM nav_logs nl
      LEFT JOIN users u ON nl.user_id = u.id
      ORDER BY nl.created_at DESC
      LIMIT 20
    `)

    // Daily navs (alias kept for backward compatibility)
    const dailyNavs = navTrend

    res.json({
      success: true,
      data: {
        totalUsers: totalUsers.count,
        totalPois: totalPOIs.count,
        totalPOIs: totalPOIs.count,
        totalNavigations: totalNavs.count,
        todayNavigations: todayNavs.count,
        navTrend,
        dailyNavs,
        popularPois,
        popularRoutes,
        userTrend,
        recentLogs
      }
    })
  } catch (err) {
    console.error('Stats error:', err)
    res.status(500).json({ success: false, message: '获取统计数据失败' })
  }
})
