
'use strict';

var node_util = require('util');

var QUOTE = '\'';
var PRE_CURLY_BRANKET = '{';
var SUF_CURLY_BRANKET = '}';
var PRE_BRANKET = '[';
var SUF_BRANKET = ']';


function create_spaces(n){
    if(!n){
        return '';
    }

    var space = ' ';
    var ret = '';

    while(n --){
        ret += space;
    }

    return ret;
}


// @param {Object} object
// @param {function|null} replacer same as `replacer` parameter of `JSON.stringify`
// @param {number} space same as `space` parameter of `JSON.stringify`
// @param {number} indent
function object_to_code(object, replacer, space, indent) {
    space = space || 0;
    indent = indent || 0;

    var key;
    var value;

    var indent_string = create_spaces(indent);
    var joiner = (space ? '\n' + create_spaces(space) : '') + indent_string;
    var key_value_joiner = space ? ' ' : '';

    var start = PRE_CURLY_BRANKET + joiner;
    var end = (space ? '\n' : '') + indent_string + SUF_CURLY_BRANKET;
    var code = [];

    joiner = ',' + joiner;

    for(key in object){
        if( object.hasOwnProperty(key) ){
            value = object[key];

            if(replacer){
                value = replacer(key, value);

                if(value === undefined){
                    continue;
                }
            }

            code.push(
                string_to_code(key) + 
                ':' + key_value_joiner + 
                value_to_code(value, replacer, space, space + indent) 
            );
        }
    }

    code = code.join(joiner);

    return code ? start + code + end : '{}';
};


function string_to_code(string){
    return QUOTE + string.replace(/'/g, '\\\'') + QUOTE;
};


function value_to_code(value, replacer, space, indent) {
    var type = typeof value;

    if(value === undefined){
        return 'undefined';
    
    }else if(value === null){
        return 'null';

    }else if(type === 'number'){
        return value;

    }else if(type === 'string'){
        return string_to_code(value);
    
    }else if(type === 'boolean'){
        return value ? 'true' : 'false';
    
    }else if(type === 'function' || node_util.isRegExp(value)){
        return value.toString();
    
    }else if(node_util.isArray(value)){
        return array_to_code(value, replacer, space, indent);
    
    }else{
        return object_to_code(value, replacer, space, indent);
    }
}



// @param {Array} array
function array_to_code(array, replacer, space, indent){
    space = space || 0;
    indent = indent || 0;

    var key;
    var value;

    var indent_string = create_spaces(indent);
    var joiner = (space ? '\n' + create_spaces(space) : '') + indent_string;

    var start = PRE_BRANKET + joiner;
    var end = (space ? '\n' : '') + indent_string + SUF_BRANKET;
    var code = [];

    joiner = ',' + joiner;

    var i = 0;
    var length = array.length;
    var value;

    // Never use any iterators of Array, such as .reduce(), .forEach(), etc,
    // 'coz those method will never iterate unset items of array
    for(; i < length; i ++){
        value = array[i];

        if(replacer){
            value = replacer( String(i), value );

            if(value === undefined){

                // If `replacer` returns undefined then null is used instead, as well as `JSON.stringify`
                value = null;
            }
        }

        code.push( value_to_code(value, replacer, space, indent + space) );
    }

    code = code.join(joiner);

    return code ? start + code + end : [];
}


module.exports = value_to_code;
