// import { createApp } from 'vue'
// import App from './App.vue'
import {createApp} from './mini-vue/index.js'
import { createVNode } from './mini-vue/runtime-core/vnode.js'

createApp({
  data(){
    return {
      // title: 'hello, mini-vue!',
      title: ['hello, ', 'mini-vue!']
    }
  },
  mounted(){
    setTimeout(()=>{
      this.title = ['wow, ', 'title change!','123123']
      // this.title = 'wow, title change!'
    },2000)
  },
  render(){
    // const h3 = document.createElement('h3')
    // h3.textContent = this.title
    // return h3

    // 虚拟dom
    if(Array.isArray(this.title)){
      return createVNode(
        'h3',
        {},
        this.title.map(t=>createVNode('p',{},t))
      )
    }else{
      return createVNode('h3', {}, this.title)
    }
  },
}).mount('#app')
