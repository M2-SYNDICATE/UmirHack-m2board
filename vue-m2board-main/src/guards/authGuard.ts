import { type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router'

export const requireAuth = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const token = localStorage.getItem('m2boards_access_token')
  const user = localStorage.getItem('m2boards_user')
  console.log('🔐 Auth guard - token exists:', !!token, 'user exists:', !!user, 'Route:', to.name)

  if (token && user) {
    console.log('✅ Access granted to:', to.name)
    next()
  } else {
    console.log('❌ Access denied to:', to.name, '- redirecting to home')
    next('/')
  }
}

export const requireGuest = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const token = localStorage.getItem('m2boards_access_token')
  const user = localStorage.getItem('m2boards_user')
  console.log('👤 Guest guard - token exists:', !!token, 'user exists:', !!user, 'Route:', to.name)

  if (!token || !user) {
    console.log('✅ Guest access granted to:', to.name)
    next()
  } else {
    // Только для главной страницы делаем редирект
    if (to.name === 'Home') {
      console.log('🔄 User authenticated, redirecting from home to dashboard')
      next('/dashboard')
    } else {
      // Для других маршрутов разрешаем доступ
      console.log('ℹ️ User authenticated but allowing access to:', to.name)
      next()
    }
  }
}
