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

class A { }
class B { }

test('Matches on type', t => {
  patroon(
    typed(B), () => t.fail(),
    typed(A, {a: _}), () => t.fail(),
    typed(A), () => t.end()
  )(new A())
})

test('Does not match on array that is too short', t => {
  patroon(
    [_, _], () => t.pass(),
    [_], () => t.fail(),
    [], () => t.fail(),
  )([1,2])

  patroon(
    [_, _], () => t.fail(),
    [_], () => t.pass(),
    [], () => t.fail(),
  )([1])

  patroon(
    [_, _], () => t.fail(),
    [_], () => t.fail(),
    [], () => t.pass(),
  )([])

  t.end()
})

test('Implement toPairs function using patroon', t => {
  const toPairs = patroon(
    [_, _], ([a, b, ...c], p=[]) => toPairs(c, [...p , [a, b]]),
    _, (_, p=[]) => p,
  )

  t.deepEquals(toPairs([1]), [])
  t.deepEquals(toPairs([1,2]), [[1,2]])
  t.deepEquals(toPairs([1,2,3]), [[1,2]])
  t.deepEquals(toPairs([1,2,3,4]), [[1,2], [3,4]])
  t.end()
})

test('Matches on type and values assigned to that type', t => {
  patroon(
    typed(B, {value: 20}), () => t.fail(),
    typed(A, {value: 30}), () => t.fail(),
    typed(A, {value: 20}), () => t.end()
  )(Object.assign(new A(), {value: 20}))
})

test('Matches only when property exists', t => {
  patroon(
    {c: _}, () => t.fail(), // c is not defined
    {a: _}, () => t.end(),
  )({a: undefined})
})

test('Matches using an array pattern', t => {
  patroon(
    [_, 10], () => t.fail(),
    [_, 20], () => t.end()
  )([10, 20])
})

test('Matches always when pattern equals value', check(gen.any, (t, val) => {
  patroon(val, () => t.end())(val)
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

