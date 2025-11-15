import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireGuest } from '@/guards/authGuard' // убрали globalAuthGuard

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        requiresGuest: true,
        title: 'M2 Boards - Главная',
      },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/DashboardView.vue'),
      beforeEnter: requireAuth,
      meta: {
        requiresAuth: true,
        title: 'Панель управления - M2 Boards',
      },
    },
    {
      path: '/editor/:id',
      name: 'Editor',
      component: () => import('@/views/EditorView.vue'),
      beforeEnter: requireAuth,
      meta: {
        requiresAuth: true,
        title: 'Редактор сторибордов - M2 Boards',
      },
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('@/views/AboutView.vue'),
      meta: {
        title: 'О нас - M2 Boards',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: '/',
    },
  ],
})

// Обновление заголовка страницы
router.afterEach((to) => {
  const title = to.meta?.title as string
  if (title) {
    document.title = title
  }
})

export default router
