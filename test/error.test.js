const {expect} = require('chai')
const {Stringifier} = require('..')

describe('options error', () => {
  [
    [{replacer: 1}, 'INVALID_REPLACER'],
    [{space: - 1}, 'INVALID_SPACE'],
    [{space: {}}, 'INVALID_SPACE'],
  ].forEach(([options, code]) => {
    it(JSON.stringify(options), () => {
      try {
        /* eslint-disable no-new */
        new Stringifier(options)
      } catch (err) {
        expect(err.code).to.equal(code)
        return
      }

      throw new Error('should throw')
    })
  })
})

describe('register error', () => {
  [
    [{}, 'INVALID_TEST'],
    [{test: - 1}, 'INVALID_TEST'],
    [{test: () => true, stringify: 1}, 'INVALID_STRINGIFY'],
    [{test: () => true}, 'INVALID_STRINGIFY'],
  ].forEach(([options, code]) => {
    it(JSON.stringify(options), () => {
      try {
        /* eslint-disable no-new */
        new Stringifier().register(options)
      } catch (err) {
        expect(err.code).to.equal(code)
        return
      }

      throw new Error('should throw')
    })
  })
})
