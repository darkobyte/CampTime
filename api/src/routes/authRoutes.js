import { Router } from 'express'
import { AuthController } from '../controllers/authController.js'

export const createAuthRouter = (db) => {
  const router = Router()
  const authController = new AuthController(db)

  router.post('/register', authController.register)
  router.post('/login', authController.login)
  router.post('/tokencheck', authController.validateToken)
  router.post('/logout', authController.logout)

  return router
}
