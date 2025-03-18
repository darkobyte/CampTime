<script setup>
import { ref, computed, onMounted } from 'vue'
import { useActivityStore } from '../stores/activities'
import { useRouter } from 'vue-router'

const activityStore = useActivityStore()
const router = useRouter()
const categories = ref([
  'Alle',
  'Spiele',
  'Sport',
  'Basteln',
  'Lernen',
  'Outdoor',
  'Gruppenstunde'
])

const selectedCategory = ref('Alle')
const searchQuery = ref('')
const showNewActivityForm = ref(false)

const newActivity = ref({
  name: '',
  description: '',
  duration: 30,
  category: 'Spiele',
  materials: [],
  minParticipants: 5,
  maxParticipants: 15,
})

const newMaterial = ref('')

const addMaterial = () => {
  if (newMaterial.value.trim()) {
    newActivity.value.materials.push(newMaterial.value.trim())
    newMaterial.value = ''
  }
}

const removeMaterial = (index) => {
  newActivity.value.materials.splice(index, 1)
}

const handleCreateActivity = async () => {
  if (await activityStore.createActivity(newActivity.value)) {
    showNewActivityForm.value = false
    newActivity.value = {
      name: '',
      description: '',
      duration: 30,
      category: 'Spiele',
      materials: [],
      minParticipants: 5,
      maxParticipants: 15,
    }
  }
}

const filteredActivities = computed(() => {
  return activityStore.activities.filter(activity => {
    const matchesCategory = selectedCategory.value === 'Alle' || activity.category === selectedCategory.value
    const matchesSearch = activity.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})

const viewDetails = (id) => {
  router.push(`/activities/${id}`)
}

const editActivity = (id) => {
  router.push(`/activities/${id}/edit`)
}

onMounted(() => {
  activityStore.fetchActivities()
})
</script>

<template>
  <div class="activities-container">
    <div class="activities-header">
      <h1>Aktivitäten</h1>
      <button class="add-button" @click="showNewActivityForm = true">
        Neue Aktivität
      </button>
    </div>

    <!-- New Activity Form -->
    <div v-if="showNewActivityForm" class="modal">
      <div class="modal-content">
        <h2>Neue Aktivität</h2>
        <form @submit.prevent="handleCreateActivity">
          <div class="form-group">
            <label for="name">Name</label>
            <input v-model="newActivity.name" id="name" required>
          </div>

          <div class="form-group">
            <label for="description">Beschreibung</label>
            <textarea v-model="newActivity.description" id="description" required></textarea>
          </div>

          <div class="form-group">
            <label for="duration">Dauer (Minuten)</label>
            <input type="number" v-model="newActivity.duration" id="duration" min="1" required>
          </div>

          <div class="form-group">
            <label for="category">Kategorie</label>
            <select v-model="newActivity.category" id="category" required>
              <option v-for="cat in categories.filter(c => c !== 'Alle')" 
                      :key="cat" 
                      :value="cat">
                {{ cat }}
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
              <li v-for="(material, index) in newActivity.materials" :key="index">
                {{ material }}
                <button type="button" @click="removeMaterial(index)">×</button>
              </li>
            </ul>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="minParticipants">Min. Teilnehmer</label>
              <input type="number" v-model="newActivity.minParticipants" id="minParticipants" min="1" required>
            </div>

            <div class="form-group">
              <label for="maxParticipants">Max. Teilnehmer</label>
              <input type="number" v-model="newActivity.maxParticipants" id="maxParticipants" min="1" required>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn">Erstellen</button>
            <button type="button" @click="showNewActivityForm = false" class="cancel-btn">
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="filters">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Aktivität suchen..."
        class="search-input"
      >
      <div class="category-filters">
        <button
          v-for="category in categories"
          :key="category"
          :class="['category-button', { active: selectedCategory === category }]"
          @click="selectedCategory = category"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <div class="activities-grid">
      <div 
        v-for="activity in filteredActivities" 
        :key="activity.id" 
        class="activity-card"
      >
        <div class="activity-header">
          <h3>{{ activity.name }}</h3>
          <span class="duration-badge">{{ activity.duration }} Min</span>
        </div>
        <span class="category-tag">{{ activity.category }}</span>
        <p class="description">{{ activity.description }}</p>
        <div class="materials">
          <h4>Material:</h4>
          <ul>
            <li v-for="material in activity.materials" :key="material">
              {{ material }}
            </li>
          </ul>
        </div>
        <div class="participants">
          <span>{{ activity.minParticipants }}-{{ activity.maxParticipants }} Teilnehmer</span>
        </div>
        <div class="activity-actions">
          <button class="action-button" @click="viewDetails(activity.id)">Details</button>
          <button class="action-button" @click="editActivity(activity.id)">Bearbeiten</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activities-container {
  padding: 1rem;
}

.activities-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.filters {
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.category-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  cursor: pointer;
}

.category-button.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.activity-card {
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.duration-badge {
  background: var(--color-accent);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.category-tag {
  background: var(--color-secondary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  display: inline-block;
  margin-bottom: 1rem;
}

.description {
  margin-bottom: 1rem;
}

.materials {
  margin-bottom: 1rem;
}

.materials ul {
  list-style: none;
  padding-left: 0;
}

.materials li {
  display: inline-block;
  background: var(--color-background);
  padding: 0.25rem 0.5rem;
  margin: 0.25rem;
  border-radius: 4px;
}

.activity-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.action-button {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background: var(--color-primary);
  color: white;
  cursor: pointer;
}

.action-button:hover {
  background: var(--color-secondary);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-surface);
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
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

.add-button {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>
