
let activeEffect;

// 设置副作用函数
export function effect(fn){
  activeEffect = fn
}

export function reactive(obj){
  return new Proxy(obj, {
    get(target, key){
      const value = Reflect.get(target, key)
      // 收集依赖
      track(target, key)
      return value
    },
    set(target, key, value){
      const result = Reflect.set(target, key, value)
      trigger(target, key)
      return result
    },
    deleteProperty(target, key){
      const result = Reflect.deleteProperty(target, key)
      trigger(target, key)
      return result
    }
  })
}

// 依赖收集函数，使【响应式数据中属性】与【跟其有关的所有更新函数】建立联系。
// 数据结构{target: {key: [fn1, fn2]}}
let targetMap = new WeakMap()
export function track(target,key){
  if(activeEffect){
    // 看一下当前targetMap中是否已经存在该target
    let depsMap = targetMap.get(target)
    // 首次执行没有depsMap，需要创建
    if(!depsMap){
      targetMap.set(target, (depsMap = new Map()))
    }
    // 查看当前depsMap中是否存在该key
    let deps = depsMap.get(key)
    // 首次执行没有deps，需要创建
    if(!deps){
      depsMap.set(key, (deps = new Set()))
    }
    deps.add(activeEffect)
  }
}

// 当数据发生变化时，执行所有的相关更新函数
export function trigger(target, key){
  const depsMap = targetMap.get(target)
  if(depsMap){
    const deps = depsMap.get(key)
    if(deps){
      deps.forEach(dep => dep())
    }
  }
}