export class MeetingService {
  constructor(db) {
    this.db = db
  }

  async getUpcomingMeetings(stamm) {
    // First get all groups with their meeting times
    const [groups] = await this.db.query(
      'SELECT id, name, meetingTime, start_date, end_date FROM groups WHERE stamm = ?',
      [stamm]
    )

    // Get saved meetings with activities - Entferne den CURDATE() Filter
    const [savedMeetings] = await this.db.query(
      `SELECT m.*, g.name as groupName, 
        DATE_FORMAT(m.meeting_date, '%Y-%m-%d') as meeting_date,
        TIME_FORMAT(m.meeting_time, '%H:%i') as meeting_time,
        m.is_cancelled,
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
       GROUP BY m.id`,
      [stamm]
    )

    // Create a map of saved meetings by date and group
    const savedMeetingsMap = new Map()
    savedMeetings.forEach(meeting => {
      const key = `${meeting.group_id}_${meeting.meeting_date}`
      let parsedActivities = []
      
      if (meeting.activities) {
        try {
          // Wenn activities ein einzelner String ist, machen wir ein Array daraus
          const activitiesStr = meeting.activities.includes('},{') ? 
            `[${meeting.activities}]` : 
            `[${meeting.activities || ''}]`
          
          parsedActivities = JSON.parse(activitiesStr)
            .filter(a => a && Object.keys(a).length > 0)
        } catch (err) {
          console.error('Error parsing activities:', err)
          parsedActivities = []
        }
      }

      savedMeetingsMap.set(key, {
        ...meeting,
        activities: parsedActivities,
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
      let date = new Date(group.start_date)
      if (date < today) {
        date = this.getNextWeekday(today, parseInt(meetingTime.weekday))
      } else {
        date = this.getNextWeekday(date, parseInt(meetingTime.weekday))
      }

      let count = 0
      const endDate = group.end_date ? new Date(group.end_date) : null

      while (count < 8) {
        if (endDate && date > endDate) break
        
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

  async cancelMeeting(meetingId, stamm) {
    try {
      await this.db.query('START TRANSACTION')

      // Wenn es eine berechnete Gruppenstunde ist, erstelle sie zuerst
      if (typeof meetingId === 'string' && meetingId.startsWith('calc_')) {
        const [_, groupId, dateStr] = meetingId.split('_')
        const date = dateStr.split('T')[0]
        
        // Get group details
        const [groups] = await this.db.query(
          'SELECT name, meetingTime FROM groups WHERE id = ? AND stamm = ?',
          [groupId, stamm]
        )
        const group = groups[0]
        const meetingTime = JSON.parse(group.meetingTime)

        // Create new meeting
        const [result] = await this.db.query(
          `INSERT INTO meetings (group_id, meeting_date, meeting_time, title, stamm, is_cancelled)
           VALUES (?, ?, ?, ?, ?, 1)`,
          [groupId, date, meetingTime.time, `${group.name} Gruppenstunde`, stamm]
        )
        meetingId = result.insertId
      } else {
        // Toggle is_cancelled für existierende Meetings
        const [result] = await this.db.query(
          'UPDATE meetings SET is_cancelled = NOT is_cancelled WHERE id = ? AND stamm = ?',
          [meetingId, stamm]
        )
        
        if (result.affectedRows === 0) {
          throw new Error('Meeting not found')
        }
      }

      await this.db.query('COMMIT')
      return meetingId
    } catch (error) {
      await this.db.query('ROLLBACK')
      throw error
    }
  }

  async clearActivities(meetingId, stamm) {
    await this.db.query(
      'DELETE ma FROM meeting_activities ma JOIN meetings m ON ma.meeting_id = m.id WHERE m.id = ? AND m.stamm = ?',
      [meetingId, stamm]
    )
  }

  async createMeeting(meetingData) {
    try {
      await this.db.query('START TRANSACTION')
      
      // Create new meeting
      const [result] = await this.db.query(
        `INSERT INTO meetings (group_id, meeting_date, meeting_time, title, stamm)
         VALUES (?, ?, ?, ?, ?)`,
        [meetingData.group_id, meetingData.meeting_date, meetingData.meeting_time, 
         meetingData.title, meetingData.stamm]
      )

      await this.db.query('COMMIT')
      return { id: result.insertId, ...meetingData }
    } catch (error) {
      await this.db.query('ROLLBACK')
      throw error
    }
  }
}
