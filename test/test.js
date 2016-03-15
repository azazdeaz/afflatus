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
  defineModel,
  serialise,
  deserialise,
  record,
  autorun,
  getStats,
  IS_MODEL,
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
    const foo = createArray('number', [1,2,3])
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
    defineModel({
      type: 'Foo',
      simpleValues: {
        tux: {defaultValue: 25}
      }
    })
    defineModel({
      type: 'Bar',
      simpleValues: {
        foo: {defaultValue: 1},
        fux: {type: 'Foo'},
      },
      computedValues: {
        foofoo() {return this.foo * 2}
      },
      arrayValues: {
        bar: {defaultValue: [1,2,3]}
      },
    })
    const item = createModel('Bar')
    expect(item.foo).to.equal(1)
    expect(item.foofoo).to.equal(2)
    expect(item.fux).to.be.an('object')
    expect(item.fux.tux).to.equal(25)
    expect(item.bar.getLength()).to.equal(3)

    const spy = chai.spy()
    autorun(() => spy(item.foofoo))
    expect(spy).to.have.been.called.with(2)
    item.foo = 2
    expect(spy).to.have.been.called.with(4)

    expect(Object.keys(item)).to.have.members(['foo', 'bar', 'fux'])

    item.bar.push(4)
    const seed = serialise(item)
    console.log('seed', seed)
    const seed2 = serialise(deserialise(seed))
    console.log('seed2', seed2)
    expect(seed).to.deep.equal(seed2)
  })
})
