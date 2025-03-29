import axiosInstance from './config'

export const authApi = {
  // 一般登入
  login(credentials) {
    return axiosInstance.post('/users/login', credentials)
  },

  // Google 登入
  googleLogin() {
    // 獲取當前的域名和協議作為基礎 URL
    const baseUrl = window.location.origin;
    
    // 根據環境決定重定向路徑
    let redirectTarget = '';
    if(import.meta.env.MODE === 'development') {
      const redirectPath = '/users/google/callback';
      redirectTarget = `${baseUrl}${redirectPath}`;
    } else {
      const redirectPath = '/users/google/callback';
      redirectTarget = `${baseUrl}${redirectPath}`;
    }
    
    // 將重定向 URL 編碼後作為 state 參數傳遞
    const encodedRedirectTarget = encodeURIComponent(redirectTarget);
    console.log(encodedRedirectTarget)
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=${encodeURIComponent(import.meta.env.VITE_GOOGLE_CALLBACK_URL)}&scope=email%20profile&client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&state=${encodedRedirectTarget}`;
    
    window.location.href = authUrl;
  },

  // 登出
  logout() {
    localStorage.removeItem('music_tutor_admin_token')
  },

  // 獲取用戶資料
  getProfile() {
    return axiosInstance.get('/users/profile')
  }
} 