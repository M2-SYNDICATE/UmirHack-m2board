<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { apiService, type Folder } from '@/services/api'

const router = useRouter()

// Получаем props
const props = defineProps<{
  selectedProject: string
  currentView: string
}>()

const emit = defineEmits<{
  projectSelected: [project: string]
  archiveSelected: []
  resetProjects: []
}>()

// Заменяем статический список на реальные папки
const projectFolders = ref<Folder[]>([])
const isLoading = ref(false)

// Данные пользователя из localStorage
const user = ref({
  login: localStorage.getItem('m2boards_user')
    ? JSON.parse(localStorage.getItem('m2boards_user')!).name
    : 'Пользователь',
  email: localStorage.getItem('m2boards_user')
    ? JSON.parse(localStorage.getItem('m2boards_user')!).email
    : 'email@example.com',
})

// Флаг для предотвращения циклических обновлений
const isUpdating = ref(false)

// Загрузка папок
const loadFolders = async () => {
  isLoading.value = true
  try {
    const folders = await apiService.getFolders()
    console.log(
      '📁 Загружены папки для сайдбара:',
      folders.map((f) => ({ name: f.name, archived: f.archived })),
    )

    // Фильтруем только активные папки (не архивные)
    projectFolders.value = folders.filter((folder) => !folder.archived)

    console.log(
      '🔄 Отфильтрованные папки:',
      projectFolders.value.map((f) => f.name),
    )
  } catch (error) {
    console.error('❌ Ошибка загрузки папок для сайдбара:', error)
  } finally {
    isLoading.value = false
  }
}

const selectProject = async (projectName: string) => {
  if (isUpdating.value) return

  isUpdating.value = true
  console.log('🎯 Выбор папки в сайдбаре:', projectName)

  console.log('📤 Отправка события projectSelected:', projectName)
  emit('projectSelected', projectName)

  await nextTick()
  isUpdating.value = false
}

const isFolderActive = (folderName: string) => {
  return props.selectedProject === folderName
}

const selectArchive = () => {
  emit('archiveSelected')
}

const resetAllProjects = () => {
  emit('resetProjects')
}

// Функции для профиля
const openSettings = () => {
  console.log('Открыть настройки профиля')
}

const logout = () => {
  console.log('🔴 Выход из системы')

  // Очищаем данные авторизации
  localStorage.removeItem('m2boards_auth_token')
  localStorage.removeItem('m2boards_refresh_token')
  localStorage.removeItem('m2boards_user')

  console.log('✅ Данные авторизации очищены')

  // Перенаправляем на главную страницу
  router.push('/')
}

// Получаем первую букву логина для аватара
const getInitial = () => {
  return user.value.login.charAt(0).toUpperCase()
}

// Загружаем папки при монтировании компонента
onMounted(() => {
  loadFolders()
})

// Expose функцию для сброса состояний извне
defineExpose({
  resetAllProjects,
  loadFolders,
})
</script>

<template>
  <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
    <!-- Logo -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center space-x-3">
        <div
          class="bg-gradient-to-r from-pink-500 to-orange-400 w-8 h-8 rounded-lg flex items-center justify-center"
        >
          <span class="text-white font-bold text-sm">M2</span>
        </div>
        <h2 class="text-xl font-bold text-gray-900">BOARDS</h2>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4">
      <div class="space-y-2 mb-8">
        <button
          @click="selectArchive"
          class="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          :class="{ 'bg-pink-50 text-pink-700': currentView === 'archive' }"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
          <span>Архив</span>
        </button>
      </div>

      <!-- Folders Section -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Папки ({{ projectFolders.length }})
          </h3>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
        </div>

        <!-- Folders List -->
        <div v-else class="space-y-1">
          <button
            v-for="folder in projectFolders"
            :key="folder.id"
            class="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left group"
            :class="{ 'bg-pink-50 text-pink-700': isFolderActive(folder.name) }"
            @click="selectProject(folder.name)"
          >
            <!-- Folder Icon -->
            <div class="relative">
              <div
                class="w-4 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-sm rounded-tr-none transform rotate-3"
              >
                <div
                  class="absolute -top-0.5 -right-0.5 w-1.5 h-0.5 bg-blue-400 rounded-full"
                ></div>
              </div>
              <div
                class="absolute -bottom-0.5 -left-0.5 w-3.5 h-2.5 bg-gradient-to-r from-blue-400 to-blue-500 rounded-sm rounded-tr-none opacity-80"
              ></div>
            </div>

            <span class="text-sm flex-1 truncate">{{ folder.name }}</span>

            <!-- Project Count -->
            <span
              class="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 min-w-5 text-center"
              :class="{ 'bg-pink-100 text-pink-700': isFolderActive(folder.name) }"
            >
              {{ folder.projects?.length || 0 }}
            </span>
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && projectFolders.length === 0" class="text-center py-4">
          <svg
            class="mx-auto h-8 w-8 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
            />
          </svg>
          <p class="text-xs text-gray-500">Нет папок</p>
        </div>
      </div>
    </nav>

    <!-- Profile Section -->
    <div class="p-4 border-t border-gray-200">
      <div class="flex items-center space-x-3 mb-3">
        <!-- Аватар с первой буквой логина -->
        <div
          class="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center"
        >
          <span class="text-white font-semibold text-sm">{{ getInitial() }}</span>
        </div>

        <!-- Информация пользователя -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ user.login }}</p>
          <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
        </div>

        <!-- Кнопка выхода -->
        <button
          @click="logout"
          class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Выйти"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>

      <!-- Кнопка настроек -->
      <button
        @click="openSettings"
        class="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-pink-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span>Настройки профиля</span>
      </button>
    </div>
  </aside>
</template>
