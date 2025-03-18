<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const authStore = useAuthStore()
</script>

<template>
  <div class="app-container">
    <header v-if="authStore.isAuthenticated">
      <nav>
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/groups">Gruppen</RouterLink>
        <RouterLink to="/meetings">Gruppenstunden</RouterLink>
        <RouterLink to="/activities">Aktivitäten</RouterLink>
        <RouterLink to="/members">Mitglieder</RouterLink>
        <RouterLink to="/camps">Lager</RouterLink>
      </nav>
    </header>

    <main :class="{ 'login-layout': !authStore.isAuthenticated }">
      <RouterView />
    </main>
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
</style>
