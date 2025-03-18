import { MemberService } from '../services/memberService.js'

export class MemberController {
  constructor(db) {
    this.memberService = new MemberService(db)
  }

  getMembers = async (req, res) => {
    try {
      const stamm = req.user.stamm
      const members = await this.memberService.getMembers(stamm)
      res.json(members)
    } catch (error) {
      console.error('Error fetching members:', error)
      res.status(500).json({ error: 'Failed to fetch members' })
    }
  }

  createMember = async (req, res) => {
    try {
      const memberData = { ...req.body, stamm: req.user.stamm }
      const member = await this.memberService.createMember(memberData)
      res.status(201).json(member)
    } catch (error) {
      console.error('Error creating member:', error)
      res.status(500).json({ error: 'Failed to create member' })
    }
  }

  deleteMember = async (req, res) => {
    try {
      const stamm = req.user.stamm
      await this.memberService.deleteMember(req.params.id, stamm)
      res.status(204).end()
    } catch (error) {
      console.error('Error deleting member:', error)
      res.status(500).json({ error: 'Failed to delete member' })
    }
  }

  updateMember = async (req, res) => {
    try {
      const stamm = req.user.stamm
      const member = await this.memberService.updateMember(req.params.id, req.body, stamm)
      res.json(member)
    } catch (error) {
      console.error('Error updating member:', error)
      res.status(500).json({ error: 'Failed to update member' })
    }
  }
}
