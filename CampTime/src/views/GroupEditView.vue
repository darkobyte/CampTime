<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGroupStore } from '../stores/groups'

const route = useRoute()
const router = useRouter()
const groupStore = useGroupStore()
const group = ref(null)

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

onMounted(async () => {
  const groupId = parseInt(route.params.id)
  group.value = await groupStore.fetchGroupById(groupId)
})

const addLeader = () => {
  if (!group.value.leaders) group.value.leaders = []
  group.value.leaders.push({ firstName: '', lastName: '' })
}

const removeLeader = (index) => {
  group.value.leaders.splice(index, 1)
}

const handleSubmit = async () => {
  if (await groupStore.updateGroup(group.value)) {
    router.push(`/groups/${group.value.id}`)
  }
}
</script>

<template>
  <div class="group-edit-container" v-if="group">
    <h1>Gruppe bearbeiten</h1>
    <form @submit.prevent="handleSubmit" class="edit-form">
      <div class="form-group">
        <label for="name">Name</label>
        <input v-model="group.name" id="name" required>
      </div>

      <div class="form-group">
        <label for="description">Beschreibung</label>
        <textarea v-model="group.description" id="description" required></textarea>
      </div>

      <div class="meeting-time-section">
        <h3>Treffzeit</h3>
        <div class="meeting-time-inputs">
          <div class="form-group">
            <label for="start_date">Startdatum</label>
            <input 
              type="date" 
              v-model="group.start_date"
              id="start_date" 
              required
            >
          </div>

          <div class="form-group">
            <label for="end_date">Enddatum (optional)</label>
            <input 
              type="date" 
              v-model="group.end_date"
              id="end_date"
              :min="group.start_date"
            >
          </div>

          <div class="form-group">
            <label for="weekday">Wochentag</label>
            <select v-model="group.meetingTime.weekday" id="weekday" required>
              <option v-for="day in weekdays" :key="day.value" :value="day.value">
                {{ day.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="time">Uhrzeit</label>
            <input type="time" v-model="group.meetingTime.time" id="time" required>
          </div>

          <div class="form-group">
            <label for="frequency">Häufigkeit</label>
            <select v-model="group.meetingTime.frequency" id="frequency" required>
              <option v-for="freq in frequencies" :key="freq.value" :value="freq.value">
                {{ freq.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="leaders-section">
        <h3>Leiter</h3>
        <div v-for="(leader, index) in group.leaders" :key="index" class="leader-inputs">
          <input v-model="leader.firstName" placeholder="Vorname" required>
          <input v-model="leader.lastName" placeholder="Nachname" required>
          <button type="button" @click="removeLeader(index)" v-if="group.leaders.length > 1">
            Entfernen
          </button>
        </div>
        <button type="button" @click="addLeader" class="add-leader-btn">
          Leiter hinzufügen
        </button>
      </div>

      <div class="form-actions">
        <button type="submit" class="submit-btn">Speichern</button>
        <button type="button" @click="router.push(`/groups/${group.id}`)" class="cancel-btn">
          Abbrechen
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.group-edit-container {
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

/* Reuse existing styles from GroupsView */
.form-group, .meeting-time-section, .leaders-section,
.meeting-time-inputs, .leader-inputs, .form-actions,
.submit-btn, .cancel-btn, .add-leader-btn {
  /* These styles are the same as in GroupsView */
}
</style>
