import {factories} from './factories'

export function createModel(type, seed, parent) {
  if (!factories[type]) {
    throw Error(`[afflatus]: There is no model type "${type}" defined`)
  }

  return factories[type](seed, parent)
}
