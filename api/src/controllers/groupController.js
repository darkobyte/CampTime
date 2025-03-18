import { GroupService } from '../services/groupService.js'

export class GroupController {
  constructor(db) {
    this.groupService = new GroupService(db)
  }

  getGroups = async (req, res) => {
    try {
      const stamm = req.user.stamm
      const groups = await this.groupService.getGroups(stamm)
      res.json(groups)
    } catch (error) {
      console.error('Error fetching groups:', error)
      res.status(500).json({ error: 'Failed to fetch groups' })
    }
  }

  getGroupById = async (req, res) => {
    try {
      const stamm = req.user.stamm
      const group = await this.groupService.getGroupById(req.params.id, stamm)
      
      if (!group) {
        return res.status(404).json({ error: 'Group not found' })
      }
      
      res.json(group)
    } catch (error) {
      console.error('Error fetching group:', error)
      res.status(500).json({ error: 'Failed to fetch group' })
    }
  }

  createGroup = async (req, res) => {
    try {
      const groupData = { ...req.body, stamm: req.user.stamm }
      const group = await this.groupService.createGroup(groupData)
      res.status(201).json(group)
    } catch (error) {
      console.error('Error creating group:', error)
      res.status(500).json({ error: 'Failed to create group' })
    }
  }

  updateGroup = async (req, res) => {
    try {
      const stamm = req.user.stamm
      const group = await this.groupService.updateGroup(req.params.id, req.body, stamm)
      res.json(group)
    } catch (error) {
      if (error.message === 'Group not found') {
        res.status(404).json({ error: error.message })
      } else {
        console.error('Error updating group:', error)
        res.status(500).json({ error: 'Failed to update group' })
      }
    }
  }
}
