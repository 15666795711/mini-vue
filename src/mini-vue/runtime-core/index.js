// runtime-core通用代码
import {effect, reactive} from '../reactivity/reactive'


// ------------custom render api----------
export function createRenderer(options) {
  // render负责渲染组件内容
  const render = (rootComponent, selector) => {
      // console.log(selector)
      // 1. 获取宿主
      const container = options.querySelector(selector)
      // 2. 将data处理成响应式数据
      const observed = reactive(rootComponent.data())
      // 3. 渲染视图，创建更新函数方法
      const updateComponentFn = ()=>{
        const el = rootComponent.render.call(observed)
        // 清除容器中的文本内容
        options.setElementText(container, '')
        // 4. 追加到宿主
        options.insert(el, container )
      }
      // 设置副作用函数
      effect(updateComponentFn)
      // 5. 初始化时执行一次视图更新
      updateComponentFn()
      // 执行挂载钩子
      if(rootComponent.mounted){
        rootComponent.mounted.call(observed)
      }
  }
  // 返回一个render实例
  return {
    render,
    // 创建createApp方法
    createApp: createAppAPI(render)
  }
}
// 负责创建createApp
export function createAppAPI(render) {
  return function createApp(rootComponent){
    const app = {
      mount(selector){
        render(rootComponent, selector)
      }
    }
    return app
  }
} 