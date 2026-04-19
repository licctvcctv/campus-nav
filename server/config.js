import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const secretFile = path.join(__dirname, 'data', '.jwt-secret')

// JWT密钥：优先环境变量 → 持久化文件 → 首次启动自动生成并持久化
function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET
  try {
    return fs.readFileSync(secretFile, 'utf-8').trim()
  } catch {
    const secret = crypto.randomBytes(32).toString('hex')
    fs.mkdirSync(path.dirname(secretFile), { recursive: true })
    fs.writeFileSync(secretFile, secret)
    console.log('  Generated new JWT secret')
    return secret
  }
}

export default {
  JWT_SECRET: getJwtSecret(),
  PORT: parseInt(process.env.PORT || '3456'),
  DB_PATH: process.env.DB_PATH || path.join(__dirname, 'data', 'campus.db'),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
}
