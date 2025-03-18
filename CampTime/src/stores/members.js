import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

export const useMemberStore = defineStore('members', () => {
  const members = ref([])
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  const fetchMembers = async () => {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')

    try {
      const response = await fetch('http://localhost:3000/api/members', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch members')
      members.value = await response.json()
    } catch (err) {
      error.value = err.message
      console.error('Error fetching members:', err)
    } finally {
      loading.value = false
    }
  }

  const createMember = async (memberData) => {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')

    try {
      const response = await fetch('http://localhost:3000/api/members', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memberData)
      })

      if (!response.ok) throw new Error('Failed to create member')
      const newMember = await response.json()
      members.value.push(newMember)
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteMember = async (id) => {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`http://localhost:3000/api/members/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete member')
      }

      members.value = members.value.filter(m => m.id !== id)
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error deleting member:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const updateMember = async (id, memberData) => {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`http://localhost:3000/api/members/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memberData)
      })

      if (!response.ok) throw new Error('Failed to update member')
      const updatedMember = await response.json()
      const index = members.value.findIndex(m => m.id === id)
      if (index !== -1) {
        members.value[index] = updatedMember
      }
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    members,
    loading,
    error,
    fetchMembers,
    createMember,
    deleteMember,
    updateMember
  }
})
