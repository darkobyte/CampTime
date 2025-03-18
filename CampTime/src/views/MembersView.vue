<script setup>
import { ref } from 'vue'

const members = ref([
  {
    id: 1,
    firstName: 'Max',
    lastName: 'Mustermann',
    group: 'Jupfis',
    birthDate: '2012-05-15',
    email: 'max.mustermann@email.com',
    phone: '+49 123 456789',
    attendance: 85
  },
  {
    id: 2,
    firstName: 'Lisa',
    lastName: 'Schmidt',
    group: 'Pfadis',
    birthDate: '2010-08-22',
    email: 'lisa.schmidt@email.com',
    phone: '+49 123 456790',
    attendance: 92
  }
])

const selectedGroup = ref('all')
const searchQuery = ref('')

const filteredMembers = computed(() => {
  return members.value.filter(member => {
    const matchesGroup = selectedGroup.value === 'all' || member.group === selectedGroup.value
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesGroup && matchesSearch
  })
})
</script>

<template>
  <div class="members-container">
    <div class="members-header">
      <h1>Mitglieder</h1>
      <button class="add-button">Neues Mitglied</button>
    </div>

    <div class="filters">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Suchen..."
        class="search-input"
      >
      <select v-model="selectedGroup" class="group-filter">
        <option value="all">Alle Gruppen</option>
        <option value="Jupfis">Jupfis</option>
        <option value="Pfadis">Pfadis</option>
        <option value="Rover">Rover</option>
      </select>
    </div>

    <div class="members-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Gruppe</th>
            <th>Email</th>
            <th>Telefon</th>
            <th>Anwesenheit</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in filteredMembers" :key="member.id">
            <td>{{ member.firstName }} {{ member.lastName }}</td>
            <td>{{ member.group }}</td>
            <td>{{ member.email }}</td>
            <td>{{ member.phone }}</td>
            <td>
              <div class="attendance">
                <div 
                  class="attendance-bar"
                  :style="{ width: `${member.attendance}%` }"
                ></div>
                {{ member.attendance }}%
              </div>
            </td>
            <td>
              <button class="icon-button">📝</button>
              <button class="icon-button">👁️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.members-container {
  padding: 1rem;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input, .group-filter {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.search-input {
  flex: 1;
}

.members-table {
  background: var(--color-surface);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.attendance {
  position: relative;
  width: 100px;
}

.attendance-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--color-accent);
  opacity: 0.2;
  z-index: 0;
}

.icon-button {
  padding: 0.25rem;
  margin: 0 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}
</style>
