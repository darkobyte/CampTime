<script setup>
import { ref } from 'vue'

const meetings = ref([
  {
    id: 1,
    title: 'Jupfi Gruppenstunde',
    date: '2024-02-20',
    time: '16:00',
    group: 'Jupfis',
    activities: [
      { name: 'Begrüßungsspiel', duration: 15 },
      { name: 'Knoten lernen', duration: 30 },
      { name: 'Abschlusskreis', duration: 15 }
    ]
  }
])

const activities = ref([
  { id: 1, name: 'Begrüßungsspiel', duration: 15, category: 'Spiele' },
  { id: 2, name: 'Knoten lernen', duration: 30, category: 'Lernen' },
  { id: 3, name: 'Geländespiel', duration: 45, category: 'Outdoor' },
])
</script>

<template>
  <div class="meetings-container">
    <div class="activities-sidebar">
      <h2>Aktivitäten</h2>
      <div class="activities-list">
        <div 
          v-for="activity in activities" 
          :key="activity.id"
          class="activity-item"
          draggable="true"
        >
          <h3>{{ activity.name }}</h3>
          <p>{{ activity.duration }} Minuten</p>
          <span class="category-tag">{{ activity.category }}</span>
        </div>
      </div>
    </div>

    <div class="meetings-content">
      <h2>Gruppenstunden</h2>
      <div class="meetings-list">
        <div 
          v-for="meeting in meetings" 
          :key="meeting.id"
          class="meeting-card"
        >
          <div class="meeting-header">
            <h3>{{ meeting.title }}</h3>
            <p>{{ meeting.date }} {{ meeting.time }}</p>
          </div>
          <div class="meeting-activities">
            <div 
              v-for="(activity, index) in meeting.activities" 
              :key="index"
              class="meeting-activity"
            >
              <span>{{ activity.name }}</span>
              <span>{{ activity.duration }} Min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meetings-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  height: calc(100vh - 120px);
}

.activities-sidebar {
  background: var(--color-surface);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.activity-item {
  background: var(--color-background);
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  cursor: move;
}

.category-tag {
  background: var(--color-secondary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.meetings-content {
  background: var(--color-surface);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.meeting-card {
  background: var(--color-background);
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.meeting-activities {
  margin-top: 1rem;
}

.meeting-activity {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: var(--color-surface);
  margin-bottom: 0.5rem;
  border-radius: 4px;
}
</style>
