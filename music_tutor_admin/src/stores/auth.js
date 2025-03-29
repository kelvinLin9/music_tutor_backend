import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('music_tutor_admin_token'))

  async function login(credentials) {
    try {
      const response = await authApi.login(credentials)
      user.value = response.data.user
      token.value = response.data.token
      localStorage.setItem('music_tutor_admin_token', token.value)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async function googleLogin() {
    try {
      authApi.googleLogin()
    } catch (error) {
      throw error
    }
  }

  async function logout() {
    try {
      await authApi.logout()
      user.value = null
      token.value = null
    } catch (error) {
      throw error
    }
  }

  async function getProfile() {
    try {
      const response = await authApi.getProfile()
      user.value = response.data
      return response.data
    } catch (error) {
      throw error
    }
  }

  return {
    user,
    token,
    login,
    logout,
    getProfile,
    googleLogin
  }
}) 