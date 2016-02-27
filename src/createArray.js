import {reportUse, reportChange} from './core'

export function createArray(seed=[]) {
  const id = Symbol()
  let array = patchArray(seed, id)

  return {
    get() {
      return array
    },
    set(newSeed) {
      array = patchArray(newSeed, id)
      reportChange(id)
    }
  }

  const proxy = {
    get length() {
      reportUse(id)
      return array.length
    }
  }
}

function patchArray(seed, id) {
  const array = seed.slice()
  const setters = ['pop', 'push', 'shift', 'unshift', 'splice']
  const getters = ['find', 'findIndex', 'forEach', 'map', 'slice']

  setters.forEach(name => {
    array[name] = (...args) => {
      const result = Array.prototype[name].apply(array, args)
      reportChange(id)
      return result
    }
  })

  getters.forEach(name => {
    array[name] = (...args) => {
      reportUse(id)
      return Array.prototype[name].apply(array, args)
    }
  })

  array.getLength = () => {
    reportUse(id)
    return array.length
  }

  return array
}
