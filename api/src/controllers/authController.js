import { AuthService } from '../services/authService.js'

export class AuthController {
  constructor(db) {
    this.authService = new AuthService(db)
  }

  register = async (req, res) => {
    try {
      const user = await this.authService.registerUser(req.body)
      res.status(201).json(user)
    } catch (error) {
      if (error.message === 'Email already registered') {
        res.status(400).json({ error: error.message })
      } else {
        console.error('Registration error:', error)
        res.status(500).json({ error: 'Registration failed' })
      }
    }
  }

  login = async (req, res) => {
    try {
      const user = await this.authService.loginUser(req.body)
      res.json(user)
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        res.status(401).json({ error: error.message })
      } else {
        console.error('Login error:', error)
        res.status(500).json({ error: 'Login failed' })
      }
    }
  }

  validateToken = async (req, res) => {
    try {
      const { token } = req.body
      const user = await this.authService.validateToken(token)
      res.json(user)
    } catch (error) {
      if (error.message === 'Invalid token' || error.message === 'Token expired') {
        res.status(401).json({ error: error.message })
      } else {
        console.error('Token validation error:', error)
        res.status(500).json({ error: 'Token validation failed' })
      }
    }
  }

  logout = async (req, res) => {
    try {
      const { token } = req.body
      await this.authService.logout(token)
      res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
      console.error('Logout error:', error)
      res.status(500).json({ error: 'Logout failed' })
    }
  }
}
