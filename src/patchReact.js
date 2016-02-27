import {record} from './core'

export const patchReact = Component => {
  const originalRender = Component.prototype.render
  Component.prototype.render = function () {
    let result
    record(
      () => result = originalRender.call(this),
      () => this.forceUpdate()
    )
    return result
  }
  return Component
}
