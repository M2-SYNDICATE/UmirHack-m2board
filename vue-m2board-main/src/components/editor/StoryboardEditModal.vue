<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BlockEditModal from './BlockEditModal.vue'
import type { ScenarioBlock } from '@/services/api'

const props = defineProps<{
  isOpen: boolean
  blocks: ScenarioBlock[]
}>()

const emit = defineEmits<{
  close: []
  update: [blocks: ScenarioBlock[]]
  addBlock: [index: number, blockType: string]
  moveBlock: [fromIndex: number, toIndex: number]
  editBlock: [block: ScenarioBlock, index: number]
  deleteBlock: [blockIndex: number]
}>()

// Локальная копия блоков для редактирования
const localBlocks = ref<ScenarioBlock[]>([])

// Текущий редактируемый блок
const editingBlock = ref<ScenarioBlock | null>(null)
const editingIndex = ref<number>(-1)
const showEditModal = ref(false)

// Модальное окно выбора типа блока
const showBlockTypeModal = ref(false)
const newBlockIndex = ref<number>(-1)

// Модальное окно подтверждения удаления
const showDeleteConfirmModal = ref(false)
const deletingBlockIndex = ref<number>(-1)

// Инициализация блоков
watch(
  () => props.blocks,
  (newBlocks) => {
    localBlocks.value = JSON.parse(JSON.stringify(newBlocks))
  },
  { immediate: true },
)

// Закрытие модального окна
const closeModal = () => {
  emit('close')
}

// Сохранение изменений
const saveChanges = () => {
  emit('update', localBlocks.value)
  closeModal()
}

// Шаблоны для разных типов блоков
const getBlockTemplate = (type: string): Omit<ScenarioBlock, 'index'> => {
  const templates: { [key: string]: Omit<ScenarioBlock, 'index'> } = {
    scene_heading: {
      type: 'scene_heading',
      content: {
        location_type: 'INT',
        location: 'Новая локация',
        time: 'DAY',
      },
      formatting: {
        alignment: 'left',
        font_case: 'upper',
        indent: 0,
        max_lines: 1,
        font_size: 12,
        font_family: 'Courier New',
      },
    },
    action: {
      type: 'action',
      content: {
        description: 'Новое действие...',
      },
      formatting: {
        alignment: 'left',
        font_case: 'sentence',
        indent: 0,
        max_lines: 4,
        font_size: 12,
        font_family: 'Courier New',
      },
    },
    character: {
      type: 'character',
      content: {
        name: 'Новый персонаж',
        parenthetical: '',
        description: '',
      },
      formatting: {
        alignment: 'center',
        font_case: 'upper',
        indent: 2,
        max_lines: 1,
        font_size: 12,
        font_family: 'Courier New',
      },
    },
    dialogue: {
      type: 'dialogue',
      content: {
        speaker: 'Персонаж',
        text: 'Текст диалога...',
      },
      formatting: {
        alignment: 'left',
        font_case: 'sentence',
        indent: 1,
        max_lines: 3,
        font_size: 12,
        font_family: 'Courier New',
      },
    },
    transition: {
      type: 'transition',
      content: {
        transition_type: 'CUT TO',
        description: '',
      },
      formatting: {
        alignment: 'right',
        font_case: 'upper',
        indent: 0,
        max_lines: 1,
        font_size: 12,
        font_family: 'Courier New',
      },
    },
  }

  // Принудительно утверждаем тип
  return (templates[type] ?? templates.action) as Omit<ScenarioBlock, 'index'>
}

// Открытие модального окна выбора типа
const openBlockTypeModal = (index: number) => {
  newBlockIndex.value = index
  showBlockTypeModal.value = true
}

// Добавление блока выбранного типа
const addBlockWithType = (type: string) => {
  // Правильно вычисляем позицию для добавления ПОСЛЕ текущего блока
  const insertPosition = newBlockIndex.value + 1
  emit('addBlock', insertPosition, type)
  showBlockTypeModal.value = false
}
// Открытие модального окна подтверждения удаления
const openDeleteConfirmModal = (index: number) => {
  deletingBlockIndex.value = index
  showDeleteConfirmModal.value = true
}

// Удаление блока
const deleteBlock = () => {
  if (deletingBlockIndex.value === -1) {
    showDeleteConfirmModal.value = false
    return
  }

  const blockToDelete = localBlocks.value[deletingBlockIndex.value]
  if (!blockToDelete) {
    showDeleteConfirmModal.value = false
    deletingBlockIndex.value = -1
    return
  }

  const blockIndex = blockToDelete.index
  emit('deleteBlock', blockIndex)

  showDeleteConfirmModal.value = false
  deletingBlockIndex.value = -1
}

// Перемещение блока
const moveBlock = (fromIndex: number, toIndex: number) => {
  if (toIndex < 0 || toIndex >= localBlocks.value.length) return
  emit('moveBlock', fromIndex, toIndex)
}

// Начало редактирования блока
const startEditBlock = (block: ScenarioBlock, index: number) => {
  editingBlock.value = JSON.parse(JSON.stringify(block))
  editingIndex.value = index
  showEditModal.value = true
}
// Сохранение отредактированного блока
const saveEditedBlock = (updatedBlock: ScenarioBlock) => {
  console.log('💾 Сохранение блока из StoryboardEditModal:', updatedBlock)

  if (editingIndex.value !== -1) {
    localBlocks.value[editingIndex.value] = updatedBlock
    emit('editBlock', updatedBlock, editingIndex.value)
  }

  showEditModal.value = false
  editingBlock.value = null
  editingIndex.value = -1
}
// Функции для получения информации о блоках
const getBlockColor = (type: string) => {
  const colors: { [key: string]: string } = {
    scene_heading: 'border-blue-200 bg-blue-50',
    action: 'border-green-200 bg-green-50',
    character: 'border-purple-200 bg-purple-50',
    dialogue: 'border-orange-200 bg-orange-50',
    transition: 'border-gray-200 bg-gray-50',
  }
  return colors[type] || 'border-gray-200 bg-gray-50'
}

const getBlockSvgIcon = (type: string) => {
  const icons: { [key: string]: string } = {
    scene_heading: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    `,
    action: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    `,
    character: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    `,
    dialogue: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
    `,
    transition: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
      </svg>
    `,
  }
  return (
    icons[type] ||
    `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
    </svg>
  `
  )
}

const getBlockTypeName = (type: string) => {
  const names: { [key: string]: string } = {
    scene_heading: 'СЦЕНА',
    action: 'ДЕЙСТВИЕ',
    character: 'ПЕРСОНАЖ',
    dialogue: 'ДИАЛОГ',
    transition: 'ПЕРЕХОД',
  }
  return names[type] || type
}

const getBlockTitle = (block: ScenarioBlock) => {
  switch (block.type) {
    case 'scene_heading':
      return `${block.content.location} - ${block.content.time}`
    case 'character':
      return block.content.name
    case 'dialogue':
      return `Диалог: ${block.content.speaker || 'Персонаж'}`
    case 'transition':
      return `Переход: ${block.content.transition_type || block.content.type || 'Переход'}`
    case 'action':
      return 'Действие'
    default:
      return getBlockTypeName(block.type)
  }
}

// Опции для типов блоков
const blockTypes = [
  { type: 'scene_heading', name: 'Сцена', icon: 'scene_heading', color: 'blue' },
  { type: 'action', name: 'Действие', icon: 'action', color: 'green' },
  { type: 'character', name: 'Персонаж', icon: 'character', color: 'purple' },
  { type: 'dialogue', name: 'Диалог', icon: 'dialogue', color: 'orange' },
  { type: 'transition', name: 'Переход', icon: 'transition', color: 'gray' },
]
</script>

<template>
  <!-- Основное модальное окно редактирования сценария -->
  <div
    v-if="isOpen"
    class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Редактирование сценария</h2>
          <p class="text-sm text-gray-600 mt-1">Перетаскивайте блоки и редактируйте содержимое</p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            @click="closeModal"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Отмена
          </button>
          <button
            @click="saveChanges"
            class="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-orange-500 transition-all duration-200"
          >
            Сохранить изменения
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-auto p-6">
        <div class="space-y-4">
          <!-- Блоки сценария -->
          <div
            v-for="(block, index) in localBlocks"
            :key="block.index"
            class="flex items-start space-x-4 group"
          >
            <!-- Номер блока и действия -->
            <div class="flex flex-col items-center space-y-2 pt-2">
              <div
                class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600"
              >
                {{ block.index }}
              </div>

              <!-- Кнопки перемещения -->
              <button
                v-if="index > 0"
                @click="moveBlock(index, index - 1)"
                class="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                title="Переместить вверх"
              >
                <svg
                  class="w-3 h-3 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>

              <button
                v-if="index < localBlocks.length - 1"
                @click="moveBlock(index, index + 1)"
                class="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                title="Переместить вниз"
              >
                <svg
                  class="w-3 h-3 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <!-- Кнопка удаления -->
              <button
                @click="openDeleteConfirmModal(index)"
                class="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                title="Удалить блок"
              >
                <svg
                  class="w-3 h-3 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>

            <!-- Контент блока -->
            <div
              class="flex-1 border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer"
              :class="[
                getBlockColor(block.type),
                editingIndex === index ? 'ring-2 ring-pink-500' : '',
              ]"
              @click="startEditBlock(block, index)"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="text-gray-600" v-html="getBlockSvgIcon(block.type)"></div>
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ getBlockTypeName(block.type) }}</h3>
                    <p class="text-xs text-gray-600">{{ getBlockTitle(block) }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-1">
                  <button
                    @click.stop="startEditBlock(block, index)"
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-gray-400 hover:text-gray-600"
                    title="Редактировать блок"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Содержимое блока -->
              <div class="text-sm text-gray-700">
                <template v-if="block.type === 'scene_heading'">
                  <p><strong>Локация:</strong> {{ block.content.location }}</p>
                  <p><strong>Время:</strong> {{ block.content.time }}</p>
                  <p v-if="block.content.location_type">
                    <strong>Тип:</strong> {{ block.content.location_type }}
                  </p>
                </template>
                <template v-else-if="block.type === 'character'">
                  <p><strong>Имя:</strong> {{ block.content.name }}</p>
                  <p v-if="block.content.parenthetical">
                    <strong>Реплика:</strong> {{ block.content.parenthetical }}
                  </p>
                  <p v-if="block.content.description">
                    <strong>Описание:</strong> {{ block.content.description }}
                  </p>
                </template>
                <template v-else-if="block.type === 'dialogue'">
                  <p><strong>Говорящий:</strong> {{ block.content.speaker || 'Персонаж' }}</p>
                  <p class="italic mt-1">"{{ block.content.text }}"</p>
                </template>
                <template v-else-if="block.type === 'transition'">
                  <p>
                    <strong>Тип:</strong>
                    {{ block.content.transition_type || block.content.type || 'переход' }}
                  </p>
                  <p v-if="block.content.description">
                    <strong>Описание:</strong> {{ block.content.description }}
                  </p>
                </template>
                <template v-else>
                  <p>{{ block.content.description }}</p>
                </template>
              </div>
            </div>

            <!-- Кнопка добавления блока после текущего -->
            <div class="flex items-center pt-2">
              <button
                @click="openBlockTypeModal(index)"
                class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors group/add"
                title="Добавить блок после"
              >
                <svg
                  class="w-4 h-4 text-gray-500 group-hover/add:text-gray-700"
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
              </button>
            </div>
          </div>

          <!-- Кнопка добавления нового блока в конец -->
          <div class="flex justify-center pt-4">
            <button
              @click="openBlockTypeModal(localBlocks.length)"
              class="flex items-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-all duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Добавить новый блок</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Модальное окно выбора типа блока -->
  <div
    v-if="showBlockTypeModal"
    class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Выберите тип блока</h3>

      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="blockType in blockTypes"
          :key="blockType.type"
          @click="addBlockWithType(blockType.type)"
          class="p-4 border-2 rounded-lg text-left hover:shadow-md transition-all duration-200"
          :class="[
            `border-${blockType.color}-200 bg-${blockType.color}-50 hover:bg-${blockType.color}-100`,
          ]"
        >
          <div class="flex items-center space-x-3">
            <div class="text-gray-600" v-html="getBlockSvgIcon(blockType.type)"></div>
            <div>
              <h4 class="font-semibold text-gray-900">{{ blockType.name }}</h4>
              <p class="text-xs text-gray-600 mt-1">
                {{ getBlockTypeName(blockType.type) }}
              </p>
            </div>
          </div>
        </button>
      </div>

      <div class="flex justify-end mt-6">
        <button
          @click="showBlockTypeModal = false"
          class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  </div>

  <!-- Модальное окно подтверждения удаления -->
  <div
    v-if="showDeleteConfirmModal"
    class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
      <div class="text-center">
        <div
          class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"
        >
          <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Удалить блок?</h3>
        <p class="text-sm text-gray-600 mb-6">
          Вы уверены, что хотите удалить этот блок? Это действие нельзя отменить.
        </p>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          @click="showDeleteConfirmModal = false"
          class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Отмена
        </button>
        <button
          @click="deleteBlock"
          class="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-all duration-200"
        >
          Удалить
        </button>
      </div>
    </div>
  </div>

  <!-- Модальное окно редактирования конкретного блока -->
  <BlockEditModal
    v-if="showEditModal && editingBlock"
    :is-open="showEditModal"
    :block="editingBlock"
    @close="showEditModal = false"
    @save="saveEditedBlock"
  />
</template>
