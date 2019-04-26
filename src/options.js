


function make_sure_spaces (space) {
  const type = typeof space

  // Support string-type `space`
  return type === 'string'
    ? space
    : type === 'number'
      ? create_spaces(space)
      : ''
}


function create_spaces (n) {
  if (!n) {
    return ''
  }

  const space = ' '
  let ret = ''

  while (n --) {
    ret += space
  }

  return ret
}

const createOptions = ({
  replacer,
  space,
  indent,
  detectCircular
}) => {

}


const isNumberString = string => string === String(Number(string))

const isPlainObject = object =>
  typeof object === 'object'
  && object.constructor === {}.constructor

module.exports = {
  isNumberString,
  isPlainObject
}
