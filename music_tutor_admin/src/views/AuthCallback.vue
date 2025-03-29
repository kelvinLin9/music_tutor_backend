<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">處理登入中...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    const token = route.query.token
    if (token) {
      authStore.token = token
      localStorage.setItem('token', token)
      await authStore.getProfile()
      router.push('/')
    } else {
      router.push('/login')
    }
  } catch (error) {
    console.error('Auth callback error:', error)
    router.push('/login')
  }
})
</script> 