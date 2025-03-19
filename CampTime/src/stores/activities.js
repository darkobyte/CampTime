import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_BASE_URL } from '../config'

export const useActivityStore = defineStore('activities', () => {
  const activities = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchActivities = async () => {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`${API_BASE_URL}/activities`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch activities')
      activities.value = await response.json()
    } catch (err) {
      error.value = err.message
      console.error('Error fetching activities:', err)
    } finally {
      loading.value = false
    }
  }

  const createActivity = async (activityData) => {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`${API_BASE_URL}/activities`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activityData)
      })

      if (!response.ok) throw new Error('Failed to create activity')
      const newActivity = await response.json()
      activities.value.push(newActivity)
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error creating activity:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchActivityById = async (id) => {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch activity')
      return await response.json()
    } catch (err) {
      error.value = err.message
      console.error('Error fetching activity:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateActivity = async (id, activityData) => {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activityData)
      })

      if (!response.ok) throw new Error('Failed to update activity')

      const updatedActivity = await response.json()
      const index = activities.value.findIndex(a => a.id === id)
      if (index !== -1) {
        activities.value[index] = updatedActivity
      }
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error updating activity:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteActivity = async (id) => {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete activity')
      activities.value = activities.value.filter(a => a.id !== id)
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error deleting activity:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    activities,
    loading,
    error,
    fetchActivities,
    createActivity,
    fetchActivityById,
    updateActivity,
    deleteActivity
  }
})
