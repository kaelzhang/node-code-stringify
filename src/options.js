const {Errors, exitOnNotDefined} = require('err-object')
const {
  isArray, isFunction, isString, isNumber, isBoolean
} = require('core-util-is')

const {error, E} = new Errors({
  prefix: '[code-stringify] ',
  notDefined: exitOnNotDefined
})

const EE = (key, shouldBe, variable = `options.${key}`) => {
  const s = '`%s`'

  E(
    `INVALID_${key.toUpperCase()}`,
    `${variable} must be ${shouldBe}, but got ${s}`,
    TypeError
  )
}

EE('replacer', 'null, function or array')
EE('space', 'string or non-negative number')
EE('detectCircular', 'boolean')
EE('quote', 'either `"` or `\'`')

EE('test', 'a function', 'customStringifier.test')
EE('stringify', 'a function', 'customStringifier.stringify')

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
  },

  useNumberKey: {
    test: isBoolean
  }
}

const AVAILABLE_OPTIONS = Object.keys(RULES)

const createOptions = ({
  replacer = null,
  space = 0,
  detectCircular = false,
  quote = QUOTE,
  useNumberKey = true
} = {}) => {
  const ret = {
    replacer,
    space,
    detectCircular,
    quote,
    useNumberKey
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

const checkStringifier = stringifier => {
  if (!isFunction(stringifier.test)) {
    throw error('INVALID_TEST', stringifier.test)
  }

  if (!isFunction(stringifier.stringify)) {
    throw error('INVALID_STRINGIFY', stringifier.stringify)
  }

  return stringifier
}

const isNumberString = string => string === String(Number(string))

const isPlainObject = object =>
  typeof object === 'object'
  && object.constructor === {}.constructor

module.exports = {
  createOptions,
  checkStringifier,
  isNumberString,
  isPlainObject,
  QUOTE,
  EMPTY,
  SPACE
}
