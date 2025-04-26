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

const tabs = ref(['Übersicht', 'Küchenplan', 'Programm', 'Weiteres'])
const activeTab = ref('Übersicht')
const selectedCamp = ref(null) // Track the selected camp
const showEditCampForm = ref(false) // Control the visibility of the edit popup

const editedCamp = ref({
  id: null,
  title: '',
  location: '',
  startDate: '',
  endDate: '',
  groups: [],
  participants: 0,
  status: ''
})

const statusOptions = ['In Planung', 'Aktiv', 'Abgeschlossen', 'Auf Eis', 'Geplant']

const openEditCampForm = (camp) => {
  editedCamp.value = { ...camp }
  showEditCampForm.value = true
}

const handleSaveCamp = () => {
  const index = camps.value.findIndex(c => c.id === editedCamp.value.id)
  if (index !== -1) {
    camps.value[index] = { ...editedCamp.value }
  }
  showEditCampForm.value = false
}

const getStatusClass = (status) => {
  switch (status) {
    case 'In Planung':
      return 'status-planning'
    case 'Aktiv':
      return 'status-active'
    case 'Abgeschlossen':
      return 'status-completed'
    case 'Auf Eis':
      return 'status-on-hold'
    case 'Geplant':
      return 'status-scheduled'
    default:
      return ''
  }
}
</script>

<template>
  <div class="camps-container">
    <div class="members-header">
      <h1>Lager</h1>
      <button class="add-button" @click="selectedCamp = null">Neues Lager</button>
    </div>

    <div class="camps-content">
      <div v-for="camp in camps" :key="camp.id" class="camp-card" @click="selectedCamp = camp">
        <div class="camp-header">
          <h2>
            {{ camp.title }}
            <span :class="['status-badge', getStatusClass(camp.status)]">
              {{ camp.status }}
            </span>
          </h2>
        </div>
        
        <div class="camp-details">
          <p><strong>Ort:</strong> {{ camp.location }}</p>
          <p><strong>Datum:</strong> {{ camp.startDate }} - {{ camp.endDate }}</p>
          <p><strong>Gruppen:</strong> {{ camp.groups.join(', ') }}</p>
          <p><strong>Teilnehmer:</strong> {{ camp.participants }}</p>
        </div>

        <div class="camp-actions">
          <button class="action-button" @click="openEditCampForm(camp)">Bearbeiten</button>
          <button class="action-button">Details</button>
        </div>
      </div>
    </div>

    <!-- Edit Camp Modal -->
    <div v-if="showEditCampForm" class="modal">
      <div class="modal-content">
        <h2>Lager bearbeiten</h2>
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
        <form @submit.prevent="handleSaveCamp">
          <div v-if="activeTab === 'Übersicht'">
            <!-- Status Switcher -->
            <div class="form-group">
              <label for="status">Status</label>
              <select v-model="editedCamp.status" id="status">
                <option v-for="status in statusOptions" :key="status" :value="status">
                  {{ status }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="title">Titel</label>
              <input v-model="editedCamp.title" id="title" required>
            </div>
            <div class="form-group">
              <label for="location">Ort</label>
              <input v-model="editedCamp.location" id="location" required>
            </div>
            <div class="form-group">
              <label for="startDate">Startdatum</label>
              <input v-model="editedCamp.startDate" id="startDate" type="date" required>
            </div>
            <div class="form-group">
              <label for="endDate">Enddatum</label>
              <input v-model="editedCamp.endDate" id="endDate" type="date" required>
            </div>
            <div class="form-group">
              <label for="participants">Teilnehmer</label>
              <input v-model="editedCamp.participants" id="participants" type="number" required>
            </div>
          </div>
          <div v-else-if="activeTab === 'Küchenplan'">
            <p>Küchenplan bearbeiten...</p>
          </div>
          <div v-else-if="activeTab === 'Programm'">
            <p>Programm bearbeiten...</p>
          </div>
          <div v-else-if="activeTab === 'Teilnehmer'">
            <p>Teilnehmer bearbeiten...</p>
          </div>
          <div class="form-actions">
            <button type="submit" class="submit-btn">Speichern</button>
            <button type="button" @click="showEditCampForm = false" class="cancel-btn">Abbrechen</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.camps-container {
  padding: 1rem;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.add-button {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem; /* Adjusted size */
  border-radius: 4px;
  cursor: pointer;
}

.camp-tabs {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
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
  cursor: pointer;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: white;
  font-weight: bold;
  min-width: 50px; /* Ensure badge has a minimum width */
  text-align: center;
}

.status-planning {
  background: var(--color-warning); /* Scout orange */
}

.status-active {
  background: var(--color-accent); /* Vibrant green */
}

.status-completed {
  background: var(--color-secondary); /* Bright sky blue */
}

.status-on-hold {
  background: var(--color-earth); /* Earthy purple */
}

.status-scheduled {
  background: var(--color-sky); /* Clear sky blue */
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
  max-width: 500px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 1rem;
  appearance: none; /* Remove default browser styling */
  cursor: pointer;
}

.form-group select:focus {
  outline: none;
  border-color: var(--color-primary); /* Highlight border on focus */
  box-shadow: 0 0 4px var(--color-primary);
}


.form-group select {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2334495e'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
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

.camp-header h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Add spacing between title and status badge */
}
</style>
