const {Errors, exitOnNotDefined} = require('err-object')
const {
  isArray, isFunction, isString, isNumber, isBoolean
} = require('core-util-is')

const {error, E} = new Errors({
  notDefined: exitOnNotDefined
})

const EE = (key, shouldBe) => {
  const s = '`%s`'

  E(
    `INVALID_${key.toUpperCase()}`,
    `options.${key} must be ${shouldBe}, but got ${s}`,
    TypeError
  )
}

EE('replacer', 'null, function or array')
EE('space', 'string or non-negative number')
EE('detectCircular', 'boolean')
EE('quote', 'either `"` or `\'`')

const EMPTY = ''
const SPACE = ' '
const QUOTE = `'`

const RULES = {
  replacer: {
    test: v => v === null || isFunction(v) || isArray(v)
  },

  space: {
    set (v) {
      if (isString(v)) {
        return v
      }

      if (!isNumber(v) || v < 0) {
        throw error('INVALID_SPACE', v)
      }

      return v === 0
        ? EMPTY
        : SPACE.repeat(v)
    }
  },

  detectCircular: {
    test: isBoolean
  },

  quote: {
    test: v => v === QUOTE || v === '"'
  }
}

const AVAILABLE_OPTIONS = Object.keys(RULES)

const createOptions = ({
  replacer = null,
  space = 0,
  detectCircular = false,
  quote = QUOTE
}) => {
  const ret = {
    replacer,
    space,
    detectCircular,
    quote
  }

  AVAILABLE_OPTIONS.forEach(key => {
    const option = ret[key]
    const rule = RULES[key]

    if (rule.test && !rule.test(option)) {
      throw error(`INVALID_${key.toUpperCase()}`, option)
    }

    if (rule.set) {
      ret[key] = rule.set(option)
    }
  })

  return ret
}

const isNumberString = string => string === String(Number(string))

const isPlainObject = object =>
  typeof object === 'object'
  && object.constructor === {}.constructor

module.exports = {
  createOptions,
  isNumberString,
  isPlainObject,
  QUOTE,
  EMPTY,
  SPACE
}
