<template>
  <section class="py-20 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="max-w-7xl mx-auto">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Посмотрите, как это работает</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Создавайте профессиональные сторибоарды за минуты с помощью нашего интуитивного интерфейса
        </p>
      </div>

      <!-- Video Container -->
      <div class="relative max-w-5xl mx-auto">
        <div class="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
          <!-- Video Placeholder -->
          <div
            class="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"
          >
            <div class="text-center">
              <button
                class="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-6 mb-4 transition-all duration-200 group"
              >
                <svg
                  class="h-12 w-12 text-white group-hover:scale-110 transition-transform duration-200"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <p class="text-white text-lg font-medium">Нажмите для просмотра демо</p>
            </div>
          </div>

          <!-- Video Interface Mockup -->
          <div
            class="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300"
          >
            <div class="absolute top-4 left-4 right-4">
              <div class="bg-white bg-opacity-90 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div class="text-sm text-gray-600">Рекламное видео - v1</div>
                  <div class="flex space-x-2">
                    <button class="px-3 py-1 bg-gray-200 rounded text-sm">Скачать</button>
                    <button class="px-3 py-1 bg-gray-200 rounded text-sm">Презентация</button>
                    <button class="px-3 py-1 bg-gray-900 text-white rounded text-sm">
                      Поделиться
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-4 gap-2">
                  <div class="bg-green-100 rounded p-2 text-center">
                    <div class="w-full h-16 bg-green-200 rounded mb-1"></div>
                    <div class="text-xs text-gray-600">Конференц-зал</div>
                  </div>
                  <div class="bg-blue-100 rounded p-2 text-center">
                    <div class="w-full h-16 bg-blue-200 rounded mb-1"></div>
                    <div class="text-xs text-gray-600">Офис</div>
                  </div>
                  <div class="bg-purple-100 rounded p-2 text-center">
                    <div class="w-full h-16 bg-purple-200 rounded mb-1"></div>
                    <div class="text-xs text-gray-600">Кухня</div>
                  </div>
                  <div class="bg-orange-100 rounded p-2 text-center">
                    <div class="w-full h-16 bg-orange-200 rounded mb-1"></div>
                    <div class="text-xs text-gray-600">Коридор</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Features List -->
        <div class="grid md:grid-cols-3 gap-8 mt-16">
          <div class="text-center">
            <div
              class="bg-gradient-to-r from-pink-500 to-orange-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Быстрое создание</h3>
            <p class="text-gray-600">
              Создавайте сторибоарды в 10 раз быстрее с помощью готовых шаблонов и инструментов
            </p>
          </div>

          <div class="text-center">
            <div
              class="bg-gradient-to-r from-pink-500 to-orange-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Командная работа</h3>
            <p class="text-gray-600">
              Получайте обратную связь от команды и клиентов в ре��име реального времени
            </p>
          </div>

          <div class="text-center">
            <div
              class="bg-gradient-to-r from-pink-500 to-orange-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Легкий обмен</h3>
            <p class="text-gray-600">
              Делитесь проектами одним кликом и экспортируйте в любом формате
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
