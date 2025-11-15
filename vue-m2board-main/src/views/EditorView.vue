<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  apiService,
  type Scenario,
  type ScenarioBlock,
  type BlockImagesResponse,
  type BlockImage,
} from '@/services/api'
import BlockEditModal from '@/components/editor/BlockEditModal.vue'
import StoryboardEditModal from '@/components/editor/StoryboardEditModal.vue'

const route = useRoute()
const router = useRouter()

// ID проекта из URL
const projectId = ref<number>(parseInt(route.params.id as string))

// Данные проекта
const projectData = ref<any>(null)
const scenarioData = ref<Scenario | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

// Режимы просмотра и зум
const viewMode = ref<'grid' | 'list'>('grid')
const zoomLevel = ref(100)

// Модальные окна
const showImageModal = ref(false)
const selectedBlock = ref<any>(null)
const customPrompt = ref('')
const useBlockPrompt = ref(true)
const isGeneratingImage = ref(false)

// Модальные окна редактирования
const showStoryboardEditModal = ref(false)
const showBlockEditModal = ref(false)
const editingBlock = ref<ScenarioBlock | null>(null)
const editingBlockIndex = ref<number>(-1)

// Состояния генерации
const isGeneratingScenario = ref(false)
const isGeneratingImages = ref(false)

const blockImages = ref<Map<number, string>>(new Map()) // blockIndex -> imageURL
const loadingImages = ref<Set<number>>(new Set()) // block indices that are loading

// Интервалы для проверки статуса
let statusCheckInterval: number | null = null
let scenarioStatusInterval: number | null = null

// Проверяем, можно ли редактировать
const canEdit = computed(() => {
  return !isGeneratingScenario.value && !isGeneratingImages.value
})

// Функция для загрузки изображений блоков
const loadBlockImages = async (blockIndices: number[]) => {
  if (blockIndices.length === 0) return

  try {
    // Помечаем блоки как загружающиеся
    blockIndices.forEach((index) => loadingImages.value.add(index))

    const response = await apiService.getBlockImages(projectId.value, blockIndices)

    // Обрабатываем результаты
    response.results.forEach((result) => {
      const blockIndex = result.block_index

      if (result.images && result.images.length > 0) {
        const image = result.images[0]
        if (image && image.mime_type && image.data_base64) {
          const imageUrl = `data:${image.mime_type};base64,${image.data_base64}`
          blockImages.value.set(blockIndex, imageUrl)
        }
      }
      // Убираем из загрузки
      loadingImages.value.delete(blockIndex)
    })

    console.log('✅ Изображения блоков загружены:', response.results.length)
  } catch (err) {
    console.error('❌ Ошибка загрузки изображений блоков:', err)
    // Убираем все блоки из загрузки при ошибке
    blockIndices.forEach((index) => loadingImages.value.delete(index))
  }
}

// Функция для загрузки изображения конкретного блока
const loadSingleBlockImage = async (blockIndex: number) => {
  await loadBlockImages([blockIndex])
}

// Функция для загрузки всех изображений action блоков
const loadAllActionBlockImages = async () => {
  if (!scenarioData.value?.blocks) return

  const actionBlockIndices = scenarioData.value.blocks
    .filter((block) => block.type === 'action')
    .map((block) => block.index)

  if (actionBlockIndices.length > 0) {
    await loadBlockImages(actionBlockIndices)
  }
}

// Загрузка данных проекта
const loadProjectData = async () => {
  try {
    isLoading.value = true
    error.value = null

    // 1. Загружаем основную информацию о проекте
    console.log('📡 Загрузка информации о проекте:', projectId.value)
    projectData.value = await apiService.getScriptStatus(projectId.value)
    console.log('✅ Данные проекта:', projectData.value)

    // Проверяем статус генерации сценария
    if (projectData.value.status === 'in_progress') {
      isGeneratingScenario.value = true
      startScenarioStatusChecking()
    }

    // Проверяем статус генерации изображений
    const hasImagesInProgress = projectData.value.image_generation_status?.some(
      (status: any) => status.status === 'in_progress',
    )
    if (hasImagesInProgress) {
      isGeneratingImages.value = true
      startImageStatusChecking()
    }

    // 2. Загружаем сценарий
    console.log('📜 Загрузка сценария...')
    scenarioData.value = await apiService.getScenario(projectId.value)
    console.log('✅ Сценарий загружен:', scenarioData.value)

    // 3. Загружаем изображения для action блоков
    if (scenarioData.value?.blocks) {
      const actionBlockIndices = scenarioData.value.blocks
        .filter((block) => block.type === 'action')
        .map((block) => block.index)

      if (actionBlockIndices.length > 0) {
        console.log('🖼️ Загрузка изображений для блоков:', actionBlockIndices)
        await loadBlockImages(actionBlockIndices)
      }
    }
  } catch (err) {
    console.error('❌ Ошибка загрузки данных:', err)
    error.value = 'Не удалось загрузить данные проекта'
  } finally {
    isLoading.value = false
  }
}

const refreshProjectStatus = async () => {
  try {
    console.log('🔄 Принудительное обновление статуса проекта...')
    projectData.value = await apiService.getScriptStatus(projectId.value)
    console.log('✅ Статус проекта обновлен:', projectData.value)
  } catch (err) {
    console.error('❌ Ошибка обновления статуса:', err)
  }
}

// Проверка статуса генерации сценария
const startScenarioStatusChecking = () => {
  if (scenarioStatusInterval) {
    clearInterval(scenarioStatusInterval)
  }

  scenarioStatusInterval = setInterval(async () => {
    try {
      const status = await apiService.getScriptStatus(projectId.value)

      if (status.status === 'completed') {
        isGeneratingScenario.value = false
        if (scenarioStatusInterval) {
          clearInterval(scenarioStatusInterval)
          scenarioStatusInterval = null
        }
        // Перезагружаем данные
        await loadProjectData()
        console.log('✅ Генерация сценария завершена')
      } else if (status.status === 'failed') {
        isGeneratingScenario.value = false
        if (scenarioStatusInterval) {
          clearInterval(scenarioStatusInterval)
          scenarioStatusInterval = null
        }
        console.error('❌ Генерация сценария провалилась')
        alert('Ошибка генерации сценария')
      }
    } catch (err) {
      console.error('❌ Ошибка проверки статуса сценария:', err)
    }
  }, 5000)
}

// Объединенные блоки с информацией о изображениях
const blocks = computed(() => {
  if (!scenarioData.value?.blocks) return []

  return scenarioData.value.blocks.map((block: ScenarioBlock) => {
    const blockIndex = block.index

    // Находим информацию о изображении для этого блока
    const imageInfo = projectData.value?.image_paths?.find((img: any) => img.index === blockIndex)
    const imageDescription = projectData.value?.image_descriptions?.find(
      (desc: any) => desc.index === blockIndex,
    )
    const generationStatus = projectData.value?.image_generation_status?.find(
      (status: any) => status.index === blockIndex,
    )

    return {
      ...block,
      id: blockIndex,
      imageUrl: imageInfo?.image_path || null,
      imageDescription: imageDescription?.image_description || null,
      generationStatus: generationStatus?.status || 'pending',
      hasRealImage: block.type === 'action' && imageInfo?.image_path,
    }
  })
})
// Функции для работы со сценарием
const updateScenario = async (updatedScenario: Scenario) => {
  try {
    scenarioData.value = updatedScenario
    console.log('✅ Сценарий обновлен')
  } catch (err) {
    console.error('❌ Ошибка обновления сценария:', err)
    throw err
  }
}

// Добавление блока
const addBlock = async (position: number, blockType: string) => {
  if (!canEdit.value) {
    alert('Невозможно добавить блок во время генерации')
    return
  }

  try {
    const blockTemplate = getBlockTemplate(blockType)

    // Создаем временный объект блока без сохранения на сервере
    const newBlock: ScenarioBlock & { isNew?: boolean; tempPosition?: number } = {
      ...blockTemplate,
      index: -1, // Временный индекс
      isNew: true, // Флаг нового блока
      tempPosition: position, // Сохраняем позицию для создания
    }

    // Открываем модальное окно редактирования
    editingBlock.value = newBlock
    editingBlockIndex.value = -1
    showBlockEditModal.value = true

    console.log('📝 Открыто редактирование нового блока типа:', blockType)
  } catch (err) {
    console.error('❌ Ошибка подготовки нового блока:', err)
    throw err
  }
}

// Обновление блока
const updateBlock = async (blockIndex: number, patch: Partial<ScenarioBlock>) => {
  if (!canEdit.value) {
    alert('Невозможно редактировать блок во время генерации')
    return
  }

  try {
    const response = await apiService.updateBlock(projectId.value, blockIndex, patch)
    scenarioData.value = response.scenario

    // Если это action блок и изменился контент, запускаем генерацию изображения
    const updatedBlock = response.updated_block
    if (updatedBlock.type === 'action' && patch.content) {
      console.log('🔄 Запуск генерации изображения для обновленного блока:', blockIndex)
      await generateBlockImage(blockIndex)
    }

    console.log('✅ Блок обновлен:', response.updated_block)
  } catch (err) {
    console.error('❌ Ошибка обновления блока:', err)
    throw err
  }
}

// Удаление блока
const deleteBlock = async (blockIndex: number) => {
  if (!canEdit.value) {
    alert('Невозможно удалить блок во время генерации')
    return
  }

  try {
    const response = await apiService.deleteBlock(projectId.value, blockIndex)
    scenarioData.value = response.scenario
    console.log('✅ Блок удален:', response.deleted_index)

    // ОБНОВЛЯЕМ ДАННЫЕ ПОСЛЕ УДАЛЕНИЯ БЛОКА
    await refreshProjectData()
  } catch (err) {
    console.error('❌ Ошибка удаления блока:', err)
    throw err
  }
}

// Перестановка блоков
const reorderBlocks = async (fromIndex: number, toIndex: number) => {
  if (!canEdit.value) {
    alert('Невозможно перемещать блоки во время генерации')
    return
  }

  if (!scenarioData.value?.blocks) return

  // Создаем новый порядок на основе текущих индексов
  const blocks = [...scenarioData.value.blocks]
  const currentOrder = blocks.map((block) => block.index)

  // Перемещаем элемент в массиве
  const [movedBlock] = currentOrder.splice(fromIndex, 1)
  if (movedBlock !== undefined) {
    currentOrder.splice(toIndex, 0, movedBlock)
  }

  try {
    const response = await apiService.reorderBlocks(projectId.value, currentOrder)
    scenarioData.value = response.scenario
    console.log('✅ Блоки переставлены:', response.index_map)

    // ОБНОВЛЯЕМ ДАННЫЕ ПОСЛЕ ПЕРЕСТАНОВКИ БЛОКОВ
    await refreshProjectData()
  } catch (err) {
    console.error('❌ Ошибка перестановки блоков:', err)
    throw err
  }
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
  return (templates[type] || templates.action) as Omit<ScenarioBlock, 'index'>
}

// Функции для зума
const adjustZoom = (delta: number) => {
  zoomLevel.value = Math.max(25, Math.min(200, zoomLevel.value + delta))
}

// Вычисляемое свойство для количества колонок в зависимости от зума
const gridColumns = computed(() => {
  if (viewMode.value === 'list') return 1
  if (zoomLevel.value <= 50) return 6
  if (zoomLevel.value <= 75) return 4
  if (zoomLevel.value <= 100) return 3
  if (zoomLevel.value <= 150) return 2
  return 1
})

const blocksWithImages = computed(() => {
  if (!scenarioData.value?.blocks) return []

  return scenarioData.value.blocks.map((block: ScenarioBlock) => {
    const blockIndex = block.index

    const imageInfo = projectData.value?.image_paths?.find((img: any) => img.index === blockIndex)
    const imageDescription = projectData.value?.image_descriptions?.find(
      (desc: any) => desc.index === blockIndex,
    )
    const generationStatus = projectData.value?.image_generation_status?.find(
      (status: any) => status.index === blockIndex,
    )

    const base64ImageUrl = blockImages.value.get(blockIndex)

    return {
      ...block,
      id: blockIndex,
      imageUrl: base64ImageUrl || imageInfo?.image_path || null,
      imageDescription: imageDescription?.image_description || null,
      generationStatus: generationStatus?.status || 'pending',
      hasRealImage: (block.type === 'action' && base64ImageUrl) || imageInfo?.image_path,
      isLoadingImage: loadingImages.value.has(blockIndex),
    }
  })
})
// Навигация
const goBack = () => {
  router.push('/dashboard')
}

// Генерация видео
const generateVideo = () => {
  console.log('Генерация видео для сторибоарда:', projectData.value?.project_name)
}

// Редактирование всего сценария
const editFullScript = () => {
  if (!canEdit.value) {
    alert('Невозможно редактировать сценарий во время генерации')
    return
  }
  showStoryboardEditModal.value = true
}

// Функции для работы с модальными окнами редактирования
const closeStoryboardEdit = () => {
  showStoryboardEditModal.value = false
  showBlockEditModal.value = false
}

const saveScenarioChanges = async (updatedBlocks: ScenarioBlock[]) => {
  if (scenarioData.value) {
    const updatedScenario = {
      ...scenarioData.value,
      blocks: updatedBlocks,
    }
    await updateScenario(updatedScenario)
  }
}

const addNewBlock = async (index: number, blockType: string) => {
  try {
    await addBlock(index, blockType)
  } catch (err) {
    console.error('❌ Ошибка добавления блока:', err)
  }
}

const moveScenarioBlock = async (fromIndex: number, toIndex: number) => {
  try {
    await reorderBlocks(fromIndex, toIndex)
  } catch (err) {
    console.error('❌ Ошибка перемещения блока:', err)
  }
}

const editScenarioBlock = (block: ScenarioBlock, index: number) => {
  if (!canEdit.value) {
    alert('Невозможно редактировать блок во время генерации')
    return
  }
  editingBlock.value = block
  editingBlockIndex.value = index
  showBlockEditModal.value = true
}

// Обновите функцию saveBlockChanges
const saveBlockChanges = async (updatedBlock: ScenarioBlock) => {
  console.log('💾 Сохранение блока:', updatedBlock)

  try {
    // СРАЗУ закрываем модальное окно редактирования
    showBlockEditModal.value = false

    if (editingBlockIndex.value === -1 && (updatedBlock as any).isNew) {
      console.log('🆕 Создание нового блока на сервере...')

      const { tempPosition, isNew, ...blockData } = updatedBlock

      // ТЕПЕРЬ СОЗДАЕМ БЛОК НА СЕРВЕРЕ ТОЛЬКО ПРИ СОХРАНЕНИИ
      const response = await apiService.addBlock(projectId.value, blockData, tempPosition)

      scenarioData.value = response.scenario
      console.log('✅ Новый блок создан:', response.added_block)

      // ОБНОВЛЯЕМ ДАННЫЕ ПРОЕКТА ПОСЛЕ ДОБАВЛЕНИЯ БЛОКА
      await refreshProjectStatus()

      // ПЕРЕЗАГРУЖАЕМ ИЗОБРАЖЕНИЯ ДЛЯ ВСЕХ ACTION БЛОКОВ
      await loadAllActionBlockImages()

      // Закрываем модальное окно сценария если оно было открыто
      showStoryboardEditModal.value = false
    } else if (editingBlockIndex.value !== -1) {
      console.log('✏️ Обновление существующего блока...')
      await updateBlock(updatedBlock.index, updatedBlock)
      console.log('✅ Блок обновлен')

      await refreshProjectStatus()
    }
  } catch (err) {
    console.error('❌ Ошибка сохранения блока:', err)
    alert('Ошибка при сохранении блока')

    // В случае ошибки оставляем модальное окно открытым
    showBlockEditModal.value = true
    throw err
  } finally {
    editingBlock.value = null
    editingBlockIndex.value = -1
  }
}

const refreshProjectData = async () => {
  try {
    console.log('🔄 Полное обновление данных проекта...')

    // 1. Обновляем статус проекта
    await refreshProjectStatus()

    // 2. Перезагружаем сценарий
    scenarioData.value = await apiService.getScenario(projectId.value)
    console.log('✅ Сценарий перезагружен')

    // 3. Перезагружаем изображения для action блоков
    await loadAllActionBlockImages()

    console.log('✅ Все данные проекта обновлены')
  } catch (err) {
    console.error('❌ Ошибка обновления данных проекта:', err)
  }
}
// Функции для работы с изображениями
const generateBlockImage = async (blockIndex: number) => {
  try {
    console.log('🖼️ Генерация изображения для блока:', blockIndex)
    isGeneratingImage.value = true
    isGeneratingImages.value = true

    await refreshProjectStatus()

    await apiService.generateImageForBlock({
      project_id: projectId.value,
      block_index: blockIndex,
    })

    startImageStatusChecking()

    console.log('✅ Запрос на генерацию изображения отправлен')
  } catch (err) {
    console.error('❌ Ошибка генерации изображения:', err)
    alert('Ошибка при генерации изображения')
    isGeneratingImages.value = false
  } finally {
    isGeneratingImage.value = false
  }
}

const editBlockImage = (block: any) => {
  if (!canEdit.value) {
    alert('Невозможно редактировать изображение во время генерации')
    return
  }
  selectedBlock.value = block
  customPrompt.value = block.content.description || ''
  useBlockPrompt.value = true
  showImageModal.value = true
}

const saveEditedImage = async () => {
  if (!selectedBlock.value) return

  try {
    isGeneratingImage.value = true
    isGeneratingImages.value = true
    showImageModal.value = false

    await apiService.editImageForBlock({
      project_id: projectId.value,
      block_index: selectedBlock.value.id,
      use_block_prompt: useBlockPrompt.value,
      custom_prompt: customPrompt.value,
    })

    // Запускаем проверку статуса
    startImageStatusChecking()

    // После завершения генерации обновим данные
    setTimeout(async () => {
      await refreshProjectData()
    }, 3000) // Даем время на начало генерации
  } catch (err) {
    console.error('❌ Ошибка редактирования изображения:', err)
    alert('Ошибка при редактировании изображения')
    isGeneratingImages.value = false
  } finally {
    isGeneratingImage.value = false
    selectedBlock.value = null
  }
}

const handleEditBlock = async (block: ScenarioBlock, index: number) => {
  console.log('✏️ Редактирование блока из модалки сценария:', block)
  try {
    await updateBlock(block.index, block)
    console.log('✅ Блок обновлен из модалки сценария')
  } catch (err) {
    console.error('❌ Ошибка обновления блока:', err)
  }
}

// Проверка статуса генерации изображений
const startImageStatusChecking = () => {
  // Очищаем предыдущий интервал
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval)
  }

  // Запускаем проверку каждые 5 секунд
  statusCheckInterval = setInterval(async () => {
    try {
      await refreshProjectStatus()

      console.log('🔍 Проверка статусов изображений:', projectData.value?.image_generation_status)

      const hasInProgress = projectData.value?.image_generation_status?.some(
        (imgStatus: any) => imgStatus.status === 'in_progress',
      )

      console.log('📊 Есть ли изображения в процессе:', hasInProgress)

      if (!hasInProgress) {
        isGeneratingImages.value = false
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval)
          statusCheckInterval = null
        }
        console.log('✅ Все изображения сгенерированы')

        // ПОЛНОЕ ОБНОВЛЕНИЕ ДАННЫХ ПОСЛЕ ЗАВЕРШЕНИЯ ГЕНЕРАЦИИ
        await refreshProjectData()
      }
    } catch (err) {
      console.error('❌ Ошибка проверки статуса:', err)
    }
  }, 5000)
}
// Функции перевода
const translateLocationType = (type: string) => {
  const types: { [key: string]: string } = {
    INT: 'Интерьер',
    EXT: 'Экстерьер',
    'INT/EXT': 'Интерьер/Экстерьер',
  }
  return types[type] || type
}

const translateTime = (time: string) => {
  const times: { [key: string]: string } = {
    DAY: 'День',
    NIGHT: 'Ночь',
    MORNING: 'Утро',
    EVENING: 'Вечер',
  }
  return times[time] || time
}

const translateTransition = (transition: string) => {
  const transitions: { [key: string]: string } = {
    'CUT TO': 'Резкая смена',
    'FADE TO': 'Плавный переход',
    'DISSOLVE TO': 'Растворение',
  }
  return transitions[transition] || transition
}

// Функции для получения информации о блоках
const getBlockIcon = (type: string) => {
  const icons: { [key: string]: string } = {
    scene_heading: 'M13 10V3L4 14h7v7l9-11h-7z',
    action: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    character: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    dialogue:
      'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    transition: 'M13 5l7 7-7 7M5 5l7 7-7 7',
  }
  return icons[type] || 'M12 6v6m0 0v6m0-6h6m-6 0H6'
}

const getBlockColor = (type: string) => {
  const colors: { [key: string]: string } = {
    scene_heading: 'text-blue-600 bg-blue-50 border-blue-200',
    action: 'text-green-600 bg-green-50 border-green-200',
    character: 'text-purple-600 bg-purple-50 border-purple-200',
    dialogue: 'text-orange-600 bg-orange-50 border-orange-200',
    transition: 'text-gray-600 bg-gray-50 border-gray-200',
  }
  return colors[type] || 'text-gray-600 bg-gray-50 border-gray-200'
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

const getBlockTitle = (block: any) => {
  switch (block.type) {
    case 'scene_heading':
      return `${translateLocationType(block.content.location_type)} ${block.content.location} - ${translateTime(block.content.time)}`
    case 'character':
      return block.content.name
    case 'dialogue':
      return `Диалог: ${block.content.speaker || 'Персонаж'}`
    case 'transition':
      return `Переход: ${translateTransition(block.content.transition_type || block.content.type || 'Переход')}`
    case 'action':
      return 'Действие'
    default:
      return getBlockTypeName(block.type)
  }
}

const getBlockDescription = (block: any) => {
  switch (block.type) {
    case 'scene_heading':
      return `Сцена устанавливает локацию "${block.content.location}" в "${translateTime(block.content.time)}". ${block.content.location_type ? `Тип: ${translateLocationType(block.content.location_type)}` : ''}`
    case 'character':
      return `Персонаж "${block.content.name}"${block.content.parenthetical ? ` (${block.content.parenthetical})` : ''}${block.content.description ? ` - ${block.content.description}` : ''}`
    case 'dialogue':
      return `Диалог${block.content.speaker ? ` персонажа "${block.content.speaker}"` : ''}: "${block.content.text}"`
    case 'transition':
      return `Переход "${translateTransition(block.content.transition_type || block.content.type || 'переход')}": ${block.content.description || ''}`
    case 'action':
      return block.content.description
    default:
      return block.content.description || 'Описание блока'
  }
}

const getBlockSvgIcon = (type: string) => {
  const icons: { [key: string]: string } = {
    scene_heading: `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    `,
    action: `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    `,
    character: `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    `,
    dialogue: `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
    `,
    transition: `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
      </svg>
    `,
  }
  return (
    icons[type] ||
    `
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
    </svg>
  `
  )
}

const getGenerationStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    pending: 'Ожидание',
    in_progress: 'Генерация...',
    completed: 'Завершено',
    failed: 'Ошибка',
  }
  return statusMap[status] || status
}

const getGenerationStatusColor = (status: string) => {
  const colorMap: { [key: string]: string } = {
    pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    in_progress: 'text-blue-600 bg-blue-50 border-blue-200',
    completed: 'text-green-600 bg-green-50 border-green-200',
    failed: 'text-red-600 bg-red-50 border-red-200',
  }
  return colorMap[status] || 'text-gray-600 bg-gray-50 border-gray-200'
}

// Загрузка при монтировании
onMounted(() => {
  loadProjectData()
})

// Очистка интервалов при размонтировании
onUnmounted(() => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval)
  }
  if (scenarioStatusInterval) {
    clearInterval(scenarioStatusInterval)
  }
})

watch(
  projectData,
  async (newData) => {
    if (newData && scenarioData.value?.blocks) {
      console.log('🔄 ProjectData изменился, обновляем изображения...')

      const actionBlockIndices = scenarioData.value.blocks
        .filter((block) => block.type === 'action')
        .map((block) => block.index)

      if (actionBlockIndices.length > 0) {
        await loadBlockImages(actionBlockIndices)
      }
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <!-- Back Button -->
          <button
            @click="goBack"
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
          </button>

          <!-- Breadcrumb -->
          <nav class="flex items-center space-x-2 text-sm text-gray-500">
            <button @click="goBack" class="hover:text-gray-900 transition-colors">Проекты</button>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span class="text-gray-900">{{ projectData?.project_name || 'Загрузка...' }}</span>
          </nav>
        </div>

        <!-- Title -->
        <div class="flex-1 text-center">
          <div class="flex items-center justify-center space-x-4">
            <h1 class="text-lg font-semibold text-gray-900">
              {{ projectData?.project_name || 'Сторибоард' }}
            </h1>

            <!-- Индикаторы генерации -->
            <div v-if="isGeneratingScenario" class="flex items-center space-x-2 text-yellow-600">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
              <span class="text-sm">Генерация сценария...</span>
            </div>

            <div v-else-if="isGeneratingImages" class="flex items-center space-x-2 text-blue-600">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span class="text-sm">Генерация изображений...</span>
            </div>
          </div>
          <p class="text-sm text-gray-500">{{ blocks.length }} блоков</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-3">
          <!-- Кнопка редактировать весь сценарий -->
          <button
            @click="editFullScript"
            :disabled="!canEdit"
            class="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>Редактировать сценарий</span>
          </button>

          <button class="text-gray-600 hover:text-gray-900">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
          <button
            @click="generateVideo"
            :disabled="!canEdit"
            class="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-orange-500 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span>Генерация видео</span>
          </button>
          <button
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Скачать JSON
          </button>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex justify-center items-center py-12">
      <div class="text-center">
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button @click="loadProjectData" class="text-pink-600 hover:text-pink-700">
          Попробовать снова
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Toolbar -->
      <div class="bg-white border-b border-gray-200 px-6 py-3">
        <div class="flex items-center justify-between">
          <!-- Left side: View mode and zoom controls -->
          <div class="flex items-center space-x-4">
            <!-- View Mode Toggle -->
            <div class="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                @click="viewMode = 'grid'"
                :class="[
                  'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900',
                ]"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                @click="viewMode = 'list'"
                :class="[
                  'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900',
                ]"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            <!-- Zoom Controls -->
            <div v-if="viewMode === 'grid'" class="flex items-center space-x-3">
              <button
                @click="adjustZoom(-25)"
                class="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                :disabled="zoomLevel <= 25"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 12H4"
                  />
                </svg>
              </button>

              <span class="text-sm text-gray-600 font-medium">{{ zoomLevel }}%</span>

              <button
                @click="adjustZoom(25)"
                class="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                :disabled="zoomLevel >= 200"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <!-- Right side: Block count -->
          <div class="text-sm text-gray-600">
            {{ blocks.length }} {{ blocks.length === 1 ? 'блок' : 'блоков' }}
          </div>
        </div>
      </div>

      <!-- Grid View -->
      <main class="p-6">
        <div
          v-if="viewMode === 'grid'"
          class="grid gap-6 transition-all duration-300"
          :class="{
            'grid-cols-1': gridColumns === 1,
            'grid-cols-2': gridColumns === 2,
            'grid-cols-3': gridColumns === 3,
            'grid-cols-4': gridColumns === 4,
            'grid-cols-6': gridColumns === 6,
          }"
        >
          <!-- Block Card -->
          <div
            v-for="block in blocksWithImages"
            :key="block.id"
            class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
          >
            <!-- Block Header -->
            <div
              class="p-4 border-b border-gray-200 flex items-center justify-between"
              :class="{
                'bg-blue-50': block.type === 'scene_heading',
                'bg-green-50': block.type === 'action',
                'bg-purple-50': block.type === 'character',
                'bg-orange-50': block.type === 'dialogue',
                'bg-gray-50': block.type === 'transition',
              }"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center"
                  :class="getBlockColor(block.type).split(' ')[2]"
                >
                  <span class="text-sm font-bold">{{ block.id }}</span>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ getBlockTypeName(block.type) }}</h3>
                  <p class="text-xs text-gray-600">{{ getBlockTitle(block) }}</p>
                </div>
                <!-- Кнопка редактирования блока -->
                <button
                  @click.stop="editScenarioBlock(block, block.id - 1)"
                  class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Редактировать блок"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              </div>
              <div
                class="flex items-center justify-center w-8 h-8"
                v-html="getBlockSvgIcon(block.type)"
              ></div>
            </div>

            <!-- Block Content Area -->
            <div class="p-4">
              <!-- Для блоков действия с изображениями -->
              <div v-if="block.type === 'action'" class="mb-4">
                <div
                  class="aspect-video rounded-lg flex items-center justify-center relative group cursor-pointer border-2"
                  :class="block.hasRealImage ? 'border-gray-200' : 'border-dashed border-green-300'"
                  @click="block.hasRealImage ? editBlockImage(block) : generateBlockImage(block.id)"
                >
                  <!-- Индикатор загрузки -->
                  <div
                    v-if="block.isLoadingImage"
                    class="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 rounded-lg"
                  >
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                  </div>

                  <!-- Если base64 изображение есть -->
                  <div
                    v-else-if="block.imageUrl && block.imageUrl.startsWith('data:')"
                    class="w-full h-full"
                  >
                    <img
                      :src="block.imageUrl"
                      :alt="block.imageDescription"
                      class="w-full h-full object-cover rounded-lg"
                    />
                    <div
                      class="absolute inset-0 bg-opacity-0 backdrop-filter backdrop-blur-0 group-hover:backdrop-blur-md transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      <div class="bg-white rounded-full p-3 shadow-lg">
                        <svg
                          class="h-6 w-6 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Если обычное URL изображение есть -->
                  <div v-else-if="block.hasRealImage && block.imageUrl" class="w-full h-full">
                    <img
                      :src="block.imageUrl"
                      :alt="block.imageDescription"
                      class="w-full h-full object-cover rounded-lg"
                    />
                    <div
                      class="absolute inset-0 bg-opacity-0 backdrop-filter backdrop-blur-0 group-hover:backdrop-blur-md transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      <div class="bg-white rounded-full p-3 shadow-lg">
                        <svg
                          class="h-6 w-6 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Если изображения нет -->
                  <div v-else class="text-center text-green-700 flex flex-col items-center">
                    <svg
                      class="w-12 h-12 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p class="text-sm font-medium">Сгенерировать фото</p>
                    <p class="text-xs opacity-70 mt-1">Нажмите для создания</p>
                  </div>
                </div>

                <!-- Статус генерации -->
                <div v-if="block.generationStatus !== 'completed'" class="mt-2 flex justify-end">
                  <span
                    :class="[
                      'px-2 py-1 rounded text-xs font-medium',
                      getGenerationStatusColor(block.generationStatus),
                    ]"
                  >
                    {{ getGenerationStatusText(block.generationStatus) }}
                  </span>
                </div>
              </div>

              <!-- Для остальных блоков - информационная карточка -->
              <div v-else class="mb-4">
                <div
                  class="aspect-video rounded-lg flex items-center justify-center p-6 border-2"
                  :class="getBlockColor(block.type).split(' ')[2]"
                >
                  <div class="text-center flex flex-col items-center">
                    <div
                      class="flex items-center justify-center w-16 h-16 mb-3"
                      v-html="getBlockSvgIcon(block.type)"
                    ></div>
                    <h4 class="font-semibold text-gray-800 mb-2">
                      {{ getBlockTypeName(block.type) }}
                    </h4>
                    <p class="text-sm text-gray-600 leading-relaxed">
                      {{ getBlockDescription(block) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Block Details -->
              <div class="space-y-3">
                <div class="flex items-start space-x-2">
                  <!-- Block Icon -->
                  <div
                    :class="[
                      'p-2 rounded-lg flex items-center justify-center',
                      getBlockColor(block.type),
                    ]"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        :d="getBlockIcon(block.type)"
                      />
                    </svg>
                  </div>

                  <!-- Block Text Content -->
                  <div class="flex-1">
                    <p class="text-sm text-gray-700 leading-relaxed">
                      <template v-if="block.type === 'scene_heading'">
                        <strong class="text-blue-700">Локация:</strong> {{ block.content.location
                        }}<br />
                        <strong class="text-blue-700">Время:</strong>
                        {{ translateTime(block.content.time) }}
                        <span v-if="block.content.location_type">
                          <br /><strong class="text-blue-700">Тип:</strong>
                          {{ translateLocationType(block.content.location_type) }}
                        </span>
                      </template>
                      <template v-else-if="block.type === 'character'">
                        <strong class="text-purple-700">Имя:</strong> {{ block.content.name }}<br />
                        <span v-if="block.content.parenthetical">
                          <strong class="text-purple-700">Реплика:</strong>
                          {{ block.content.parenthetical }}<br />
                        </span>
                        <span v-if="block.content.description">
                          <strong class="text-purple-700">Описание:</strong>
                          {{ block.content.description }}
                        </span>
                      </template>
                      <template v-else-if="block.type === 'dialogue'">
                        <strong class="text-orange-700"
                          >{{ block.content.speaker || 'Персонаж' }}:</strong
                        >
                        <span class="italic">"{{ block.content.text }}"</span>
                      </template>
                      <template v-else-if="block.type === 'transition'">
                        <strong class="text-gray-700">Тип:</strong>
                        {{
                          translateTransition(
                            block.content.transition_type || block.content.type || 'переход',
                          )
                        }}<br />
                        <span v-if="block.content.description">
                          <strong class="text-gray-700">Описание:</strong>
                          {{ block.content.description }}
                        </span>
                      </template>
                      <template v-else>
                        {{ block.content.description }}
                      </template>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- List View -->
        <div v-if="viewMode === 'list'" class="space-y-4">
          <div
            v-for="block in blocks"
            :key="block.id"
            class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex hover:shadow-md transition-shadow duration-300"
          >
            <!-- Left Side: Number and Visual -->
            <div
              class="w-48 p-4 border-r border-gray-200 flex flex-col items-center justify-center"
              :class="{
                'bg-blue-50': block.type === 'scene_heading',
                'bg-green-50': block.type === 'action',
                'bg-purple-50': block.type === 'character',
                'bg-orange-50': block.type === 'dialogue',
                'bg-gray-50': block.type === 'transition',
              }"
            >
              <div class="text-center flex flex-col items-center">
                <div
                  class="flex items-center justify-center w-12 h-12 mb-2"
                  v-html="getBlockSvgIcon(block.type)"
                ></div>
                <h3 class="text-2xl font-bold text-gray-900 mb-3">{{ block.id }}</h3>
                <div class="text-sm font-medium text-gray-700">
                  {{ getBlockTypeName(block.type) }}
                </div>
              </div>
            </div>

            <!-- Right Side: Content -->
            <div class="flex-1 p-6">
              <div class="flex items-start space-x-4">
                <!-- Block Details -->
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-4">
                    <div>
                      <h4 class="text-lg font-semibold text-gray-900">
                        {{ getBlockTitle(block) }}
                      </h4>
                      <p class="text-gray-600">{{ getBlockDescription(block) }}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                      <!-- Кнопка редактирования блока -->
                      <button
                        @click="editScenarioBlock(block, block.id - 1)"
                        class="px-3 py-2 text-sm rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 transition-colors"
                      >
                        <svg
                          class="h-4 w-4 inline mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Редактировать
                      </button>
                      <!-- Кнопка редактирования изображения для action блоков -->
                      <button
                        v-if="block.type === 'action'"
                        @click="
                          block.hasRealImage ? editBlockImage(block) : generateBlockImage(block.id)
                        "
                        :class="[
                          'px-3 py-2 text-sm rounded-md transition-colors border',
                          block.hasRealImage
                            ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-300'
                            : 'text-green-600 hover:text-green-900 hover:bg-green-100 border-green-300',
                        ]"
                      >
                        <svg
                          class="h-4 w-4 inline mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {{ block.hasRealImage ? 'Изменить фото' : 'Сгенерировать фото' }}
                      </button>
                    </div>
                  </div>

                  <div class="text-gray-700 space-y-2">
                    <template v-if="block.type === 'scene_heading'">
                      <p>
                        <strong class="text-blue-700">Локация:</strong> {{ block.content.location }}
                      </p>
                      <p>
                        <strong class="text-blue-700">Время:</strong>
                        {{ translateTime(block.content.time) }}
                      </p>
                      <p v-if="block.content.location_type">
                        <strong class="text-blue-700">Тип:</strong>
                        {{ translateLocationType(block.content.location_type) }}
                      </p>
                    </template>
                    <template v-else-if="block.type === 'character'">
                      <p><strong class="text-purple-700">Имя:</strong> {{ block.content.name }}</p>
                      <p v-if="block.content.parenthetical">
                        <strong class="text-purple-700">Реплика:</strong>
                        {{ block.content.parenthetical }}
                      </p>
                      <p v-if="block.content.description">
                        <strong class="text-purple-700">Описание:</strong>
                        {{ block.content.description }}
                      </p>
                    </template>
                    <template v-else-if="block.type === 'dialogue'">
                      <p>
                        <strong class="text-orange-700">Говорящий:</strong>
                        {{ block.content.speaker || 'Персонаж' }}
                      </p>
                      <p class="italic">"{{ block.content.text }}"</p>
                    </template>
                    <template v-else-if="block.type === 'transition'">
                      <p>
                        <strong class="text-gray-700">Тип перехода:</strong>
                        {{
                          translateTransition(
                            block.content.transition_type || block.content.type || 'переход',
                          )
                        }}
                      </p>
                      <p v-if="block.content.description">
                        <strong class="text-gray-700">Описание:</strong>
                        {{ block.content.description }}
                      </p>
                    </template>
                    <template v-else>
                      <p>{{ block.content.description }}</p>
                    </template>
                  </div>

                  <!-- Статус генерации для action блоков -->
                  <div
                    v-if="block.type === 'action' && block.generationStatus !== 'completed'"
                    class="mt-3"
                  >
                    <span
                      :class="[
                        'px-2 py-1 rounded text-xs font-medium',
                        getGenerationStatusColor(block.generationStatus),
                      ]"
                    >
                      {{ getGenerationStatusText(block.generationStatus) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal для редактирования изображения -->
    <div
      v-if="showImageModal && selectedBlock"
      class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Редактирование изображения</h3>

        <div class="space-y-4">
          <!-- Информация о блоке -->
          <div>
            <p class="text-sm font-medium text-gray-700 mb-1">Действие:</p>
            <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {{ selectedBlock.content.description }}
            </p>
          </div>

          <!-- Настройки промпта -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3"
              >Промпт для генерации:</label
            >

            <div class="space-y-3">
              <label class="flex items-start space-x-3 cursor-pointer">
                <input
                  v-model="useBlockPrompt"
                  type="radio"
                  name="promptType"
                  :value="true"
                  class="mt-1"
                />
                <div class="flex-1">
                  <span class="text-sm font-medium text-gray-900"
                    >Использовать описание из сценария</span
                  >
                  <p class="text-sm text-gray-500 mt-1 bg-blue-50 p-2 rounded">
                    {{ selectedBlock.content.description }}
                  </p>
                </div>
              </label>

              <label class="flex items-start space-x-3 cursor-pointer">
                <input
                  v-model="useBlockPrompt"
                  type="radio"
                  name="promptType"
                  :value="false"
                  class="mt-1"
                />
                <div class="flex-1">
                  <span class="text-sm font-medium text-gray-900">Свой промпт</span>
                  <!-- Поле для своего промпта -->
                  <div class="mt-2">
                    <textarea
                      v-model="customPrompt"
                      placeholder="Опишите желаемое изображение..."
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      :disabled="useBlockPrompt"
                    ></textarea>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Действия -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              @click="showImageModal = false"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Отмена
            </button>
            <button
              @click="saveEditedImage"
              :disabled="isGeneratingImage"
              class="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-orange-500 transition-all duration-200 disabled:opacity-50"
            >
              {{ isGeneratingImage ? 'Генерация...' : 'Сгенерировать' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования всего сценария -->
    <StoryboardEditModal
      v-if="showStoryboardEditModal"
      :is-open="showStoryboardEditModal && canEdit"
      :blocks="scenarioData?.blocks || []"
      @close="closeStoryboardEdit"
      @update="saveScenarioChanges"
      @add-block="addNewBlock"
      @move-block="moveScenarioBlock"
      @edit-block="handleEditBlock"
      @delete-block="deleteBlock"
    />

    <!-- Модальное окно редактирования отдельного блока -->
    <BlockEditModal
      v-if="showBlockEditModal"
      :is-open="showBlockEditModal"
      :block="editingBlock"
      :can-edit="canEdit"
      @close="showBlockEditModal = false"
      @save="saveBlockChanges"
    />
  </div>
</template>
