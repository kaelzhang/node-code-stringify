[![Build Status](https://travis-ci.org/kaelzhang/node-code-stringify.svg?branch=master)](https://travis-ci.org/kaelzhang/node-code-stringify)
[![Coverage](https://codecov.io/gh/kaelzhang/node-code-stringify/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/node-code-stringify)

# code-stringify

`code-stringify` is the node.js module that converts JavaScript variables into source codes with indents and styles.

Unlike `JSON.stringify`, `code-stringify` also deals with reference(object) types of variables, and it converts JavaScript variables into strings of codes, not JSON.

Supports:

- Primative variables
- Regular expressions
- Functions
- Arrays
- Your custom formatter

## Installation

```sh
npm i code-stringify
```

## Usage

```js
const stringify = require('code-stringify')
const obj = {
  '0': 1,
  'a': function(n){return n;},
  'b': 1,
  'c-d': 3
}

const fs = require('fs')

// So you can use code-stringify to save your javascript variables into a file:
fs.writeFileSync(
  'output.js',
  'module.exports = ' + stringify(a, null, 2)
)
```

Then 'output.js' will look like:

```js
module.exports = {
  0: 1,
  a: function (n){return n;},
  b: 1,
  "c-d": 3
}
```

## stringify(subject, replacer, space, indent)

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
      "c-d": 3
    }
```

### stringify.Code(string)

If an object `obj` has a prototype property `toCode` and `obj.toCode` is an function, then `code(obj)` will be equal to `obj.toCode()`.

We could use `new code.Code(code_string)` to define an already-stringified property.

So, see the example below:

```js
let output = `module.exports = ${stringify({
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

### Versus `JSON.stringify()`

- `JSON.stringify` makes JSON.
- `code-stringify` makes JavaScript code.

****

> Advanced Section

## new Stringifier(options)

> new in 2.0.0

The constructor `Stringifier` allows us to take more control of the stringifer.

- **options** `Object`
  - **replacer?** `(Function | Array)=null`
  - **space?** `(number | string)=0` Defaults to `0` which indicates there should be no spaces.
  - **detectCircular?** `boolean=false` Whether should detect circular object and throw an error if any circular reference is found
  - **quote?** `' | "` the quote character for strings. Defaults to `'`.
  - **useNumberKey?** `boolean=true` uses number key of an object if possible

#### control object keys

```js
new Stringifier().stringify({'1': 1, '2b': 2})
// {1:1,'2b':2}

new Stringifier({
  useNumberKey: false
}).stringify({'1': 1, '2b': 2})
// {'1':1:'2b':2}
```

### stringifier.stringify(subject, indent = 0): string

- **indent?** `(number | string)=0`

Returns the JavaScript code string.

## Known Issues

- `space` parameter could not affect the code indent inside functions.
- Could not deal with variable scope so far.

Those issues or tasks which should be done to enhance the module might be fixed in the future. Or there will be a million thanks if you fork and contribute ~~
