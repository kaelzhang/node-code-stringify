

const code = require('..')

const {expect} = require('chai')
const fs = require('fs')
const node_path = require('path')

const obj = {
  0: 1,
  2: 1,
  a: 1,
  bc: '2',
  def: true,
  'g-h': function (n) { return n },
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
  foo: new code.Code('(function (a){return a})(3)')
}

const expected = fs.readFileSync(
  node_path.join(__dirname, 'expected')
).toString()

code.QUOTE = '\''

describe('complex', () => {
  it('all together', () => {
    const result = code(obj, null, 2)
    expect(result).to.equal(expected.trim())
  })
})

describe('code.Code', () => {
  it('single', () => {
    expect(code(new code.Code('a'))).to.equal('a')
  })

  it('should not use normal `toCode` property', () => {
    expect(code({toCode () { return 3 }})).to.equal('{toCode:function(){return 3}}')
  })

  it('if toCode is not a function', () => {
    function F () {
    }
    F.prototype.toCode = 3
    const f = new F()
    expect(code(f)).to.equal('{}')
  })

  it('with replacer', () => {
    const value = [1, 2, 3]
    expect(code(value, (i, v) => i === ''
      ? v
      : new code.Code(`_${v}`))).to.equal('[_1,_2,_3]')
  })
})

describe('primitive types', () => {
  it('number', () => {
    const a = 1
    expect(code(a)).to.equal('1')
  })

  describe('string', () => {
    it('no quotes', () => {
      const a = 'a'
      expect(code(a)).to.equal("'a'")
    })

    it('with double quotes', () => {
      const a = '"a"'
      expect(code(a)).to.equal("'\"a\"'")
    })

    it('with single quotes', () => {
      const a = "'a'"
      expect(code(a)).to.equal("'\\'a\\''")
    })
  })

  it('boolean', () => {
    expect(code(true)).to.equal('true')
    expect(code(false)).to.equal('false')
  })
})

describe('reference types', () => {
  describe('arrays of primitive types', () => {
    it('no indent', () => {
      expect(code([1, '2', true])).to.equal("[1,'2',true]")
    })

    it('with indents', () => {
      expect(code([1, '2', true], null, 4)).to.equal("[\n    1,\n    '2',\n    true\n]")
    })

    it('empty array', () => {
      expect(code([])).to.equal('[]')
      expect(code({a: []})).to.equal('{a:[]}')
    })
  })

  it('functions', () => {
    expect(code(a => a)).to.equal('function(a){return a}')
  })

  it('regexp', () => {
    expect(code(/abc/)).to.equal('/abc/')
  })

  describe('objects', () => {
    it('no indent', () => {
      expect(code({
        a: 1, b: true, cd: 2, 'c-d': 3
      })).to.equal("{a:1,b:true,cd:2,'c-d':3}")
    })

    it('number key object', () => {
      expect(code({0: 1})).to.equal('{0:1}')
    })

    it('object key starts with number', () => {
      expect(code({'0a': 1})).to.equal("{'0a':1}")
    })

    it('with indents', () => {
      expect(code({a: 1, b: true}, null, 4)).to.equal('{\n    a: 1,\n    b: true\n}')
    })
  })
})

describe('mixtures', () => {
  it('array of objects', () => {
    expect(code([1, {a: 1}])).to.equal('[1,{a:1}]')
  })
  it('object contains arrays', () => {
    expect(code({a: [1, 'a']})).to.equal("{a:[1,'a']}")
  })
})

describe('replacer', () => {
  it('removes object property if returns undefined, remove all', () => {
    expect(code({a: 1}, () => {})).to.equal('undefined')
  })

  it('removes object property if returns undefined, remove a', () => {
    expect(code({a: 1}, (k, v) => k === 'a'
      ? undefined
      : v)).to.equal('{}')
  })

  it('replacer this', () => {
    const value = {a: 1}
    code(value, k => {
      if (!k) {
        expect(this).to.deep.equal({'': value})
      }

      if (k === 'a') {
        expect(this).to.equal(value)
      }
    })
  })

  it('object with array replacer', () => {
    const value = {a: 1, b: 2}
    expect(code(value, ['a'])).to.equal('{a:1}')
  })

  it('array with array replacer', () => {
    const value = ['a', 'b']
    expect(code(value, [1])).to.equal("['a','b']")
  })
})
