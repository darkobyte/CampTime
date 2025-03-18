<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMemberStore } from '../stores/members'
import { useGroupStore } from '../stores/groups'

const memberStore = useMemberStore()
const groupStore = useGroupStore()

const selectedGroup = ref('all')
const searchQuery = ref('')

const groupOptions = computed(() => {
  return [
    { value: 'all', label: 'Alle Gruppen' },
    ...groupStore.groups.map(group => ({
      value: group.id,
      label: group.name
    }))
  ]
})

onMounted(async () => {
  await Promise.all([
    memberStore.fetchMembers(),
    groupStore.fetchGroups()
  ])
})

const filteredMembers = computed(() => {
  return memberStore.members.filter(member => {
    const matchesGroup = selectedGroup.value === 'all' || member.groupId === selectedGroup.value
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesGroup && matchesSearch
  })
})

const getGroupName = (groupId) => {
  const group = groupStore.groups.find(g => g.id === groupId)
  return group ? group.name : ''
}

const showNewMemberForm = ref(false)
const newMember = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  groupId: ''
})

const handleCreateMember = async () => {
  if (await memberStore.createMember(newMember.value)) {
    showNewMemberForm.value = false
    newMember.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      groupId: ''
    }
    await memberStore.fetchMembers()
  }
}

const memberToEdit = ref(null)
const showEditMemberForm = ref(false)

const handleDeleteMember = async (id) => {
  if (confirm('Möchten Sie dieses Mitglied wirklich löschen?')) {
    const success = await memberStore.deleteMember(id)
    if (success) {
      // Optionally refresh the list to ensure sync with server
      await memberStore.fetchMembers()
    } else {
      alert('Fehler beim Löschen des Mitglieds')
    }
  }
}

const handleEditMember = async () => {
  if (await memberStore.updateMember(memberToEdit.value.id, memberToEdit.value)) {
    showEditMemberForm.value = false
    memberToEdit.value = null
  }
}

const openEditForm = (member) => {
  memberToEdit.value = { ...member }
  showEditMemberForm.value = true
}
</script>

<template>
  <div class="members-container">
    <div class="members-header">
      <h1>Mitglieder</h1>
      <button class="add-button" @click="showNewMemberForm = true">Neues Mitglied</button>
    </div>

    <!-- New Member Modal -->
    <div v-if="showNewMemberForm" class="modal">
      <div class="modal-content">
        <h2>Neues Mitglied</h2>
        <form @submit.prevent="handleCreateMember">
          <div class="form-group">
            <label for="firstName">Vorname</label>
            <input v-model="newMember.firstName" id="firstName" required>
          </div>
          <div class="form-group">
            <label for="lastName">Nachname</label>
            <input v-model="newMember.lastName" id="lastName" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input v-model="newMember.email" id="email" type="email">
          </div>
          <div class="form-group">
            <label for="phone">Telefon</label>
            <input v-model="newMember.phone" id="phone">
          </div>
          <div class="form-group">
            <label for="group">Gruppe</label>
            <select v-model="newMember.groupId" id="group">
              <option value="">Keine Gruppe</option>
              <option v-for="group in groupStore.groups" 
                      :key="group.id" 
                      :value="group.id">
                {{ group.name }}
              </option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="submit-btn">Erstellen</button>
            <button type="button" 
                    @click="showNewMemberForm = false" 
                    class="cancel-btn">
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Member Modal -->
    <div v-if="showEditMemberForm" class="modal">
      <div class="modal-content">
        <h2>Mitglied bearbeiten</h2>
        <form @submit.prevent="handleEditMember">
          <div class="form-group">
            <label for="editFirstName">Vorname</label>
            <input v-model="memberToEdit.firstName" id="editFirstName" required>
          </div>
          <div class="form-group">
            <label for="editLastName">Nachname</label>
            <input v-model="memberToEdit.lastName" id="editLastName" required>
          </div>
          <div class="form-group">
            <label for="editEmail">Email</label>
            <input v-model="memberToEdit.email" id="editEmail" type="email">
          </div>
          <div class="form-group">
            <label for="editPhone">Telefon</label>
            <input v-model="memberToEdit.phone" id="editPhone">
          </div>
          <div class="form-group">
            <label for="editGroup">Gruppe</label>
            <select v-model="memberToEdit.groupId" id="editGroup">
              <option value="">Keine Gruppe</option>
              <option v-for="group in groupStore.groups" 
                      :key="group.id" 
                      :value="group.id">
                {{ group.name }}
              </option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="submit-btn">Speichern</button>
            <button type="button" 
                    @click="showEditMemberForm = false" 
                    class="cancel-btn">
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="filters">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Suchen..."
        class="search-input"
      >
      <select v-model="selectedGroup" class="group-filter">
        <option 
          v-for="option in groupOptions" 
          :key="option.value" 
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>

    <div v-if="memberStore.loading" class="loading">
      Lade Mitglieder...
    </div>
    <div v-else-if="memberStore.error" class="error">
      {{ memberStore.error }}
    </div>
    <div v-else class="members-table">
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
            <td>{{ getGroupName(member.groupId) }}</td>
            <td>{{ member.email }}</td>
            <td>{{ member.phone }}</td>
            <td>
              <div class="attendance">
                <div 
                  class="attendance-bar"
                  :style="{ width: `${member.attendance || 0}%` }"
                ></div>
                {{ member.attendance || 0 }}%
              </div>
            </td>
            <td>
              <button class="icon-button edit" @click="openEditForm(member)">✏️</button>
              <button class="icon-button delete" @click="handleDeleteMember(member.id)">🗑️</button>
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

.icon-button.edit {
  color: var(--color-primary);
}

.icon-button.delete {
  color: var(--color-danger);
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
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

.add-button {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>
