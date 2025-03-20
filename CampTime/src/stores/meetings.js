import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_BASE_URL } from '../config'

export const useMeetingStore = defineStore('meetings', () => {
  const meetings = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchUpcomingMeetings = async () => {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`${API_BASE_URL}/meetings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch meetings')
      const data = await response.json()
      
      // Formatiere das Datum in YYYY-MM-DD
      meetings.value = data.map(meeting => ({
        ...meeting,
        meeting_date: new Date(meeting.meeting_date).toISOString().split('T')[0]
      }))
      
      console.log('Formatted meetings:', meetings.value)
    } catch (err) {
      error.value = err.message
      console.error('Error fetching meetings:', err)
    } finally {
      loading.value = false
    }
  }

  const createMeeting = async (meetingData) => {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`${API_BASE_URL}/meetings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meetingData)
      })

      if (!response.ok) throw new Error('Failed to create meeting')
      const newMeeting = await response.json()
      meetings.value.push(newMeeting)
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  const addActivityToMeeting = async (meetingId, activityId) => {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`${API_BASE_URL}/meetings/activity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ meetingId, activityId })
      })

      if (!response.ok) throw new Error('Failed to add activity')

      const { meetingId: updatedMeetingId } = await response.json()
      await fetchUpcomingMeetings() // Refresh meetings list
      return updatedMeetingId
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  const cancelMeeting = async (meetingId) => {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to cancel meeting')
      await fetchUpcomingMeetings()
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  const clearActivities = async (meetingId) => {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/activities`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to clear activities')
      await fetchUpcomingMeetings()
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    meetings,
    loading,
    error,
    fetchUpcomingMeetings,
    createMeeting,
    addActivityToMeeting,
    cancelMeeting,
    clearActivities
  }
})
