'use strict';

// test native `JSON.stringify`

var obj = {
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    a: 1,
    b: 2
};


function replacer(key, value) {
    console.log(key, typeof key, key === '1', key === '', value);
    switch(key){
        case '':
            return value;

        case '1': 
            return 100;
        case '2':
            return '200';
        case '3':
            return true;

        case '4':
            return {a: 1};

        case '5':
            return function(n){return n};

        case '6':
            return {
                '1': 1,
                '3': 3 
            };

        case '7':
            return /abc/;

        default:
            return;
    }
}


console.log( JSON.stringify(obj, replacer, 1) );

