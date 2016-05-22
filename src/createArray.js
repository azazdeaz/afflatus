import {reportUse, reportChange, isPrimitiveModelType} from './core'
import {createModel} from './createModel'

const protoSplice = Array.prototype.splice

export function createArray(type, firstSeed=[], parent, debug) {
  const id = Symbol(`array-${type}-${debug}-${Math.random()}`)
  let array = patchArray(firstSeed, id)
  const isPrimitive = isPrimitiveModelType(type)

  return {
    get() {
      return array
    },
    set(newSeed) {
      array = patchArray(newSeed, id)
      reportChange(id, array)
    }
  }

  function patchArray(seed) {
    const array = seed.slice()
    const getters = ['find', 'findIndex', 'forEach', 'map', 'slice']

    function splice(start, deleteCount, ...newItems) {
      const oldItems = protoSplice.call(array, start, deleteCount, ...newItems)

      if (!isPrimitive) {
        oldItems.forEach(item => item.firstParent = null)
        newItems.forEach(item => item.firstParent = parent)
      }

      if (oldItems.length > 0 || newItems.length > 0) {
        reportChange(id, array)
      }
      return oldItems
    }

    array.pop = () => splice(-1, 1)[0]
    array.shift = () => splice(0, 1)[0]
    array.push = (...newItems) => {
      splice(array.length, 0, ...newItems)
      return array.length
    }
    array.unshift = (...newItems) => {
      splice(0, 0, ...newItems)
      return array.length
    }
    array.splice = (...args) => splice(...args)

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
}
