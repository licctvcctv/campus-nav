import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { queryOne, queryAll, execute, saveDB } from '../db.js'
import { authMiddleware, JWT_SECRET } from '../middleware.js'

const router = Router()

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.json({ success: false, message: '用户名和密码不能为空' })
    }
    if (username.length < 2 || password.length < 4) {
      return res.json({ success: false, message: '用户名至少2位，密码至少4位' })
    }

    // Check if username exists
    const existing = queryOne('SELECT id FROM users WHERE username = ?', [username])
    if (existing) {
      return res.json({ success: false, message: '用户名已存在' })
    }

    // First user becomes admin
    const userCount = queryOne('SELECT COUNT(*) as count FROM users')
    const role = userCount.count === 0 ? 'admin' : 'user'

    const hash = await bcrypt.hash(password, 10)
    const { lastId } = execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hash, role]
    )
    saveDB()

    const token = jwt.sign({ id: lastId, username }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ success: true, token, username, role })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ success: false, message: '注册失败' })
  }
})

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.json({ success: false, message: '用户名和密码不能为空' })
    }

    const user = queryOne('SELECT * FROM users WHERE username = ?', [username])
    if (!user) {
      return res.json({ success: false, message: '用户不存在' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.json({ success: false, message: '密码错误' })
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ success: true, token, username: user.username, role: user.role })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ success: false, message: '登录失败' })
  }
})

// GET /api/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    id: req.user.id,
    username: req.user.username,
    role: req.user.role
  })
})

export default router
