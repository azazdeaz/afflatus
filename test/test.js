var assert = require('assert')
var {createValue, record, autorun, getStats} = require('../src/afflatus')

describe('afflatus', () => {
  it('test', () => {
    const foo = createValue('foo')
    autorun(() => console.log(foo.get()))
    foo.set('foo2')
    foo.set('foo3')
  })
})
