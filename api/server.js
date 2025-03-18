import express from 'express'
import mysql from 'mysql2/promise'
import cors from 'cors'
import bcrypt from 'bcrypt'

const app = express()
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'mydb'
}

let db = null

async function initDatabase() {
  const schemas = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      stamm VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  ]

  for (const schema of schemas) {
    await db.query(schema)
  }
  console.log('Database schema initialized')
}

async function connectWithRetry(retries = 5, delay = 5000) {
  while (retries > 0) {
    try {
      db = await mysql.createConnection(dbConfig)
      console.log('Successfully connected to database')
      await initDatabase()
      return true
    } catch (err) {
      retries--
      console.log(`Failed to connect to database. ${retries} retries left. Retrying in ${delay/1000}s...`)
      if (retries === 0) throw err
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, stamm } = req.body

    // Check if user exists
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email])
    if (users.length > 0) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const [result] = await db.query(
      'INSERT INTO users (firstName, lastName, email, password, stamm) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, stamm]
    )

    res.status(201).json({
      id: result.insertId,
      firstName,
      lastName,
      email,
      stamm
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Get user
    const [users] = await db.query(
      'SELECT id, firstName, lastName, email, password, stamm FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = users[0]

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Don't send password back
    delete user.password

    res.json(user)
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

async function startServer() {
  try {
    await connectWithRetry()

    app.get('/', (req, res) => {
      res.sendFile('index.html', { root: './public' })
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

startServer()
