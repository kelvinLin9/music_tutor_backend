<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900">儀表板</h1>

    <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <!-- 總用戶數 -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UserGroupIcon class="h-6 w-6 text-gray-400" aria-hidden="true" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">總用戶數</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{{ stats.totalUsers }}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- 總課程數 -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <BookOpenIcon class="h-6 w-6 text-gray-400" aria-hidden="true" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">總課程數</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{{ stats.totalCourses }}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- 本月訂單數 -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ShoppingCartIcon class="h-6 w-6 text-gray-400" aria-hidden="true" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">本月訂單數</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{{ stats.monthlyOrders }}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- 本月收入 -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CurrencyDollarIcon class="h-6 w-6 text-gray-400" aria-hidden="true" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">本月收入</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">${{ stats.monthlyRevenue }}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近訂單 -->
    <div class="mt-8">
      <h2 class="text-lg font-medium text-gray-900">最近訂單</h2>
      <div class="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" class="divide-y divide-gray-200">
          <li v-for="order in recentOrders" :key="order.id">
            <div class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-primary-600 truncate">
                  訂單 #{{ order.orderNumber }}
                </p>
                <div class="ml-2 flex-shrink-0 flex">
                  <p
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-green-100 text-green-800': order.status === 'completed',
                      'bg-yellow-100 text-yellow-800': order.status === 'pending',
                      'bg-red-100 text-red-800': order.status === 'cancelled'
                    }"
                  >
                    {{ order.statusText }}
                  </p>
                </div>
              </div>
              <div class="mt-2 sm:flex sm:justify-between">
                <div class="sm:flex">
                  <p class="flex items-center text-sm text-gray-500">
                    {{ order.customerName }}
                  </p>
                  <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                    {{ order.courseName }}
                  </p>
                </div>
                <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <CalendarIcon class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                  <p>{{ order.createdAt }}</p>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  UserGroupIcon,
  BookOpenIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline'

const stats = ref({
  totalUsers: 0,
  totalCourses: 0,
  monthlyOrders: 0,
  monthlyRevenue: 0
})

const recentOrders = ref([])

onMounted(async () => {
  // TODO: 從 API 獲取數據
  // 模擬數據
  stats.value = {
    totalUsers: 1234,
    totalCourses: 56,
    monthlyOrders: 89,
    monthlyRevenue: 12345
  }

  recentOrders.value = [
    {
      id: 1,
      orderNumber: 'ORD001',
      status: 'completed',
      statusText: '已完成',
      customerName: '張三',
      courseName: '鋼琴基礎課程',
      createdAt: '2024-03-29'
    },
    {
      id: 2,
      orderNumber: 'ORD002',
      status: 'pending',
      statusText: '處理中',
      customerName: '李四',
      courseName: '小提琴進階課程',
      createdAt: '2024-03-28'
    },
    {
      id: 3,
      orderNumber: 'ORD003',
      status: 'cancelled',
      statusText: '已取消',
      customerName: '王五',
      courseName: '吉他入門課程',
      createdAt: '2024-03-27'
    }
  ]
})
</script> 