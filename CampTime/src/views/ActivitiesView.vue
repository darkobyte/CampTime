<script setup>
import { ref, computed } from 'vue'

const categories = ref([
  'Alle',
  'Spiele',
  'Sport',
  'Basteln',
  'Lernen',
  'Outdoor',
  'Gruppenstunde'
])

const activities = ref([
  {
    id: 1,
    name: 'Knoten lernen',
    duration: 30,
    category: 'Lernen',
    materials: ['Seile', 'Anleitungen'],
    minParticipants: 5,
    maxParticipants: 15,
    description: 'Verschiedene Knotenarten für Zelte und Lagerbauten lernen.'
  },
  {
    id: 2,
    name: 'Geländespiel: Schatzsuche',
    duration: 60,
    category: 'Outdoor',
    materials: ['Karten', 'Kompass', 'Schatz'],
    minParticipants: 8,
    maxParticipants: 20,
    description: 'Schatzsuche mit Koordinaten und Hinweisen im Gelände.'
  }
])

const selectedCategory = ref('Alle')
const searchQuery = ref('')

const filteredActivities = computed(() => {
  return activities.value.filter(activity => {
    const matchesCategory = selectedCategory.value === 'Alle' || activity.category === selectedCategory.value
    const matchesSearch = activity.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})
</script>

<template>
  <div class="activities-container">
    <div class="activities-header">
      <h1>Aktivitäten</h1>
      <button class="add-button">Neue Aktivität</button>
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
          <button class="action-button">Details</button>
          <button class="action-button">Bearbeiten</button>
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
</style>
