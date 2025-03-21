<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const handleRegister = async () => {
  errorMessage.value = ''
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwörter stimmen nicht überein'
    return
  }

  const success = await authStore.register({
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    password: password.value,
    stamm: null  // Set stamm to null by default
  })

  if (success) {
    router.push('/dashboard')
  } else {
    errorMessage.value = 'Registrierung fehlgeschlagen'
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h1>CampTime</h1>
      <h2>Registrierung</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="firstName">Vorname</label>
          <input
            type="text"
            id="firstName"
            v-model="firstName"
            required
          >
        </div>
        <div class="form-group">
          <label for="lastName">Nachname</label>
          <input
            type="text"
            id="lastName"
            v-model="lastName"
            required
          >
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
          >
        </div>
        <div class="form-group">
          <label for="password">Passwort</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
          >
        </div>
        <div class="form-group">
          <label for="confirmPassword">Passwort bestätigen</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            required
          >
        </div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button type="submit">Registrieren</button>
        <p class="switch-text">
          Bereits ein Konto?
          <RouterLink to="/">Anmelden</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
}

.login-box {
  background: var(--color-surface);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;
}

button:hover {
  background-color: var(--color-secondary);
}

.switch-text {
  text-align: center;
  margin-top: 1rem;
}

.switch-text a {
  color: var(--color-primary);
  text-decoration: none;
}

.switch-text a:hover {
  text-decoration: underline;
}

.error-message {
  color: var(--color-danger);
  text-align: center;
  margin-bottom: 1rem;
}
</style>
