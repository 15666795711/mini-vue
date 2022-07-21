// import { createApp } from 'vue'
// import App from './App.vue'
import {createApp} from './mini-vue/index.js'
import { createVNode } from './mini-vue/runtime-core/vnode.js'

createApp({
  data(){
    return {
      title: 'hello, mini-vue!',

    }
  },
  mounted(){
    setTimeout(()=>{
      this.title = 'wow, title change!'
    },2000)
  },
  render(){
    // const h3 = document.createElement('h3')
    // h3.textContent = this.title
    // return h3

    // 虚拟dom
    return createVNode('h3', {}, this.title)
  },
}).mount('#app')
