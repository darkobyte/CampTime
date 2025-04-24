<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { onMounted, watch, computed } from 'vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  const success = await authStore.init()
  console.log('Auth init completed:', success, authStore.user) // Debug line
})

watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated && route.path === '/') {
    if (authStore.user?.stamm) {
      router.push('/dashboard')
    } else {
      router.push('/error')
    }
  }
})

watch(() => authStore.showStammWarning, (show) => {
  if (show) {
    // Remove access to all routes except login/register
    router.push('/error')
  }
})

// Add stamm check for navigation visibility
const showNavigation = computed(() => {
  return authStore.isAuthenticated && authStore.user?.stamm
})

watch(() => authStore.user?.stamm, (stamm) => {
  if (authStore.isAuthenticated && !stamm) {
    authStore.showStammWarning = true
    router.push('/error')
  }
})
</script>

<template>
  <div class="app-container">
    <header v-if="showNavigation">
      <nav>
        <h1 style="color: wheat;">{{ authStore.user?.stamm }}</h1>
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/groups">Gruppen</RouterLink>
        <RouterLink to="/meetings">Gruppenstunden</RouterLink>
        <RouterLink to="/activities">Aktivitäten</RouterLink>
        <RouterLink to="/members">Mitglieder</RouterLink>
        <RouterLink to="/camps">Lager</RouterLink>
        <RouterLink to="/how-to">How To</RouterLink>
      </nav>
    </header>

    <main :class="{ 'login-layout': !authStore.isAuthenticated }">
      <RouterView />
    </main>

    <div v-if="authStore.showStammWarning" class="stamm-warning-overlay">
      <div class="stamm-warning-modal">
        <h2>Kein Stamm zugewiesen!</h2>
        <p>
          Konto erstellt, kein Stamm zugewiesen. <br> Bitte warten oder Admin kontaktieren.
        </p>
        <button @click="authStore.logout">Abmelden</button>
      </div>
    </div>
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background-color: var(--color-primary);
  padding: 1rem;
}

nav {
  display: flex;
  gap: 1rem;
}

nav a {
  color: var(--color-text-light);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

nav a:hover {
  background-color: var(--color-secondary);
}

nav a.router-link-active {
  background-color: var(--color-secondary);
  font-weight: bold;
}

main {
  flex: 1;
  background-color: var(--color-background);
}

.login-layout {
  padding: 0;
  height: 100vh;
}

.stamm-warning-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.stamm-warning-modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  text-align: center;
}

.stamm-warning-modal button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
