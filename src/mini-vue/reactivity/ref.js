import { trigger, track } from "./reactive"

export function ref(value){
  const obj = { value }
  return new Proxy(obj, {
    get(target, key){
      const result = Reflect.get(target,key)
      track(target, key)
      return result
    },
    set(target, key, value){
      const result = Reflect.set(target, key, value)
      trigger(target, key)
      return result
    },
    // 先不关心对象的情况
    // deleteProperty(target, key){
    //   const result = Reflect.deleteProperty(target, key)
    //   trigger(target, key)
    //   return result
    // }
  })
}

