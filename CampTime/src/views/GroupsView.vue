<script setup>
import { ref } from 'vue'

const groups = ref([
  {
    id: 1,
    name: 'Jupfis',
    description: 'Jungpfadfinder 10-13 Jahre',
    meetingTime: 'Dienstags 16:00',
    leaders: ['Anna M.', 'Michael K.'],
    memberCount: 15
  },
  {
    id: 2,
    name: 'Pfadis',
    description: 'Pfadfinder 13-16 Jahre',
    meetingTime: 'Mittwochs 17:30',
    leaders: ['Thomas B.', 'Sarah L.'],
    memberCount: 12
  }
])

const showNewGroupForm = ref(false)
</script>

<template>
  <div class="groups-container">
    <div class="groups-header">
      <h1>Gruppen</h1>
      <button @click="showNewGroupForm = true" class="add-button">
        Neue Gruppe
      </button>
    </div>

    <div class="groups-grid">
      <div v-for="group in groups" :key="group.id" class="group-card">
        <div class="group-header">
          <h2>{{ group.name }}</h2>
          <span class="member-count">{{ group.memberCount }} Mitglieder</span>
        </div>
        <p>{{ group.description }}</p>
        <div class="group-details">
          <p><strong>Treffen:</strong> {{ group.meetingTime }}</p>
          <p><strong>Leiter:</strong> {{ group.leaders.join(', ') }}</p>
        </div>
        <div class="group-actions">
          <button class="edit-button">Bearbeiten</button>
          <button class="view-button">Details</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.groups-container {
  padding: 1rem;
}

.groups-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.group-card {
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.member-count {
  background: var(--color-accent);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.group-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.edit-button, .view-button {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-button {
  background: var(--color-primary);
  color: white;
}

.view-button {
  background: var(--color-secondary);
  color: white;
}
</style>
