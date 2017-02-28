[![Build Status](https://travis-ci.org/kaelzhang/node-code-stringify.svg?branch=master)](https://travis-ci.org/kaelzhang/node-code-stringify)

# code-stringify

`code-stringify` is the node.js module that converts JavaScript variables into source codes.

Unlike `JSON.stringify`, `code-stringify` also deals with reference(object) types of variables, and it converts JavaScript variables into strings of codes, not JSON.

Supports:

- Regular expressions
- Functions
- Arrays

## Installation

```sh
npm install code-stringify --save
```

## Usage

```js
const code = require('code-stringify')
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
  'module.exports = ' + code(a, null, 2)
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

## code(subject, replacer, space)

##### subject `mixed`

The subject to be converted

##### replacer `function(key, value)|Array`

The `replacer` argument acts just like the second parameter of `JSON.stringify`.

```js
code({
  a: 1,
  b: 2
}, function (key, value) {
  return key === 'b'
    ? undefined
    : value
})

// '{a:1}'
```

##### space `number|string`

The `space` argument acts just like the third parameter of `JSON.stringify`.

### code.Code(string)

If an object `obj` has a prototype property `toCode` and `obj.toCode` is an function, then `code(obj)` will be equal to `obj.toCode()`.

We could use `new code.Code(code_string)` to define an already-stringified property.

So, see the example below:

```js
let output = 'module.exports = ' + code({
  a: 1,
  'foo-bar': 2,
  foo: new code.Code('(function(a){return a})(3)')
})

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

## Versus `JSON.stringify()`

value | JSON.stringify(value) | code(value) | comment
----- | --------------------- | ----------- | ----------
`1`   | `'1'`                 | `'1'`       |
`'1'` | `"1"`                 | `"'1'"`     | you can change quote style by `code.QUOTE = '"'`
`undefined` | `undefined`     | `'undefined'` |
`null`      | `'null'`        | `'null'`      |
`[undefined]` | `[null]`        | `[undefined]` |
`[null]`      | `[null]`        | `[null]`      |

- `JSON.stringify` makes JSON.
- `code-stringify` makes JavaScript code.


## Known Issues

- Can't deal with recursive objects or arrays SO FAR.
- `space` parameter could not affect the code indent inside functions.
- Could not deal with variable scope so far.

Those issues or tasks which should be done to enhance the module might be fixed in the future. Or there will be a million thanks if you fork and contribute ~~
