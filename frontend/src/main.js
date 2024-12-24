import { createApp } from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import DropdownMenu from 'v-dropdown-menu'

const app = createApp(App)
app.use(DropdownMenu)
app.mount('#app')
