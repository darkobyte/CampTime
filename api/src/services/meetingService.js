export class MeetingService {
  constructor(db) {
    this.db = db
  }

  async getUpcomingMeetings(stamm) {
    // First get all groups with their meeting times
    const [groups] = await this.db.query(
      'SELECT id, name, meetingTime FROM groups WHERE stamm = ?',
      [stamm]
    )

    // Get saved meetings with activities
    const [savedMeetings] = await this.db.query(
      `SELECT m.*, g.name as groupName, 
        DATE_FORMAT(m.meeting_date, '%Y-%m-%d') as meeting_date,
        TIME_FORMAT(m.meeting_time, '%H:%i') as meeting_time,
        GROUP_CONCAT(
          JSON_OBJECT(
            'id', a.id,
            'name', a.name,
            'duration', a.duration
          )
        ) as activities
       FROM meetings m
       JOIN groups g ON m.group_id = g.id
       LEFT JOIN meeting_activities ma ON m.id = ma.meeting_id
       LEFT JOIN activities a ON ma.activity_id = a.id
       WHERE m.stamm = ? 
       AND m.meeting_date >= CURDATE()
       GROUP BY m.id`,
      [stamm]
    )

    // Create a map of saved meetings by date and group
    const savedMeetingsMap = new Map()
    savedMeetings.forEach(meeting => {
      const key = `${meeting.group_id}_${meeting.meeting_date}`
      savedMeetingsMap.set(key, {
        ...meeting,
        activities: meeting.activities ? JSON.parse(`[${meeting.activities}]`) : [],
        isCalculated: false
      })
    })

    // Calculate next 8 meetings for each group
    const calculatedMeetings = []
    const today = new Date()
    
    for (const group of groups) {
      const meetingTime = JSON.parse(group.meetingTime)
      if (!meetingTime || !meetingTime.weekday) continue

      const frequency = parseInt(meetingTime.frequency) || 1
      let date = this.getNextWeekday(today, parseInt(meetingTime.weekday))
      let count = 0

      while (count < 8) {
        const dateStr = date.toISOString().split('T')[0]
        const key = `${group.id}_${dateStr}`

        // If there's no saved meeting for this date/group, add calculated one
        if (!savedMeetingsMap.has(key)) {
          calculatedMeetings.push({
            id: `calc_${group.id}_${date.toISOString()}`,
            group_id: group.id,
            groupName: group.name,
            meeting_date: dateStr,
            meeting_time: meetingTime.time,
            title: `${group.name} Gruppenstunde`,
            activities: [],
            isCalculated: true
          })
        }

        date.setDate(date.getDate() + (7 * frequency))
        count++
      }
    }

    // Combine saved and calculated meetings
    const allMeetings = [...savedMeetingsMap.values(), ...calculatedMeetings]

    // Sort by date and time
    return allMeetings
      .sort((a, b) => {
        const dateA = new Date(`${a.meeting_date}T${a.meeting_time}`)
        const dateB = new Date(`${b.meeting_date}T${b.meeting_time}`)
        return dateA - dateB
      })
      .slice(0, 8)
  }

  getNextWeekday(date, weekday) {
    const result = new Date(date)
    result.setDate(result.getDate() + (7 + weekday - result.getDay()) % 7)
    return result
  }

  async addActivityToMeeting(meetingId, activityId, stamm) {
    try {
      await this.db.query('START TRANSACTION')

      let finalMeetingId = meetingId
      if (typeof meetingId === 'string' && meetingId.startsWith('calc_')) {
        const [_, groupId, dateStr] = meetingId.split('_')
        const date = dateStr.split('T')[0]
        
        // Check for existing meeting
        const [existingMeetings] = await this.db.query(
          'SELECT id FROM meetings WHERE group_id = ? AND meeting_date = ? AND stamm = ?',
          [groupId, date, stamm]
        )

        if (existingMeetings.length > 0) {
          finalMeetingId = existingMeetings[0].id
        } else {
          // Get group details
          const [groups] = await this.db.query(
            'SELECT name, meetingTime FROM groups WHERE id = ? AND stamm = ?',
            [groupId, stamm]
          )
          const group = groups[0]
          const meetingTime = JSON.parse(group.meetingTime)

          // Create new meeting
          const [result] = await this.db.query(
            `INSERT INTO meetings (group_id, meeting_date, meeting_time, title, stamm)
             VALUES (?, ?, ?, ?, ?)`,
            [groupId, date, meetingTime.time, `${group.name} Gruppenstunde`, stamm]
          )
          finalMeetingId = result.insertId
        }
      }

      // Add activity to meeting
      await this.db.query(
        `INSERT INTO meeting_activities (meeting_id, activity_id, order_index)
         SELECT ?, ?, COALESCE((
           SELECT MAX(order_index) + 1 
           FROM meeting_activities 
           WHERE meeting_id = ?
         ), 0)`,
        [finalMeetingId, activityId, finalMeetingId]
      )

      await this.db.query('COMMIT')
      return finalMeetingId
    } catch (error) {
      await this.db.query('ROLLBACK')
      throw error
    }
  }
}
