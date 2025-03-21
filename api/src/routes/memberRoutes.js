import { Router } from 'express'
import { MemberController } from '../controllers/memberController.js'
import { authMiddleware } from '../middleware/auth.js'
import { stammAuthMiddleware } from '../middleware/stammAuth.js'

export const createMemberRouter = (db) => {
  const router = Router()
  const memberController = new MemberController(db)
  const auth = authMiddleware(db)
  const stammAuth = stammAuthMiddleware(db)

  router.use(auth)
  router.use(stammAuth)
  router.get('/', memberController.getMembers)
  router.post('/', memberController.createMember)
  router.put('/:id', memberController.updateMember)
  router.delete('/:id', memberController.deleteMember)

  return router
}
