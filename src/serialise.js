import {IS_MODEL} from './core'

function forEach(item, cb) {
  Object.keys(item).forEach(key => cb(item[key], key))
}

export function serialise(rootItem) {
  const dryList = []
  const referenceList = []
  let nextId = 1
  dry(rootItem)
  dryList[0].type = rootItem.type
  return dryList

  function dry(item) {
    const $id = nextId++
    const seed = {$id}

    dryList.push(seed)
    referenceList.push(item)

    forEach(item, (value, key) => {
      if (value && value[IS_MODEL]) {
        const index = referenceList.indexOf(value)
        if (index >= 0) {
          seed[key] = dryList[index].$id
        }
        else {
          seed[key] = dry(value)
        }
      }
      else if (value instanceof Array) {
        seed[key] = value.map(childItem => (
          (childItem && childItem[IS_MODEL])
            ? dry(childItem)
            : childItem
        ))
      }
      else {
        seed[key] = value
      }
    })
    return $id
  }
}
