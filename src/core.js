const runningListeners = []
const listeners = new Map()
const readyToFireListeners = []

window.listeners = listeners

export const IS_MODEL = 'isModel'

let transactionLevel = 0

export const isPrimitiveModelType = type =>
  !type || (/^[a-z]/).test(type)

export function reportUse(id) {
  // console.log('reportChange', id)
  if (runningListeners.length === 0) {
    return
  }
  const activeListener = runningListeners[runningListeners.length - 1]
  activeListener.add(id)
}

export function reportChange(id, debug) {
  console.log('reportChange', id, debug)
  const h=[]
  listeners.forEach((dependencies, handler) => {
    if (dependencies.has(id)) {
      listeners.delete(handler)
      h.push(handler)
      // readyToFireListeners.push(handler)
    }
  })
h.forEach(handler => handler())
  // fireReadyListeners()
}

function fireReadyListeners() {
  // if (transactionLevel === 0) {
    readyToFireListeners.forEach(handler => handler())
    readyToFireListeners.length = 0
  // }
}

export function createValue(value, debug) {
  const id = Symbol(`value-${value}-${debug}-${Math.random()}`)
  return {
    get() {
      reportUse(id)
      return value
    },
    set(newValue) {
      if (newValue !== value) {
        value = newValue
        reportChange(id, value)
      }
    }
  }
}

export function record(fn, handler) {
  const dependencies = new Set()
  runningListeners.push(dependencies)
  fn()
  if (runningListeners[runningListeners.length - 1] !== dependencies) {
    throw Error('Nooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo!')
  }
  runningListeners.pop()
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
  // runningListeners.delete(handler)
  listeners.delete(handler)
}

export function createComputedValue(fn, debug) {
  const id = Symbol(`compuded-${debug}-${Math.random()}`)
  let inited = false
  let value
  const update = () => {
    const newValue = fn()
    if (newValue !== value) {
      value = newValue
      reportChange(id, value)
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
  transactionLevel += 1
  const result = fn()
  transactionLevel -= 1
  // fireReadyListeners()

  return result
}

export function getStats() {
  return {listeners: listeners.size, runningListeners: runningListeners.length}
}
