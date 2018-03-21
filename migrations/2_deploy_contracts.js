var MusereumToken = artifacts.require('./MusereumToken.sol')

module.exports = function (deployer) {
  deployer.deploy(MusereumToken)
}