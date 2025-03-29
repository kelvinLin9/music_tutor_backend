import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 請求攔截器
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('music_tutor_admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 響應攔截器
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('music_tutor_admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance 