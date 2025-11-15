<script setup lang="ts">
defineProps<{
  project: {
    id: number
    name: string
    description?: string
    image?: string
    date: string
    type: string
    folders?: any[]
    storyboards?: any[]
  }
}>()

defineEmits<{
  click: [project: any]
}>()

const getProjectIcon = (type: string) => {
  switch (type) {
    case 'folder':
      return 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z'
    case 'presentation':
    case 'commercial':
    case 'educational':
    case 'storyboard':
      return 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
    default:
      return 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
  }
}

const getProjectColor = (type: string) => {
  switch (type) {
    case 'folder':
      return 'from-blue-500 to-purple-400'
    case 'presentation':
      return 'from-gray-500 to-gray-400'
    case 'commercial':
      return 'from-purple-500 to-pink-400'
    case 'educational':
      return 'from-green-500 to-teal-400'
    case 'storyboard':
      return 'from-pink-500 to-orange-400'
    default:
      return 'from-pink-500 to-orange-400'
  }
}

const getItemCount = (project: any) => {
  if (project.type === 'folder') {
    return project.storyboards?.length || 0
  }
  return 0
}

const getItemCountText = (project: any) => {
  if (project.type === 'folder') {
    const count = project.storyboards?.length || 0
    return `${count} ${count === 1 ? 'сторибоард' : count < 5 ? 'сторибоарда' : 'сторибоардов'}`
  }
  return ''
}
</script>

<template>
  <div
    @click="$emit('click', project)"
    class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
  >
    <!-- Project Image or Icon -->
    <div class="aspect-video bg-gray-100 overflow-hidden flex items-center justify-center">
      <div v-if="project.image" class="w-full h-full">
        <img
          :src="project.image"
          :alt="project.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div v-else class="text-center">
        <div
          :class="`bg-gradient-to-r ${getProjectColor(project.type)} w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3`"
        >
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="getProjectIcon(project.type)"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Project Info -->
    <div class="p-4">
      <h3 class="font-medium text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
        {{ project.name }}
      </h3>

      <p v-if="project.description" class="text-sm text-gray-500 mb-2 line-clamp-2">
        {{ project.description }}
      </p>

      <div class="flex items-center justify-between text-sm text-gray-500">
        <div class="flex items-center">
          <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {{ project.date }}
        </div>

        <div v-if="project.type === 'folder'" class="text-xs text-gray-400">
          {{ getItemCountText(project) }}
        </div>
      </div>
    </div>
  </div>
</template>
