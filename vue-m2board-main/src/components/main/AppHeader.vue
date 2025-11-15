<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthModal from '@/components/auth/AuthModal.vue'

const router = useRouter()
const isMobileMenuOpen = ref(false)
const showAuthModal = ref(false)

// Проверяем авторизацию
const isAuthenticated = computed(() => {
  return !!localStorage.getItem('m2boards_user')
})

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
  isMobileMenuOpen.value = false
}

const handleAboutClick = () => {
  router.push('/about')
  isMobileMenuOpen.value = false
}

const handleDashboardClick = () => {
  if (isAuthenticated.value) {
    // Если авторизован - сразу переходим на дашборд
    router.push('/dashboard')
  } else {
    // Если не авторизован - показываем модалку
    showAuthModal.value = true
  }
  isMobileMenuOpen.value = false
}

const handleLogin = (credentials: { email: string; password: string }) => {
  console.log('🔐 Авторизация:', credentials)
  showAuthModal.value = false
  // После успешной авторизации переходим на дашборд
  router.push('/dashboard')
}

defineEmits<{
  navigateToDashboard: []
}>()
</script>

<template>
  <header class="bg-white shadow-sm sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <!-- Logo -->
        <div class="flex items-center">
          <div
            class="bg-gradient-to-r from-pink-500 to-orange-400 w-8 h-8 rounded-lg flex items-center justify-center"
          >
            <span class="text-white font-bold text-lg">M2</span>
          </div>
          <span class="ml-2 text-xl font-bold text-gray-900">Boards</span>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <button
            @click="scrollToSection('use-cases')"
            class="text-gray-700 hover:text-gray-900 py-2 transition-colors duration-200"
          >
            Применение
          </button>

          <button
            @click="handleAboutClick"
            class="text-gray-700 hover:text-gray-900 py-2 transition-colors duration-200"
          >
            О нас
          </button>
        </nav>

        <!-- Dashboard Button -->
        <div class="hidden md:flex items-center">
          <button
            @click="handleDashboardClick"
            class="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-6 py-2 rounded-full font-medium hover:from-pink-600 hover:to-orange-500 transition-all duration-200"
          >
            {{ isAuthenticated ? 'Панель управления' : 'Войти в систему' }}
          </button>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="text-gray-700 hover:text-gray-900 p-2"
          >
            <svg
              v-if="!isMobileMenuOpen"
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg v-else class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div v-if="isMobileMenuOpen" class="md:hidden border-t border-gray-200 py-4">
        <div class="flex flex-col space-y-4">
          <button
            @click="scrollToSection('video-demo')"
            class="text-left text-gray-700 hover:text-gray-900 py-2 transition-colors duration-200"
          >
            Видео-визитка
          </button>

          <button
            @click="scrollToSection('features')"
            class="text-left text-gray-700 hover:text-gray-900 py-2 transition-colors duration-200"
          >
            Возможности
          </button>

          <button
            @click="scrollToSection('use-cases')"
            class="text-left text-gray-700 hover:text-gray-900 py-2 transition-colors duration-200"
          >
            Применение
          </button>

          <button
            @click="handleAboutClick"
            class="text-left text-gray-700 hover:text-gray-900 py-2 transition-colors duration-200"
          >
            О нас
          </button>

          <div class="pt-4 border-t border-gray-200">
            <button
              @click="handleDashboardClick"
              class="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-orange-500 transition-all duration-200"
            >
              {{ isAuthenticated ? 'Панель управления' : 'Войти в систему' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Auth Modal -->
    <AuthModal :is-open="showAuthModal" @close="showAuthModal = false" @login="handleLogin" />
  </header>
</template>
