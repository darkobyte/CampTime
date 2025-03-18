import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'mydb'
}

export const initializeDatabase = async () => {
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
    )`,
    `CREATE TABLE IF NOT EXISTS tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(255) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ]

  const connection = await connectWithRetry()
  for (const schema of schemas) {
    await connection.query(schema)
  }
  console.log('Database schema initialized')
  return connection
}

async function connectWithRetry(retries = 5, delay = 5000) {
  while (retries > 0) {
    try {
      const connection = await mysql.createConnection(dbConfig)
      console.log('Successfully connected to database')
      return connection
    } catch (err) {
      retries--
      console.log(`Failed to connect to database. ${retries} retries left. Retrying in ${delay/1000}s...`)
      if (retries === 0) throw err
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
