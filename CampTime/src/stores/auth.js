import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_BASE_URL } from '../config'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)

  async function init() {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/tokencheck`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        if (response.ok) {
          const userData = await response.json()
          user.value = { ...userData, token } // Include token in user object
          isAuthenticated.value = true
          console.log('Token validation successful:', token)
          return true
        } else {
          localStorage.removeItem('token')
        }
      } catch (error) {
        console.error('Token validation error:', error)
        localStorage.removeItem('token')
      }
    }
    return false
  }

  async function login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) throw new Error('Login failed')

      const userData = await response.json()
      user.value = userData
      isAuthenticated.value = true
      localStorage.setItem('token', userData.token)
      // Add token to user object
      user.value.token = userData.token
      console.log('Login successful, token set:', userData.token)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  async function register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (!response.ok) throw new Error('Registration failed')

      // After registration, automatically log in
      return await login(userData.email, userData.password)
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  async function logout() {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('token')
  }

  return {
    isAuthenticated,
    user,
    init,
    login,
    logout,
    register
  }
})
