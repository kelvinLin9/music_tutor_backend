export const authAPI = {
  // Google 登入
  googleLogin: async (callbackUrl) => {
    const response = await fetch(`/api/users/google?callback=${encodeURIComponent(callbackUrl)}`);
    if (response.redirected) {
      window.location.href = response.url;
    }
  },

  // 獲取已連接的帳號
  getConnectedAccounts: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/users/connected-accounts', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // 斷開帳號連接
  disconnectAccount: async (provider) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/users/disconnect/${provider}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // 檢查登入狀態
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch('/api/users/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('檢查登入狀態失敗:', error);
      return false;
    }
  },

  // 登出
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}; 