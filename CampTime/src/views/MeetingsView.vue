<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useMeetingStore } from '../stores/meetings'
import { useActivityStore } from '../stores/activities'
import { useGroupStore } from '../stores/groups'

const meetingStore = useMeetingStore()
const activityStore = useActivityStore()
const groupStore = useGroupStore()

const showNewMeetingForm = ref(false)
const newMeeting = ref({
  group_id: '',
  meeting_date: '',
  meeting_time: '',
  title: '',
  activities: []
})

const selectedGroup = ref('all')
const selectedDate = ref(new Date().toISOString().split('T')[0])

const navigateDate = (days) => {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() + days)
  selectedDate.value = date.toISOString().split('T')[0]
}

const filteredMeetings = computed(() => {
  let filtered = meetingStore.meetings
  
  if (selectedGroup.value !== 'all') {
    filtered = filtered.filter(meeting => meeting.group_id.toString() === selectedGroup.value)
  }
  
  // Sortiere nach Datum und filtere ab dem ausgewählten Datum
  return filtered
    .filter(meeting => meeting.meeting_date >= selectedDate.value)
    .sort((a, b) => {
      const dateA = new Date(`${a.meeting_date}T${a.meeting_time}`)
      const dateB = new Date(`${b.meeting_date}T${b.meeting_time}`)
      return dateA - dateB
    })
    .slice(0, 8) // Nur die nächsten 8 Meetings
})

const resetDate = () => {
  selectedDate.value = new Date().toISOString().split('T')[0]
}

onMounted(async () => {
  await Promise.all([
    meetingStore.fetchUpcomingMeetings(),
    activityStore.fetchActivities(),
    groupStore.fetchGroups()
  ])
})

const formatDateTime = (date, time) => {
  if (!date || !time) return 'Invalid Date'
  try {
    // Ensure we have the correct format
    const [hours, minutes] = time.split(':')
    const dateObj = new Date(date)
    dateObj.setHours(parseInt(hours), parseInt(minutes))
    
    return dateObj.toLocaleString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid Date'
  }
}

const handleDrop = async (e, meetingId) => {
  const activityId = e.dataTransfer.getData('activity')
  await meetingStore.addActivityToMeeting(meetingId, activityId)
}

const handleDragStart = (e, activity) => {
  e.dataTransfer.setData('activity', activity.id)
}

const handleClearActivities = async (meetingId) => {
  await meetingStore.clearActivities(meetingId)
}

const handleCancelMeeting = async (meeting) => {
  await meetingStore.cancelMeeting(meeting.id)
}

const showCustomMeetingForm = ref(false)
const customMeeting = ref({
  title: '',
  group_id: '',
  meeting_date: '',
  meeting_time: ''
})

const handleCreateCustomMeeting = async () => {
  if (await meetingStore.createMeeting(customMeeting.value)) {
    showCustomMeetingForm.value = false
    customMeeting.value = {
      title: '',
      group_id: '',
      meeting_date: '',
      meeting_time: ''
    }
    await meetingStore.fetchUpcomingMeetings()
  }
}
</script>

<template>
  <div>
    <div class="top-actions">
      <div class="spacer"></div>
      <button class="add-button" @click="showCustomMeetingForm = true">
        Einzelne Gruppenstunde
      </button>
    </div>
    
    <div class="meetings-container">
      <div class="activities-sidebar">
        <h2>Aktivitäten</h2>
        <div class="activities-list">
          <div 
            v-for="activity in activityStore.activities" 
            :key="activity.id"
            class="activity-item"
            draggable="true"
            @dragstart="handleDragStart($event, activity)"
          >
            <h3>{{ activity.name }}</h3>
            <p>{{ activity.duration }} Minuten</p>
            <span class="category-tag">{{ activity.category }}</span>
          </div>
        </div>
      </div>

      <div class="meetings-content">
        <div class="meetings-header">
          <h2>Gruppenstunden</h2>
          <div class="header-actions">
            <div class="filters">
              <select v-model="selectedGroup" class="group-filter">
                <option value="all">Alle Gruppen</option>
                <option 
                  v-for="group in groupStore.groups" 
                  :key="group.id" 
                  :value="group.id.toString()"
                >
                  {{ group.name }}
                </option>
              </select>
              
              <div class="date-filter">
                <button @click="navigateDate(-1)" class="nav-button">&lt;</button>
                <input 
                  type="date" 
                  v-model="selectedDate" 
                  class="date-input"
                >
                <button @click="navigateDate(1)" class="nav-button">&gt;</button>
                <button @click="resetDate" class="today-button">Heute</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Custom Meeting Modal -->
        <div v-if="showCustomMeetingForm" class="modal">
          <div class="modal-content">
            <h2>Einzelne Gruppenstunde erstellen</h2>
            <form @submit.prevent="handleCreateCustomMeeting">
              <div class="form-group">
                <label for="title">Titel</label>
                <input v-model="customMeeting.title" id="title" required>
              </div>

              <div class="form-group">
                <label for="group">Gruppe</label>
                <select v-model="customMeeting.group_id" id="group" required>
                  <option value="">Bitte wählen</option>
                  <option v-for="group in groupStore.groups" 
                          :key="group.id" 
                          :value="group.id">
                    {{ group.name }}
                  </option>
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="date">Datum</label>
                  <input type="date" 
                         v-model="customMeeting.meeting_date" 
                         id="date" 
                         required>
                </div>
                <div class="form-group">
                  <label for="time">Uhrzeit</label>
                  <input type="time" 
                         v-model="customMeeting.meeting_time" 
                         id="time" 
                         required>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="submit-btn">Erstellen</button>
                <button type="button" 
                        @click="showCustomMeetingForm = false" 
                        class="cancel-btn">
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div v-if="meetingStore.loading" class="loading">
          Lade Gruppenstunden...
        </div>
        <div v-else-if="filteredMeetings.length === 0" class="no-meetings">
          Keine Gruppenstunden ab diesem Datum gefunden
        </div>
        <div v-else class="meetings-list">
          <div 
            v-for="meeting in filteredMeetings" 
            :key="meeting.id"
            class="meeting-card"
            :class="{ 
              'is-calculated': meeting.isCalculated,
              'is-cancelled': meeting.is_cancelled 
            }"
            @drop="handleDrop($event, meeting.id)"
            @dragover.prevent
            @dragenter.prevent
          >
            <div class="meeting-header">
              <div class="meeting-info">
                <h3>{{ meeting.title }}</h3>
                <p>{{ formatDateTime(meeting.meeting_date, meeting.meeting_time) }}</p>
                <span class="group-tag">{{ meeting.groupName }}</span>
              </div>
              <div class="meeting-actions">
                <button 
                  @click="handleClearActivities(meeting.id)"
                  class="clear-button"
                >
                  🗑️ Clear
                </button>
                <button 
                  @click="handleCancelMeeting(meeting)"
                  :class="['cancel-button', { 'is-cancelled': meeting.is_cancelled }]"
                >
                  {{ meeting.is_cancelled ? '✓ Abgesagt' : '❌ Absagen' }}
                </button>
              </div>
            </div>
            <div class="meeting-activities">
              <div v-if="!meeting.activities || meeting.activities.length === 0" class="empty-activities">
                Aktivitäten hier ablegen
              </div>
              <template v-else>
                <div 
                  v-for="activity in meeting.activities" 
                  :key="activity.id"
                  class="meeting-activity"
                >
                  <span>{{ activity.name }}</span>
                  <span>{{ activity.duration }} Min</span>
                </div>
              </template>
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
  height: calc(100vh - 170px); /* Adjusted for top actions */
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.group-tag {
  background: var(--color-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.add-button {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.meetings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.is-calculated {
  border: 1px dashed var(--color-border);
}

.empty-activities {
  padding: 1rem;
  text-align: center;
  color: var(--color-text);
  opacity: 0.5;
}

.group-filter {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  min-width: 200px;
  background: var(--color-background);
  color: var(--color-text);
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.date-filter {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.date-input {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
}

.nav-button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  cursor: pointer;
}

.nav-button:hover {
  background: var(--color-border);
}

.today-button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  background: var(--color-primary);
  color: white;
  cursor: pointer;
}

.today-button:hover {
  opacity: 0.9;
}

.no-meetings {
  text-align: center;
  padding: 2rem;
  color: var(--color-text);
  opacity: 0.7;
  background: var(--color-background);
  border-radius: 4px;
  margin: 1rem 0;
}

.meeting-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.clear-button, .cancel-button {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  cursor: pointer;
  font-size: 0.8rem;
}

.clear-button:hover {
  background: var(--color-border);
}

.cancel-button:hover {
  background: var(--color-danger);
  color: white;
}

.meeting-card.is-cancelled {
  opacity: 0.6;
  background: var(--color-background);
  position: relative;
  pointer-events: auto; 
}

.meeting-card.is-cancelled::after {
  content: "ABGESAGT";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  font-size: 2rem;
  color: var(--color-danger);
  border: 3px solid var(--color-danger);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  pointer-events: none;
}

.meeting-card.is-cancelled .meeting-activities {
  pointer-events: none;
}

/* Cancelled meeting styles */
.meeting-card[class~="is-cancelled"] {
  opacity: 0.6;
  background: var(--color-background);
  position: relative;
  pointer-events: auto;
}

.meeting-card[class~="is-cancelled"]::after {
  content: "ABGESAGT";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  font-size: 2rem;
  color: var(--color-danger);
  border: 3px solid var(--color-danger);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  pointer-events: none;
}

.meeting-card[class~="is-cancelled"] .meeting-activities {
  pointer-events: none;
}

.meeting-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.meeting-info {
  flex: 1;
}

.meeting-actions {
  margin-left: 1rem;
  display: flex;
  gap: 0.5rem;
  align-self: flex-start;
}

.clear-button, .cancel-button {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  cursor: pointer;
  font-size: 0.8rem;
  white-space: nowrap;
}

.cancel-button.is-cancelled {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Remove these styles since we don't want any disabled states */
[disabled] {
  display: none;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
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

.top-actions {
  margin-bottom: 1rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.spacer {
  flex: 1;
}
</style>
