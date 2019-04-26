[![Build Status](https://travis-ci.org/kaelzhang/node-code-stringify.svg?branch=master)](https://travis-ci.org/kaelzhang/node-code-stringify)
[![Coverage](https://codecov.io/gh/kaelzhang/node-code-stringify/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/node-code-stringify)

# code-stringify

`code-stringify` is the node.js module that converts JavaScript variables into source codes with indents and styles.

Unlike `JSON.stringify`, `code-stringify` also deals with reference(object) types of variables, and it converts JavaScript variables into strings of codes, not JSON.

Supports:

- **Primative variables**
- **Regular expressions**
- **Functions**
- **Arrays**
- **Your custom formatter**

## Installation

```sh
npm i code-stringify
```

## Usage

```js
const fs = require('fs')
const stringify = require('code-stringify')

const obj = {
  '0': 1,
  'a': function(n){return n;},
  'b': 1,
  'c-d': 3
}

// So you can use code-stringify to save your javascript variables into a file:
fs.writeFileSync(
  'output.js',
  `module.exports = ${stringify(obj, null, 2)}`
)
```

Then 'output.js' will look like:

```js
module.exports = {
  0: 1,
  a: function(n){return n;},
  b: 1,
  'c-d': 3
}
```

## stringify(subject, replacer, space, indent): string

##### subject `any`

The subject to be stringified

##### replacer `Function(key, value) | Array`

The `replacer` argument acts just like the second parameter of `JSON.stringify`.

> A function that alters the behavior of the stringification process, or an array of String and Number objects that serve as a whitelist for selecting/filtering the properties of the value object to be included in the JSON string. If this value is null or not provided, all properties of the object are included in the resulting JSON string.

```js
stringify({
  a: 1,
  b: 2
}, function (key, value) {
  return key === 'b'
    ? undefined
    : value
})

// '{a:1}'
```

##### space `number | string`

The `space` argument acts just like the third parameter of `JSON.stringify`.

##### indent `number | string`

Defaults to `0`

The code indent for the entire subject. If `indent === 4`, then the content of the `output.js` in the first example will be:

```js
    module.exports = {
      0: 1,
      a: function (n){return n;},
      b: 1,
      'c-d': 3
    }
```

### new stringify.Code(string)

We could use `new code.Code(code_string)` to define an already-stringified property.

So, see the example below:

```js
const output = `module.exports = ${stringify({
  a: 1,
  'foo-bar': 2,
  foo: new stringify.Code('(function(a){return a})(3)')
})}`

saveFile(output, 'output.js')
```

And the output.js will be:

```
module.exports = {
  a: 1,
  'foo-bar': 2,
  foo: (function(a){return a})(3)
}
```

### `stringify.STRINGIFY_SYMBOL`

```js
// `stringify.STRINGIFY_SYMBOL` equals to
stringify.STRINGIFY_SYMBOL = Symbol.for('code.stringify.custom')
```

If an `object[stringify.STRINGIFY_SYMBOL]` is a function, then the function will be used as the stringifier of the object.

```js
const monkey = {
  iam: {
    [Symbol.for('code.stringify.custom')] () {
      return '"monkey king"'
    }
  }
}

console.log(stringify(monkey))
// {iam:"monkey king"}
```

### Versus `JSON.stringify()`

- `JSON.stringify` makes JSON.
- `code-stringify` makes JavaScript code.

****

> Advanced Section

```js
const {
  Stringifier,
  STRINGIFY_SYMBOL,
  CODE_STRINGIFY_CUSTOM
} = require('code-stringify')
```

## new Stringifier(options)

> new in 2.0.0

The constructor `Stringifier` allows us to take more control of the stringifer.

- **options** `Object`
  - **replacer?** `(Function | Array)=null`
  - **space?** `(number | string)=0` Defaults to `0` which indicates there should be no spaces.
  <!-- - **detectCircular?** `boolean=false` Whether should detect circular object and throw an error if any circular reference is found -->
  - **quote?** `' | "` the quote character for strings. Defaults to `'`.
  - **useNumberKey?** `boolean=true` uses number key of an object if possible

#### options.useNumberKey

```js
new Stringifier().stringify({'1': 1, '2b': 2})
// {1:1,'2b':2}

new Stringifier({
  useNumberKey: false
}).stringify({'1': 1, '2b': 2})
// {'1':1:'2b':2}
```
<!--
#### options.detectCircular

If we try to stringify a circular object, then it will throw an `CIRCULAR_DETECTED` error instead of exceeding maximum call stack error if we set the option to `true` -->

### stringifier.stringify(subject, indent = 0): string

- **indent?** `(number | string)=0`

Returns the JavaScript code string.

### stringifier.register(customStringifier): this

- **customStringifier** `CustomStringifier`

```ts
interface CustomStringifier {
  // Test if we could use the custom stringifier
  test: Function (subject): boolean
  // If the test method returns true,
  // then the stringify method will be used.
  // Inside the method, we can access the `Stringifier` instance by `this` object, so that we can use the utility methods below
  stringify: Function(subject, indent, options): string
}
```

Register a custom stringifier for certain data type.

```js
class King {
  constructor (name) {
    this._name = name
  }

  selfIntroduce () {
    return `[king ${this._name}]`
  }
}

new Stringifier().register({
  test (value) {
    return value instanceof Monkey
  },
  stringify (value) {
    return this.string(value.selfIntroduce())
  }
})
.stringify({
  dinosaur: 'Godzilla',
  ape: new King('Kong')
})
// {dinasaur:'Godzilla',ape:'[king Kong]'}
```

## `CODE_STRINGIFY_CUSTOM`

`CODE_STRINGIFY_CUSTOM` is a built-in `CustomStringifier` to support `stringify.STRINGIFY_SYMBOL`.

And a new `Stringifier` is not registered `CODE_STRINGIFY_CUSTOM` by default.

### Utility methods

The following methods has no type checking and fault tolerance

Make sure every argument that passed into the methods has been type-checked

#### stringifier.string(string)

- **string** `string`

Stringify a string

#### stringifier.object(object, indent)

- **object** `Object`

Stringify a string

#### stringifier.array(array, indent)

- **array** `Array`

Stringify an array

#### stringifier.key(key)

- **string** `key`

Stringify a property of an object.

## Known Issues

- `space` parameter could not affect the code indent inside functions.
- Could not deal with variable scope so far.

Those issues or tasks which should be done to enhance the module might be fixed in the future. Or there will be a million thanks if you fork and contribute ~~
