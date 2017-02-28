'use strict'

var code = require('..')
var expect = require('chai').expect
var fs = require('fs')
var node_path = require('path')

var obj = {
  '0': 1,
  2: 1,
  'a': 1,
  bc: '2',
  def: true,
  'g-h': function(n){return n},
  $i: [
    {
      a: 1
    },
    [
      1,
      '2'
    ],
    '1'
  ],
  a0: 1,
  '0ab': 1,
  foo: new code.Code('(function(a){return a})(3)')
}

var expected = fs.readFileSync(
  node_path.join(__dirname, 'expected')
).toString()

code.QUOTE = '\''

describe('complex', function () {
  it('all together', function () {
    var result = code(obj, null, 2)
    expect(result).to.equal(expected)
  })
})

describe('code.Code', function () {
  it('single', function () {
    expect(code(new code.Code('a'))).to.equal('a')
  })

  it('should not use normal `toCode` property', function () {
    expect(code({toCode: function(){return 3}})).to.equal('{toCode:function (){return 3}}')
  })

  it('if toCode is not a function', function () {
    function F () {
    }
    F.prototype.toCode = 3
    var f = new F
    expect(code(f)).to.equal('{}')
  })

  it('with replacer', function () {
    var value = [1, 2, 3]
    expect(code(value, function (i, v) {
      return i === ''
        ? v
        : new code.Code('_' + v)
    })).to.equal('[_1,_2,_3]')
  })
})

describe("primitive types", function(){
  it("number", function(){
    var a = 1
    expect( code(a) ).to.equal('1')
  })

  describe("string", function(){
    it("no quotes", function(){
      var a = 'a'
      expect( code(a) ).to.equal("'a'")
    })

    it("with double quotes", function(){
      var a = '"a"'
      expect( code(a) ).to.equal("'\"a\"'")
    })

    it("with single quotes", function(){
      var a = "'a'"
      expect( code(a) ).to.equal("'\\'a\\''")
    })
  })

  it("boolean", function(){
    expect(code(true)).to.equal('true')
    expect(code(false)).to.equal('false')
  })
})

describe("reference types", function(){
  describe("arrays of primitive types", function(){
    it("no indent", function(){
      expect(code([1, '2', true])).to.equal("[1,'2',true]")
    })

    it("with indents", function(){
      expect(code([1, '2', true], null, 4)).to.equal("[\n    1,\n    '2',\n    true\n]")
    })

    it("empty array", function(){
      expect(code([])).to.equal('[]')
      expect(code({a:[]})).to.equal("{a:[]}")
    })
  })

  it("functions", function(){
    expect(code(function(a){return a})).to.equal('function (a){return a}')
  })

  it("regexp", function(){
    expect(code(/abc/)).to.equal('/abc/')
  })

  describe("objects", function(){
    it("no indent", function(){
      expect(code({a:1,b:true,cd:2,'c-d':3})).to.equal("{a:1,b:true,cd:2,'c-d':3}")
    })

    it('number key object', function () {
      expect(code({0: 1})).to.equal("{0:1}")
    })

    it('object key starts with number', function () {
      expect(code({'0a': 1})).to.equal("{'0a':1}")
    })

    it("with indents", function(){
      expect(code({a:1,b:true}, null, 4)).to.equal("{\n    a: 1,\n    b: true\n}")
    })
  })
})

describe("mixtures", function(){
  it("array of objects", function(){
    expect(code([1,{a:1}])).to.equal("[1,{a:1}]")
  })
  it("object contains arrays", function(){
    expect(code({a:[1,'a']})).to.equal("{a:[1,'a']}")
  })
})

describe('replacer', function () {
  it('removes object property if returns undefined, remove all', function () {
    expect(code({a: 1}, function () {})).to.equal('undefined')
  })

  it('removes object property if returns undefined, remove a', function () {
    expect(code({a: 1}, function (k, v) {
      return k === 'a'
        ? undefined
        : v
    })).to.equal('{}')
  })

  it('replacer this', function () {
    var value = {a: 1}
    code(value, function (k, v) {
      if (!k) {
        expect(this).to.deep.equal({'': value})
      }

      if (k === 'a') {
        expect(this).to.equal(value)
      }
    })
  })

  it('object with array replacer', function () {
    var value = {a: 1, b: 2}
    expect(code(value, ['a'])).to.equal('{a:1}')
  })

  it('array with array replacer', function () {
    var value = ['a', 'b']
    expect(code(value, [1])).to.equal("['a','b']")
  })
})
