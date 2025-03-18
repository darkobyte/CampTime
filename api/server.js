import express from 'express'
import cors from 'cors'
import { initializeDatabase } from './src/config/database.js'
import { createAuthRouter } from './src/routes/authRoutes.js'

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.static('public'))

async function startServer() {
  try {
    const db = await initializeDatabase()
    
    // Routes
    app.use('/api/auth', createAuthRouter(db))

    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

startServer()
