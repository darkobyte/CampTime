import { MeetingService } from '../services/meetingService.js'

export class MeetingController {
  constructor(db) {
    this.meetingService = new MeetingService(db)
  }

  getUpcomingMeetings = async (req, res) => {
    try {
      const stamm = req.user.stamm
      const meetings = await this.meetingService.getUpcomingMeetings(stamm)
      res.json(meetings)
    } catch (error) {
      console.error('Error fetching meetings:', error)
      res.status(500).json({ error: 'Failed to fetch meetings' })
    }
  }

  createMeeting = async (req, res) => {
    try {
      const meetingData = { ...req.body, stamm: req.user.stamm }
      const meeting = await this.meetingService.createMeeting(meetingData)
      res.status(201).json(meeting)
    } catch (error) {
      console.error('Error creating meeting:', error)
      res.status(500).json({ error: 'Failed to create meeting' })
    }
  }

  addActivity = async (req, res) => {
    try {
      const { meetingId, activityId } = req.body
      const stamm = req.user.stamm
      const updatedMeetingId = await this.meetingService.addActivityToMeeting(meetingId, activityId, stamm)
      res.json({ meetingId: updatedMeetingId })
    } catch (error) {
      console.error('Error adding activity to meeting:', error)
      res.status(500).json({ error: 'Failed to add activity' })
    }
  }

  cancelMeeting = async (req, res) => {
    try {
      const meetingId = req.params.id
      const stamm = req.user.stamm
      await this.meetingService.cancelMeeting(meetingId, stamm)
      res.status(200).json({ message: 'Meeting cancelled successfully' })
    } catch (error) {
      console.error('Error cancelling meeting:', error)
      res.status(500).json({ error: 'Failed to cancel meeting' })
    }
  }

  clearActivities = async (req, res) => {
    try {
      const meetingId = req.params.id
      const stamm = req.user.stamm
      await this.meetingService.clearActivities(meetingId, stamm)
      res.status(200).json({ message: 'Activities cleared successfully' })
    } catch (error) {
      console.error('Error clearing activities:', error)
      res.status(500).json({ error: 'Failed to clear activities' })
    }
  }
}
