[![NPM version](https://badge.fury.io/js/code-stringify.png)](http://badge.fury.io/js/code-stringify)
[![Build Status](https://travis-ci.org/kaelzhang/node-code-stringify.png?branch=master)](https://travis-ci.org/kaelzhang/node-code-stringify)
[![Dependency Status](https://gemnasium.com/kaelzhang/node-code-stringify.png)](https://gemnasium.com/kaelzhang/node-code-stringify)

# Code-this

Code-this is the node.js module that converts JavaScript variables into source codes.

Unlike `JSON.stringify`, code-stringify also deals with reference(object) types of variables.

## Installation

```sh
npm install code-stringify --save
```

## Usage

```js
const code = require('code-stringify')
const obj = {
  0: 1,
  a: function(n){return n;},
  b: 1,
  'c-d': 3
}

const fs = require('fs')

// So you can use code-stringify to save your javascript variables into a file:
fs.writeFileSync(
	'output.js',
	'module.exports = ' + code(a, null, 2)
);
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

##### replacer `function(key, value)`

The `replacer` argument acts just like the second parameter of `JSON.stringify`.

##### space `number`

The `space` argument acts just like the third parameter of `JSON.stringify`.


## Known Issues

- Code-this can't deal with recursive objects or arrays SO FAR.
- `space` parameter could not affect the code indent inside functions.
- Code-this could not deal with variable scope so far.

Those issues or tasks which should be done to enhance the module might be fixed in the future. Or there will be a million thanks if you fork and contribute ~~