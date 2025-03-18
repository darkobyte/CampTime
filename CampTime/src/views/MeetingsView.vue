<script setup>
import { ref, onMounted, computed } from 'vue'
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
</script>

<template>
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
      <h2>Gruppenstunden</h2>
      
      <div v-if="meetingStore.loading" class="loading">
        Lade Gruppenstunden...
      </div>
      <div v-else class="meetings-list">
        <div 
          v-for="meeting in meetingStore.meetings" 
          :key="meeting.id"
          class="meeting-card"
          :class="{ 'is-calculated': meeting.isCalculated }"
          @drop="handleDrop($event, meeting.id)"
          @dragover.prevent
        >
          <div class="meeting-header">
            <h3>{{ meeting.title }}</h3>
            <p>{{ formatDateTime(meeting.meeting_date, meeting.meeting_time) }}</p>
            <span class="group-tag">{{ meeting.groupName }}</span>
          </div>
          <div class="meeting-activities">
            <div v-if="meeting.activities.length === 0" class="empty-activities">
              Aktivitäten hier ablegen
            </div>
            <div 
              v-for="activity in meeting.activities" 
              :key="activity.id"
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
</style>
