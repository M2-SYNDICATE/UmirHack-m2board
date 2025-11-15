<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Folder } from '@/services/api' // Добавляем импорт типа

interface Props {
  isOpen: boolean
  folders: Folder[] // Получаем папки из родителя
}

interface Emits {
  (e: 'close'): void
  (e: 'archive', folderIds: number[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Данные
const selectedFolders = ref<number[]>([])
const isArchiving = ref(false)

// Вычисляемые свойства
const availableFolders = computed(() => {
  return props.folders.filter((folder) => !folder.archived)
})

const selectedCount = computed(() => {
  return selectedFolders.value.length
})

const canArchive = computed(() => {
  return selectedCount.value > 0 && !isArchiving.value
})

// Обработчики
const toggleFolderSelection = (folderId: number) => {
  const index = selectedFolders.value.indexOf(folderId)
  if (index > -1) {
    selectedFolders.value.splice(index, 1)
  } else {
    selectedFolders.value.push(folderId)
  }
}

const selectAll = () => {
  if (selectedFolders.value.length === availableFolders.value.length) {
    selectedFolders.value = []
  } else {
    selectedFolders.value = availableFolders.value.map((folder) => folder.id)
  }
}

const handleArchive = async () => {
  if (!canArchive.value) return

  isArchiving.value = true
  try {
    emit('archive', selectedFolders.value)
    handleClose()
  } catch (error) {
    console.error('❌ Ошибка архивации:', error)
  } finally {
    isArchiving.value = false
  }
}

const handleClose = () => {
  selectedFolders.value = []
  emit('close')
}
</script>

<template>
  <!-- Modal Overlay -->
  <div
    v-if="isOpen"
    class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="handleClose"
  >
    <!-- Modal Content -->
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col transform transition-all duration-200"
    >
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Добавить в архив</h3>
            <p class="text-sm text-gray-500 mt-1">Выберите папки для перемещения в архив</p>
          </div>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <!-- Modal Body -->
      <div class="flex-1 overflow-hidden flex flex-col">
        <!-- Selection Info -->
        <div
          v-if="selectedCount > 0"
          class="bg-blue-50 border-b border-blue-200 px-6 py-3 flex-shrink-0"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="bg-blue-100 p-1 rounded">
                <svg
                  class="h-4 w-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span class="text-sm font-medium text-blue-800">
                Выбрано папок: {{ selectedCount }}
              </span>
            </div>
            <button
              @click="selectAll"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              {{ selectedCount === availableFolders.length ? 'Снять выделение' : 'Выбрать все' }}
            </button>
          </div>
        </div>

        <!-- Folders List -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-6">
            <!-- Empty State -->
            <div v-if="availableFolders.length === 0" class="text-center py-8">
              <svg
                class="mx-auto h-12 w-12 text-gray-400 mb-3"
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
              <h3 class="text-sm font-medium text-gray-900 mb-1">Нет доступных папок</h3>
              <p class="text-sm text-gray-500">Все папки уже находятся в архиве</p>
            </div>

            <!-- Folders Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                v-for="folder in availableFolders"
                :key="folder.id"
                class="border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-pink-300 hover:shadow-sm"
                :class="{
                  'border-pink-500 bg-pink-50 shadow-sm': selectedFolders.includes(folder.id),
                  'border-gray-200 bg-white': !selectedFolders.includes(folder.id),
                }"
                @click="toggleFolderSelection(folder.id)"
              >
                <div class="flex items-start space-x-3">
                  <!-- Checkbox -->
                  <div class="flex-shrink-0 mt-1">
                    <div
                      class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                      :class="{
                        'border-pink-500 bg-pink-500': selectedFolders.includes(folder.id),
                        'border-gray-300': !selectedFolders.includes(folder.id),
                      }"
                    >
                      <svg
                        v-if="selectedFolders.includes(folder.id)"
                        class="h-3 w-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>

                  <!-- Folder Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2 mb-2">
                      <!-- Folder Icon -->
                      <div class="relative">
                        <div
                          class="w-6 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-sm rounded-tr-none transform rotate-3"
                        >
                          <div
                            class="absolute -top-0.5 -right-0.5 w-2 h-0.5 bg-blue-400 rounded-full"
                          ></div>
                        </div>
                        <div
                          class="absolute -bottom-0.5 -left-0.5 w-5 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-sm rounded-tr-none opacity-80"
                        ></div>
                      </div>

                      <h4 class="font-medium text-gray-900 truncate">{{ folder.name }}</h4>
                    </div>

                    <div class="flex items-center space-x-4 text-xs text-gray-500">
                      <span class="flex items-center space-x-1">
                        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span>{{ folder.projects?.length || 0 }} сторибоардов</span>
                      </span>
                      <span>{{ new Date(folder.created_at).toLocaleDateString('ru-RU') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex-shrink-0">
        <div class="flex space-x-3">
          <button
            @click="handleClose"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            :disabled="isArchiving"
          >
            Отмена
          </button>
          <button
            @click="handleArchive"
            :disabled="!canArchive"
            class="flex-1 bg-gradient-to-r from-yellow-500 to-orange-400 text-white px-4 py-2 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <svg v-if="isArchiving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>
              {{ isArchiving ? 'Архивация...' : `В архив (${selectedCount})` }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
