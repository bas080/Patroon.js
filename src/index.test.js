const {test} = require('tape')
const { check, gen } = require('tape-check')
const {
  p, // predicate
  _, // placeholder,
  t: typed,
  patroon,
  NoMatchError
} = require('./index')

const simpleObject = {a: 1}
const otherObject = {b: 1}
const emptyObject = {}

test('Ability to match on Type and values assigned to that type', t => {
  class A {
    constructor(value) {
      this.value = value
    }
  }

  class B {
    constructor(value) {
      this.value = value
    }
  }

  patroon(
    typed(B, {value: 20}), () => t.fail(),
    typed(A, {value: 30}), () => t.fail(),
    typed(A, {value: 20}), () => t.end()
  )(new A(20))
})

test('Matches using an array pattern', t => {
  patroon(
    [_, 10], () => t.fail(),
    [_, 20], () => t.end()
  )([10, 20])
})

test('Matches always when pattern equals value', check(gen.any, (t, val) => {
  patroon(val, () => t.pass('matches'))(val)
  t.end()
}));

test('Matches the first pattern', t => {
  patroon(simpleObject, a => t.end())(simpleObject)
})

test('Matches the second case', t => {
  patroon(
    simpleObject, () => t.fail(),
    otherObject, () => t.end()
  )(otherObject)
})

test('Matches the default case', t => {
  patroon(
    simpleObject, () => t.fail(),
    _, a => t.equals(a, otherObject) // default case
  )(otherObject)
  t.end()
})

test('Matches a nested pattern', t => {
  patroon(
    {ok: {value: 20}}, () => t.fail(),
    {error: {value: _}}, ({error}) => t.end(),
    {error: _}, ({error}) => t.fail()
  )({error: {value: 20}})
})

test('Matches none of the patterns and throws', t => {
  try {
    patroon(
      simpleObject, () => t.fail(),
      otherObject,  () => t.fail()
    )(emptyObject)
    t.fail()
  } catch(e) {
    t.ok(e instanceof NoMatchError)
    t.end()
  }
})

test('Matches using a predicate', t => {
  const gt2 = v => v > 2

  t.equals(patroon(
    p(gt2), () => 2
  )(4), 2)
  t.end()
})

