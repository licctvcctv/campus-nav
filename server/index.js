import express from 'express'
import cors from 'cors'
import config from './config.js'
import { initDB, saveDB } from './db.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import poiRoutes from './routes/pois.js'
import { publicRouter as announcementPublicRoutes, adminRouter as announcementAdminRoutes } from './routes/announcements.js'
import { publicRouter as navLogPublicRoutes, adminRouter as navLogAdminRoutes, statsRouter } from './routes/navLogs.js'

const app = express()
const PORT = config.PORT

app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }))
app.use(express.json())

// Auth routes: /api/register, /api/login, /api/me
app.use('/api', authRoutes)

// POI routes: /api/pois
app.use('/api/pois', poiRoutes)

// Announcement routes
app.use('/api/announcements', announcementPublicRoutes)    // GET /api/announcements (public)
app.use('/api/admin/announcements', announcementAdminRoutes) // admin CRUD

// Navigation log routes
app.use('/api/nav-logs', navLogPublicRoutes)       // POST /api/nav-logs (authenticated)
app.use('/api/admin/nav-logs', navLogAdminRoutes)   // GET /api/admin/nav-logs (admin)
app.use('/api/admin/stats', statsRouter)            // GET /api/admin/stats (admin)

// User management routes: /api/admin/users
app.use('/api/admin/users', userRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Campus Nav API is running' })
})

// Initialize database then start server
async function start() {
  try {
    console.log('Starting Campus Nav API server...')
    await initDB()

    app.listen(PORT, () => {
      console.log(`✓ Campus-nav API server running at http://localhost:${PORT}`)
    })

    // Save database periodically (every 5 minutes)
    setInterval(() => {
      saveDB()
    }, 5 * 60 * 1000)

    // Save on shutdown
    process.on('SIGINT', () => {
      console.log('\nSaving database and shutting down...')
      saveDB()
      process.exit(0)
    })

    process.on('SIGTERM', () => {
      console.log('\nSaving database and shutting down...')
      saveDB()
      process.exit(0)
    })

  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
