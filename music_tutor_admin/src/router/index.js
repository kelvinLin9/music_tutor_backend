import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/google/callback',
    name: 'google-callback',
    component: () => import('@/views/GoogleCallback.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/components/layout/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/users/UserList.vue')
      },
      {
        path: 'courses',
        name: 'courses',
        component: () => import('@/views/courses/CourseList.vue')
      },
      {
        path: 'appointments',
        name: 'appointments',
        component: () => import('@/views/appointments/AppointmentList.vue')
      },
      {
        path: 'orders',
        name: 'orders',
        component: () => import('@/views/orders/OrderList.vue')
      },
      {
        path: 'materials',
        name: 'materials',
        component: () => import('@/views/materials/MaterialList.vue')
      },
      {
        path: 'homework',
        name: 'homework',
        component: () => import('@/views/homework/HomeworkList.vue')
      },
      {
        path: 'coupons',
        name: 'coupons',
        component: () => import('@/views/coupons/CouponList.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const token = localStorage.getItem('music_tutor_admin_token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router 