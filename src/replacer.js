const {isArray} = require('core-util-is')
const {isPlainObject} = require('./options')

/* eslint-disable no-use-before-define */

function applyReplacer (value, replacer) {
  if (typeof replacer === 'function') {
    const input = {
      '': value
    }
    return applyFunctionReplacer(input, replacer)['']
  }

  if (
    isArray(replacer)
    // Array replacer only works for plain object
    && isPlainObject(value)
  ) {
    return applyFunctionReplacer(value, (k, v) => ~ replacer.indexOf(k)
      ? v
      : undefined)
  }

  return value
}


const applyFunctionReplacer = (value, replacer) => isArray(value)
  ? applyArrayFunctionReplacer(value, replacer)
  : isPlainObject(value)
    ? applyObjectFunctionReplacer(value, replacer)
    : value

function applyArrayFunctionReplacer (value, replacer) {
  return value.map((v, i) => {
    v = replacer.call(value, i, v)
    return applyFunctionReplacer(v, replacer)
  })
}


const applyObjectFunctionReplacer = (object, replacer) =>
  Object.keys(object).reduce((ret, key) => {
    const value = replacer.call(object, key, object[key])

    if (value !== undefined) {
      ret[key] = applyFunctionReplacer(value, replacer)
    }

    return ret
  }, {})

module.exports = applyReplacer
