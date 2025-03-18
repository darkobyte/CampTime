<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useActivityStore } from '../stores/activities'

const route = useRoute()
const router = useRouter()
const activityStore = useActivityStore()
const activity = ref(null)
const newMaterial = ref('')

const categories = [
  'Spiele',
  'Sport',
  'Basteln',
  'Lernen',
  'Outdoor',
  'Gruppenstunde'
]

onMounted(async () => {
  const activityId = parseInt(route.params.id)
  activity.value = await activityStore.fetchActivityById(activityId)
})

const addMaterial = () => {
  if (newMaterial.value.trim() && activity.value) {
    activity.value.materials.push(newMaterial.value.trim())
    newMaterial.value = ''
  }
}

const removeMaterial = (index) => {
  if (activity.value) {
    activity.value.materials.splice(index, 1)
  }
}

const handleSubmit = async () => {
  if (await activityStore.updateActivity(activity.value.id, activity.value)) {
    router.push(`/activities/${activity.value.id}`)
  }
}

const handleDelete = async () => {
  if (confirm('Möchten Sie diese Aktivität wirklich löschen?')) {
    if (await activityStore.deleteActivity(activity.value.id)) {
      router.push('/activities')
    }
  }
}
</script>

<template>
  <div class="activity-edit-container" v-if="activity">
    <div class="header">
      <h1>Aktivität bearbeiten</h1>
      <button @click="handleDelete" class="delete-button">Löschen</button>
    </div>
    <form @submit.prevent="handleSubmit" class="edit-form">
      <div class="form-group">
        <label for="name">Name</label>
        <input v-model="activity.name" id="name" required>
      </div>

      <div class="form-group">
        <label for="description">Beschreibung</label>
        <textarea v-model="activity.description" id="description" required></textarea>
      </div>

      <div class="form-group">
        <label for="duration">Dauer (Minuten)</label>
        <input type="number" v-model="activity.duration" id="duration" min="1" required>
      </div>

      <div class="form-group">
        <label for="category">Kategorie</label>
        <select v-model="activity.category" id="category" required>
          <option v-for="category in categories" 
                  :key="category" 
                  :value="category">
            {{ category }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Material</label>
        <div class="materials-input">
          <input v-model="newMaterial" placeholder="Neues Material">
          <button type="button" @click="addMaterial">+</button>
        </div>
        <ul class="materials-list">
          <li v-for="(material, index) in activity.materials" :key="index">
            {{ material }}
            <button type="button" @click="removeMaterial(index)">×</button>
          </li>
        </ul>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="minParticipants">Min. Teilnehmer</label>
          <input type="number" v-model="activity.minParticipants" id="minParticipants" min="1" required>
        </div>

        <div class="form-group">
          <label for="maxParticipants">Max. Teilnehmer</label>
          <input type="number" v-model="activity.maxParticipants" id="maxParticipants" min="1" required>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="submit-btn">Speichern</button>
        <button type="button" @click="router.push(`/activities/${activity.id}`)" class="cancel-btn">
          Abbrechen
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.activity-edit-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.edit-form {
  background: var(--color-surface);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.materials-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.materials-input input {
  flex: 1;
}

.materials-list {
  list-style: none;
  padding: 0;
}

.materials-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem;
  background: var(--color-background);
  margin-bottom: 0.25rem;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.submit-btn,
.cancel-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
}

.submit-btn {
  background: var(--color-primary);
  color: white;
}

.cancel-btn {
  background: var(--color-border);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.delete-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: var(--color-danger);
  color: white;
  cursor: pointer;
}
</style>
