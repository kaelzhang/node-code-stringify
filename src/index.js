const {isArray, isRegExp, isFunction} = require('core-util-is')
const {
  isNumberString, createOptions, QUOTE, EMPTY, SPACE
} = require('./options')
const applyReplacer = require('./replacer')

const PRE_CURLY_BRACKET = '{'
const SUF_CURLY_BRACKET = '}'
const PRE_BRACKET = '['
const SUF_BRACKET = ']'

const STRINGIFY = Symbol.for('code.stringify.custom')

class Code {
  constructor (code) {
    this._code = code
  }

  [STRINGIFY] () {
    return this._code
  }
}

const CODE_STRINGIFY_CUSTOM = {
  test (value) {
    return value && isFunction(value[STRINGIFY])
  },

  stringify (value) {
    return value[STRINGIFY]()
  }
}

const REGEX_IS_VALID_KEY_STRING = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

class Stringifier {
  constructor (options) {
    this._options = createOptions(options)

    this.stringify = this.stringify.bind(this)
    this._stringifiers = []
  }

  register ({
    test,
    stringify: s
  }) {
    this._stringifiers.push({
      test,
      stringify: s
    })
    return this
  }

  stringify (value, indent = EMPTY) {
    const {
      replacer
    } = this._options

    if (replacer) {
      value = applyReplacer(value, replacer)
    }

    return this._stringify(value, indent)
  }

  _check (value, indent) {
    if (this._stringifiers.length === 0) {
      return
    }

    const found = this._stringifiers.find(({test}) => test(value))
    if (!found) {
      return
    }

    const {stringify: s} = found
    return {
      code: s(value, indent, this._options)
    }
  }

  _stringify (value, indent) {
    const checked = this._check(value)
    if (checked) {
      return checked.code
    }

    if (value === undefined) {
      return 'undefined'
    }

    if (value === null) {
      return 'null'
    }

    const type = typeof value

    if (type === 'number') {
      return String(value)
    }

    if (type === 'string') {
      return this.string(value)
    }

    if (type === 'boolean') {
      return value ? 'true' : 'false'
    }

    if (type === 'function' || isRegExp(value)) {
      return value.toString()
    }

    if (isArray(value)) {
      return this.array(value, indent)
    }

    return this.object(value, indent)
  }

  _escapeString (string) {
    const {quote} = this._options

    return string
    // #2: deals with backslash
    .replace(/\\/g, '\\\\')
    .replace(new RegExp(quote, 'g'), `\\${quote}`)
  }

  string (string) {
    const {quote} = this._options

    return quote
    + this._escapeString(string)
    + quote
  }

  _join (slices, indent, pre, suf) {
    const {
      space
    } = this._options

    //   indent  space
    // |--------|-----|
    //          [               <--- \n + indent + space
    //                value,    <--- itemJoiner: , + \n + indent + space
    //                value
    //          ]

    //   indent  space    keyValueJoiner
    // |--------|-----|  |--|
    //          {
    //                key:  value,
    //                key:  value
    //          }

    const sufJoiner = space

      ? `\n${indent}`
      // [value
      : EMPTY

    const preJoiner = sufJoiner + space
    const code = slices.join(`,${preJoiner}`)

    return code
      ? pre + preJoiner + code + sufJoiner + suf
      : '[]'
  }

  array (array, indent) {
    const {space} = this._options

    let i = 0
    let v
    const {length} = array.length
    const slices = []
    // Never use any iterators of Array, such as .reduce(), .forEach(), etc,
    // 'coz those method will never iterate unset items of an array
    for (; i < length; i ++) {
      v = array[i]
      slices.push(this._stringify(v, indent + space))
    }

    return this._join(slices, indent, PRE_BRACKET, SUF_BRACKET)
  }

  key (key) {
    const {useNumberKey} = this._options

    // valid: {0: 1}
    if (useNumberKey && isNumberString(key)) {
      return key
    }

    // invalid: { 0a: 1 }
    if (REGEX_IS_VALID_KEY_STRING.test(key)) {
      return key
    }

    return this.string(key)
  }

  object (object, indent) {
    const {space} = this._options
    const keyValueJoiner = space
      ? SPACE
      : EMPTY

    const slices = []
    Object.keys(object).forEach(key => {
      const value = object[key]
      slices.push(
        `${this.key(key)}:${keyValueJoiner}${
          this._stringify(value, space + indent)
        }`
      )
    })

    return this._join(slices, indent, PRE_CURLY_BRACKET, SUF_CURLY_BRACKET)
  }
}

const stringify = (value, replacer, space, indent) =>
  new Stringifier({
    replacer,
    space,
    quote: stringify.QUOTE
  })
  .register(CODE_STRINGIFY_CUSTOM)
  .stringify(value, indent)

stringify.Code = Code

stringify.QUOTE = QUOTE

stringify.Stringifier = Stringifier

module.exports = stringify
