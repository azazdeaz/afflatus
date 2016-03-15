import {createModel} from './createModel'

let currentDryItems

export function findSeedById(id) {
  return currentDryItems.find(item => item.$id === id)
}

export function deserialise(dryItems) {
  currentDryItems = dryItems
  const rootItem = dryItems[0]
  return createModel(rootItem.type, rootItem)
}
