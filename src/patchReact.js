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

  Component.prototype.render = function () {
    console.log(`[afflatus]: render `, Component.name, Component.affID)

    if (!this.__handleAfflatusChange) {
      this.__handleAfflatusChange = () => this.forceUpdate()
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
