<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps<{
  isOpen: boolean
  storyboardName: string
}>()

const emit = defineEmits<{
  complete: [name: string, description: string]
}>()

const loadingSteps = [
  'Анализируем описание продукта...',
  'Создаем структуру сценария...',
  'Разрабатываем персонажей...',
  'Продумываем диалоги...',
  'Строим сюжетную арку...',
  'Добавляем визуальные элементы...',
  'Создаем раскадровку...',
  'Оптимизируем сценарий...',
  'Проверяем целостность истории...',
  'Формируем финальный сторибоард...',
]

const currentStep = ref(0)
let stepInterval: number | null = null

const startLoadingAnimation = () => {
  console.log('🚀 Запуск анимации загрузки')
  currentStep.value = 0

  // Циклически меняем шаги загрузки
  stepInterval = setInterval(() => {
    currentStep.value = (currentStep.value + 1) % loadingSteps.length
  }, 3000) // Меняем шаг каждые 3 секунды
}

const stopLoadingAnimation = () => {
  if (stepInterval) {
    clearInterval(stepInterval)
    stepInterval = null
  }
  currentStep.value = 0
}

// Следим за изменением isOpen
watch(
  () => props.isOpen,
  (newValue) => {
    console.log('👀 isOpen изменился:', newValue)
    if (newValue) {
      startLoadingAnimation()
    } else {
      stopLoadingAnimation()
    }
  },
)

// Очищаем интервал при размонтировании
onUnmounted(() => {
  stopLoadingAnimation()
})
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <div
          class="bg-gradient-to-r from-pink-500 to-orange-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg class="h-8 w-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
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
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Создаем сторибоард</h3>
        <p class="text-gray-600">"{{ storyboardName }}"</p>
      </div>

      <!-- Loading Steps -->
      <div class="mb-6">
        <div class="text-center">
          <p class="text-sm text-gray-600 mb-1">{{ loadingSteps[currentStep] }}</p>
        </div>
      </div>

      <!-- Loading Animation -->
      <div class="flex justify-center space-x-1">
        <div
          class="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
          style="animation-delay: 0ms"
        ></div>
        <div
          class="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
          style="animation-delay: 150ms"
        ></div>
        <div
          class="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
          style="animation-delay: 300ms"
        ></div>
      </div>

      <!-- Info Text -->
      <div class="text-center mt-4">
        <p class="text-xs text-gray-500">Это может занять несколько минут...</p>
        <p class="text-xs text-gray-400 mt-1">Пожалуйста, не закрывайте страницу</p>
      </div>
    </div>
  </div>
</template>
