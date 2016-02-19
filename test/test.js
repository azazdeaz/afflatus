var assert = require('assert')
var {createValue, record} = require('../src/afflatus')

describe('afflatus', () => {
  it('test', () => {
    const foo = createValue('foo')
    record(() => console.log(foo.get()))
    foo.set('foo2')
    foo.set('foo3')
  })
})
