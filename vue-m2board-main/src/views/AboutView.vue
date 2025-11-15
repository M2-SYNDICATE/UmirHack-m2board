<template>
  <section id="about" class="py-20 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="max-w-7xl mx-auto">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <!-- Логотип M2 -->
        <div class="flex justify-center mb-6">
          <div class="relative">
            <div
              class="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
            >
              <span class="text-white text-2xl font-bold">M2</span>
            </div>
            <div
              class="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md"
            >
              HDD
            </div>
          </div>
        </div>

        <h2 class="text-4xl font-bold text-gray-900 mb-4">О нас</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Разработано сообществом <span class="font-semibold text-blue-600">M2</span> командой
          <span
            class="font-semibold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent"
            >HDD</span
          >
        </p>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="https://t.me/m2SYNDICATE"
            class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
          >
            <span>Телеграм-канал</span>
          </a>

          <a
            href="https://t.me/T1nnLD"
            class="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-orange-500 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>Связаться с тим-лидом</span>
          </a>
        </div>
      </div>

      <!-- Team Section -->
      <div class="mb-16">
        <h3 class="text-2xl font-bold text-gray-900 text-center mb-12">Наша команда</h3>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Team Member 1 -->
          <div
            class="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group"
          >
            <div class="relative mb-4">
              <div
                class="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:border-blue-200 transition-colors duration-300"
              >
                <img
                  src="/images/denis.webp"
                  alt="Бражко Денис"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div
                class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md"
              >
                Тим-лид
              </div>
            </div>
            <h4 class="text-lg font-semibold text-gray-900 mb-2">Бражко Денис</h4>
            <p class="text-sm text-gray-600 mb-3">ML / Data Scientist</p>
            <div class="flex flex-wrap gap-2 justify-center">
              <span class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Python</span>
              <span class="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >Airflow</span
              >
              <span class="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                >MLflow</span
              >
              <span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                >Data Engineering</span
              >
            </div>
          </div>

          <!-- Team Member 2 -->
          <div
            class="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group"
          >
            <div class="relative mb-4">
              <div
                class="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:border-blue-200 transition-colors duration-300"
              >
                <img
                  src="/images/bogdan.webp"
                  alt="Далиба Богдан"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div
                class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md"
              >
                Frontend
              </div>
            </div>
            <h4 class="text-lg font-semibold text-gray-900 mb-2">Далиба Богдан</h4>
            <p class="text-sm text-gray-600 mb-3">Frontend разработчик</p>
            <div class="flex flex-wrap gap-2 justify-center">
              <span class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Vue.js</span>
              <span class="px-3 py-1 bg-cyan-100 text-cyan-800 text-xs rounded-full"
                >Tailwind CSS</span
              >
              <span class="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                >TypeScript</span
              >
              <span class="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                >Nuxt.js</span
              >
            </div>
          </div>

          <!-- Team Member 3 -->
          <div
            class="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group"
          >
            <div class="relative mb-4">
              <div
                class="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:border-blue-200 transition-colors duration-300"
              >
                <img
                  src="/images/andrey.webp"
                  alt="Буренок Андрей"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div
                class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md"
              >
                Backend
              </div>
            </div>
            <h4 class="text-lg font-semibold text-gray-900 mb-2">Буренок Андрей</h4>
            <p class="text-sm text-gray-600 mb-3">Backend разработчик</p>
            <div class="flex flex-wrap gap-2 justify-center">
              <span class="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Python</span>
              <span class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">SQL</span>
              <span class="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full">FastAPI</span>
              <span class="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Docker</span>
            </div>
          </div>

          <!-- Team Member 4 -->
          <div
            class="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group"
          >
            <div class="relative mb-4">
              <div
                class="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:border-blue-200 transition-colors duration-300"
              >
                <img
                  src="/images/ivan.webp"
                  alt="Алипатов Иван"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div
                class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md"
              >
                ML
              </div>
            </div>
            <h4 class="text-lg font-semibold text-gray-900 mb-2">Алипатов Иван</h4>
            <p class="text-sm text-gray-600 mb-3">ML разработчик</p>
            <div class="flex flex-wrap gap-2 justify-center">
              <span class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Python</span>
              <span class="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                >PyTorch</span
              >
              <span class="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                >TensorFlow</span
              >
              <span class="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Pandas</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Hackathons Section -->
      <div class="mb-16">
        <h3 class="text-2xl font-bold text-gray-900 text-center mb-8">Наши достижения</h3>

        <div
          class="bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl p-8 border border-pink-100 shadow-sm"
        >
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Achievement 1 -->
            <div
              class="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div
                class="bg-gradient-to-r from-silver-400 to-gray-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300"
              >
                <svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">Хакатон "Ринхак" осень 2023</h4>
                <p class="text-sm text-gray-600">2 место</p>
              </div>
            </div>

            <!-- Achievement 2 -->
            <div
              class="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div
                class="bg-gradient-to-r from-silver-400 to-gray-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300"
              >
                <svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">
                  Хакатон "Цифровой прорыв" 2024 Санкт-Петербург
                </h4>
                <p class="text-sm text-gray-600">2 место</p>
              </div>
            </div>

            <!-- Achievement 3 -->
            <div
              class="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div
                class="bg-gradient-to-r from-silver-400 to-gray-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300"
              >
                <svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">Хакатон "Азовское Море" 2024</h4>
                <p class="text-sm text-gray-600">2 место в категории "EdTech"</p>
              </div>
            </div>

            <!-- Achievement 4 -->
            <div
              class="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div
                class="bg-gradient-to-r from-silver-400 to-gray-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300"
              >
                <svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">
                  Кейс чемпионат по машинному обучение от банка Центр Инвест 2025
                </h4>
                <p class="text-sm text-gray-600">2 место</p>
              </div>
            </div>

            <!-- Achievement 5 -->
            <div
              class="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div
                class="bg-gradient-to-r from-silver-400 to-gray-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300"
              >
                <svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">Хакатон "MoreTech" 2025</h4>
                <p class="text-sm text-gray-600">2 место</p>
              </div>
            </div>

            <!-- Achievement 6 -->
            <div
              class="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div
                class="bg-gradient-to-r from-yellow-400 to-orange-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300"
              >
                <svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">Атомик Хак 3.0 2025 полуфинал</h4>
                <p class="text-sm text-gray-600">1 место</p>
              </div>
            </div>

            <!-- Achievement 7 -->
            <div
              class="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div
                class="bg-gradient-to-r from-silver-400 to-gray-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300"
              >
                <svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">Атомик Хак 3.0 2025 финал</h4>
                <p class="text-sm text-gray-600">2 место</p>
              </div>
            </div>

            <!-- Achievement 8 - Placeholder for future achievements -->
            <div
              class="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-100 group hover:shadow-md transition-all duration-200"
            >
              <div
                class="bg-gradient-to-r from-blue-500 to-indigo-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">Следующее достижение</h4>
                <p class="text-sm text-gray-600">В процессе...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Thank You Message -->
      <div
        class="text-center bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl p-8 text-white shadow-lg relative overflow-hidden"
      >
        <!-- Decorative elements -->
        <div
          class="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"
        ></div>
        <div
          class="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2"
        ></div>

        <h3 class="text-2xl font-bold mb-4 relative z-10">Почему выбирают нас?</h3>
        <p class="text-lg mb-6 max-w-4xl mx-auto leading-relaxed relative z-10">
          Команда <span class="font-bold">HDD</span> из сообщества
          <span class="font-bold">M2</span> — это не просто разработчики, это энтузиасты, которые
          превращают идеи в реальность. Мы способны не только полностью реализовать ваш проект, но и
          продвинуть его на новый уровень, обеспечить масштабирование и постоянное развитие с
          добавлением инновационных функций.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
          <div
            class="flex items-center space-x-2 text-pink-100 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Полная реализация проектов</span>
          </div>
          <div
            class="flex items-center space-x-2 text-pink-100 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Быстрое масштабирование</span>
          </div>
          <div
            class="flex items-center space-x-2 text-pink-100 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span>Инновационные решения</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
