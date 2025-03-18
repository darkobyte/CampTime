export class GroupService {
  constructor(db) {
    this.db = db
  }

  async getGroups(stamm) {
    const [groups] = await this.db.query(
      `SELECT g.*, COALESCE(COUNT(DISTINCT m.id), 0) as memberCount
       FROM groups g
       LEFT JOIN group_members m ON g.id = m.group_id
       WHERE g.stamm = ?
       GROUP BY g.id`,
      [stamm]
    )

    for (let group of groups) {
      const [leaders] = await this.db.query(
        `SELECT firstName, lastName 
         FROM group_leaders 
         WHERE group_id = ?`,
        [group.id]
      )
      group.leaders = leaders
      group.meetingTime = JSON.parse(group.meetingTime)
    }

    return groups
  }

  async getGroupById(id, stamm) {
    const [groups] = await this.db.query(
      `SELECT g.*, COALESCE(COUNT(DISTINCT m.id), 0) as memberCount
       FROM groups g
       LEFT JOIN group_members m ON g.id = m.group_id
       WHERE g.id = ? AND g.stamm = ?
       GROUP BY g.id`,
      [id, stamm]
    )

    if (groups.length === 0) {
      return null
    }

    const group = groups[0]
    const [leaders] = await this.db.query(
      `SELECT firstName, lastName 
       FROM group_leaders 
       WHERE group_id = ?`,
      [id]
    )
    
    group.leaders = leaders
    group.meetingTime = JSON.parse(group.meetingTime)
    return group
  }

  async createGroup(groupData) {
    const { name, description, meetingTime, stamm, leaders } = groupData

    try {
      await this.db.query('START TRANSACTION')

      const [result] = await this.db.query(
        'INSERT INTO groups (name, description, meetingTime, stamm) VALUES (?, ?, ?, ?)',
        [name, description, JSON.stringify(meetingTime), stamm]
      )

      const groupId = result.insertId

      for (const leader of leaders) {
        await this.db.query(
          'INSERT INTO group_leaders (group_id, firstName, lastName) VALUES (?, ?, ?)',
          [groupId, leader.firstName, leader.lastName]
        )
      }

      await this.db.query('COMMIT')
      return { id: groupId, ...groupData, memberCount: 0 }
    } catch (error) {
      await this.db.query('ROLLBACK')
      throw error
    }
  }

  async updateGroup(id, groupData, stamm) {
    const { name, description, meetingTime, leaders } = groupData

    try {
      await this.db.query('START TRANSACTION')

      // Verify group belongs to stamm
      const [groups] = await this.db.query(
        'SELECT id FROM groups WHERE id = ? AND stamm = ?',
        [id, stamm]
      )

      if (groups.length === 0) {
        throw new Error('Group not found')
      }

      // Update group details
      await this.db.query(
        'UPDATE groups SET name = ?, description = ?, meetingTime = ? WHERE id = ?',
        [name, description, JSON.stringify(meetingTime), id]
      )

      // Delete existing leaders
      await this.db.query('DELETE FROM group_leaders WHERE group_id = ?', [id])

      // Insert new leaders
      for (const leader of leaders) {
        await this.db.query(
          'INSERT INTO group_leaders (group_id, firstName, lastName) VALUES (?, ?, ?)',
          [id, leader.firstName, leader.lastName]
        )
      }

      await this.db.query('COMMIT')
      return await this.getGroupById(id, stamm)
    } catch (error) {
      await this.db.query('ROLLBACK')
      throw error
    }
  }
}
