<script setup>
import { ref } from 'vue'

const upcomingMeetings = ref([
  { id: 1, title: 'Jupfi Gruppenstunde', date: '2024-02-20', time: '16:00', group: 'Jupfis' },
  { id: 2, title: 'Pfadi Gruppenstunde', date: '2024-02-21', time: '17:30', group: 'Pfadis' }
])

const activeGroups = ref([
  { id: 1, name: 'Jupfis', memberCount: 15 },
  { id: 2, name: 'Pfadis', memberCount: 12 },
  { id: 3, name: 'Rover', memberCount: 8 }
])
</script>

<template>
  <div class="dashboard-grid">
    <div class="dashboard-card">
      <h2>Nächste Gruppenstunden</h2>
      <div class="upcoming-meetings">
        <div v-for="meeting in upcomingMeetings" :key="meeting.id" class="meeting-item">
          <h3>{{ meeting.title }}</h3>
          <p>{{ meeting.date }} um {{ meeting.time }}</p>
        </div>
      </div>
    </div>

    <div class="dashboard-card">
      <h2>Aktive Gruppen</h2>
      <div class="group-list">
        <div v-for="group in activeGroups" :key="group.id" class="group-item">
          <h3>{{ group.name }}</h3>
          <p>{{ group.memberCount }} Mitglieder</p>
        </div>
      </div>
    </div>

    <div class="dashboard-card">
      <h2>Schnellzugriff</h2>
      <div class="quick-actions">
        <button class="action-button">Neue Gruppenstunde</button>
        <button class="action-button">Mitglied hinzufügen</button>
        <button class="action-button">Neues Lager planen</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.dashboard-card {
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.meeting-item, .group-item {
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: var(--color-background);
  border-radius: 4px;
}

.action-button {
  display: block;
  width: 100%;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-button:hover {
  background: var(--color-secondary);
}
</style>
