import { Router } from 'express'
import { ActivityController } from '../controllers/activityController.js'
import { authMiddleware } from '../middleware/auth.js'

export const createActivityRouter = (db) => {
  const router = Router()
  const activityController = new ActivityController(db)
  const auth = authMiddleware(db)

  router.use(auth)
  router.get('/', activityController.getActivities)
  router.post('/', activityController.createActivity)
  router.get('/:id', activityController.getActivityById)
  router.put('/:id', activityController.updateActivity)
  router.delete('/:id', activityController.deleteActivity)

  return router
}
