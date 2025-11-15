<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const isAppReady = ref(false)

// Инициализация приложения
onMounted(async () => {
  try {
    // Проверяем авторизацию при загрузке приложения
    if (authStore.accessToken) {
      await authStore.checkAuth()
    }
  } catch (error) {
    console.error('Auth initialization error:', error)
  } finally {
    isAppReady.value = true
  }
})

// Глобальная обработка ошибок
const handleGlobalError = (event: ErrorEvent) => {
  console.error('Global error:', event.error)
  // Можно добавить отправку ошибок в сервис мониторинга
}

onMounted(() => {
  window.addEventListener('error', handleGlobalError)
})

// Очистка
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('error', handleGlobalError)
})
</script>

<template>
  <!-- Информационная полоска сверху -->
  <div class="bg-yellow-100 border-b border-yellow-300">
    <div class="max-w-7xl mx-auto px-4 py-2">
      <div class="text-center text-yellow-800 text-sm">
        Перед тестированием, напишите нам, чтобы мы запустили мощности
      </div>
    </div>
  </div>

  <div class="min-h-screen bg-gray-50">
    <!-- Loading state -->
    <div v-if="!isAppReady" class="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Загрузка...</p>
      </div>
    </div>

    <!-- Main content -->
    <div v-else>
      <RouterView />
    </div>

    <!-- Global error toast (опционально) -->
    <div
      v-if="authStore.error"
      class="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg max-w-sm z-50"
    >
      <div class="flex justify-between items-start">
        <div>
          <p class="font-medium">Ошибка</p>
          <p class="text-sm mt-1">{{ authStore.error }}</p>
        </div>
        <button
          @click="authStore.clearError()"
          class="text-red-600 hover:text-red-800 ml-4 flex-shrink-0"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  </div>
</template>

<style>
html {
  scroll-behavior: smooth;
}

/* Глобальные стили для анимаций */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Кастомный скроллбар */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
