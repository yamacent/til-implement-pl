function InputStream(input) {
  let pos = 0
  let line = 1
  let col = 0
  return {
    next() {
      const ch = input.charAt(pos++)
      if (ch === '\n') {
        line++
        col = 0
      } else {
        col++
      }
      return ch
    },
    peek: () => input.charAt(pos),
    eof: () => peek() === '',
    croak() {
      throw new Error(`${msg} (${line}:${col})`)
    }
  }
}
