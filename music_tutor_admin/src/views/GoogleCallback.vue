<template>
  <div class="callback-container">
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>登入中，請稍候...</p>
    </div>
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="goToLogin" class="btn btn-primary mt-3">
        返回登入頁
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// import { useUserStore } from '@/stores/user'; // 假設你有一個用戶 store

const router = useRouter();
// const userStore = useUserStore();

const isLoading = ref(true);
const error = ref('');

const goToLogin = () => {
  router.push('/login');
};

onMounted(async () => {
  try {
    // 從 URL 獲取 token
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
      error.value = '無法獲取登入令牌，請重新登入';
      isLoading.value = false;
      return;
    }
    
    console.log('取得令牌:', token);
    
    // 將 token 儲存到 localStorage 或 state 管理
    localStorage.setItem('userToken', token);
    
    // 更新你的用戶 store
    localStorage.setItem('music_tutor_beta_token', token);

    
    // 可選：獲取用戶資料
    // await userStore.getUserProfile();
    
    // 登入成功後重定向到主頁或儀表板
    router.push('/');
  } catch (err) {
    console.error('處理登入回調時出錯:', err);
    error.value = '登入過程中發生錯誤，請重試';
    isLoading.value = false;
  }
});
</script>

<style scoped>
.callback-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  padding: 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  padding: 20px;
  border-radius: 8px;
  background-color: #f8d7da;
  color: #721c24;
  max-width: 500px;
}
</style>