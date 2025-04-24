import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import ErrorView from '../views/ErrorView.vue'
import HowTo from '../components/HowTo.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue')
    },
    {
      path: '/error',
      name: 'error',
      component: ErrorView,
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/groups',
      name: 'groups',
      component: () => import('@/views/GroupsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/groups/:id',
      name: 'group-details',
      component: () => import('@/views/GroupDetailsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/groups/:id/edit',
      name: 'group-edit',
      component: () => import('@/views/GroupEditView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/meetings',
      name: 'meetings',
      component: () => import('@/views/MeetingsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/activities',
      name: 'activities',
      component: () => import('@/views/ActivitiesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/activities/:id',
      name: 'activity-details',
      component: () => import('@/views/ActivityDetailsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/activities/:id/edit',
      name: 'activity-edit',
      component: () => import('@/views/ActivityEditView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/members',
      name: 'members',
      component: () => import('@/views/MembersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/camps',
      name: 'camps',
      component: () => import('@/views/CampsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/how-to',
      name: 'how-to',
      component: HowTo
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/')
  } else if (authStore.isAuthenticated && to.path === '/') {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
