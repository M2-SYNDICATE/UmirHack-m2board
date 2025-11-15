import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, type LoginCredentials, type User } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('m2boards_access_token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!accessToken.value)

  const setAuth = (authData: { user: User; accessToken: string }) => {
    user.value = authData.user
    accessToken.value = authData.accessToken
    localStorage.setItem('m2boards_access_token', authData.accessToken)
    localStorage.setItem('m2boards_user', JSON.stringify(authData.user))
  }

  const clearAuth = () => {
    user.value = null
    accessToken.value = null
    localStorage.removeItem('m2boards_access_token')
    localStorage.removeItem('m2boards_user')
  }

  const setUser = (userData: User) => {
    user.value = userData
    localStorage.setItem('m2boards_user', JSON.stringify(userData))
  }

  const clearUser = () => {
    user.value = null
    localStorage.removeItem('m2boards_user')
  }

  const login = async (credentials: { login: string; password: string }): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiService.login({
        login: credentials.login,
        password: credentials.password,
      })

      console.log('Auth store response:', response)

      // Создаем объект пользователя из ответа
      const userData: User = {
        id: response.user_id.toString(),
        email: response.email,
        name: response.username,
        username: response.username,
        createdAt: new Date().toISOString(),
      }

      // Сохраняем аутентификационные данные
      setAuth({
        user: userData,
        accessToken: response.access_token,
      })

      console.log('Login successful, user authenticated')
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      clearAuth()
    }
  }

  const checkAuth = async (): Promise<boolean> => {
    // Проверяем наличие токена и пользователя
    const savedToken = localStorage.getItem('m2boards_access_token')
    const savedUser = localStorage.getItem('m2boards_user')

    if (savedToken && savedUser) {
      accessToken.value = savedToken
      user.value = JSON.parse(savedUser)
      return true
    }

    // Если нет токена, очищаем аутентификацию
    clearAuth()
    return false
  }

  const clearError = () => {
    error.value = null
  }

  return {
    user,
    accessToken,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    clearError,
  }
})
