import { AuthService } from '../services/authService.js'

export const authMiddleware = (db) => {
  const authService = new AuthService(db)
  
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization

      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' })
      }

      const token = authHeader.split(' ')[1]
      const user = await authService.validateToken(token)
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      req.user = user
      next()
    } catch (error) {
      res.status(401).json({ error: error.message || 'Invalid token' })
    }
  }
}
