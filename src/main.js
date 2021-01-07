const InputStream = require('./InputStream')
const TokenStream = require('./TokenStream')
const parse = require('./Parser')

const code = `
a = 1 + 2;
b = a * 3
`

const ast = parse(TokenStream(InputStream(code)))

console.log(JSON.stringify(ast, null, 2))
