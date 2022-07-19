import { expect } from 'vitest'
import {reactive} from '../reactive'

test('test reactive', ()=>{
  const original = {tag: 'foo'}
  const observed = reactive(original)

  // 代理对象是全新的对象
  expect(original).not.toBe(observed)

  // 可以监听到对象属性的修改set
  observed.tag = 'fooooooo'
  expect(observed.tag).toBe('fooooooo')

  // 能够访问所代理对象的属性get
  expect(observed.tag).toBe(original.tag)

  // 能新增所代理对象的属性
  observed.id = 1
  expect(observed.id).toBe(1)
  expect(original.id).toBe(1)

  // 能够删除所代理对象的属性
  delete observed.tag
  expect(observed.tag).toBe(undefined)
  expect(original.tag).toBe(undefined)
})