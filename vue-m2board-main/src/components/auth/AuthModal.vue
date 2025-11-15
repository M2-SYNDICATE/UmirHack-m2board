<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const memeMessage = ref('')
const memeTimeout = ref<number | null>(null)

const forgotPasswordMessages = [
  'Ага, щас! Жди письмо с советами по медитации вместо пароля 🧘‍♂️',
  'Восстановление? Ты думаешь это магия? 🧙‍♂️',
  'Пароль забыл? Вспоминай быстрее, время тикает! ⏰',
  'Забыл пароль? Попробуй вспомнить тот, что используешь везде 😅',
  'Восстановление пароля стоит 10 мемов и одну шутку про IT 🔧',
  'Пароль утерян? Проверь под клавиатурой, там часто заваляется 🕵️‍♂️',
  'Забыл пароль? Спой его нам, может узнаем 🎤',
  'Восстановление? А ты уверен, что хочешь это вспомнить? 🤔',
  "Пароль забыт? Попробуй '123456' или 'password', вдруг сработает 😄",
  "Восстановление доступно после прохождения капчи 'выбери все светофоры' 🚦",
]

const registerMessages = [
  "Регистрация откроется после того как ты пройдешь квест 'Найди админа' 🎮",
  'Регистрация? Мы тут только для избранных! 🎩',
  'Нет аккаунта? Спроси у Илона Маска, может он знает 🚀',
  'Зарегистрироваться? Сначала пройди собеседование с котом 🐱',
  'Регистрация временно закрыта на техническое обновление... шучу 😜',
  'Новый аккаунт? Принеси нам кофе и печеньки ☕🍪',
  'Регистрация доступна по приглашению от единорога 🦄',
  'Хочешь зарегистрироваться? Реши сначала задачу про уток в ряду 🦆',
  'Регистрация откроется, когда ты найдешь пасхальное яйцо 🥚',
  'Нет аккаунта? Это фича, а не баг! 🐛',
]

const handleLogin = async () => {
  if (!email.value.trim() || !password.value.trim()) return

  authStore.clearError()

  const success = await authStore.login({
    login: email.value.trim(),
    password: password.value,
  })

  if (success) {
    email.value = ''
    password.value = ''
    clearMemeMessage()
    emit('close')
    router.push('/dashboard')
  }
}

const handleClose = () => {
  email.value = ''
  password.value = ''
  clearMemeMessage()
  authStore.clearError()
  emit('close')
}

const handleSocialLogin = (provider: 'vk' | 'yandex') => {
  console.log(`🔐 Вход через ${provider}`)
  // Здесь будет логика входа через соцсети
}

const clearMemeMessage = () => {
  if (memeTimeout.value) {
    clearTimeout(memeTimeout.value)
    memeTimeout.value = null
  }
  memeMessage.value = ''
}

const showMemeMessage = (message: string) => {
  // Очищаем предыдущий таймер
  clearMemeMessage()

  // Устанавливаем новое сообщение
  memeMessage.value = message

  // Устанавливаем новый таймер на 8 секунд
  memeTimeout.value = setTimeout(() => {
    memeMessage.value = ''
    memeTimeout.value = null
  }, 8000)
}

const showForgotPasswordMeme = () => {
  const randomIndex = Math.floor(Math.random() * forgotPasswordMessages.length)
  showMemeMessage(forgotPasswordMessages[randomIndex]!)
}

const showRegisterMeme = () => {
  const randomIndex = Math.floor(Math.random() * registerMessages.length)
  showMemeMessage(registerMessages[randomIndex]!)
}
</script>

<template>
  <!-- Modal Overlay with blur effect -->
  <div
    v-if="isOpen"
    class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="handleClose"
  >
    <!-- Modal Content -->
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-200 overflow-hidden"
    >
      <!-- Modal Header -->
      <div class="relative bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-8 text-center">
        <button
          @click="handleClose"
          class="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
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

        <div class="text-white">
          <h2 class="text-2xl font-bold mb-2">С возвращением!</h2>
          <p class="text-pink-100">Войдите в свой аккаунт M2 Boards</p>
        </div>
      </div>

      <!-- Error Message -->
      <div
        v-if="authStore.error"
        class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-6 mt-4 rounded-lg transition-all duration-300"
      >
        <div class="flex justify-between items-start">
          <p class="text-sm font-medium flex-1">{{ authStore.error }}</p>
          <button
            @click="authStore.clearError"
            class="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <!-- Meme Message -->
      <div
        v-if="memeMessage"
        class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mx-6 mt-4 rounded-lg transition-all duration-300"
      >
        <div class="flex justify-between items-start">
          <p class="text-sm font-medium flex-1">{{ memeMessage }}</p>
          <button
            @click="clearMemeMessage"
            class="text-yellow-600 hover:text-yellow-800 ml-2 flex-shrink-0"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div class="px-6 py-6">
        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email или логин
            </label>
            <div class="relative">
              <input
                id="email"
                v-model="email"
                type="text"
                placeholder="Введите email или логин"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                :disabled="authStore.isLoading"
                required
              />
              <svg
                class="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Пароль
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Введите пароль"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                :disabled="authStore.isLoading"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  v-if="!showPassword"
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Forgot Password Meme Button -->
          <div class="text-right">
            <button
              type="button"
              @click="showForgotPasswordMeme"
              class="text-sm text-pink-500 hover:text-pink-600 transition-colors font-medium"
            >
              Забыли пароль?
            </button>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="!email.trim() || !password.trim() || authStore.isLoading"
            class="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-3 rounded-lg font-medium hover:from-pink-600 hover:to-orange-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <svg
              v-if="authStore.isLoading"
              class="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
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
            <span>{{ authStore.isLoading ? 'Вход...' : 'Войти' }}</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="my-6 flex items-center">
          <div class="flex-1 border-t border-gray-300"></div>
          <span class="px-4 text-sm text-gray-500">или войдите с помощью</span>
          <div class="flex-1 border-t border-gray-300"></div>
        </div>

        <!-- Social Login Buttons -->
        <div class="space-y-3">
          <!-- VK Login -->
          <button
            @click="handleSocialLogin('vk')"
            class="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            :disabled="authStore.isLoading"
          >
            <svg class="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1.01-1.49-.9-1.744-.9-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.441 0 .61.203.78.678.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.169-.407.441-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.169.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.271.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .763.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"
              />
            </svg>
            <span class="text-gray-700 font-medium">Войти через ВКонтакте</span>
          </button>

          <!-- Yandex Login -->
          <button
            @click="handleSocialLogin('yandex')"
            class="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            :disabled="authStore.isLoading"
          >
            <span class="text-gray-700 font-medium">Войти через Яндекс</span>
          </button>
        </div>

        <!-- Register Meme Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Нет аккаунта?
            <button
              @click="showRegisterMeme"
              class="text-pink-500 hover:text-pink-600 transition-colors font-medium ml-1"
            >
              Зарегистрироваться
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
