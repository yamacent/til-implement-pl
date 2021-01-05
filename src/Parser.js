function parse(input) {
  function isPunc(ch) {
    const tok = input.peek()
    return tok && tok.type === 'punc' && (!ch || tok.value === ch) && tok
  }
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

  function parseVarname() {}
  function parseExpression() {}
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
  function parseToplevel() {
    const prog = []
    while (!input.eof()) {
      prog.push(parseExpression())
      if (!input.eof()) skipPunc(';')
    }
    return { type: 'prog', prog }
  }
  return parseToplevel
}
