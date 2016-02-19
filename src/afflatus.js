const listeners = new Map()
const runningListeners = new Map()

function reportUse(id) {
  runningListeners.forEach(dependencies => dependencies.add(id))
}

function reportChange(id) {
  listeners.forEach((dependencies, handler) => {
    if (dependencies.has(id)) {
      // listeners.delete(handler)
      handler()
    }
  })
}

export function createValue(value) {
  const id = Symbol(Math.random())
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

export function createComputedValue(fn) {
  const id = Symbol()
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
      record(update)
    }
    reportUse()
    return value
  }
}
