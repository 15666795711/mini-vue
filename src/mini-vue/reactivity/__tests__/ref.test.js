import { expect } from 'vitest'
import {ref} from '../ref'

test('ref should work', ()=>{
  const name = 'frank'
  const observed = ref(name)

  // name和observed不同
  expect(name).not.toBe(observed)

  // 可以监听到值的读取
  expect(observed.value).toBe('frank')

  // 可以监听到值的改变
  observed.value = 'becky'
  expect(observed.value).toBe('becky')

})