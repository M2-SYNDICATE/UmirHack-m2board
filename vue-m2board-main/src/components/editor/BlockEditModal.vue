<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">{{ modalTitle }}</h2>
          <p class="text-sm text-gray-500 mt-1">Заполните все поля для создания блока</p>
        </div>
        <button @click="closeModal" class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-auto p-6">
        <!-- Сообщения об ошибках -->
        <div
          v-if="validationErrors.length > 0"
          class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div class="flex items-start space-x-2">
            <svg
              class="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div class="text-sm text-red-700">
              <p class="font-medium">Заполните обязательные поля:</p>
              <ul class="mt-1 list-disc list-inside">
                <li v-for="error in validationErrors" :key="error">{{ error }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Переключатель режима редактирования -->
        <div class="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            @click="editMode = 'manual'"
            :class="[
              'flex items-center justify-center space-x-2 flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              editMode === 'manual'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            <span v-html="getModeIcon('manual')"></span>
            <span>Ручное редактирование</span>
          </button>
          <button
            @click="editMode = 'ai'"
            disabled
            :class="[
              'flex items-center justify-center space-x-2 flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-not-allowed',
              editMode === 'ai' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400',
            ]"
          >
            <span v-html="getModeIcon('ai')"></span>
            <span>Генерация через ИИ</span>
          </button>
        </div>

        <!-- Ручное редактирование -->
        <div v-if="editMode === 'manual'" class="space-y-4">
          <div v-for="field in editFields" :key="field.key" class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              {{ field.label }}
              <span v-if="isFieldRequired(field)" class="text-red-500">*</span>
            </label>

            <input
              v-if="field.type === 'text'"
              :ref="setFirstInputRef"
              :value="getValue(field.key)"
              @input="updateValue(field.key, ($event.target as HTMLInputElement).value)"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              :placeholder="getPlaceholder(field)"
            />

            <textarea
              v-else-if="field.type === 'textarea'"
              :ref="setFirstInputRef"
              :value="getValue(field.key)"
              @input="updateValue(field.key, ($event.target as HTMLTextAreaElement).value)"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              :placeholder="getPlaceholder(field)"
            />

            <select
              v-else-if="field.type === 'select'"
              :value="getValue(field.key)"
              @change="updateValue(field.key, ($event.target as HTMLSelectElement).value)"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">Выберите...</option>
              <option v-for="option in field.options" :key="option" :value="option">
                {{ getOptionLabel(field.key, option) }}
              </option>
            </select>
          </div>
        </div>

        <!-- Генерация через ИИ -->
        <div v-else class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Промпт для ИИ</label>
            <textarea
              v-model="aiPrompt"
              rows="4"
              placeholder="Опишите, что вы хотите сгенерировать..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">
              ИИ поможет улучшить или переписать содержимое блока
            </p>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <div class="text-blue-600 mt-0.5">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div class="text-sm text-blue-700">
                <p class="font-medium">
                  Примеры промптов для "{{ getBlockTypeName(localBlock.type) }}"
                </p>
                <ul class="mt-2 space-y-1">
                  <li v-for="example in aiPromptExamples" :key="example" class="text-xs">
                    • {{ example }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <button
            @click="generateWithAI"
            :disabled="isGenerating || !aiPrompt.trim()"
            class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <svg v-if="isGenerating" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
            <span>{{ isGenerating ? 'Генерация...' : 'Сгенерировать через ИИ' }}</span>
          </button>

          <!-- Предпросмотр сгенерированного контента -->
          <div
            v-if="aiGeneratedContent && !isGenerating"
            class="border border-green-200 bg-green-50 rounded-lg p-4 mt-4"
          >
            <h4 class="font-medium text-green-800 mb-2">Сгенерированный контент:</h4>
            <p class="text-sm text-green-700 whitespace-pre-wrap">{{ aiGeneratedContent }}</p>
            <div class="flex justify-end mt-3">
              <button
                @click="applyAIContent"
                class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end space-x-3 p-6 border-t border-gray-200">
        <button
          @click="closeModal"
          class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Отмена
        </button>
        <button
          @click="saveChanges"
          :disabled="!isFormValid || isGenerating"
          class="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-orange-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ (block as any)?.isNew ? 'Создать блок' : 'Сохранить изменения' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'

const props = defineProps<{
  isOpen: boolean
  block: any
  canEdit?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [block: any]
}>()

// Локальная копия блока для редактирования
const localBlock = ref<any>({})
const editMode = ref<'manual' | 'ai'>('manual')
const aiPrompt = ref('')
const isGenerating = ref(false)
const aiGeneratedContent = ref('')
const firstInputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)

// Валидация
const isFormValid = ref(false)
const validationErrors = ref<string[]>([])

const setFirstInputRef = (el: any) => {
  if (el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
    firstInputRef.value = el
  }
}

// Получение промпта для ИИ на основе типа блока
const getBlockAIPrompt = (block: any) => {
  switch (block.type) {
    case 'scene_heading':
      return `Опиши сцену: ${block.content.location_type} ${block.content.location} в ${block.content.time}. `
    case 'action':
      return block.content.description || 'Опиши действие персонажа в сцене'
    case 'character':
      return `Опиши персонажа: ${block.content.name}. ${block.content.description || ''}`
    case 'dialogue':
      return `Напиши диалог для ${block.content.speaker || 'персонажа'} в стиле кинематографичного сценария`
    case 'transition':
      return `Опиши переход: ${block.content.transition_type || block.content.type} между сценами`
    default:
      return 'Опиши этот блок сценария'
  }
}

// Примеры промптов для ИИ
const aiPromptExamples = computed(() => {
  switch (localBlock.value.type) {
    case 'scene_heading':
      return [
        'Добавь атмосферные детали к интерьеру квартиры',
        'Сделай описание экстерьера более кинематографичным',
        'Уточни время суток и освещение',
      ]
    case 'action':
      return [
        'Сделай действие более динамичным и визуальным',
        'Добавь эмоции и невербальные действия персонажа',
        'Опиши движение камеры или ракурс',
      ]
    case 'character':
      return [
        'Добавь характерные жесты и манеры',
        'Опиши внешность и стиль одежды',
        'Создай уникальную речевую характеристику',
      ]
    case 'dialogue':
      return [
        'Сделай диалог более естественным и живым',
        'Добавь подтекст и скрытые эмоции',
        'Создай остроумную реплику в стиле комедии',
      ]
    case 'transition':
      return [
        'Предложи альтернативные варианты перехода',
        'Опиши визуальный эффект перехода',
        'Создай плавный переход между сценами',
      ]
    default:
      return ['Улучши содержание блока', 'Сделай более детализированным', 'Добавь креативности']
  }
})

// Валидация формы
const validateForm = () => {
  const errors: string[] = []

  switch (localBlock.value.type) {
    case 'scene_heading':
      if (!localBlock.value.content?.location?.trim()) {
        errors.push('Укажите локацию')
      }
      if (!localBlock.value.content?.location_type?.trim()) {
        errors.push('Выберите тип локации')
      }
      if (!localBlock.value.content?.time?.trim()) {
        errors.push('Выберите время')
      }
      break

    case 'action':
      if (!localBlock.value.content?.description?.trim()) {
        errors.push('Введите описание действия')
      }
      break

    case 'character':
      if (!localBlock.value.content?.name?.trim()) {
        errors.push('Введите имя персонажа')
      }
      break

    case 'dialogue':
      if (!localBlock.value.content?.speaker?.trim()) {
        errors.push('Введите говорящего')
      }
      if (!localBlock.value.content?.text?.trim()) {
        errors.push('Введите текст диалога')
      }
      break

    case 'transition':
      if (!localBlock.value.content?.transition_type?.trim()) {
        errors.push('Выберите тип перехода')
      }
      break
  }

  validationErrors.value = errors
  isFormValid.value = errors.length === 0

  return isFormValid.value
}

// Проверка обязательности поля
const isFieldRequired = (field: any) => {
  const requiredFields = [
    'content.location',
    'content.location_type',
    'content.time',
    'content.description',
    'content.name',
    'content.speaker',
    'content.text',
    'content.transition_type',
  ]
  return requiredFields.includes(field.key)
}

// Инициализация блока
watch(
  () => props.block,
  (newBlock) => {
    if (newBlock) {
      localBlock.value = JSON.parse(JSON.stringify(newBlock))
      aiPrompt.value = getBlockAIPrompt(newBlock)
      aiGeneratedContent.value = ''
      validateForm()

      // Автофокус при открытии
      nextTick(() => {
        if (firstInputRef.value) {
          firstInputRef.value.focus()
        }
      })
    }
  },
  { immediate: true },
)

// Следим за открытием модального окна
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      // Сбрасываем состояние при открытии
      editMode.value = 'manual'
      isGenerating.value = false
      aiGeneratedContent.value = ''

      nextTick(() => {
        if (firstInputRef.value) {
          firstInputRef.value.focus()
        }
      })
    }
  },
)

// Следим за изменениями в блоке и валидируем
watch(
  () => localBlock.value,
  () => {
    validateForm()
  },
  { deep: true },
)

// Закрытие модального окна
const closeModal = () => {
  emit('close')
}

// Сохранение изменений
const saveChanges = () => {
  if (!validateForm()) {
    const errorMessage = validationErrors.value.join('\n')
    alert(`Пожалуйста, заполните все обязательные поля:\n${errorMessage}`)
    return
  }

  console.log('📤 Отправка данных и закрытие модалки')

  emit('save', localBlock.value)

  emit('close')
}

// Генерация через ИИ
const generateWithAI = async () => {
  if (!aiPrompt.value.trim()) return

  isGenerating.value = true
  aiGeneratedContent.value = ''

  try {
    // Имитация вызова API для генерации через ИИ
    console.log('Генерация через ИИ с промптом:', aiPrompt.value)

    // Имитация задержки сети
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Генерация контента в зависимости от типа блока
    switch (localBlock.value.type) {
      case 'scene_heading':
        aiGeneratedContent.value = `ИНТ. ${localBlock.value.content.location || 'ЛОКАЦИЯ'} - ${localBlock.value.content.time || 'ДЕНЬ'}\n${aiPrompt.value} - камера медленно движется по помещению, выхватывая детали обстановки.`
        break
      case 'action':
        aiGeneratedContent.value = `${aiPrompt.value}. Персонаж совершает движение, выражающее его эмоциональное состояние. Камера следует за ним, подчеркивая значимость момента.`
        break
      case 'character':
        aiGeneratedContent.value = `${localBlock.value.content.name} - ${aiPrompt.value}. Его/ее присутствие ощущается в кадре, манера держаться говорит о характере.`
        break
      case 'dialogue':
        aiGeneratedContent.value = `"${aiPrompt.value}" - произносит с определенной интонацией, глядя прямо в камеру/на собеседника.`
        break
      case 'transition':
        aiGeneratedContent.value = `${aiPrompt.value}. Плавная смена планов, создающая нужный ритм и настроение.`
        break
      default:
        aiGeneratedContent.value = aiPrompt.value
    }
  } catch (error) {
    console.error('Ошибка генерации через ИИ:', error)
    aiGeneratedContent.value = 'Ошибка генерации. Попробуйте еще раз.'
  } finally {
    isGenerating.value = false
  }
}

// Применение сгенерированного контента
const applyAIContent = () => {
  if (!aiGeneratedContent.value) return

  switch (localBlock.value.type) {
    case 'scene_heading':
      if (localBlock.value.content.location) {
        localBlock.value.content.location += ` - ${aiGeneratedContent.value}`
      }
      break
    case 'action':
      localBlock.value.content.description = aiGeneratedContent.value
      break
    case 'character':
      localBlock.value.content.description = aiGeneratedContent.value
      break
    case 'dialogue':
      localBlock.value.content.text = aiGeneratedContent.value
      break
    case 'transition':
      localBlock.value.content.description = aiGeneratedContent.value
      break
    default:
      if (localBlock.value.content.description) {
        localBlock.value.content.description = aiGeneratedContent.value
      }
  }

  // Переключаемся на ручное редактирование для просмотра результата
  editMode.value = 'manual'
  aiGeneratedContent.value = ''
}

// Заголовок модального окна
const modalTitle = computed(() => {
  const typeNames: { [key: string]: string } = {
    scene_heading: 'Сцены',
    action: 'Действия',
    character: 'Персонажа',
    dialogue: 'Диалога',
    transition: 'Перехода',
  }
  return `Редактирование ${typeNames[localBlock.value.type] || 'блока'}`
})

// Поля для редактирования в зависимости от типа блока
const editFields = computed(() => {
  const baseFields = []

  switch (localBlock.value.type) {
    case 'scene_heading':
      baseFields.push(
        {
          label: 'Тип локации',
          key: 'content.location_type',
          type: 'select',
          options: ['INT', 'EXT', 'INT/EXT'],
        },
        { label: 'Локация', key: 'content.location', type: 'text' },
        {
          label: 'Время',
          key: 'content.time',
          type: 'select',
          options: ['DAY', 'NIGHT', 'MORNING', 'EVENING'],
        },
      )
      break
    case 'action':
      baseFields.push({ label: 'Описание действия', key: 'content.description', type: 'textarea' })
      break
    case 'character':
      baseFields.push(
        { label: 'Имя персонажа', key: 'content.name', type: 'text' },
        { label: 'Реплика в скобках', key: 'content.parenthetical', type: 'text' },
        { label: 'Описание персонажа', key: 'content.description', type: 'textarea' },
      )
      break
    case 'dialogue':
      baseFields.push(
        { label: 'Говорящий', key: 'content.speaker', type: 'text' },
        { label: 'Текст диалога', key: 'content.text', type: 'textarea' },
      )
      break
    case 'transition':
      baseFields.push(
        {
          label: 'Тип перехода',
          key: 'content.transition_type',
          type: 'select',
          options: ['CUT TO', 'FADE TO', 'DISSOLVE TO', 'FADE IN', 'FADE OUT'],
        },
        { label: 'Описание перехода', key: 'content.description', type: 'textarea' },
      )
      break
    default:
      baseFields.push({ label: 'Содержимое', key: 'content.description', type: 'textarea' })
  }

  return baseFields
})

// Ключ первого поля для автофокуса
const firstFieldKey = computed(() => {
  return editFields.value[0]?.key || ''
})

// Обновление значения в объекте по пути
const updateValue = (path: string, value: any) => {
  const keys = path.split('.')
  let obj: any = localBlock.value

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (obj && typeof obj === 'object' && key !== undefined) {
      if (!obj[key]) {
        obj[key] = {}
      }
      obj = obj[key]
    } else {
      console.warn(`Invalid path: ${path}`)
      return
    }
  }

  const lastKey = keys[keys.length - 1]
  if (obj && typeof obj === 'object' && lastKey !== undefined) {
    obj[lastKey] = value
  }
}
// Получение значения из объекта по пути
const getValue = (path: string) => {
  const keys = path.split('.')
  let obj = localBlock.value
  for (const key of keys) {
    if (obj && typeof obj === 'object' && key in obj) {
      obj = obj[key]
    } else {
      return ''
    }
  }
  return obj
}

// Получение плейсхолдера для поля
const getPlaceholder = (field: any) => {
  switch (field.key) {
    case 'content.location':
      return 'Например: КВАРТИРА АННЫ - ГОСТИНАЯ'
    case 'content.description':
      return 'Опишите действие, персонажа или сцену...'
    case 'content.name':
      return 'Имя персонажа'
    case 'content.text':
      return 'Текст реплики...'
    case 'content.parenthetical':
      return '(действие или эмоция)'
    default:
      return ''
  }
}

// Получение метки для опции селекта
const getOptionLabel = (fieldKey: string, option: string) => {
  const labels: { [key: string]: { [key: string]: string } } = {
    'content.location_type': {
      INT: 'Интерьер (INT)',
      EXT: 'Экстерьер (EXT)',
      'INT/EXT': 'Интерьер/Экстерьер (INT/EXT)',
    },
    'content.time': {
      DAY: 'День',
      NIGHT: 'Ночь',
      MORNING: 'Утро',
      EVENING: 'Вечер',
    },
    'content.transition_type': {
      'CUT TO': 'Резкая смена (CUT TO)',
      'FADE TO': 'Плавный переход (FADE TO)',
      'DISSOLVE TO': 'Растворение (DISSOLVE TO)',
      'FADE IN': 'Появление (FADE IN)',
      'FADE OUT': 'Исчезновение (FADE OUT)',
    },
  }

  return labels[fieldKey]?.[option] || option
}

// Вспомогательные функции
const getBlockTypeName = (type: string) => {
  const names: { [key: string]: string } = {
    scene_heading: 'Сцена',
    action: 'Действие',
    character: 'Персонаж',
    dialogue: 'Диалог',
    transition: 'Переход',
  }
  return names[type] || type
}

// SVG иконки для переключателей
const getModeIcon = (mode: string) => {
  const icons: { [key: string]: string } = {
    manual: `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
      `,
    ai: `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
      `,
  }
  return icons[mode] || ''
}
</script>
