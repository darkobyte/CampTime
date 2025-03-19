import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import { API_BASE_URL } from '../config'

export const useGroupStore = defineStore('groups', () => {
  const groups = ref([])
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  const fetchGroups = async () => {
    loading.value = true
    error.value = null

    const token = localStorage.getItem('token')
    console.log('Current token:', token) // Debug line

    if (!token) {
      error.value = 'Not authenticated'
      loading.value = false
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/groups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch groups')
      }

      groups.value = await response.json()
    } catch (err) {
      error.value = err.message
      console.error('Error fetching groups:', err)
    } finally {
      loading.value = false
    }
  }

  const createGroup = async (groupData) => {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')

    if (!token) {
      error.value = 'Not authenticated'
      loading.value = false
      return false
    }

    try {
      const response = await fetch(`${API_BASE_URL}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(groupData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create group')
      }

      const newGroup = await response.json()
      groups.value.push(newGroup)
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error creating group:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchGroupById = async (id) => {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch group')

      return await response.json()
    } catch (err) {
      error.value = err.message
      console.error('Error fetching group:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateGroup = async (groupData) => {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(groupData)
      })

      if (!response.ok) throw new Error('Failed to update group')

      const updatedGroup = await response.json()
      const index = groups.value.findIndex(g => g.id === updatedGroup.id)
      if (index !== -1) {
        groups.value[index] = updatedGroup
      }
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error updating group:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    fetchGroupById,
    updateGroup
  }
})
