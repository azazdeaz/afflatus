var assert = require('assert')
var {
  createValue,
  createComputedValue,
  record,
  autorun,
  getStats
} = require('../src/afflatus')

describe('afflatus', () => {
  it('test', () => {
    const foo = createValue('foo')
    const foofoo = createComputedValue(() => foo.get() + foo.get())
    autorun(() => console.log(foo.get()))
    autorun(() => console.log(foofoo()))
    foo.set('foo2')
    foo.set('foo3')
    foo.set('foo4')
  })
})
