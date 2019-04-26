const {isArray, isRegExp, isFunction} = require('core-util-is')
const {isNumberString, createOptions} = require('./options')

const PRE_CURLY_BRACKET = '{'
const SUF_CURLY_BRACKET = '}'
const PRE_BRACKET = '['
const SUF_BRACKET = ']'

function apply_replacer (value, replacer) {
  if (typeof replacer === 'function') {
    const input = {
      '': value
    }
    return apply_function_replacer(input, replacer)['']
  }

  if (
    isArray(replacer)
    // Array replacer only works for plain object
    && is_plain_object(value)
  ) {
    return apply_function_replacer(value, (k, v) => ~ replacer.indexOf(k)
      ? v
      : undefined)
  }

  return value
}


function apply_function_replacer (value, replacer) {
  if (isArray(value)) {
    return apply_array_function_replacer(value, replacer)
  }

  if (is_plain_object(value)) {
    return apply_object_function_replacer(value, replacer)
  }

  return value
}


function apply_array_function_replacer (value, replacer) {
  return value.map((v, i) => {
    v = replacer.call(value, i, v)
    return apply_function_replacer(v, replacer)
  })
}


function apply_object_function_replacer (value, replacer) {
  let k
  let v
  for (k in value) {
    v = value[k]
    v = replacer.call(value, k, v)

    if (v === undefined) {
      delete value[k]
      continue
    }

    value[k] = apply_function_replacer(v, replacer)
  }

  return value
}

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

const EMPTY = ''
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

  }

  _check (value, indent) {
    if (this._codec.length === 0) {
      return
    }

    const found = this._codec.find(({test}) => test(value))
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
      : ''

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
      ? ' '
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

// space = make_sure_spaces(space)
// indent = make_sure_spaces(indent)
// value = apply_replacer(value, replacer)

// return code_stringify(value, space, indent)

stringify.Code = Code

stringify.QUOTE = `'`

stringify.Stringifier = Stringifier
