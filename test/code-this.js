'use strict';

var code = require('..');
var expect = require('chai').expect;

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


describe("primitive types", function(){
    it("number", function(){
        var a = 1;
        expect( code(a) ).to.equal('1');
    });

    describe("string", function(){
        it("no quotes", function(){
            var a = 'a';
            expect( code(a) ).to.equal("'a'");
        });

        it("with double quotes", function(){
            var a = '"a"';
            expect( code(a) ).to.equal("'\"a\"'");
        });

        it("with single quotes", function(){
            var a = "'a'";
            expect( code(a) ).to.equal("'\\'a\\''");
        });
    });

    it("boolean", function(){
        expect(code(true)).to.equal('true');
        expect(code(false)).to.equal('false');
    });
});

describe("reference types", function(){
    describe("arrays of primitive types", function(){
        it("no indent", function(){
            expect(code([1, '2', true])).to.equal("[1,'2',true]");
        });

        it("with indents", function(){
            expect(code([1, '2', true], null, 4)).to.equal("[\n    1,\n    '2',\n    true\n]");
        });
    });

    it("functions", function(){
        expect(code(function(a){return a;})).to.equal('function (a){return a;}');
    });

    it("regexp", function(){
        expect(code(/abc/)).to.equal('/abc/'); 
    });

    describe("objects", function(){
        it("no indent", function(){
            expect(code({a:1,b:true})).to.equal("{'a':1,'b':true}");
        });

        it("with indents", function(){
            expect(code({a:1,b:true}, null, 4)).to.equal("{\n    'a': 1,\n    'b': true\n}");
        });
    });
});

describe("mixtures", function(){
    it("array of objects", function(){
        expect(code([1,{a:1}])).to.equal("[1,{'a':1}]");
    });
    it("object contains arrays", function(){
        expect(code({a:[1,'a']})).to.equal("{'a':[1,'a']}");
    });
});

