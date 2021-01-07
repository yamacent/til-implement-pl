const KEYWORDS = " if then else lambda λ true false "

const isKeyword = x => KEYWORDS.indexOf(` ${x} `) >= 0
const isDigit = ch => /[0-9]/i.test(ch)
const isIdStart = ch => /[a-zλ_]/i.test(ch)
const isId = ch => isIdStart(ch) || '?!-<>=0123456789'.indexOf(ch) >= 0
const isOpChar = ch => '+-*/%=&|<>!'.indexOf(ch) >= 0
const isPunc = ch => ',;(){}[]'.indexOf(ch) >= 0
const isWhitespace = ch => ' \t\n'.indexOf(ch) >= 0

module.exports = function TokenStream(input) {
  let current = null
  function readWhile(predicate) {
    let str = ''
    while (!input.eof() && predicate(input.peek())) str += input.next()
    return str
  }
  function readNumber() {
    let hasDot = false
    const number = readWhile(ch => {
      if (ch === '.') {
        if (hasDot) return false
        hasDot = true
        return true
      }
      return isDigit(ch)
    })
    return { type: 'num', value: parseFloat(number) }
  }
  function readIdent() {
    const id = readWhile(isId)
    return { type: isKeyword(id) ? 'kw' : 'var', value: id }
  }
  function readEscaped(end) {
    let escaped = false
    let str = ''
    while (!input.eof()) {
      let ch = input.next()
      if (escaped) {
        str += ch
        escaped = false
      } else if (ch === '\\') {
        escaped = true
      } else if (ch === end) {
        break
      } else {
        str += ch
      }
    }
    return str
  }
  function readString() {
    return { type: 'str', value: readEscaped('"') }
  }
  function skipComment() {
    readWhile(ch => ch != '\n')
    input.next()
  }
  function readNext() {
    readWhile(isWhitespace)
    if (input.eof()) return null
    const ch = input.peek()
    if (ch === '#') {
      skipComment()
      return readNext()
    }
    if (ch === '"') return readString()
    if (isDigit(ch)) return readNumber()
    if (isIdStart(ch)) return readIdent()
    if (isPunc(ch)) return {
      type: 'punc',
      value: input.next()
    }
    if (isOpChar(ch)) return {
      type: 'op',
      value: readWhile(isOpChar)
    }
    input.croak(`Can't handle character: ${ch}`)
  }
  function peek() {
    return current || (current = readNext())
  }
  function next() {
    const tok = current
    current = null
    return tok || readNext()
  }
  function eof() {
    return peek() === null
  }
  return {
    next,
    peek,
    eof,
    croak: input.croak
  }
}
