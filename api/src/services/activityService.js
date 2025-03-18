export class ActivityService {
  constructor(db) {
    this.db = db
  }

  async getActivities(stamm) {
    const [activities] = await this.db.query(
      'SELECT * FROM activities WHERE stamm = ?',
      [stamm]
    )
    
    return activities.map(activity => ({
      ...activity,
      materials: JSON.parse(activity.materials)
    }))
  }

  async createActivity(activityData) {
    const { name, description, duration, category, materials, minParticipants, maxParticipants, stamm } = activityData

    const [result] = await this.db.query(
      `INSERT INTO activities 
       (name, description, duration, category, materials, minParticipants, maxParticipants, stamm)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

      [name, description, duration, category, JSON.stringify(materials), minParticipants, maxParticipants, stamm]
    )

    return {
      id: result.insertId,
      ...activityData
    }
  }

  async getActivityById(id, stamm) {
    const [activities] = await this.db.query(
      'SELECT * FROM activities WHERE id = ? AND stamm = ?',
      [id, stamm]
    )

    if (activities.length === 0) {
      return null
    }

    const activity = activities[0]
    return {
      ...activity,
      materials: JSON.parse(activity.materials)
    }
  }

  async updateActivity(id, activityData, stamm) {
    const { name, description, duration, category, materials, minParticipants, maxParticipants } = activityData

    await this.db.query(
      `UPDATE activities 
       SET name = ?, description = ?, duration = ?, category = ?, 
           materials = ?, minParticipants = ?, maxParticipants = ?
       WHERE id = ? AND stamm = ?`,
      [name, description, duration, category, JSON.stringify(materials), 
       minParticipants, maxParticipants, id, stamm]
    )

    return this.getActivityById(id, stamm)
  }

  async deleteActivity(id, stamm) {
    await this.db.query(
      'DELETE FROM activities WHERE id = ? AND stamm = ?',
      [id, stamm]
    )
  }
}
