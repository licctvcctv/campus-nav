import { Router } from 'express'
import { queryAll, queryOne, execute, saveDB } from '../db.js'
import { authMiddleware, adminMiddleware } from '../middleware.js'

const router = Router()

// GET /api/pois — public
router.get('/', (req, res) => {
  try {
    const pois = queryAll('SELECT * FROM pois ORDER BY id')
    res.json({ success: true, data: pois })
  } catch (err) {
    console.error('List POIs error:', err)
    res.status(500).json({ success: false, message: '获取POI列表失败' })
  }
})

// POST /api/pois — admin only
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { name, type, lng, lat, description } = req.body
    if (!name || !type || lng == null || lat == null) {
      return res.json({ success: false, message: '缺少必填字段' })
    }

    const { lastId } = execute(
      'INSERT INTO pois (name, type, lng, lat, description, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [name, type, lng, lat, description || '', req.user.id]
    )
    saveDB()

    const poi = queryOne('SELECT * FROM pois WHERE id = ?', [lastId])
    res.json({ success: true, data: poi })
  } catch (err) {
    console.error('Create POI error:', err)
    res.status(500).json({ success: false, message: '创建POI失败' })
  }
})

// PUT /api/pois/:id — admin only
router.put('/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params
    const { name, type, lng, lat, description } = req.body

    const existing = queryOne('SELECT id FROM pois WHERE id = ?', [id])
    if (!existing) {
      return res.json({ success: false, message: 'POI不存在' })
    }

    execute(
      'UPDATE pois SET name = ?, type = ?, lng = ?, lat = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, type, lng, lat, description || '', id]
    )
    saveDB()

    const poi = queryOne('SELECT * FROM pois WHERE id = ?', [id])
    res.json({ success: true, data: poi })
  } catch (err) {
    console.error('Update POI error:', err)
    res.status(500).json({ success: false, message: '更新POI失败' })
  }
})

// DELETE /api/pois/:id — admin only
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params

    const existing = queryOne('SELECT id FROM pois WHERE id = ?', [id])
    if (!existing) {
      return res.json({ success: false, message: 'POI不存在' })
    }

    execute('DELETE FROM pois WHERE id = ?', [id])
    saveDB()
    res.json({ success: true, message: '删除成功' })
  } catch (err) {
    console.error('Delete POI error:', err)
    res.status(500).json({ success: false, message: '删除POI失败' })
  }
})

export default router
