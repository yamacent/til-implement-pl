const fs = require('fs')
const InputStream = require('./InputStream')
const TokenStream = require('./TokenStream')
const parse = require('./parse')
const globalEnv = require('./globalEnv')
const evaluate = require('./evaluate')

const filename = process.argv[2]

fs.readFile(filename, 'utf8', (err, code) => {
  if (err) throw err
  const ast = parse(TokenStream(InputStream(code)));
  evaluate(ast, globalEnv)
})
