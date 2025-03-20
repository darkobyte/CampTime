<script setup>
import { ref, onMounted } from 'vue'
import { useGroupStore } from '../stores/groups'
import { useRouter } from 'vue-router'

const router = useRouter()

const groupStore = useGroupStore()
const showNewGroupForm = ref(false)
const newGroup = ref({
  name: '',
  description: '',
  meetingTime: {
    weekday: '',
    time: '',
    frequency: '1' // '1' for weekly, '2' for bi-weekly
  },
  start_date: '',
  end_date: '',
  leaders: [{ firstName: '', lastName: '' }]
})

const weekdays = [
  { value: '1', label: 'Montag' },
  { value: '2', label: 'Dienstag' },
  { value: '3', label: 'Mittwoch' },
  { value: '4', label: 'Donnerstag' },
  { value: '5', label: 'Freitag' },
  { value: '6', label: 'Samstag' },
  { value: '0', label: 'Sonntag' }
]

const frequencies = [
  { value: '1', label: 'Jede Woche' },
  { value: '2', label: 'Alle 2 Wochen' }
]

const addLeader = () => {
  newGroup.value.leaders.push({ firstName: '', lastName: '' })
}

const removeLeader = (index) => {
  newGroup.value.leaders.splice(index, 1)
}

const handleSubmit = async () => {
  if (await groupStore.createGroup(newGroup.value)) {
    showNewGroupForm.value = false
    newGroup.value = {
      name: '',
      description: '',
      meetingTime: {
        weekday: '',
        time: '',
        frequency: '1'
      },
      start_date: '',
      end_date: '',
      leaders: [{ firstName: '', lastName: '' }]
    }
  }
}

const formatMeetingTime = (meetingTime) => {
  if (!meetingTime || !meetingTime.weekday || !meetingTime.time) return ''
  const weekday = weekdays.find(w => w.value === meetingTime.weekday)?.label
  const frequency = meetingTime.frequency === '2' ? ' (alle 2 Wochen)' : ''
  return `${weekday} um ${meetingTime.time}${frequency}`
}

const formatLeaders = (leaders) => {
  if (!leaders || !Array.isArray(leaders)) return ''
  return leaders
    .map(leader => `${leader.firstName} ${leader.lastName}`)
    .join(', ')
}

const viewDetails = (groupId) => {
  router.push(`/groups/${groupId}`)
}

const editGroup = (groupId) => {
  router.push(`/groups/${groupId}/edit`)
}

onMounted(() => {
  groupStore.fetchGroups()
})
</script>

<template>
  <div class="groups-container">
    <div class="groups-header">
      <h1>Gruppen</h1>
      <button @click="showNewGroupForm = true" class="add-button">
        Neue Gruppe
      </button>
    </div>

    <div v-if="showNewGroupForm" class="new-group-form">
      <h2>Neue Gruppe erstellen</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Name</label>
          <input v-model="newGroup.name" id="name" required>
        </div>

        <div class="form-group">
          <label for="description">Beschreibung</label>
          <textarea v-model="newGroup.description" id="description" required></textarea>
        </div>

        <div class="meeting-time-section">
          <h3>Treffzeit</h3>
          <div class="meeting-time-inputs">
            <div class="form-group">
              <label for="start_date">Startdatum</label>
              <input 
                type="date" 
                v-model="newGroup.start_date"
                id="start_date" 
                required
              >
            </div>

            <div class="form-group">
              <label for="end_date">Enddatum (optional)</label>
              <input 
                type="date" 
                v-model="newGroup.end_date"
                id="end_date"
                :min="newGroup.start_date"
              >
            </div>

            <div class="form-group">
              <label for="weekday">Wochentag</label>
              <select v-model="newGroup.meetingTime.weekday" id="weekday" required>
                <option value="">Bitte wählen</option>
                <option v-for="day in weekdays" :key="day.value" :value="day.value">
                  {{ day.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="time">Uhrzeit</label>
              <input 
                type="time" 
                v-model="newGroup.meetingTime.time" 
                id="time" 
                required
              >
            </div>

            <div class="form-group">
              <label for="frequency">Häufigkeit</label>
              <select v-model="newGroup.meetingTime.frequency" id="frequency" required>
                <option v-for="freq in frequencies" :key="freq.value" :value="freq.value">
                  {{ freq.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="leaders-section">
          <h3>Leiter</h3>
          <div v-for="(leader, index) in newGroup.leaders" :key="index" class="leader-inputs">
            <input v-model="leader.firstName" placeholder="Vorname" required>
            <input v-model="leader.lastName" placeholder="Nachname" required>
            <button type="button" @click="removeLeader(index)" v-if="newGroup.leaders.length > 1">
              Entfernen
            </button>
          </div>
          <button type="button" @click="addLeader" class="add-leader-btn">
            Leiter hinzufügen
          </button>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">Erstellen</button>
          <button type="button" @click="showNewGroupForm = false" class="cancel-btn">
            Abbrechen
          </button>
        </div>
      </form>
    </div>

    <div v-if="groupStore.loading" class="loading">Laden...</div>
    <div v-else-if="groupStore.error" class="error">{{ groupStore.error }}</div>
    <div v-else class="groups-grid">
      <div v-for="group in groupStore.groups" :key="group.id" class="group-card">
        <div class="group-header">
          <h2>{{ group.name }}</h2>
          <span class="member-count">{{ group.memberCount }} Mitglieder</span>
        </div>
        <p>{{ group.description }}</p>
        <div class="group-details">
          <p><strong>Treffen:</strong> {{ formatMeetingTime(group.meetingTime) }}</p>
          <p><strong>Leiter:</strong> {{ formatLeaders(group.leaders) }}</p>
        </div>
        <div class="group-actions">
          <button class="edit-button" @click="editGroup(group.id)">Bearbeiten</button>
          <button class="view-button" @click="viewDetails(group.id)">Details</button>
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

.new-group-form {
  background: var(--color-surface);
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
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
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.leaders-section {
  margin: 1rem 0;
}

.leader-inputs {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.leader-inputs input {
  flex: 1;
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
}

.submit-btn {
  background: var(--color-primary);
  color: white;
}

.cancel-btn {
  background: var(--color-border);
}

.add-leader-btn {
  background: var(--color-accent);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.error {
  color: var(--color-danger);
  text-align: center;
  padding: 2rem;
}

.meeting-time-section {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--color-background);
  border-radius: 4px;
}

.meeting-time-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

select, input[type="time"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: white;
}
</style>
