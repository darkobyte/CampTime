import express from 'express'
import cors from 'cors'
import { initializeDatabase } from './src/config/database.js'
import { createAuthRouter } from './src/routes/authRoutes.js'
import { createGroupRouter } from './src/routes/groupRoutes.js'
import { createMemberRouter } from './src/routes/memberRoutes.js'
import { createActivityRouter } from './src/routes/activityRoutes.js'
import { createMeetingRouter } from './src/routes/meetingRoutes.js'

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(express.static('public'))

async function startServer() {
  try {
    const db = await initializeDatabase()
    
    // Routes
    app.use('/api/auth', createAuthRouter(db))
    app.use('/api/groups', createGroupRouter(db))
    app.use('/api/members', createMemberRouter(db))
    app.use('/api/activities', createActivityRouter(db))
    app.use('/api/meetings', createMeetingRouter(db)) // Add this line

    const PORT = process.env.PORT || 3030
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

startServer()
