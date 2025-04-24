<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMeetingStore } from '../stores/meetings'
import { useGroupStore } from '../stores/groups'
import { useMemberStore } from '../stores/members'
import { useActivityStore } from '../stores/activities'

const meetingStore = useMeetingStore()
const groupStore = useGroupStore()
const memberStore = useMemberStore()
const activityStore = useActivityStore()

// Get all data on mount
onMounted(async () => {
  await Promise.all([
    meetingStore.fetchUpcomingMeetings(),
    groupStore.fetchGroups(),
    memberStore.fetchMembers(),
    activityStore.fetchActivities()
  ])
})

// Computed properties for statistics
const totalMembers = computed(() => memberStore.members.length)
const totalGroups = computed(() => groupStore.groups.length)
const totalActivities = computed(() => activityStore.activities.length)
const averageMembersPerGroup = computed(() => {
  return groupStore.groups.length ? 
    Math.round(memberStore.members.length / groupStore.groups.length) : 0
})

// Helper for date formatting
const formatDateTime = (date, time) => {
  if (!date || !time) return ''
  const dateObj = new Date(`${date}T${time}`)
  return dateObj.toLocaleString('de-DE', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="dashboard-grid">
    <!-- Statistics Overview -->
    <div class="dashboard-card stats-grid">
      <div class="stat-item">
        <h3>Mitglieder</h3>
        <div class="stat-value">{{ totalMembers }}</div>
      </div>
      <div class="stat-item">
        <h3>Gruppen</h3>
        <div class="stat-value">{{ totalGroups }}</div>
      </div>
      <div class="stat-item">
        <h3>Aktivitäten</h3>
        <div class="stat-value">{{ totalActivities }}</div>
      </div>
      <div class="stat-item">
        <h3>⌀ pro Gruppe</h3>
        <div class="stat-value">{{ averageMembersPerGroup }}</div>
      </div>
    </div>

    <!-- Upcoming Meetings -->
    <div class="dashboard-card">
      <h2>Nächste Gruppenstunden</h2>
      <div v-if="meetingStore.loading" class="loading">Laden...</div>
      <div v-else class="upcoming-meetings">
        <div 
          v-for="meeting in meetingStore.meetings.slice(0, 3)" 
          :key="meeting.id" 
          class="meeting-item"
        >
          <h3>{{ meeting.title }}</h3>
          <p>{{ formatDateTime(meeting.meeting_date, meeting.meeting_time) }}</p>
          <span class="group-tag">{{ meeting.groupName }}</span>
        </div>
        <div v-if="meetingStore.meetings.length === 0" class="empty-state">
          Keine anstehenden Gruppenstunden
        </div>
      </div>
    </div>

    <!-- Active Groups -->
    <div class="dashboard-card">
      <h2>Aktive Gruppen</h2>
      <div v-if="groupStore.loading" class="loading">Laden...</div>
      <div v-else class="group-list">
        <div 
          v-for="group in groupStore.groups" 
          :key="group.id" 
          class="group-item"
        >
          <h3>{{ group.name }}</h3>
          <p>{{ group.memberCount }} Mitglieder</p>
        </div>
        <div v-if="groupStore.groups.length === 0" class="empty-state">
          Keine Gruppen vorhanden
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-grid {
  padding: 1em;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  grid-column: 1 / -1;
}

.stat-item {
  background: var(--color-background);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-top: 0.5rem;
}

.meeting-item, .group-item {
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: var(--color-background);
  border-radius: 4px;
}

.group-tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: var(--color-primary);
  color: white;
  border-radius: 4px;
  font-size: 0.9rem;
}

.loading {
  text-align: center;
  padding: 1rem;
  color: var(--color-text);
  opacity: 0.7;
}

.empty-state {
  text-align: center;
  padding: 1rem;
  background: var(--color-background);
  border-radius: 4px;
  color: var(--color-text);
  opacity: 0.7;
}
</style>
