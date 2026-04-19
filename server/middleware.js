import jwt from 'jsonwebtoken'
import { queryOne } from './db.js'

const JWT_SECRET = 'campus-nav-secret-key-2024'

export { JWT_SECRET }

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未登录' })
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET)
    // Fetch fresh user data from DB
    const user = queryOne('SELECT id, username, role FROM users WHERE id = ?', [decoded.id])
    if (!user) {
      return res.status(401).json({ success: false, message: '用户不存在' })
    }
    req.user = user
    next()
  } catch {
    res.status(401).json({ success: false, message: 'token已过期' })
  }
}

export function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: '需要管理员权限' })
  }
  next()
}
