<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 側邊欄 -->
    <aside class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
      <div class="p-4">
        <h1 class="text-xl font-bold text-primary-600">音樂家教後台管理系統</h1>
      </div>
      <nav class="mt-4">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
          :class="{ 'bg-gray-100': isActive(item.path) }"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.name }}
        </router-link>
      </nav>
    </aside>

    <!-- 主要內容區 -->
    <div class="ml-64">
      <!-- 頂部導航欄 -->
      <header class="bg-white shadow">
        <div class="flex items-center justify-between px-4 py-3">
          <h1 class="text-xl font-semibold">{{ currentPageTitle }}</h1>
          <div class="flex items-center">
            <button class="p-2 rounded-full hover:bg-gray-100">
              <BellIcon class="w-6 h-6" />
            </button>
            <div class="ml-4">
              <Menu as="div" class="relative">
                <MenuButton class="flex items-center">
                  <img 
                    :src="userAvatar" 
                    class="w-8 h-8 rounded-full"
                    alt="User avatar"
                  />
                </MenuButton>
                <transition
                  enter-active-class="transition duration-100 ease-out"
                  enter-from-class="transform scale-95 opacity-0"
                  enter-to-class="transform scale-100 opacity-100"
                  leave-active-class="transition duration-75 ease-out"
                  leave-from-class="transform scale-100 opacity-100"
                  leave-to-class="transform scale-95 opacity-0"
                >
                  <MenuItems class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
                    <MenuItem v-slot="{ active }">
                      <a
                        href="#"
                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                      >
                        個人資料
                      </a>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <a
                        href="#"
                        @click="logout"
                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                      >
                        登出
                      </a>
                    </MenuItem>
                  </MenuItems>
                </transition>
              </Menu>
            </div>
          </div>
        </div>
      </header>

      <!-- 頁面內容 -->
      <main class="p-6">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import {
  HomeIcon,
  UserGroupIcon,
  BookOpenIcon,
  CalendarIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  TicketIcon,
  BellIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const menuItems = [
  { name: '儀表板', path: '/', icon: HomeIcon },
  { name: '用戶管理', path: '/users', icon: UserGroupIcon },
  { name: '課程管理', path: '/courses', icon: BookOpenIcon },
  { name: '預約管理', path: '/appointments', icon: CalendarIcon },
  { name: '訂單管理', path: '/orders', icon: ShoppingCartIcon },
  { name: '教材管理', path: '/materials', icon: DocumentTextIcon },
  { name: '作業管理', path: '/homework', icon: ClipboardDocumentListIcon },
  { name: '優惠券管理', path: '/coupons', icon: TicketIcon }
]

const currentPageTitle = computed(() => {
  const currentItem = menuItems.find(item => item.path === route.path)
  return currentItem ? currentItem.name : ''
})

const isActive = (path) => {
  return route.path === path
}

const userAvatar = computed(() => {
  return authStore.user?.avatar || 'https://via.placeholder.com/32'
})

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script> 