const InputStream = require('./InputStream')
const TokenStream = require('./TokenStream')
const parse = require('./Parser')
const Environment = require('./Envinronment')
const evaluate = require('./evaluate')

const code = `
  sum = lambda(x, y) x + y;
  foo = 42;
  bar = 24;
  print(sum(foo, sum(bar, bar)));
`

const ast = parse(TokenStream(InputStream(code)))

const globalEnv = new Environment()

globalEnv.def('print', txt => console.log(txt))

evaluate(ast, globalEnv)
