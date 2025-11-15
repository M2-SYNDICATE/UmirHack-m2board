<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  isOpen: boolean
  folderName?: string
}>()

const emit = defineEmits<{
  close: []
  create: [data: { project_name: string; product_description: string }] // ИЗМЕНИТЬ ТУТ
}>()

const name = ref('')
const description = ref('')
const isLoading = ref(false)

const handleCreate = async () => {
  if (!name.value.trim() || !description.value.trim()) return

  isLoading.value = true

  // Имитация создания сторибоарда
  setTimeout(() => {
    isLoading.value = false
    emit('create', {
      project_name: name.value.trim(), // ИЗМЕНИТЬ ТУТ
      product_description: description.value.trim(), // ИЗМЕНИТЬ ТУТ
    })
    name.value = ''
    description.value = ''
  }, 1000)
}

const handleClose = () => {
  name.value = ''
  description.value = ''
  emit('close')
}
</script>

<template>
  <!-- Modal Overlay with ONLY blur, no black background -->
  <div
    v-if="isOpen"
    class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="handleClose"
  >
    <!-- Modal Content -->
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-200"
    >
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold text-gray-900">Новый сторибоард</h3>
          <button @click="handleClose" class="text-gray-400 hover:text-gray-600 transition-colors">
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
        <p v-if="folderName" class="text-sm text-gray-500 mt-1">
          Создание сторибоарда в проекте "{{ folderName }}"
        </p>
      </div>

      <!-- Modal Body -->
      <div class="px-6 py-6">
        <!-- Name Field -->
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Название сторибоарда
          </label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="Введите название сторибоарда..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            :disabled="isLoading"
          />
        </div>

        <!-- Description Field -->
        <div class="mb-6">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
            Краткое описание сценария
          </label>
          <textarea
            id="description"
            v-model="description"
            rows="4"
            placeholder="Опишите основную идею вашего сторибоарда..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            :disabled="isLoading"
          />
          <p class="text-xs text-gray-500 mt-1">
            Например: "Рекламный ролик о новом продукте с акцентом на его преимущества"
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3">
          <button
            @click="handleClose"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            :disabled="isLoading"
          >
            Отмена
          </button>
          <button
            @click="handleCreate"
            :disabled="!name.trim() || !description.trim() || isLoading"
            class="flex-1 bg-gradient-to-r from-pink-500 to-orange-400 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-orange-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <svg v-if="isLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
            <span>{{ isLoading ? 'Создание...' : 'Создать сторибоард' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
