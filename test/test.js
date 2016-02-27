var assert = require('assert')
var chai = require('chai')
var spies = require('chai-spies')
chai.use(spies)
var expect = chai.expect
var assert = chai.assert
var {
  createValue,
  createArray,
  createComputedValue,
  createModel,
  record,
  autorun,
  getStats
} = require('../src')

describe('afflatus', () => {
  it('createValue works with autorun', () => {
    const foo = createValue('foo')
    const spy = chai.spy()
    autorun(() => spy(foo.get()))
    expect(spy).to.have.been.called.with('foo')
    foo.set('foo2')
    expect(spy).to.have.been.called.with('foo2')
  })

  it('createComputedValue works with autorun', () => {
    const foo = createValue('foo')
    const foofoo = createComputedValue(() => foo.get() + foo.get())
    const spy = chai.spy()
    autorun(() => spy(foofoo()))
    expect(spy).to.have.been.called.with('foofoo')
    foo.set('foo2')
    expect(spy).to.have.been.called.with('foo2foo2')
  })

  it('arrays', () => {
    const foo = createArray([1,2,3])
    const spyLength = chai.spy()
    const spyValue = chai.spy()
    autorun(() => spyLength(foo.get().getLength()))
    autorun(() => spyValue(foo.get().slice()))
    expect(spyLength).to.have.been.called.with(3)
    expect(spyValue).to.have.been.called.with([1,2,3])
    foo.get().push(4)
    expect(spyLength).to.have.been.called.with(4)
    expect(spyValue).to.have.been.called.with([1,2,3,4])
  })

  it('createModel', () => {
    const model = createModel({
      simpleValues: {
        foo: {defaultValue: 1}
      },
      computedValues: {
        foofoo() {return this.foo * 2}
      },
      arrayValues: {
        bar: {defaultValue: [1,2,3]}
      },
      untrackedValues: {
        qux: () => 8
      }
    })
    const item = model.create()
    expect(item.foo).to.equal(1)
    expect(item.foofoo).to.equal(2)
    expect(item.bar.getLength()).to.equal(3)
    expect(item.qux()).to.equal(8)

    const spy = chai.spy()
    autorun(() => spy(item.foofoo))
    expect(spy).to.have.been.called.with(2)
    item.foo = 2
    expect(spy).to.have.been.called.with(4)
  })

  it('test', () => {
    const foo = createValue('foo')
    const foofoo = createComputedValue(() => foo.get() + foo.get())
    autorun(() => console.log(foo.get()))
    autorun(() => console.log(foofoo()))
    foo.set('foo2')
    foo.set('foo3')
    foo.set('foo4')
  })
  it('createArray', () => {
    const foo = createArray([1,2,3])
    autorun(() => console.log(foo.get().length, foo.get().slice()))
    foo.get().push(4)
  })
})
