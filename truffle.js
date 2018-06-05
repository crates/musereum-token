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
      gasPrice: 0x0,
      network_id: '*' // Match any network id
    },
    make: {
      gasPrice: 1,
      network_id: '*',
      host: 'localhost',
      port: 8545,
      from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'     // Use the address we derived
    },
    rinkeby: {
      provider: () => new HDWalletProvider(process.env.PRIVATE_KEY, 'http://localhost:8545'),
      gas: 3000000,
      gasPrice: 25e9, // 20 Gwei
      network_id: 4
    },
    mainnet: {
      provider: () => new HDWalletProvider(process.env.PRIVATE_KEY, 'http://localhost:8545'),
      gas: 3000000,
      gasPrice: 8e9,
      network_id: 1
    }
  }
}
