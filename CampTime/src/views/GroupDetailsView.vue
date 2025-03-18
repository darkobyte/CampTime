<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGroupStore } from '../stores/groups'

const route = useRoute()
const router = useRouter()
const groupStore = useGroupStore()
const group = ref(null)

onMounted(async () => {
  const groupId = parseInt(route.params.id)
  group.value = await groupStore.fetchGroupById(groupId)
})

const formatMeetingTime = (meetingTime) => {
  if (!meetingTime) return ''
  const weekdays = {
    '0': 'Sonntag', '1': 'Montag', '2': 'Dienstag',
    '3': 'Mittwoch', '4': 'Donnerstag', '5': 'Freitag', '6': 'Samstag'
  }
  const weekday = weekdays[meetingTime.weekday]
  const frequency = meetingTime.frequency === '2' ? ' (alle 2 Wochen)' : ''
  return `${weekday} um ${meetingTime.time}${frequency}`
}
</script>

<template>
  <div class="group-details-container" v-if="group">
    <div class="header">
      <h1>{{ group.name }}</h1>
      <div class="actions">
        <button @click="router.push(`/groups/${group.id}/edit`)" class="edit-button">
          Bearbeiten
        </button>
        <button @click="router.push('/groups')" class="back-button">
          Zurück
        </button>
      </div>
    </div>

    <div class="detail-card">
      <h2>Beschreibung</h2>
      <p>{{ group.description }}</p>
    </div>

    <div class="detail-card">
      <h2>Treffzeit</h2>
      <p>{{ formatMeetingTime(group.meetingTime) }}</p>
    </div>

    <div class="detail-card">
      <h2>Leiter</h2>
      <ul class="leaders-list">
        <li v-for="leader in group.leaders" :key="leader">
          {{ leader }}
        </li>
      </ul>
    </div>

    <div class="detail-card">
      <h2>Mitglieder</h2>
      <p>{{ group.memberCount }} Mitglieder</p>
    </div>
  </div>
</template>

<style scoped>
.group-details-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
}

.detail-card {
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.leaders-list {
  list-style: none;
  padding: 0;
}

.leaders-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
}

.leaders-list li:last-child {
  border-bottom: none;
}

.edit-button, .back-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-button {
  background: var(--color-primary);
  color: white;
}

.back-button {
  background: var(--color-border);
}
</style>
