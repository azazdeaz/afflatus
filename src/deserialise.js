import {createModel} from './createModel'

let currentDryItems = null
let deserialiseds = null

export function findSeedByID(id) {
  return currentDryItems.find(item => item.$id === id)
}

export function getDeserializedByID(id) {
  return deserialiseds && deserialiseds.get(id)
}

export function setDeserializedByID(id, item) {
  return deserialiseds && deserialiseds.set(id, item)
}

export function deserialise(dryItems) {
  currentDryItems = dryItems
  deserialiseds = new Map()

  const rootItem = dryItems[0]
  return createModel(rootItem.type, rootItem)

  currentDryItems = null
  deserialiseds = null
}
