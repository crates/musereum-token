require('babel-polyfill')
require('babel-register')({
  // Ignore everything in node_modules except node_modules/zeppelin-solidity.
  presets: ['es2015'],
  plugins: ['syntax-async-functions', 'transform-regenerator'],
  ignore: /node_modules\/(?!zeppelin-solidity)/
})
require('dotenv').config()

const HDWalletProvider = require('truffle-hdwallet-provider-privkey')

module.exports = {
  networks: {
    testrpc: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      provider: () => new HDWalletProvider(process.env.PRIVATE_KEY, 'https://rinkeby.infura.io'),
      gas: 4600000,
      gasPrice: 5e9,
      network_id: '3'
    }
  }
}
