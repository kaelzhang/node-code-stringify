'use strict';

var code = require('code-this');


var obj = {
    a: 1,
    b: '2',
    c: true,
    d: function(n){return n;},
    e: [ {a: 1}, [1, '2'], '1' ],
    f: 1,
    g: 1,
    h: 1,
    i: 1
}


var parsed = code(obj, function (key, value) {
    switch(key){
        case 'f': 
            return value;
        case 'g':
            return '1';
        case 'h':
            return;
        case 'i':
            return [1, 2, 3];
        case '0':
            return;

        default:
            return value;
    }


}, 4);

console.log( parsed );

console.log( require('util').inspect(obj, {depth: 100}) )