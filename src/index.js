module.exports = stringify
stringify.Code = Code

const {isArray, isRegExp, isFunction} = require('core-util-is')

const PRE_CURLY_BRANKET = '{'
const SUF_CURLY_BRANKET = '}'
const PRE_BRANKET = '['
const SUF_BRANKET = ']'


function Code (code) {
  this.code = code
}

Code.prototype.toCode = function () {
  return this.code
}

function apply_replacer (value, replacer) {
  if (typeof replacer === 'function') {
    var input = {
      '': value
    }
    return apply_function_replacer(input, replacer)['']
  }

  if (
    isArray(replacer)
    // Array replacer only works for plain object
    && is_plain_object(value)
  ) {
    return apply_function_replacer(value, function (k, v) {
      return ~replacer.indexOf(k)
        ? v
        : undefined
    })
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
  return value.map(function (v, i) {
    v = replacer.call(value, i, v)
    return apply_function_replacer(v, replacer)
  })
}


function apply_object_function_replacer (value, replacer) {
  var k
  var v
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


function is_plain_object (object) {
  return typeof object === 'object'
    && object.constructor === {}.constructor
}


function make_sure_spaces (space) {
  var type = typeof space

  // Support string-type `space`
  return type === 'string'
    ? space
    : type === 'number'
      ? create_spaces(space)
      : ''
}


function create_spaces(n){
  if(!n){
    return ''
  }

  var space = ' '
  var ret = ''

  while(n --){
    ret += space
  }

  return ret
}


// @param {Object} object
// @param {function|null} replacer same as `replacer` parameter of `JSON.stringify`
// @param {number} space same as `space` parameter of `JSON.stringify`
// @param {number} indent
function object_to_code(object, space, indent) {
  var key
  var value

  var indent_string = indent
  var joiner = (space ? '\n' + space : '') + indent_string

  var key_value_joiner = space
    ? ' '
    : ''

  var start = PRE_CURLY_BRANKET + joiner
  var end = (space ? '\n' : '') + indent_string + SUF_CURLY_BRANKET
  var code = []

  joiner = ',' + joiner

  for(key in object){
    if( object.hasOwnProperty(key) ){
      value = object[key]

      code.push(
        string_to_key(key) +
        ':' + key_value_joiner +
        code_stringify(value, space, space + indent)
      )
    }
  }

  code = code.join(joiner)

  return code
    ? start + code + end
    : '{}'
}


var VALID_KEY_STRING = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

function string_to_key (string) {
  // valid: {0: 1}
  if (string === String(Number(string))) {
    return string
  }

  // invalid: { 0a: 1 }
  if (VALID_KEY_STRING.test(string)) {
    return string
  }

  return string_to_code(string)
}


function escape_string (string) {
  return string
  // #2: deals with backslash
  .replace(/\\/g, '\\\\')
  .replace(new RegExp(stringify.QUOTE, 'g'), '\\' + stringify.QUOTE)
}


// @param {Array} array
function array_to_code (array, space, indent) {

}


class Stringifier {
  constructor (options) {
    this._options = createOptions(options)

    this.stringify = this.stringify.bind(this)
    this._codec = []
  }

  register ({
    test,
    stringify: s
  }) {
    this._codec.push({
      test,
      stringify: s
    })
    return this
  }

  stringify (value, indent) {

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

    // if (
    //   value.toCode
    //   && typeof value.toCode === 'function'
    //   && !value.hasOwnProperty('toCode')
    // ) {
    //   return value.toCode()
    // }

    return this.object(value, indent)
  }

  string (value) {
    const {quote} = this._options

    return quote
    + escape_string(value)
    + quote
  }

  array (value, indent) {
    const {
      space
    } = this._options

    //   indent  space
    // |--------|-----|
    //          [               <--- \n + indent + space
    //                value,    <--- itemJoiner: , + \n + indent + space
    //                value
    //          ]

    // Spaces inside array
    const sufJoiner = space

      ? `\n${indent}`
      // [value
      : ''

    const preJoiner = sufJoiner + space

    // const leading = PRE_BRANKET + joiner
    // const ending = (space ? '\n' : '') + indent + SUF_BRANKE

    let i = 0
    let v
    const {length} = array.length
    const slices = []
    // Never use any iterators of Array, such as .reduce(), .forEach(), etc,
    // 'coz those method will never iterate unset items of an array
    for (; i < length; i ++) {
      v = array[i]
      slices.push(this._stringify(value, indent + space))
    }

    const code = slices.join(`,${preJoiner}`)
    return code
      ? PRE_BRANKET + preJoiner + code + sufJoiner + SUF_BRANKET
      : '[]'
  }
}


const stringify = (value, replacer, space, indent) =>
  new Stringifier({
    replacer,
    space,
    quote: stringify.QUOTE
  })
  .stringify(value, indent)
  // space = make_sure_spaces(space)
  // indent = make_sure_spaces(indent)
  // value = apply_replacer(value, replacer)

  // return code_stringify(value, space, indent)

}

stringify.QUOTE = `'`

stringify.Stringifier = Stringifier
