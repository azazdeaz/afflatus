import {
  createValue,
  createComputedValue,
  IS_MODEL,
  isPrimitiveModelType,
} from './core'
import {createArray} from './createArray'
import {createModel} from './createModel'
import {factories} from './factories'
import {findSeedById} from './deserialise'

let uidCounter = 1

function iterate(obj={}, cb) {
  Object.keys(obj).forEach(name => {
    const descriptor = obj[name]
    cb(descriptor, name)
  })
}

function getDefaultValue(seed, name, descriptor) {
  if (Number.isFinite(seed)) {
    seed = findSeedById(seed)
  }

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

export function defineModel({
  type,
  simpleValues,
  computedValues,
  arrayValues,
  untrackedValues,
}) {
  if (!type) {
    throw Error(`[afflatus]: You have to set the "type" in the model definitinon`)
  }

  if (factories[type]) {
    throw Error(`[afflatus]: A model with the type "${type}" is already defined`)
  }

  factories[type] = (seed={}, firstParent) => {
    console.log('create', seed)
    const item = {}

    Object.defineProperty(item, 'type', {get() {return type}})
    Object.defineProperty(item, IS_MODEL, {get() {return true}})

    function getSerialisableProps(list={}) {
      return Object.keys(list)
        .map(key => list[key].dontSerialise ? null : key)
        .filter(key => key !== null)
    }
    Object.defineProperty(item, '$serialisableProps', {
      value: [
        ...getSerialisableProps(simpleValues),
        ...getSerialisableProps(arrayValues),
      ]
    })

    firstParent = createValue(firstParent)
    Object.defineProperty(item, 'firstParent', {
      set: firstParent.set,
      get: firstParent.get,
    })

    Object.defineProperty(item, 'parent', {
      value: (type) => {
        let parent = firstParent.get()
        if (type) {
          do {
            if (parent.type === type) {
              return parent
            }
            parent = parent.firstParent && parent.firstParent
          }
          while (parent)

          throw Error(`Can't find "${type}" parent of ${item}`)
        }
      }
    })

    Object.defineProperty(item, 'uid', {
      value: uidCounter++,
    })

    iterate(simpleValues, (descriptor, name) => {
      const {type} = descriptor
      const defaultValue = getDefaultValue(seed, name, descriptor)
      const value = isPrimitiveModelType(type)
        ? createValue(defaultValue)
        : descriptor.canBeNull && !defaultValue
        ? createValue(null)
        : createValue(createModel(type, defaultValue, item))

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

    iterate(arrayValues, (descriptor, name) => {
      const {type} = descriptor
      const defaultValue = getDefaultValue(seed, name, descriptor) || []
      const arraySeed = type
        ? defaultValue.map(_seed => createModel(type, _seed, item))
        : defaultValue
      const value = createArray(type, arraySeed, item)

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
