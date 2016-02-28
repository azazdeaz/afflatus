import {createValue, createComputedValue, IS_MODEL} from './core'
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

function define(obj, name, descriptor) {
  Object.defineProperty(obj, name, {
    enumerable: true,
    ...descriptor,
  })
}

export function createModel({
  type,
  simpleValues,
  computedValues,
  modelValues,
  arrayValues,
  untrackedValues,
}) {
  return {
    create(seed={}) {
      console.log('create', seed)
      const item = {}

      Object.defineProperty(item, 'type', {get() {return type}})
      Object.defineProperty(item, IS_MODEL, {get() {return true}})

      iterate(simpleValues, (descriptor, name) => {
        const defaultValue = getDefaultValue(seed, name, descriptor)
        const value = createValue(defaultValue)
        define(item, name, {
          get: value.get,
          set: value.set,
        })
      })

      iterate(computedValues, (value, name) => {
        define(item, name, {
          get: createComputedValue(value.bind(item)),
          enumerable: false,
        })
      })

      iterate(modelValues, ({model}, name) => {
        const value = model.create(seed[name])
        define(item, name, {
          get() {return value},
        })
      })

      iterate(arrayValues, (descriptor, name) => {
        const defaultValue = getDefaultValue(seed, name, descriptor) || []
        const arraySeed = descriptor.model
          ? defaultValue.map(_seed => descriptor.model.create(_seed))
          : defaultValue
        const value = createArray(arraySeed)

        define(item, name, {
          get: value.get,
          set: value.set,
        })
      })

      iterate(untrackedValues, (value, name) => {
        define(item, name, {value, enumerable: false})
      })

      return item
    }
  }
}
