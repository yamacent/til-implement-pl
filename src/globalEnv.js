const Environment = require('./Environment')

const globalEnv = new Environment()

globalEnv.def('print', txt => process.stdout.write(String(txt)))
globalEnv.def('println', txt => console.log(txt))

module.exports = globalEnv
