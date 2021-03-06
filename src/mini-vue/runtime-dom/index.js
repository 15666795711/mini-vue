// runtime-core浏览器平台专用代码
import {createRenderer} from '../runtime-core'

// 公共的renderer变量，保证全局单例
let renderer;

// 浏览器平台的操作，实现我们用到的方法
const rendererOptions = {
  querySelector(selector){
    return document.querySelector(selector)
  },
  // 需要anchor来统一appendChild和insertBefore
  insert(child, parent, anchor){
    // 如果anchor不存在，那么就是appendChild
    parent.insertBefore(child, anchor || null)
  },
  setElementText(el, text){
    el.textContent = text
  },
  createElement(tag){
    return document.createElement(tag)
  },
  removeChild(el){
    const parent = el.parentNode
    if(parent){
      parent.removeChild(el)
    }
  }
}

// 因为renderer是全局单例，所以要封装一下
export function ensureRenderer(){
  return renderer ||  (renderer = createRenderer(rendererOptions))
}

// 创建createApp实例
export function createApp(rootComponent) {
  // console.log(rootComponent)
  const app = ensureRenderer().createApp(rootComponent)
  const mount = app.mount
  app.mount = function (selectorOrContainer){
    let container;
    if(typeof selectorOrContainer === 'string'){
      container = document.querySelector(selectorOrContainer)
    }else{

    }
    mount(container)
  }
  return  app
}