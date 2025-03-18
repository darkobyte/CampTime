import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_URL = 'http://localhost:3000/api'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)
  
  async function login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) throw new Error('Login failed')

      user.value = await response.json()
      isAuthenticated.value = true
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  async function register(userData) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (!response.ok) throw new Error('Registration failed')

      user.value = await response.json()
      isAuthenticated.value = true
      return true
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
  }

  return {
    isAuthenticated,
    user,
    login,
    logout,
    register
  }
})
