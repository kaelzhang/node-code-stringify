# Code-this

Code-this is node.js module that converts JavaScript variables into source code. 

Unlike `JSON.stringify`, code-this also deals with reference(object) types of variables.

## Installation

```sh
npm install code-this --save
```

## Usage

```js
var code = require('code-this');
var a = {a: function(n){return n;}};

code.convert(a);
```