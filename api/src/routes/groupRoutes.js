import { Router } from 'express'
import { GroupController } from '../controllers/groupController.js'
import { authMiddleware } from '../middleware/auth.js'
import { stammAuthMiddleware } from '../middleware/stammAuth.js'

export const createGroupRouter = (db) => {
  const router = Router()
  const groupController = new GroupController(db)
  const auth = authMiddleware(db)
  const stammAuth = stammAuthMiddleware(db)

  router.use(auth)
  router.use(stammAuth)  // Add stamm check
  router.get('/', groupController.getGroups)
  router.get('/:id', groupController.getGroupById)
  router.post('/', groupController.createGroup)
  router.put('/:id', groupController.updateGroup)

  return router
}
