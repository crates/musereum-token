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

    await (await MusicToken.deployed()).transferOwnership(MusicICO.address)
    await (await CopyrightToken.deployed()).transferOwnership(MusicICO.address)
  })
}
