const FALSE = { type: 'bool', value: false }
const PRECEDENCE = {
  "=": 1,
  "||": 2,
  "&&": 3,
  "<": 7, ">": 7, "<=": 7, ">=": 7, "==": 7, "!=": 7,
  "+": 10, "-": 10,
  "*": 20, "/": 20, "%": 20,
}

module.exports = function parse(input) {
  function isPunc(ch) {
    const tok = input.peek()
    return tok && tok.type === 'punc' && (!ch || tok.value === ch) && tok
  }
  function isKw(kw) {
    const tok = input.peek()
    return tok && tok.type === 'kw' && (!kw || tok.value === kw) && tok
  }
  function isOp(op) {
    const tok = input.peek()
    return tok && tok.type === 'op' && (!op || tok.value === op) && tok
  }
  function skipPunc(ch) {
    if (isPunc(ch)) input.next()
    else input.croak(`Expecting punctuation: "${ch}"`)
  }
  function skipKw(kw) {
    if (isKw(kw)) input.next()
    else input.croak(`Expecting keyword: "${kw}"`)
  }
  function skipOp(op) {
    if (isOp(op)) input.next()
    else input.croak(`Expecting operator: "${op}"`)
  }
  function unexpected() {
    input.croak('Unexpected token: ' + JSON.stringify(input.peek()))
  }
  function maybeBinary(left, myPrec) {
    const tok = isOp()
    if (tok) {
      const hisPrec = PRECEDENCE[tok.value]
      if (hisPrec > myPrec) {
        input.next()
        const right = maybeBinary(parseAtom(), hisPrec)
        const binary = {
          type: tok.value === '=' ? 'assign' : 'binary',
          operator: tok.value,
          left,
          right
        }
        return maybeBinary(binary, myPrec)
      }
    }
    return left
  }
  function delimited(start, stop, separator, parser) {
    const a = []
    let first = true
    skipPunc(start)
    while (!input.eof()) {
      if (isPunc(stop)) break
      if (first) {
        first = false
      } else {
        skipPunc(separator)
      }
      if (isPunc(stop)) break
      a.push(parser())
    }
    skipPunc(stop)
    return a
  }
  function parseCall(func) {
    return {
      type: 'call',
      func,
      args: delimited('(', ')', ',', parseExpression)
    }
  }
  function parseVarname() {
    const name = input.next()
    if (name.type !== 'var') input.croak('Expecting variable name')
    return name.value
  }
  function parseIf() {
    skipKw('if')
    const cond = parseExpression()
    if (!isPunc('{')) skipKw('then')
    const then = parseExpression()
    const ret = { type: 'if', cond, then }
    if (isKw('else')) {
      input.next()
      ret.else = parseExpression()
    }
    return ret
  }
  function parseLambda() {
    return {
      type: 'lambda',
      vars: delimited('(', ')', ',', parseVarname),
      body: parseExpression()
    }
  }
  function parseBool() {
    return {
      type: 'bool',
      value: input.next().value === 'true'
    }
  }
  function maybeCall(expr) {
    expr = expr()
    return isPunc('(') ? parseCall(expr) : expr
  }
  function parseAtom() {
    return maybeCall(() => {
      if (isPunc('(')) {
        input.next()
        const exp = parseExpression()
        skipPunc(')')
        return exp
      }
      if (isPunc('{')) return parseProg()
      if (isKw('if')) return parseIf()
      if (isKw('true') || isKw('false')) return parseBool()
      if (isKw('lambda') || isKw('λ')) {
        input.next()
        return parseLambda()
      }
      const tok = input.next()
      if (tok.type === 'var' || tok.type === 'num' || tok.type === 'str') return tok
      unexpected()
    })
  }
  function parseToplevel() {
    const prog = []
    while (!input.eof()) {
      prog.push(parseExpression())
      if (!input.eof()) skipPunc(';')
    }
    return { type: 'prog', prog }
  }
  function parseProg() {
    const prog = delimited('{', '}', ';', parseExpression)
    if (prog.length === 0) return FALSE
    if (prog.length === 1) return prog[0]
    return { type: 'prog', prog }
  }
  function parseExpression() {
    return maybeCall(() => maybeBinary(parseAtom(), 0))
  }
  return parseToplevel()
}
