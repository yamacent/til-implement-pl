module.exports = function InputStream(input) {
  let pos = 0
  let line = 1
  let col = 0
  function next() {
    const ch = input.charAt(pos++)
    if (ch === '\n') {
      line++
      col = 0
    } else {
      col++
    }
    return ch
  }
  function peek() {
    return input.charAt(pos)
  }
  function eof() {
    return peek() === ''
  }
  function croak(msg) {
    throw new Error(`${msg} (${line}:${col})`)
  }
  return {
    next,
    peek,
    eof,
    croak
  }
}
