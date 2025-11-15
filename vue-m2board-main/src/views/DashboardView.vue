<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import DashboardSidebar from '../components/dashboard/DashboardSidebar.vue'
import ProjectCard from '../components/dashboard/ProjectCard.vue'
import NewStoryboardModal from '../components/dashboard/NewStoryboardModal.vue'
import NewFolderModal from '../components/dashboard/NewFolderModal.vue'
import StoryboardLoadingModal from '../components/storyboard/StoryboardLoadingModal.vue'
import ArchiveFoldersModal from '../components/dashboard/ArchiveFoldersModal.vue'

import {
  apiService,
  type Folder,
  type Project,
  type UpdateFolderData,
  type GenerateScriptData,
  type ScriptGenerationResponse,
} from '@/services/api'

const router = useRouter()
const searchQuery = ref('')
const selectedProject = ref('Все папки')
const currentView = ref<'folders' | 'storyboards' | 'archive'>('folders')
const selectedFolder = ref<Folder | null>(null)
const showNewStoryboardModal = ref(false)
const showNewFolderModal = ref(false)
const showLoadingModal = ref(false)
const showArchiveModal = ref(false)
const loadingStoryboardName = ref('')
const sidebarRef = ref()

// Новые состояния для отслеживания генерации
const currentProjectId = ref<number | null>(null)
const statusCheckInterval = ref<number | null>(null)

// Загрузка данных
const isLoading = ref(false)
const projectFolders = ref<Folder[]>([])
const archivedProjects = ref<Folder[]>([])

// Флаг для предотвращения циклических обновлений
const isNavigating = ref(false)

// Загрузка папок с API
const loadFolders = async () => {
  isLoading.value = true
  try {
    const folders = await apiService.getFolders()
    console.log('📁 Загружены папки:', folders)

    // Разделяем на активные и архивные папки
    projectFolders.value = folders.filter((folder) => !folder.archived)
    archivedProjects.value = folders.filter((folder) => folder.archived)
  } catch (error) {
    console.error('❌ Ошибка загрузки папок:', error)
  } finally {
    isLoading.value = false
  }
}

// Функция для генерации рандомного цвета
const getRandomColor = () => {
  const colors = [
    'from-pink-500 to-orange-400',
    'from-purple-500 to-pink-400',
    'from-blue-500 to-purple-400',
    'from-green-500 to-teal-400',
    'from-yellow-500 to-red-400',
    'from-indigo-500 to-blue-400',
    'from-red-500 to-pink-400',
    'from-teal-500 to-green-400',
    'from-orange-500 to-yellow-400',
    'from-cyan-500 to-blue-400',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Функция открытия папки проекта
const openProjectFolder = async (folder: Folder) => {
  if (isNavigating.value) return

  isNavigating.value = true
  console.log('🗂️ Открытие папки проекта:', folder.name)

  // Обновляем все связанные состояния
  selectedFolder.value = folder
  selectedProject.value = folder.name
  currentView.value = 'storyboards'

  console.log('🔄 Обновление состояний:', {
    selectedProject: selectedProject.value,
    currentView: currentView.value,
    selectedFolder: selectedFolder.value?.name,
  })

  // Принудительно обновляем сайдбар
  if (sidebarRef.value) {
    await nextTick()
    try {
      await sidebarRef.value.loadFolders()
      console.log('✅ Сайдбар обновлен')
    } catch (error) {
      console.error('❌ Ошибка обновления сайдбара:', error)
    }
  }

  console.log('✅ Папка открыта')
  isNavigating.value = false
}

// Функция открытия редактора сторибоарда по ID
const openStoryboardEditor = (project: Project) => {
  console.log('🎬 Открытие редактора сторибоарда:', project.name, 'ID:', project.id)
  router.push(`/editor/${project.id}`)
}

// Функция архивации нескольких папок
const archiveSelectedFolders = async (folderIds: number[]) => {
  try {
    console.log('📦 Архивация папок:', folderIds)

    // Архивируем каждую папку
    for (const folderId of folderIds) {
      const folder = projectFolders.value.find((f) => f.id === folderId)
      if (folder) {
        await apiService.updateFolder(folderId, {
          name: folder.name,
          archived: true,
        })
      }
    }

    console.log('✅ Папки архивированы')

    // Обновляем списки
    await loadFolders()

    // Обновляем сайдбар
    if (sidebarRef.value) {
      await sidebarRef.value.loadFolders()
    }

    // Закрываем модальное окно
    showArchiveModal.value = false

    // Если архивировали текущую выбранную папку, возвращаемся к списку
    if (selectedFolder.value && folderIds.includes(selectedFolder.value.id)) {
      goBackToFolders()
    }
  } catch (error) {
    console.error('❌ Ошибка архивации папок:', error)
  }
}

// Обработчик клика на элемент
const handleItemClick = (item: any) => {
  console.log('🖱️ Клик на элемент:', item.name, 'Текущий вид:', currentView.value)

  // Если мы в списке папок или архиве, открываем папку
  if (currentView.value === 'folders' || currentView.value === 'archive') {
    openProjectFolder(item)
  }
  // Если мы в списке сторибоардов, открываем редактор проекта по ID
  else if (currentView.value === 'storyboards') {
    openStoryboardEditor(item)
  }
}

// Функция создания сторибоарда (проекта)
const handleCreateStoryboard = async (data: {
  project_name: string
  product_description: string
}) => {
  console.log('🎬 Создание сторибоарда:', data)
  console.log('📁 В папке:', selectedFolder.value?.name)

  if (!selectedFolder.value) {
    console.error('❌ Не выбрана папка для создания сторибоарда')
    return
  }

  try {
    showNewStoryboardModal.value = false
    loadingStoryboardName.value = data.project_name // используем project_name
    showLoadingModal.value = true

    // 1. Отправляем запрос на генерацию скрипта с правильной структурой
    const generateData: GenerateScriptData = {
      project_name: data.project_name, // используем project_name из данных
      product_description: data.product_description, // используем product_description из данных
      folder_id: selectedFolder.value.id,
    }

    console.log('🚀 Отправка запроса на генерацию:', generateData)

    const response = await apiService.generateScript(generateData)
    console.log('✅ Ответ от сервера:', response)

    currentProjectId.value = response.project_id

    // 2. Запускаем проверку статуса
    startStatusChecking(response.project_id)
  } catch (error) {
    console.error('❌ Ошибка создания проекта:', error)
    showLoadingModal.value = false
    // Здесь можно добавить уведомление об ошибке
    alert('Ошибка при создании сторибоарда. Попробуйте еще раз.')
  }
}

// Функция проверки статуса генерации
const startStatusChecking = (projectId: number) => {
  console.log('🔄 Запуск проверки статуса для проекта:', projectId)

  // Очищаем предыдущий интервал, если он есть
  if (statusCheckInterval.value) {
    clearInterval(statusCheckInterval.value)
  }

  // Запускаем проверку каждые 5 секунд
  statusCheckInterval.value = setInterval(async () => {
    try {
      console.log('📡 Проверка статуса проекта:', projectId)
      const status = await apiService.getScriptStatus(projectId)
      console.log('📊 Статус проекта:', status)

      switch (status.status.toLowerCase()) {
        case 'completed':
          console.log('✅ Генерация завершена')
          handleGenerationComplete(status)
          break

        case 'failed':
          console.error('❌ Генерация провалилась')
          handleGenerationFailed(status)
          break

        case 'in_progress':
          console.log('⏳ Генерация в процессе...')
          // Продолжаем ждать - модальное окно продолжает показываться
          break

        default:
          console.log('❓ Неизвестный статус:', status.status)
          break
      }
    } catch (error) {
      console.error('❌ Ошибка при проверке статуса:', error)
      // В случае ошибки продолжаем попытки
    }
  }, 5000) // 5 секунд
}

// Обработчик успешного завершения генерации
const handleGenerationComplete = (response: ScriptGenerationResponse) => {
  console.log('🎉 Генерация завершена успешно:', response)

  // Останавливаем проверку статуса
  if (statusCheckInterval.value) {
    clearInterval(statusCheckInterval.value)
    statusCheckInterval.value = null
  }

  showLoadingModal.value = false

  // Создаем объект проекта
  const newProject: Project = {
    id: response.project_id,
    name: response.project_name,
    status: 'draft',
    created_at: response.created_at,
    updated_at: response.updated_at,
    product_description: loadingStoryboardName.value,
    // Добавляем дополнительные поля из ответа
    result_path: response.result_path,
    image_path: response.image_path,
    image_description: response.image_description,
  }

  // Добавляем проект в выбранную папку
  if (selectedFolder.value) {
    selectedFolder.value.projects.push(newProject)
  }

  // Переходим в редактор по ID проекта
  console.log('🚀 Переход в редактор с ID:', newProject.id)
  router.push(`/editor/${newProject.id}`)
}

// Обработчик неудачной генерации
const handleGenerationFailed = (response: ScriptGenerationResponse) => {
  console.error('💥 Генерация провалилась:', response)

  // Останавливаем проверку статуса
  if (statusCheckInterval.value) {
    clearInterval(statusCheckInterval.value)
    statusCheckInterval.value = null
  }

  showLoadingModal.value = false
  alert('Произошла ошибка при генерации сторибоарда. Попробуйте еще раз.')
}

// Обработчик завершения загрузки (старая версия - оставляем для совместимости)
const handleLoadingComplete = (name: string, description: string) => {
  console.log('✅ Загрузка завершена (старая версия)')
  showLoadingModal.value = false

  if (selectedFolder.value) {
    const randomColor = getRandomColor()
    const newProject: Project = {
      id: Date.now(),
      name: name,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: null,
      product_description: description,
    }

    // Добавляем проект в выбранную папку
    selectedFolder.value.projects.push(newProject)

    // Переходим в редактор по ID проекта
    console.log('🚀 Переход в редактор с ID (старая версия):', newProject.id)
    router.push(`/editor/${newProject.id}`)
  }
}

// Функция создания папки
const handleCreateFolder = async (name: string) => {
  console.log('📁 Создание папки:', name)

  try {
    const newFolder = await apiService.createFolder({ name })
    console.log('✅ Папка создана:', newFolder)

    // Обновляем оба списка
    await loadFolders()

    // Обновляем сайдбар
    if (sidebarRef.value) {
      await sidebarRef.value.loadFolders()
    }

    showNewFolderModal.value = false

    // Автоматически открываем созданную папку
    openProjectFolder(newFolder)
  } catch (error) {
    console.error('❌ Ошибка создания папки:', error)
  }
}

// Функция архивации папки
const archiveFolder = async (folder: Folder) => {
  if (!confirm(`Вы уверены, что хотите архивировать папку "${folder.name}"?`)) return

  try {
    await apiService.updateFolder(folder.id, {
      name: folder.name,
      archived: true,
    })
    console.log('✅ Папка архивирована')

    // Обновляем оба списка
    await loadFolders()

    // Обновляем сайдбар
    if (sidebarRef.value) {
      await sidebarRef.value.loadFolders()
    }

    // Если архивировали текущую выбранную папку, возвращаемся к списку
    if (selectedFolder.value?.id === folder.id) {
      goBackToFolders()
    }
  } catch (error) {
    console.error('❌ Ошибка архивации папки:', error)
  }
}

// Функция восстановления папки из архива
const unarchiveFolder = async (folder: Folder) => {
  try {
    await apiService.updateFolder(folder.id, {
      name: folder.name,
      archived: false,
    })
    console.log('✅ Папка восстановлена из архива')

    // Обновляем оба списка
    await loadFolders()

    // Обновляем сайдбар
    if (sidebarRef.value) {
      await sidebarRef.value.loadFolders()
    }
  } catch (error) {
    console.error('❌ Ошибка восстановления папки:', error)
  }
}

// Функция удаления папки
const deleteFolder = async (folderId: number) => {
  if (!confirm('Вы уверены, что хотите удалить эту папку?')) return

  try {
    await apiService.deleteFolder(folderId)
    console.log('✅ Папка удалена')

    // Обновляем оба списка
    await loadFolders()

    // Обновляем сайдбар
    if (sidebarRef.value) {
      await sidebarRef.value.loadFolders()
    }

    if (selectedFolder.value?.id === folderId) {
      goBackToFolders()
    }
  } catch (error) {
    console.error('❌ Ошибка удаления папки:', error)
  }
}

// Функция удаления проекта
const deleteProject = async (projectId: number) => {
  if (!confirm('Вы уверены, что хотите удалить этот сторибоард?')) return

  try {
    await apiService.deleteProject(projectId)
    console.log('✅ Сторибоард удален')

    // Обновляем данные
    await loadFolders()

    // Обновляем сайдбар
    if (sidebarRef.value) {
      await sidebarRef.value.loadFolders()
    }
  } catch (error) {
    console.error('❌ Ошибка удаления сторибоарда:', error)
  }
}

const closeNewStoryboardModal = () => {
  showNewStoryboardModal.value = false
}

const closeNewFolderModal = () => {
  showNewFolderModal.value = false
}

// Вычисляемые свойства для отображения
const displayItems = computed(() => {
  if (currentView.value === 'folders') {
    return projectFolders.value
  } else if (currentView.value === 'storyboards' && selectedFolder.value) {
    return selectedFolder.value.projects || []
  } else if (currentView.value === 'archive') {
    return archivedProjects.value
  }
  return []
})

const folderItems = computed(() => {
  if (currentView.value === 'folders') {
    return projectFolders.value
  } else if (currentView.value === 'archive') {
    return archivedProjects.value
  }
  return []
})

// Для проектов
const projectItems = computed(() => {
  if (currentView.value === 'storyboards' && selectedFolder.value) {
    return selectedFolder.value.projects || []
  }
  return []
})

const breadcrumbText = computed(() => {
  if (currentView.value === 'folders') {
    return 'Все папки'
  } else if (currentView.value === 'storyboards' && selectedFolder.value) {
    return selectedFolder.value.name
  } else if (currentView.value === 'archive') {
    return 'Архив'
  }
  return 'Папки'
})

const sectionTitle = computed(() => {
  if (currentView.value === 'folders') {
    return `ПАПКИ (${projectFolders.value.length})`
  } else if (currentView.value === 'storyboards') {
    return `СТОРИБОАРДЫ (${displayItems.value.length})`
  } else if (currentView.value === 'archive') {
    return `АРХИВ (${archivedProjects.value.length})`
  }
  return 'ПАПКИ'
})

const createButtonText = computed(() => {
  if (currentView.value === 'folders') {
    return 'Новая папка'
  } else if (currentView.value === 'storyboards') {
    return 'Новый сторибоард'
  } else if (currentView.value === 'archive') {
    return 'Добавить в архив'
  }
  return 'Создать'
})

const showBackButton = computed(() => {
  return currentView.value === 'storyboards'
})

// Функции для навигации
const goBackToFolders = async () => {
  if (isNavigating.value) return

  isNavigating.value = true
  console.log('🔙 Возврат к списку папок')
  currentView.value = 'folders'
  selectedFolder.value = null
  selectedProject.value = 'Все папки'

  await nextTick()
  isNavigating.value = false
}

const openArchive = async () => {
  if (isNavigating.value) return

  isNavigating.value = true
  console.log('📦 Открытие архива')
  currentView.value = 'archive'
  selectedFolder.value = null
  selectedProject.value = 'Архив'

  await nextTick()
  isNavigating.value = false
}

const createNew = () => {
  if (currentView.value === 'folders') {
    showNewFolderModal.value = true
  } else if (currentView.value === 'storyboards') {
    showNewStoryboardModal.value = true
  } else if (currentView.value === 'archive') {
    showArchiveModal.value = true
  }
}

// Обработчик выбора проекта из сайдбара
const handleProjectSelected = async (projectName: string) => {
  if (isNavigating.value) return

  isNavigating.value = true
  console.log('📋 Выбран проект из сайдбара:', projectName)

  // Ищем папку во всех папках (активных и архивных)
  const allFolders = [...projectFolders.value, ...archivedProjects.value]
  const folder = allFolders.find((f) => f.name === projectName)

  if (folder) {
    console.log('✅ Найдена папка:', folder.name, 'архивная:', folder.archived)

    // Обновляем selectedProject перед открытием папки
    selectedProject.value = projectName

    // Ждем обновления реактивных переменных
    await nextTick()

    // ОТКРЫВАЕМ ПАПКУ - это ключевое изменение!
    selectedFolder.value = folder
    currentView.value = 'storyboards'

    console.log('🔄 Состояния обновлены:', {
      selectedProject: selectedProject.value,
      currentView: currentView.value,
      selectedFolder: selectedFolder.value?.name,
    })
  } else {
    console.log('❌ Папка не найдена:', projectName)
    await goBackToFolders()
  }

  isNavigating.value = false
  await refreshSidebar()
}

const refreshSidebar = async () => {
  if (sidebarRef.value) {
    await nextTick()
    try {
      await sidebarRef.value.loadFolders()
      console.log('✅ Сайдбар обновлен')
    } catch (error) {
      console.error('❌ Ошибка обновления сайдбара:', error)
    }
  }
}

// Обработчик сброса проектов
const handleResetProjects = async () => {
  await goBackToFolders()
}

const activeFolders = computed(() => {
  return projectFolders.value.filter((folder) => !folder.archived)
})

// Загружаем данные при монтировании компонента
onMounted(() => {
  loadFolders()
  if (statusCheckInterval.value) {
    clearInterval(statusCheckInterval.value)
  }
})
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <DashboardSidebar
      ref="sidebarRef"
      :selected-project="selectedProject"
      :current-view="currentView"
      @project-selected="handleProjectSelected"
      @archive-selected="openArchive"
      @reset-projects="handleResetProjects"
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <!-- Back Button -->
            <button
              v-if="showBackButton"
              @click="goBackToFolders"
              class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span class="text-sm">Назад к папкам</span>
            </button>

            <!-- Search -->
            <div class="relative">
              <svg
                class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="
                  currentView === 'folders'
                    ? 'Поиск папок'
                    : currentView === 'storyboards'
                      ? 'Поиск сторибоардов'
                      : 'Поиск в архиве'
                "
                class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent w-80"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-3">
            <button
              @click="createNew"
              class="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-orange-500 transition-all duration-200 flex items-center space-x-2"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>{{ createButtonText }}</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Breadcrumb -->
      <div class="bg-white border-b border-gray-200 px-6 py-3">
        <nav class="flex items-center space-x-2 text-sm text-gray-500">
          <button
            @click="goBackToFolders"
            class="hover:text-gray-900 transition-colors"
            :class="{ 'text-gray-900 font-medium': currentView === 'folders' }"
          >
            Папки
          </button>
          <svg
            v-if="currentView === 'storyboards'"
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span v-if="currentView === 'storyboards'" class="text-gray-900 font-medium">
            {{ selectedFolder?.name }}
            <span v-if="selectedFolder?.archived" class="text-yellow-600 text-xs ml-2"
              >(в архиве)</span
            >
          </span>
          <span v-if="currentView === 'archive'" class="text-gray-900 font-medium"> Архив </span>
        </nav>
      </div>

      <!-- Content -->
      <main class="flex-1 overflow-auto p-6">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center space-x-3 mb-4">
            <h1 class="text-3xl font-bold text-gray-900">{{ breadcrumbText }}</h1>
          </div>

          <p class="text-gray-600 max-w-2xl">
            <span v-if="currentView === 'folders'">
              Добро пожаловать в M2 Boards! Самый быстрый способ для независимых видеокоманд
              планировать, презентовать и получать одобрение своих идей.
            </span>
            <span v-else-if="currentView === 'storyboards' && selectedFolder">
              {{ selectedFolder.projects?.length || 0 }} сторибоардов в этой папке
              <span v-if="selectedFolder.archived" class="text-yellow-600"
                >• Эта папка в архиве</span
              >
            </span>
            <span v-else-if="currentView === 'archive'">
              Архивированные папки. Здесь хранятся завершенные или неактивные папки.
            </span>
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>

        <!-- Items Section -->
        <div v-else>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">{{ sectionTitle }}</h2>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500">Дата создания</span>
              <button class="text-gray-400 hover:text-gray-600">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <!-- New Item Card -->
            <div
              @click="createNew"
              class="bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-pink-400 transition-colors duration-200 cursor-pointer group"
            >
              <div class="aspect-video flex items-center justify-center">
                <div class="text-center">
                  <div
                    class="bg-gradient-to-r from-pink-500 to-orange-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200"
                  >
                    <svg
                      class="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <p class="text-gray-600 font-medium">{{ createButtonText }}</p>
                </div>
              </div>
            </div>

            <!-- Папки показываются ТОЛЬКО в folders и archive -->
            <template v-if="currentView === 'folders' || currentView === 'archive'">
              <div
                v-for="folder in folderItems"
                :key="folder.id"
                class="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group relative"
                @click="handleItemClick(folder)"
              >
                <!-- Action Buttons для папок -->
                <div
                  class="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <!-- Archive/Unarchive Button -->
                  <button
                    v-if="currentView === 'folders'"
                    @click.stop="archiveFolder(folder)"
                    class="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="Архивировать"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                  </button>
                  <button
                    v-else-if="currentView === 'archive'"
                    @click.stop="unarchiveFolder(folder)"
                    class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Восстановить из архива"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>

                  <!-- Delete Button -->
                  <button
                    @click.stop="deleteFolder(folder.id)"
                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Удалить"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                <!-- Folder Content -->
                <div class="aspect-video flex flex-col items-center justify-center p-6">
                  <!-- Folder Icon -->
                  <div class="mb-4 relative">
                    <div
                      class="w-16 h-12 rounded-lg rounded-tr-none transform rotate-3 shadow-md"
                      :class="
                        folder.archived
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600'
                      "
                    >
                      <div
                        class="absolute -top-1 -right-1 w-4 h-1 rounded-full"
                        :class="folder.archived ? 'bg-yellow-400' : 'bg-blue-400'"
                      ></div>
                    </div>
                    <div
                      class="absolute -bottom-1 -left-1 w-14 h-10 rounded-lg rounded-tr-none opacity-80"
                      :class="
                        folder.archived
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                          : 'bg-gradient-to-r from-blue-400 to-blue-500'
                      "
                    ></div>
                  </div>

                  <!-- Folder Info -->
                  <h3 class="font-semibold text-gray-900 text-center mb-2">{{ folder.name }}</h3>
                  <p class="text-sm text-gray-500 text-center">
                    {{ folder.projects?.length || 0 }} сторибоардов
                  </p>
                  <span
                    v-if="folder.archived"
                    class="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full mt-2"
                  >
                    В архиве
                  </span>
                </div>

                <!-- Footer -->
                <div class="px-4 py-3 border-t border-gray-100">
                  <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>{{ new Date(folder.created_at).toLocaleDateString('ru-RU') }}</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Проекты показываются ТОЛЬКО в storyboards -->
            <template v-else-if="currentView === 'storyboards'">
              <div
                v-for="project in projectItems"
                :key="project.id"
                class="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group relative"
                @click="handleItemClick(project)"
              >
                <!-- Action Buttons для сторибордов -->
                <div
                  class="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <!-- Delete Button для сториборда -->
                  <button
                    @click.stop="deleteProject(project.id)"
                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Удалить сторибоард"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                <!-- Storyboard Content -->
                <div class="aspect-video flex flex-col items-center justify-center p-6">
                  <!-- Storyboard Icon -->
                  <div class="mb-4">
                    <div
                      class="w-16 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-400 shadow-md flex items-center justify-center"
                    >
                      <svg
                        class="h-6 w-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>

                  <!-- Storyboard Info -->
                  <h3 class="font-semibold text-gray-900 text-center mb-2">{{ project.name }}</h3>
                  <p class="text-sm text-gray-500 text-center">
                    {{ project.status === 'draft' ? 'Черновик' : 'Опубликован' }}
                  </p>
                  <p class="text-xs text-gray-400 text-center mt-1">
                    {{ new Date(project.created_at).toLocaleDateString('ru-RU') }}
                  </p>
                </div>

                <!-- Footer -->
                <div class="px-4 py-3 border-t border-gray-100">
                  <div class="flex items-center justify-between text-xs text-gray-500">
                    <span
                      >{{ project.product_description?.substring(0, 30)
                      }}{{ (project.product_description?.length || 0) > 30 ? '...' : '' }}</span
                    >
                  </div>
                </div>
              </div>
            </template>
          </div>
          <!-- Empty State -->
          <div
            v-if="displayItems.length === 0 && !isLoading"
            class="text-center py-12 text-gray-500"
          >
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Нет элементов</h3>
            <p class="mt-1 text-sm text-gray-500">
              {{
                currentView === 'folders'
                  ? 'Создайте свою первую папку сторибоардов.'
                  : currentView === 'storyboards'
                    ? 'Создайте свой первый сторибоард в этой папке.'
                    : 'В архиве пока нет папок.'
              }}
            </p>
          </div>
        </div>
      </main>
    </div>

    <!-- New Storyboard Modal -->
    <NewStoryboardModal
      :is-open="showNewStoryboardModal"
      :folder-name="selectedFolder?.name"
      @close="closeNewStoryboardModal"
      @create="handleCreateStoryboard"
    />

    <!-- New Folder Modal -->
    <NewFolderModal
      :is-open="showNewFolderModal"
      @close="closeNewFolderModal"
      @create="handleCreateFolder"
    />

    <!-- Loading Modal -->
    <StoryboardLoadingModal
      :is-open="showLoadingModal"
      :storyboard-name="loadingStoryboardName"
      @complete="handleLoadingComplete"
    />
    <!-- Archive Folders Modal -->
    <ArchiveFoldersModal
      :is-open="showArchiveModal"
      :folders="activeFolders"
      @close="showArchiveModal = false"
      @archive="archiveSelectedFolders"
    />
  </div>
</template>
