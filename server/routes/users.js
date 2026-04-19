import { Router } from 'express'
import { queryAll, queryOne, execute, saveDB } from '../db.js'
import { authMiddleware, adminMiddleware } from '../middleware.js'

const router = Router()

// All routes require auth + admin
router.use(authMiddleware, adminMiddleware)

// GET /api/admin/users
router.get('/', (req, res) => {
  try {
    const users = queryAll('SELECT id, username, role, created_at FROM users ORDER BY id')
    res.json({ success: true, data: users })
  } catch (err) {
    console.error('List users error:', err)
    res.status(500).json({ success: false, message: '获取用户列表失败' })
  }
})

// PUT /api/admin/users/:id
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    // Prevent self-demotion
    if (Number(id) === req.user.id) {
      return res.json({ success: false, message: '不能修改自己的角色' })
    }

    const user = queryOne('SELECT id FROM users WHERE id = ?', [id])
    if (!user) {
      return res.json({ success: false, message: '用户不存在' })
    }

    if (role && (role === 'admin' || role === 'user')) {
      execute('UPDATE users SET role = ? WHERE id = ?', [role, id])
      saveDB()
    }

    res.json({ success: true, message: '更新成功' })
  } catch (err) {
    console.error('Update user error:', err)
    res.status(500).json({ success: false, message: '更新用户失败' })
  }
})

// DELETE /api/admin/users/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params

    // Prevent self-deletion
    if (Number(id) === req.user.id) {
      return res.json({ success: false, message: '不能删除自己' })
    }

    const user = queryOne('SELECT id FROM users WHERE id = ?', [id])
    if (!user) {
      return res.json({ success: false, message: '用户不存在' })
    }

    execute('DELETE FROM users WHERE id = ?', [id])
    saveDB()
    res.json({ success: true, message: '删除成功' })
  } catch (err) {
    console.error('Delete user error:', err)
    res.status(500).json({ success: false, message: '删除用户失败' })
  }
})

export default router
