<script setup>
import { ref } from 'vue'

const camps = ref([
  {
    id: 1,
    title: 'Sommerlager 2024',
    location: 'Zeltplatz Waldsee',
    startDate: '2024-07-15',
    endDate: '2024-07-22',
    groups: ['Jupfis', 'Pfadis'],
    participants: 25,
    status: 'In Planung'
  }
])

const tabs = ref(['Übersicht', 'Küchenplan', 'Programm', 'Teilnehmer'])
const activeTab = ref('Übersicht')
</script>

<template>
  <div class="camps-container">
    <div class="camps-header">
      <h1>Lager</h1>
      <button class="add-button">Neues Lager</button>
    </div>

    <div class="camp-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab"
        :class="['tab-button', { active: activeTab === tab }]"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <div class="camps-content">
      <div v-for="camp in camps" :key="camp.id" class="camp-card">
        <div class="camp-header">
          <h2>{{ camp.title }}</h2>
          <span :class="['status-badge', camp.status.toLowerCase()]">
            {{ camp.status }}
          </span>
        </div>
        
        <div class="camp-details">
          <p><strong>Ort:</strong> {{ camp.location }}</p>
          <p><strong>Datum:</strong> {{ camp.startDate }} - {{ camp.endDate }}</p>
          <p><strong>Gruppen:</strong> {{ camp.groups.join(', ') }}</p>
          <p><strong>Teilnehmer:</strong> {{ camp.participants }}</p>
        </div>

        <div class="camp-actions">
          <button class="action-button">Bearbeiten</button>
          <button class="action-button">Details</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.camps-container {
  padding: 1rem;
}

.camp-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  border: none;
  background: var(--color-surface);
  border-radius: 4px;
  cursor: pointer;
}

.tab-button.active {
  background: var(--color-primary);
  color: white;
}

.camp-card {
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: white;
}

.status-badge.planung {
  background: var(--color-warning);
}

.camp-actions {
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
</style>
