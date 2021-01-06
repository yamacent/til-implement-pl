const PRECEDENCE = {
  "=": 1,
  "||": 2,
  "&&": 3,
  "<": 7, ">": 7, "<=": 7, ">=": 7, "==": 7, "!=": 7,
  "+": 10, "-": 10,
  "*": 20, "/": 20, "%": 20,
}

function parse(input) {
  const FALSE = { type: 'bool', value: false }
  function unexpected() {}
  function isPunc(ch) {
    const tok = input.peek()
    return tok && tok.type === 'punc' && (!ch || tok.value === ch) && tok
  }
  function isOp() {}
  function isKw(kw) {}
  function skipPunc(ch) {
    if (isPunc(ch)) input.next()
    else input.croak(`Expecting punctuation: "${ch}"`)
  }
  function skipKw(kw) {}
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

  function parseBool() {}
  function parseVarname() {}
  function parseExpression() {
    return maybeCall(() => maybeBinary(parseAtom(), 0))
  }
  function parseIf() {
    skipKw('if')
    const cond = parseExpression()
    if (!isPunc('{')) skipKw('then')
    const then = parseExpression
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
  function parseProg() {
    const prog = delimited('{', '}', ';', parseExpression)
    if (prog.length === 0) return FALSE
    if (prog.length === 1) return prog[0]
    return { type: 'prog', prog }
  }
  function parseToplevel() {
    const prog = []
    while (!input.eof()) {
      prog.push(parseExpression())
      if (!input.eof()) skipPunc(';')
    }
    return { type: 'prog', prog }
  }
  function parseCall(func) {
    return {
      type: 'call',
      func,
      args: delimited('(', ')', ',', parseExpression)
    }
  }
  function maybeCall(expr) {
    expr = expr()
    return isPunc('(') ? parseCall(expr) : expr
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
  return parseToplevel
}
