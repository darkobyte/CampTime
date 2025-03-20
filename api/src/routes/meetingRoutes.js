import { Router } from 'express'
import { MeetingController } from '../controllers/meetingController.js'
import { authMiddleware } from '../middleware/auth.js'

export const createMeetingRouter = (db) => {
  const router = Router()
  const meetingController = new MeetingController(db)
  const auth = authMiddleware(db)

  router.use(auth)
  router.get('/', meetingController.getUpcomingMeetings)
  router.post('/', meetingController.createMeeting)
  router.post('/activity', meetingController.addActivity)
  router.post('/:id/cancel', meetingController.cancelMeeting)
  router.delete('/:id/activities', meetingController.clearActivities)

  return router
}
