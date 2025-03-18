<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useActivityStore } from '../stores/activities'

const route = useRoute()
const router = useRouter()
const activityStore = useActivityStore()
const activity = ref(null)

onMounted(async () => {
  const activityId = parseInt(route.params.id)
  activity.value = await activityStore.fetchActivityById(activityId)
})
</script>

<template>
  <div class="activity-details-container" v-if="activity">
    <div class="header">
      <h1>{{ activity.name }}</h1>
      <div class="actions">
        <button @click="router.push(`/activities/${activity.id}/edit`)" class="edit-button">
          Bearbeiten
        </button>
        <button @click="router.push('/activities')" class="back-button">
          Zurück
        </button>
      </div>
    </div>

    <div class="detail-card">
      <h2>Beschreibung</h2>
      <p>{{ activity.description }}</p>
    </div>

    <div class="detail-card">
      <h2>Details</h2>
      <p><strong>Dauer:</strong> {{ activity.duration }} Minuten</p>
      <p><strong>Kategorie:</strong> {{ activity.category }}</p>
      <p><strong>Teilnehmer:</strong> {{ activity.minParticipants }}-{{ activity.maxParticipants }}</p>
    </div>

    <div class="detail-card">
      <h2>Material</h2>
      <ul class="materials-list">
        <li v-for="material in activity.materials" :key="material">
          {{ material }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.activity-details-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
}

.detail-card {
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.materials-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.materials-list li {
  background: var(--color-background);
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.edit-button, .back-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-button {
  background: var(--color-primary);
  color: white;
}

.back-button {
  background: var(--color-border);
}
</style>
