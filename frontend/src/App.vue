<script setup>
const categories = ['Science', 'History', 'Geography', 'Sports', 'Entertainment'];
import { getChatResponse } from './apiCalls/QandA.js';
</script>

<template>
  <main>
    <br />
    <br />
    <p class="question-desc">AI Question/Answer</p>
    <span class="ai-answer">{{ aiAnswer }}</span>
    <dropdown-menu>
      <template #trigger>
        <p class="dropdown-desc">Choose a category for a question</p>
        <button>Choose category</button>
      </template>

      <template #body>
        <ul class="dropdown-menu-item">
          <li v-for="category in categories" :key="category">
            <a href="#" class="dropdown-item" @click.prevent="handleItemClick(category)">{{ category }}</a>
          </li>
        </ul>
      </template>
    </dropdown-menu>
    <br />
    <br />
    <br />
    <br />
    <br />
    <div class="form-group">
      <label style="color: #f1f1f1;" for="exampleInputEmail1">Your Answer</label>
      <input type="text" class="form-control" id="input" placeholder="Enter answer">
      <small style="color: #b6b5b5 !important;" class="form-text text-muted">Your answer gets processed by an AI model</small>
    </div>
    <button type="submit" @click.prevent="sendAnswer()" class="btn btn-primary">Submit</button>
  </main>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  data() {
    return {
      aiAnswer: '',
    }
  },
  methods: {
    async handleItemClick(category) {
      console.log(`Category clicked: ${category}`);
      const data = {
        input: `Give me a question for the category: ${category}`
      };
      const reply = await getChatResponse(data);
      this.aiAnswer = reply.response;
    },
    async sendAnswer() {
      const input = document.getElementById('input').value;
      const data = {
        input: `${input}, is this correct? If not give me the correct answer`
      };
      const reply = await getChatResponse(data);
      this.aiAnswer = reply.response;
    }
  },
})
</script>

<style>
body {
  background-color: #1c1c1c !important; 
  color: #f1f1f1;
}
#app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

.form-group {
  margin: 20px auto;
  width: 80%;
  max-width: 500px;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 10px;
}

.form-text {
  color: #6c757d;
}

.dropdown-desc {
  font-size: 12px;
  font-style: italic;
  font-weight: normal;
  margin-bottom: 0px;
  color: #f1f1f1;
}

.question-desc {
  font-size: 16px;
  font-weight: normal;
  margin-bottom: -18px;
  color: #f1f1f1;
}

.dropdown-menu-item {
  background-color: white;
  border: 1px solid #ccc;
  padding: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  width: 200px;
  z-index: 1000;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.dropdown-item {
  display: block;
  padding: 10px;
  color: #007bff;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.dropdown-item:hover {
  background-color: #f1f1f1;
}

.ai-answer {
  display: block;
  margin: 20px auto;
  width: 80%;
  max-width: 500px;
  font-size: 18px;
  font-weight: bold;
  color: #007bff;
  background-color: #c7c7c7;
  padding: 30px;
  border-radius: 4px;
  border: 1px solid #007bff;
}
</style>