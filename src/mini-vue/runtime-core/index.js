// runtime-core通用代码
import {effect, reactive} from '../reactivity'
import { createVNode } from './vnode'


// ------------custom render api----------
export function createRenderer(options) {

  const {
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
    insert: hostInsert,
    removeChild: hostRemoveChild
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
      // 更新阶段
      patchElement(n1, n2)
    }
  }

  const mountElement = (vnode, container)=> {
    // TODO 处理元素的属性

    const el = (vnode.el = hostCreateElement(vnode.type))
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

  const patchElement = (n1, n2) => {
    // 取出当前的元素节点
    const el = n2.el = n1.el
    // 变化前后类型相同，说明是内容变化
    if(n1.type === n2.type){
      const oldChild = n1.children
      const newChild = n2.children
      if(typeof oldChild === 'string'){
        if(typeof newChild === 'string'){
          // 字符串 -> 字符串，如果值改变则更新
          if(oldChild !== newChild){
            hostSetElementText(el, newChild)
          }
        }else{
          // 字符串 -> 子元素
          // 先清空原来的内容
          hostSetElementText(el, '')
          // 将新的内容遍历插入容器
          newChild.forEach(child => patch(null, child, el))
        }
      }else{
        if(typeof newChild === 'string'){
          // 子元素 -> 字符串
          // 清空原来的内容并插入新的字符串
          hostSetElementText(el, newChild)
        }else{
          // 子元素 -> 子元素
          // 双端diff算法
          updateChildren(oldChild, newChild, el)
        }
      }
    }else{

    }
  }
  // version1.0 - 双端diff算法 - 暴力计算
  const updateChildren = (oldChild, newChild, parentElem) => {
    // A B C D E
    // A C D E
    // 取出较短的长度
    const len = Math.min(oldChild.length, newChild.length)
    for (let i = 0; i < len; i++) {
      patch(oldChild[i],newChild[i])      
    }
    // 处理剩余的部分
    if(oldChild.length > newChild.length){
      // 删除
      oldChild.slice(len).forEach(child => hostRemoveChild(child.el)) 
    }else{
      // 追加
      newChild.slice(len).forEach(child => patch(null, child, parentElem))
    }
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
      // 获取组件渲染函数render
      const {render} = instance.vnode.type
      if(!instance.isMounted){
        // 首次挂载
        instance.isMounted = true
        // 执行render获取vnode，并保存供以后patch使用
        const vnode = (instance.subTree = render.call(instance.data))
        // 递归patch
        patch(null, vnode, container)
        // 挂载生命周期钩子
        if(instance.vnode.type.mounted){
          instance.vnode.type.mounted.call(instance.data)
        }
      }else{
        // patch
        // 获取上一次的vnode
        const prevVNode = instance.subTree
        // 获取当前的vnode
        const nextVNode = render.call(instance.data)
        // 保存当前vnode供以后patch使用
        instance.subTree = nextVNode
        patch(prevVNode, nextVNode)
      }
    }
    // 建立更新机制
    effect(updateComponentFn)
    // 首次执行更新函数
    updateComponentFn()
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