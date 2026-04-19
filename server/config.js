import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  JWT_SECRET: process.env.JWT_SECRET || 'campus-nav-secret-key-2024',
  PORT: parseInt(process.env.PORT || '3456'),
  DB_PATH: process.env.DB_PATH || path.join(__dirname, 'data', 'campus.db'),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
}
