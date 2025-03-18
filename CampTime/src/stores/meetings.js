import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMeetingStore = defineStore('meetings', () => {
  const meetings = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchUpcomingMeetings = async () => {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')

    try {
      const response = await fetch('http://localhost:3000/api/meetings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch meetings')
      meetings.value = await response.json()
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
      const response = await fetch('http://localhost:3000/api/meetings', {
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
      const response = await fetch('http://localhost:3000/api/meetings/activity', {
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

  return {
    meetings,
    loading,
    error,
    fetchUpcomingMeetings,
    createMeeting,
    addActivityToMeeting
  }
})
