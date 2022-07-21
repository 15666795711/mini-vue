// runtime-core通用代码
import {effect, reactive} from '../reactivity'
import { createVNode } from './vnode'


// ------------custom render api----------
export function createRenderer(options) {

  const {
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
    insert: hostInsert
  } = options

  // 对比两个vnode的变化，并作对应的处理
  const patch = (n1, n2, container) => {
    const {type} = n2
    if(typeof type === 'string'){
      // element
      processElement(n1, n2, container)
    }else{
      // component
      processComponent(n1, n2,container)
    }
  }

  const processComponent = (n1, n2, container) => {
    if(n1 === null){
      // mount
      mountComponent(n2, container)
    }else{
      // patch
      patchComponent(n1, n2, container)
    }
  }


  const processElement = (n1,n2,container)=>{
    if(n1 === null){
      // 创建阶段
      mountElement(n2, container)
    }else{

    }
  }

  const mountElement = (vnode, container)=> {
    // TODO 处理元素的属性

    const el = vnode.el = hostCreateElement(vnode.type)
    if(typeof vnode.children === 'string'){
      // 没有子节点，需要执行创建dom操作
      hostSetElementText(el, vnode.children)
    }else{
      // 有子节点，需要遍历patch
      vnode.children.forEach(child=>patch(null, child, el))
    }

    // 把处理完的组件挂载到根结点
    hostInsert(el, container)
  }

  const patchComponent = (n1,n2,container)=>{}

  /**
   * 挂载根组件
   * 1. 创建实例
   * 2. 初始化组件状态
   * 3. 安装副作用
   */
  const mountComponent = (initialVNode, container)=>{
    // 创建实例
    const instance = {
      el: null,
      data: {},
      vnode: initialVNode,
      isMounted: false
    }
    // 初始化组件状态
    const {data: dataOptions} = instance.vnode.type
    instance.data = reactive(dataOptions())

    // 安装副作用
    setupRenderEffect(instance, container)
  }

  const setupRenderEffect = (instance, container) => {
    // 声明组件更新函数
    const updateComponentFn = () => {
      if(!instance.isMounted){
        // 首次挂载
        instance.isMounted = true
        // 获取组件渲染函数render
        const {render} = instance.vnode.type
        // 执行render
        const vnode = render.call(instance.data)
        // 递归patch
        patch(null, vnode, container)
      }else{
        // patch
        
      }
    }
    // 建立更新机制
    effect(updateComponentFn)
    // 首次执行更新函数
    updateComponentFn()
    // 挂载生命周期钩子
    if(instance.vnode.type.mounted){
      instance.vnode.type.mounted.call(instance.data)
    }
  }


  // version1.0  -  render负责渲染组件内容
  const render1 = (rootComponent, selector) => {
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

  // version2.0
  const render = (vnode, container) => {
    // 如果vnode存在，则为mount或patch，否则umount
    if(vnode){
      patch(container._vnode || null, vnode, container)
    }
    // 保存vnode供下次使用
    container._vnode = vnode
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
      mount(container){
        // 将用户传入的内容转换成vnode
        const vnode = createVNode(rootComponent)
        // 将vnode传递给render；render将vnode转换成dom并挂载到根结点上
        render(vnode, container)
      }
    }
    return app
  }
} 