import {
  createValue,
  createComputedValue,
  IS_MODEL,
  isPrimitiveModelType,
  REFUSE_UPDATE,
} from './core'
import {createArray} from './createArray'
import {createModel} from './createModel'
import {factories} from './factories'
import {findSeedByID, getDeserializedByID, setDeserializedByID} from './deserialise'

let uidCounter = 1

function iterate(obj={}, cb) {
  Object.keys(obj).forEach(name => {
    const descriptor = obj[name]
    cb(descriptor, name)
  })
}

function getDefaultValue(seed, name, descriptor) {
  if (Number.isFinite(seed)) {
    seed = findSeedByID(seed)
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
    if (process.env.NODE_ENV !== 'production') {
      console.log('create', seed)
    }
    const item = {}

    if (Number.isFinite(seed)) {
      const deserialised = getDeserializedByID(seed)
      if (deserialised) {
        return deserialised
      }
      setDeserializedByID(seed, item)
    }

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
        const parent = firstParent.get()
        if (type && parent) {
          if (parent.type === type) {
            return parent
          }
          return parent.parent(type)
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
        ? createValue(defaultValue, name)
        : descriptor.canBeNull && !defaultValue
        ? createValue(null, name)
        : createValue(createModel(type, defaultValue, item), name)
      const set = descriptor.transform
        ? v => {
          const transformedValue = descriptor.transform(v)
          if (transformedValue !== REFUSE_UPDATE) {
            value.set(transformedValue)
          }
        }
        : value.set

      define(item, name, {
        get: value.get,
        set,
      })
    })

    iterate(computedValues, (value, name) => {
      define(item, name, {
        get: createComputedValue(value.bind(item), name),
        enumerable: false,
      })
    })

    iterate(arrayValues, (descriptor, name) => {
      const {type} = descriptor
      const defaultValue = getDefaultValue(seed, name, descriptor) || []
      const arraySeed = type
        ? defaultValue.map(_seed => createModel(type, _seed, item))
        : defaultValue
      const value = createArray(type, arraySeed, item, name)

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
