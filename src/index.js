const placeholderSymbol = Symbol('placeholder')
const predicateSymbol = Symbol('predicate')
const typedSymbol = Symbol('typed')
class NoMatchError extends Error {}

// TODO: write some tests for arrays with odd list length and empty list.
function toPairs([a, b, ...rest], result = []) {
  return (rest.length !== 0)
    ? toPairs(rest, [...result, [a, b]])
    : [...result, [a, b]]
}


module.exports = Object.assign(patroon, {
  patroon,
  t: typed,
  _: placeholderSymbol,
  p: predicate,
  NoMatchError,
})

function patroon(...list) {
  const pairs = toPairs(list)
  return function (value) {
    const [_, fn] = pairs.find(([pattern, fn]) => matches(pattern, value)) ||
      [null, v => {
        // console.error('\n', v, '\n')
        throw new NoMatchError()
      }]
    return fn(value)
  }
}

function typed(constructor, matchObject) {
  function typed(v) {
    console.log(v)
    return v instanceof constructor && matches(matchObject, v)
  }

  typed[typedSymbol] = true

  return typed
}

function matches(a, b) {
  if (a && a[typedSymbol]) {
    return a(b)
  }

  if (a && a[predicateSymbol]) {
    return a(b)
  }

  if (Array.isArray(a)) {
    return Object.keys(a).every(key => matches(a[key], b[key]))
  }

  if (typeof a === 'object' && a !== null) {
    const aKeys = Object.keys(a)

    return matches(aKeys, Object.keys(b)) &&
      aKeys.every(key => matches(a[key], b[key]))
  }

  return a === placeholderSymbol || a === b || Object.is(a, b)
}

function predicate(fn) {
  function predicate (value) {
    return fn(value)
  }

  predicate[predicateSymbol] = true

  return predicate
}

