import axiosInstance from './config'

export const authApi = {
  // 一般登入
  login(credentials) {
    return axiosInstance.post('/users/login', credentials)
  },

  // Google 登入
  googleLogin() {
    const redirectTarget = 'https://kelvinlin9.github.io/music_tutor_dashboard/google/callback';
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (!apiUrl) {
      console.error('VITE_API_URL is not defined');
      return;
    }
    
    const authUrl = `${apiUrl}/users/google?callback=${encodeURIComponent(redirectTarget)}`;
    console.log('Redirecting to:', authUrl);
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