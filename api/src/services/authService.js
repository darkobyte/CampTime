import bcrypt from 'bcrypt'
import crypto from 'crypto'

export class AuthService {
  constructor(db) {
    this.db = db
  }

  async registerUser(userData) {
    const { firstName, lastName, email, password, stamm } = userData

    // Check if user exists
    const [users] = await this.db.query('SELECT id FROM users WHERE email = ?', [email])
    if (users.length > 0) {
      throw new Error('Email already registered')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with null stamm
    const [result] = await this.db.query(
      'INSERT INTO users (firstName, lastName, email, password, stamm) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, null]
    )

    return {
      id: result.insertId,
      firstName,
      lastName,
      email,
      stamm: null
    }
  }

  async loginUser({ email, password }) {
    const [users] = await this.db.query(
      'SELECT id, firstName, lastName, email, password, stamm FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      throw new Error('Invalid credentials')
    }

    const user = users[0]
    const validPassword = await bcrypt.compare(password, user.password)
    
    if (!validPassword) {
      throw new Error('Invalid credentials')
    }

    // Delete any existing tokens for this user
    await this.db.query('DELETE FROM tokens WHERE user_id = ?', [user.id])

    // Generate new token
    const token = crypto.randomBytes(64).toString('hex')
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30)

    // Save new token
    await this.db.query(
      'INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiryDate]
    )

    delete user.password
    user.token = token
    return user
  }

  async validateToken(token) {
    if (!token) {
      throw new Error('Token is required')
    }

    const [rows] = await this.db.query(`
      SELECT u.id, u.firstName, u.lastName, u.email, u.stamm, t.expires_at
      FROM users u
      JOIN tokens t ON u.id = t.user_id
      WHERE t.token = ?
      AND t.expires_at > NOW()
    `, [token])

    if (rows.length === 0) {
      throw new Error('Invalid or expired token')
    }

    const user = rows[0]
    delete user.expires_at
    return user
  }

  async logout(token) {
    await this.db.query('DELETE FROM tokens WHERE token = ?', [token])
  }
}
