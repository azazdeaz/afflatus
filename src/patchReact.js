import React from 'react'
import ReactDOM from 'react-dom'
import shallowCompare from 'react-addons-shallow-compare'
import {record, disposeHandler} from './core'

let affID = 0

export const patchReact = Component => {
  //wrap function components
  // if (!(Component instanceof React.Component)) {
  //   const renderer = Component
  //   Component = class AfflatusFuncCompWrapper extends React.Component {
  //     render() {
  //       return renderer(this.props)
  //     }
  //   }
  // }
  Component.affID = affID++
  const originalRender = Component.prototype.render
  const originalComponentWillUnmount = Component.prototype.componentWillUnmount

  const p = Component.prototype
  Component.contextTypes = {
    ...Component.contextTypes,
    afflatusLevel: React.PropTypes.number
  }
  Component.childContextTypes = {
    ...Component.childContextTypes,
    afflatusLevel: React.PropTypes.number
  }

  const originalGetChildContext = p.getChildContext
  p.getChildContext = function () {
    const context = originalGetChildContext
      ? originalGetChildContext.call(this)
      : {}

    return {
      ...context,
      afflatusLevel: (this.context.afflatusLevel || 0) + 1
    }
  }

  Component.prototype.render = function () {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[afflatus]: render `, Component.name, Component.affID)
    }

    if (!this.__handleAfflatusChange) {
      this.__handleAfflatusChange = () => this.forceUpdate()
      this.__handleAfflatusChange.canWait = true
      this.__handleAfflatusChange.afflatusLevel = this.context.afflatusLevel
    }

    let result
    record(
      () => result = originalRender.call(this),
      this.__handleAfflatusChange
    )
    if (!window.affs) window.affs = {}
    window.affs[Component.affID] = {name: Component.name, listeners: window.listeners.get(this.__handleAfflatusChange)}
    return result
  }

  if (!Component.prototype.shouldComponentUpdate) {
    Component.prototype.shouldComponentUpdate = function (nextProps, nextState) {
      return shallowCompare(this, nextProps, nextState)
    }
  }

  Component.prototype.componentWillUnount = function (...args) {
    disposeHandler(this.__handleAfflatusChange)
    originalComponentWillUnmount.apply(this, args)
  }

  return Component
}
