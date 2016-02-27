import {createValue, createComputedValue} from './core'
import {createArray} from './createArray'

function iterate(obj={}, cb) {
  Object.keys(obj).forEach(name => {
    const descriptor = obj[name]
    cb(descriptor, name)
  })
}

export function createModel({
  simpleValues,
  computedValues,
  modelValues,
  arrayValues,
}) {
  return {
    create(seed={}) {
      const item = {}

      iterate(simpleValues, (descriptor, name) => {
        const defaultValue = seed.hasOwnProperty(name)
          ? seed[name]
          : descriptor.defaultValue
          console.log(defaultValue, 'defaultValue')
        const value = createValue(defaultValue)
        Object.defineProperty(item, name, {
          get: value.get,
          set: value.set,
        })
      })

      iterate(computedValues, (value, name) => {
        Object.defineProperty(item, name, {
          get: createComputedValue(value.bind(item)),
        })
      })

      iterate(modelValues, ({model}, name) => {
        const value = model.create(seed[name])
        Object.defineProperty(item, name, {
          get() {return value},
        })
      })

      iterate(arrayValues, ({model}, name) => {
        const seed = model
          ? seed[name]
          : seed[name].map(_seed => model.create(_seed))
        const value = createArray(seed)

        Object.defineProperty(item, name, {
          get() {return value},
        })
      })

      return item
    }
  }
}
