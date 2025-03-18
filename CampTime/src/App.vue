<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
nav {
  padding: 1rem;
}

nav a {
  padding: 0 1rem;
}
</style>
