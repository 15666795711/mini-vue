// import { createApp } from 'vue'
// import App from './App.vue'
import {createApp} from './mini-vue/index.js'

createApp({
  data(){
    return {
      title: 'hello, mini-vue!'
    }
  },
  render(){
    const h3 = document.createElement('h3')
    h3.textContent = this.title
    return h3
  }
}).mount('#app')
