import {createValue, createComputedValue} from './core'
import {createArray} from './createArray'

function iterate(obj={}, cb) {
  Object.keys(obj).forEach(name => {
    const descriptor = obj[name]
    cb(descriptor, name)
  })
}

function getDefaultValue(seed, name, descriptor) {
  return seed.hasOwnProperty(name)
    ? seed[name]
    : descriptor.defaultValue
}

export function createModel({
  simpleValues,
  computedValues,
  modelValues,
  arrayValues,
  untrackedValues,
}) {
  return {
    create(seed={}) {
      const item = {}

      iterate(simpleValues, (descriptor, name) => {
        const defaultValue = getDefaultValue(seed, name, descriptor)
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

      iterate(arrayValues, (descriptor, name) => {
        const defaultValue = getDefaultValue(seed, name, descriptor) || []
        const arraySeed = descriptor.model
          ? defaultValue.map(_seed => descriptor.model.create(_seed))
          : defaultValue
        const value = createArray(arraySeed)

        Object.defineProperty(item, name, {
          get: value.get,
        })
      })

      iterate(untrackedValues, (value, name) => {
        item[name] = value
      })

      return item
    }
  }
}
