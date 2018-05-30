var SafeMath = artifacts.require('./SafeMath.sol')
var MusicToken = artifacts.require('./MusicToken.sol')
var CopyrightToken = artifacts.require('./CopyrightToken.sol')
var MusereumToken = artifacts.require('./MusereumToken.sol')
var MusicICO = artifacts.require('./MusicICO.sol')
var { duration } = require('./../utils')

function latestTime () {
  return new Promise((resolve, reject) => {
    web3.eth.getBlock('latest', (err, block) => {
      if (err) return reject(err)
      resolve(block.timestamp)
    })
  })
}

module.exports = (deployer, network, [owner]) => {
  // proper async wrapper
  deployer.then(async () => {
    const timestamp = await latestTime()
    const startTime = timestamp
    const endTime = startTime + duration.weeks(1)
    
    await deployer.deploy(SafeMath)
    await deployer.link(SafeMath, MusicToken)
    await deployer.link(SafeMath, CopyrightToken)
    await deployer.link(SafeMath, MusereumToken)
    await deployer.link(SafeMath, MusicICO)
    await deployer.deploy(MusicToken)
    await deployer.deploy(CopyrightToken)
    await deployer.deploy(MusereumToken)
    await deployer.deploy(MusicICO,
      owner, MusicToken.address, CopyrightToken.address, startTime, endTime
    )

    /* You need to do it yourself because of bug */

    // const musicInstance = web3.eth.contract(MusicToken.abi).at(MusicToken.address)
    // const copyrightInstance = web3.eth.contract(CopyrightToken.abi).at(CopyrightToken.address)

    // await musicInstance.transferOwnership(MusicICO.address, { from: beneficiary })
    // await copyrightInstance.transferOwnership(MusicICO.address, { from: beneficiary })

    /* Last dev result */
    // MusereumToken: 0x2de44be4f8e41f577021e44107c3ec64e8688247
    // MusicToken: 0xe1a74e9297f625468723209411d3d6d40f6ebdd2
    // CopyrightToken: 0x25fb46481360aba88340c85e93e8d152c49c7ef8
    // MusereumToken: 0xac12cb1d6250cb4b4c20a3320b2a50b22602755a
    // MusicICO: 0x89c9a6875e83a0d1ca9eae08a7581d3d6f6f985d

    // For remix Musereum Token approveAndCall
    // "0x89c9a6875e83a0d1ca9eae08a7581d3d6f6f985d", 500000000000000000000, "0x0000000000000000000000000000000000000000000000000000000000000064"
  })
}
