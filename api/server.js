import express from 'express'
import mysql from 'mysql2/promise'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'mydb'
}

let db = null

// Function to connect to database with retries
async function connectWithRetry(retries = 5, delay = 5000) {
  while (retries > 0) {
    try {
      db = await mysql.createConnection(dbConfig)
      console.log('Successfully connected to database')
      return true
    } catch (err) {
      retries--
      console.log(`Failed to connect to database. ${retries} retries left. Retrying in ${delay/1000}s...`)
      if (retries === 0) throw err
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// Initialize server only after database connection is established
async function startServer() {
  try {
    await connectWithRetry()

    // Root endpoint
    app.get('/', (req, res) => {
      res.sendFile('index.html', { root: './public' })
    })

    // Test database connection
    app.get('/api/test', async (req, res) => {
      try {
        await db.query('SELECT 1')
        res.json({ message: 'Database connection successful!' })
      } catch (error) {
        res.status(500).json({ error: 'Database connection failed' })
      }
    })

    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })

  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

// Start the server
startServer()
