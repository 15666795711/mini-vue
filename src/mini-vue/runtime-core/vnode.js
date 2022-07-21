
/**
 * 创建虚拟dom
 * @param {*} type - 内容的类型，object（组件） or string（元素）
 * @param {*} props - 元素属性，style、class等
 * @param {*} children - 元素的子节点
 */
export function createVNode(type, props, children){
  // 返回虚拟dom
  return {
    type,
    props,
    children
  }
}