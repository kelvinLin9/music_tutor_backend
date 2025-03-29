<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">處理 Google 登入中...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axiosInstance from '@/api/config'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    const code = route.query.code
    const state = route.query.state

    if (!code) {
      throw new Error('未收到授權碼')
    }

    // 發送授權碼到後端
    const response = await axiosInstance.post('/users/google/callback', {
      code,
      state
    })

    // 保存 token
    const { token } = response.data
    localStorage.setItem('music_tutor_admin_token', token)
    authStore.token = token

    // 獲取用戶資料
    await authStore.getProfile()

    // 重定向到原始目標或首頁
    if (state) {
      const redirectUrl = decodeURIComponent(state)
      router.push(redirectUrl)
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error('Google 登入失敗:', error)
    router.push('/login')
  }
})
</script> 