const listeners = new Map()
const runningListeners = new Map()

export const IS_MODEL = 'isModel'

export const isPrimitiveModelType = type =>
  !type || (/^[a-z]/).test(type)

export function reportUse(id) {
  if (runningListeners.size === 0) {
    return
  }
  runningListeners.forEach(dependencies => dependencies.add(id))
}

export function reportChange(id) {
  const handlers = []
  listeners.forEach((dependencies, handler) => {
    if (dependencies.has(id)) {
      listeners.delete(handler)
      handlers.push(handler)
    }
  })
  handlers.forEach(handler => handler())
}

export function createValue(value) {
  const id = Symbol(`value-${value}-${Math.random()}`)
  return {
    get() {
      reportUse(id)
      return value
    },
    set(newValue) {
      if (newValue !== value) {
        value = newValue
        reportChange(id)
      }
    }
  }
}

export function record(fn, handler) {
  const dependencies = new Set()
  runningListeners.set(handler, dependencies)
  fn()
  runningListeners.delete(handler)
  listeners.set(handler, dependencies)
}

export function autorun(fn) {
  const run = () => {
    record(fn, run)
  }
  run()
  //return a dispose method
  return () => disposeHandler(run)
}

export function disposeHandler(handler) {
  runningListeners.delete(handler)
  listeners.delete(handler)
}

export function createComputedValue(fn) {
  const id = Symbol(`compuded-${Math.random()}`)
  let inited = false
  let value
  const update = () => {
    const newValue = fn()
    if (newValue !== value) {
      value = newValue
      reportChange(id)
    }
  }

  return function get() {
    if (!inited) {
      inited = true
      autorun(update)
    }
    reportUse(id)
    return value
  }
}

export function transaction(fn) {
  //TODO
  return fn()
}

export function getStats() {
  return {listeners: listeners.size, runningListeners: runningListeners.size}
}
