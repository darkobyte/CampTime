export class MemberService {
  constructor(db) {
    this.db = db
  }

  async getMembers(stamm) {
    const [members] = await this.db.query(
      `SELECT m.*, g.name as groupName, g.id as groupId
       FROM members m
       LEFT JOIN group_members gm ON m.id = gm.member_id
       LEFT JOIN groups g ON gm.group_id = g.id
       WHERE m.stamm = ?`,
      [stamm]
    )
    return members
  }

  async createMember(memberData) {
    const { firstName, lastName, email, phone, groupId, stamm } = memberData

    try {
      await this.db.query('START TRANSACTION')

      // Create member
      const [result] = await this.db.query(
        `INSERT INTO members 
         (firstName, lastName, email, phone, group_id, stamm) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [firstName, lastName, email, phone, groupId || null, stamm]
      )

      const memberId = result.insertId

      // If a group is specified, add to group_members
      if (groupId) {
        await this.db.query(
          `INSERT INTO group_members (group_id, member_id) 
           VALUES (?, ?)`,

          [groupId, memberId]
        )
      }

      await this.db.query('COMMIT')

      return {
        id: memberId,
        ...memberData
      }
    } catch (error) {
      await this.db.query('ROLLBACK')
      throw error
    }
  }

  async deleteMember(id, stamm) {
    await this.db.query(
      'DELETE FROM members WHERE id = ? AND stamm = ?',
      [id, stamm]
    )
  }

  async updateMember(id, memberData, stamm) {
    const { firstName, lastName, email, phone, groupId } = memberData

    try {
      await this.db.query('START TRANSACTION')

      await this.db.query(
        `UPDATE members 
         SET firstName = ?, lastName = ?, email = ?, phone = ?, group_id = ?
         WHERE id = ? AND stamm = ?`,
        [firstName, lastName, email, phone, groupId || null, id, stamm]
      )

      // Remove existing group membership
      await this.db.query('DELETE FROM group_members WHERE member_id = ?', [id])

      // Add new group membership if specified
      if (groupId) {
        await this.db.query(
          'INSERT INTO group_members (group_id, member_id) VALUES (?, ?)',
          [groupId, id]
        )
      }

      await this.db.query('COMMIT')
      
      return {
        id,
        firstName,
        lastName,
        email,
        phone,
        groupId,
        stamm
      }
    } catch (error) {
      await this.db.query('ROLLBACK')
      throw error
    }
  }
}
