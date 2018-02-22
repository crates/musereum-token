require('babel-polyfill')
require('babel-register')({
  // Ignore everything in node_modules except node_modules/zeppelin-solidity.
  presets: ['es2015'],
  plugins: ['syntax-async-functions', 'transform-regenerator'],
  ignore: /node_modules\/(?!zeppelin-solidity)/
})

require('dotenv').config()
const Web3 = require('web3')
const web3 = new Web3()

let rinkebyProvider, mainnetProvider
const HDWalletProvider = require('truffle-hdwallet-provider-privkey')

if (!process.env.SOLIDITY_COVERAGE && process.env.PRIVATE_KEY) {
  rinkebyProvider = new HDWalletProvider(process.env.PRIVATE_KEY, 'https://rinkeby.infura.io')
  mainnetProvider = new HDWalletProvider(process.env.PRIVATE_KEY, 'https://rinkeby.infura.io')
}

module.exports = {
  networks: {
    testrpc: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      provider: rinkebyProvider,
      gas: 4600000,
      gasPrice: web3.toWei('20', 'gwei'),
      network_id: '3'
    },
    mainnet: {
      provider: mainnetProvider,
      gas: 4600000,
      gasPrice: web3.toWei('20', 'gwei'),
      network_id: '1'
    }
  }
}
