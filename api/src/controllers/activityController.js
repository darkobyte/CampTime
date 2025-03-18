import { ActivityService } from '../services/activityService.js'

export class ActivityController {
  constructor(db) {
    this.activityService = new ActivityService(db)
  }

  getActivities = async (req, res) => {
    try {
      const stamm = req.user.stamm
      const activities = await this.activityService.getActivities(stamm)
      res.json(activities)
    } catch (error) {
      console.error('Error fetching activities:', error)
      res.status(500).json({ error: 'Failed to fetch activities' })
    }
  }

  createActivity = async (req, res) => {
    try {
      const activityData = { ...req.body, stamm: req.user.stamm }
      const activity = await this.activityService.createActivity(activityData)
      res.status(201).json(activity)
    } catch (error) {
      console.error('Error creating activity:', error)
      res.status(500).json({ error: 'Failed to create activity' })
    }
  }

  getActivityById = async (req, res) => {
    try {
      const stamm = req.user.stamm
      const activity = await this.activityService.getActivityById(req.params.id, stamm)
      
      if (!activity) {
        return res.status(404).json({ error: 'Activity not found' })
      }
      
      res.json(activity)
    } catch (error) {
      console.error('Error fetching activity:', error)
      res.status(500).json({ error: 'Failed to fetch activity' })
    }
  }

  updateActivity = async (req, res) => {
    try {
      const stamm = req.user.stamm
      const activity = await this.activityService.updateActivity(req.params.id, req.body, stamm)
      res.json(activity)
    } catch (error) {
      console.error('Error updating activity:', error)
      res.status(500).json({ error: 'Failed to update activity' })
    }
  }

  deleteActivity = async (req, res) => {
    try {
      const stamm = req.user.stamm
      await this.activityService.deleteActivity(req.params.id, stamm)
      res.status(204).end()
    } catch (error) {
      console.error('Error deleting activity:', error)
      res.status(500).json({ error: 'Failed to delete activity' })
    }
  }
}
