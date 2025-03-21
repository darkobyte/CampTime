import { Router } from 'express'
import { ActivityController } from '../controllers/activityController.js'
import { authMiddleware } from '../middleware/auth.js'
import { stammAuthMiddleware } from '../middleware/stammAuth.js'

export const createActivityRouter = (db) => {
  const router = Router()
  const activityController = new ActivityController(db)
  const auth = authMiddleware(db)
  const stammAuth = stammAuthMiddleware(db)

  router.use(auth)
  router.use(stammAuth)
  router.get('/', activityController.getActivities)
  router.post('/', activityController.createActivity)
  router.get('/:id', activityController.getActivityById)
  router.put('/:id', activityController.updateActivity)
  router.delete('/:id', activityController.deleteActivity)

  return router
}
