# Code-this

Code-this is node.js module that converts JavaScript variables into source codes. 

Unlike `JSON.stringify`, code-this also deals with reference(object) types of variables.

## Installation

```sh
npm install code-this --save
```

## Usage

```js
var code = require('code-this');
var a = {a: function(n){return n;}, b: 1, c: 3};

code(a, null, 2); // 1
```

Expression {1} will return:

```js
'{\n  \'a\': function (n){return n;},\n  \'b\': 1,\n  \'c\': 3\n}'
```

So you can use code-this to save your javascript variables into a file:

```js
require('fs').writeFileSync(
	'output.js', 
	'module.exports = ' + code(a, null, 2) + ';';
);
```

Then 'output.js' will be look like:

```js
module.exports = {
  'a': function (n){return n;},
  'b': 1,
  'c': 3
};
```

## code(subject, replacer, space)

##### subject `mixed`

The subject to be converted

##### replacer `function(key, value)`

The `replacer` argument act just like the second parameter of `JSON.stringify`.

##### space `number`

The `space` argument act just like the third parameter of `JSON.stringify`.


## Known Issues

- Code-this can't deal with recursive object or array SO FAR.
- `space` parameter could not affect the code indent inside functions.
- Code-this could not deal with variable scope so far.

Those issues or tasks which should be done to enhance the module might be fixed in the future. Or there will be a million thanks if you fork and contribute ~~