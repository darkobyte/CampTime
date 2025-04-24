<script setup>
import { ref } from 'vue'

// Example JSON data for topics and content
const topics = ref([
    {
        id: 1,
        title: 'Willkommen <3',
        parent: null,
        text: `
            <p>Willkommen beim ersten Allrounder mit einigen Funktionen und Möglichkeiten, wie:</p>
            <ul>
            <li>Verwaltung von Gruppen</li>
            <li>Planung von Aktivitäten</li>
            <li>Organisation von Gruppenstunden</li>
            <li>Mitgliederverwaltung</li>
            </ul>
            </br>
            <p>Bei Fehlern melden Sie sich bitte per:</p>
            <ul>
            <li>Email: <a href="mailto:gianluca.sima@icloud.com">gianluca.sima@icloud.com</a></li>
            <li>Telefon (whatsapp): <a href="tel:+393487202712">+39 348 720 2712</a></li>
            </ul>
            </br>
            <p>In zukünftigen Updates werden weitere Features wie automatischer E-Mail-Versand und mehr hinzukommen. </br>
            Falls Sie Interesse an einem neuen Tool haben, melden Sie sich einfach und beschreiben Sie, was es machen soll und können muss. </br>
            Ich werde mich bemühen, jedes Tool umzusetzen.</p>
        `,
    },
    {
        id: 2,
        title: 'Web app',
        parent: null,
        text: ``,
    },
    {
        id: 3,
        title: 'Dashboard',
        parent: 2,
        text: ``,
    },
    {
        id: 4,
        title: 'Gruppen',
        parent: 2,
        text: ``,
    },
    {
        id: 5,
        title: 'Gruppenstrunden',
        parent: 2,
        text: ``,
    },
    {
        id: 6,
        title: 'Aktivitäten',
        parent: 2,
        text: ``,
    },
    {
        id: 7,
        title: 'Mitglieder',
        parent: 2,
        text: ``,
    },
]);


const selectedTopic = ref(topics.value[0]) // Default to the first topic

const selectTopic = (topic) => {
  selectedTopic.value = topic
}
</script>

<template>
  <div class="how-to-container">
    <aside class="sidebar">
      <ul>
        <li 
          v-for="topic in topics" 
          :key="topic.id" 
          :class="{ active: topic.id === selectedTopic.id, subtopic: topic.parent !== null }"
          @click="selectTopic(topic)"
        >
          {{ topic.title }}
        </li>
      </ul>
    </aside>
    <section class="content">
      <h2>{{ selectedTopic.title }}</h2>
      <div v-html="selectedTopic.text"></div>
    </section>
  </div>
</template>

<style>
.how-to-container {
  display: flex;
  height: calc(100vh - 4.5rem); /* Subtract the header height (4rem) */
}

.sidebar {
  width: 25%;
  background-color: var(--color-primary);
  padding: 1rem;
  color: var(--color-text-light);
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  background-color: transparent;
  color: var(--color-text-light);
  border-left: 4px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.sidebar li.subtopic {
  font-size: 0.9rem;
  margin-left: 1rem; /* Indent subtopics */
}

.sidebar li:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-left-color: var(--color-secondary);
}

.sidebar li.active {
  background-color: rgba(255, 255, 255, 0.2);
  border-left-color: var(--color-secondary);
  font-weight: bold;
}

.content {
  flex: 1;
  padding: 2rem;
  background-color: var(--color-background);
}

.content p {
  margin: 0 0 1rem;
  line-height: 1.6;
}

.content code {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
}
</style>
