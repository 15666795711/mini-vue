

// runtime-core通用代码
// ------------custom render api----------
export function createRenderer(options) {
  // render负责渲染组件内容
  const render = (rootComponent, selector) => {
      // console.log(selector)
      // 1. 获取宿主
      const container = options.querySelector(selector)
      // 2. 渲染视图
      const el = rootComponent.render.call(rootComponent.data())
      // 3. 追加到宿主
      options.insert(el, container )
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