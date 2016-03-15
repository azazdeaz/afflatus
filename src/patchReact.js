import {record, disposeHandler} from './core'

export const patchReact = Component => {
  const originalRender = Component.prototype.render
  const originalComponentWillUnmount = Component.prototype.componentWillUnmount

  Component.prototype.render = function () {
    console.log(`[afflatus]: render `, Component.displayName)

    if (!this.__handleAfflatusChange) {
      this.__handleAfflatusChange = () => this.forceUpdate()
    }

    let result
    record(
      () => result = originalRender.call(this),
      this.__handleAfflatusChange
    )
    return result
  }

  Component.prototype.componentWillUnount = function (...args) {
    disposeHandler(this.__handleAfflatusChange)
    originalComponentWillUnmount.apply(this, args)
  }

  return Component
}
