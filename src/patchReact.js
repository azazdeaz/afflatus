import {record} from './core'

export const patchReact = computers => Component => {
  const originalRender = Component.prototype.render
  const originalComponentWillMount = Component.prototype.componentWillMount

  Component.prototype.render = function () {
    let result
    record(
      () => result = originalRender.call(this),
      () => this.forceUpdate()
    )
    return result
  }

  Component.componentWillMount.render = function (...args) {
    Object.keys(computers).forEach(key => {
      Object.defineProperty(Component.prototype, key, {
        get: createComputedValue(computers[key].bind(this))
      })
    })

    originalComponentWillMount.apply(this, args)
  }
  
  return Component
}
