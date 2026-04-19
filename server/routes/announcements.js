import { Router } from 'express'
import { queryAll, queryOne, execute, saveDB } from '../db.js'
import { authMiddleware, adminMiddleware } from '../middleware.js'

// Public router — mounted at /api/announcements
export const publicRouter = Router()

// Admin router — mounted at /api/admin/announcements
export const adminRouter = Router()

// Apply auth + admin to all admin routes
adminRouter.use(authMiddleware, adminMiddleware)

// GET /api/announcements — public, active only
publicRouter.get('/', (req, res) => {
  try {
    const announcements = queryAll(
      'SELECT * FROM announcements WHERE active = 1 ORDER BY created_at DESC'
    )
    res.json({ success: true, data: announcements })
  } catch (err) {
    console.error('List announcements error:', err)
    res.status(500).json({ success: false, message: '获取公告列表失败' })
  }
})

// GET /api/admin/announcements — admin, all announcements
adminRouter.get('/', (req, res) => {
  try {
    const announcements = queryAll('SELECT * FROM announcements ORDER BY created_at DESC')
    res.json({ success: true, data: announcements })
  } catch (err) {
    console.error('List all announcements error:', err)
    res.status(500).json({ success: false, message: '获取公告列表失败' })
  }
})

// POST /api/admin/announcements — admin
adminRouter.post('/', (req, res) => {
  try {
    const { title, content, type } = req.body
    if (!title || !content) {
      return res.json({ success: false, message: '标题和内容不能为空' })
    }

    const { lastId } = execute(
      'INSERT INTO announcements (title, content, type, created_by) VALUES (?, ?, ?, ?)',
      [title, content, type || 'info', req.user.id]
    )
    saveDB()

    const announcement = queryOne('SELECT * FROM announcements WHERE id = ?', [lastId])
    res.json({ success: true, data: announcement })
  } catch (err) {
    console.error('Create announcement error:', err)
    res.status(500).json({ success: false, message: '创建公告失败' })
  }
})

// PUT /api/admin/announcements/:id — admin
adminRouter.put('/:id', (req, res) => {
  try {
    const { id } = req.params
    const { title, content, type, active } = req.body

    const existing = queryOne('SELECT id FROM announcements WHERE id = ?', [id])
    if (!existing) {
      return res.json({ success: false, message: '公告不存在' })
    }

    execute(
      'UPDATE announcements SET title = ?, content = ?, type = ?, active = ? WHERE id = ?',
      [title, content, type || 'info', active != null ? active : 1, id]
    )
    saveDB()

    const announcement = queryOne('SELECT * FROM announcements WHERE id = ?', [id])
    res.json({ success: true, data: announcement })
  } catch (err) {
    console.error('Update announcement error:', err)
    res.status(500).json({ success: false, message: '更新公告失败' })
  }
})

// DELETE /api/admin/announcements/:id — admin
adminRouter.delete('/:id', (req, res) => {
  try {
    const { id } = req.params

    const existing = queryOne('SELECT id FROM announcements WHERE id = ?', [id])
    if (!existing) {
      return res.json({ success: false, message: '公告不存在' })
    }

    execute('DELETE FROM announcements WHERE id = ?', [id])
    saveDB()
    res.json({ success: true, message: '删除成功' })
  } catch (err) {
    console.error('Delete announcement error:', err)
    res.status(500).json({ success: false, message: '删除公告失败' })
  }
})
