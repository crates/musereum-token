import { increaseTimeTo, duration } from 'zeppelin-solidity/test/helpers/increaseTime'
import latestTime from 'zeppelin-solidity/test/helpers/latestTime'
import { toBytes } from '../../utils'
import { setTimeout } from 'timers'

// Globals (Truffle runtime)
const contract = global.contract || {}
const web3 = global.web3 || {}
const beforeEach = global.beforeEach || {}
const it = global.it || {}
const assert = global.assert || {}
const artifacts = global.artifacts || {}

// Contracts
const MusicICO = artifacts.require('MusicICO')
const MusicToken = artifacts.require('MusicToken')
const CopyrightToken = artifacts.require('CopyrightToken')
const MusereumToken = artifacts.require('MusereumToken')

// async function increaseTimeTo () {
//   return new Promise(resolve => {
//     setTimeout(resolve, 50)
//   })
// }

contract('MusicICO', function (accounts) {
  const beneficiary = web3.eth.accounts[0]
  const firstAccount = web3.eth.accounts[1]

  beforeEach(async function () {
    this.musicToken = await MusicToken.new()
    this.copyrightToken = await CopyrightToken.new()
    this.etmToken = await MusereumToken.new()

    this.startTime = latestTime() + duration.days(1)
    this.endTime = this.startTime + duration.weeks(1)

    this.crowdsale = await MusicICO.new(
      beneficiary,
      this.musicToken.address, this.copyrightToken.address, this.etmToken.address,
      this.startTime, this.endTime
    )
    this.musicToken.transferOwnership(this.crowdsale.address)
    this.copyrightToken.transferOwnership(this.crowdsale.address)

    // Transfer some ETM to additional account
    this.etmToken.transfer(firstAccount, 5000e18)
  })

  it('should approve and call', async function () {
    await increaseTimeTo(this.startTime)

    const investorCountBefore = await this.crowdsale.investorCount()
    const tokenReceivedBefore = await this.crowdsale.tokenReceived()
    const tokenCollectedBefore = await this.crowdsale.tokenCollected()
    const tokenDepositsBefore = await this.crowdsale.tokenDeposits.call(beneficiary)
    const balanceBefore = await this.etmToken.balanceOf(beneficiary)
    const balanceCrowdsaleBefore = await this.etmToken.balanceOf(this.crowdsale.address)

    await this.etmToken.transfer(this.crowdsale.address, 5000e18)

    const investorCountAfter = await this.crowdsale.investorCount()
    const tokenReceivedAfter = await this.crowdsale.tokenReceived()
    const tokenCollectedAfter = await this.crowdsale.tokenCollected()
    const tokenDepositsAfter = await this.crowdsale.tokenDeposits.call(beneficiary)
    const balanceAfter = await this.etmToken.balanceOf(beneficiary)
    const balanceCrowdsaleAfter = await this.etmToken.balanceOf(this.crowdsale.address)

    assert.equal(1, investorCountAfter.sub(investorCountBefore).toNumber())
    assert.equal(5000, tokenReceivedAfter.sub(tokenReceivedBefore).div(1e18).toNumber())
    assert.equal(5500, tokenCollectedAfter.sub(tokenCollectedBefore).div(1e18).toNumber()) // with 10% bonus
    assert.equal(5500, tokenDepositsAfter.sub(tokenDepositsBefore).div(1e18).toNumber()) // with 10% bonus
    assert.equal(-5000, balanceAfter.sub(balanceBefore).div(1e18).toNumber())
    assert.equal(5000, balanceCrowdsaleAfter.sub(balanceCrowdsaleBefore).div(1e18).toNumber())
  })

  it('should calculateBonusPercentage', async function () {
    await increaseTimeTo(this.startTime)

    let bonusPercentage

    // 0%
    bonusPercentage = await this.crowdsale.calculateBonusPercentage(4999e18) // 499$
    assert.equal(0, bonusPercentage.div(1e18).toNumber())

    // 10%
    bonusPercentage = await this.crowdsale.calculateBonusPercentage(5000e18) // 500$
    assert.equal(10, bonusPercentage.div(1e18).toNumber())
    bonusPercentage = await this.crowdsale.calculateBonusPercentage(9999e18) // 999$
    assert.equal(10, bonusPercentage.div(1e18).toNumber())

    // 20%
    bonusPercentage = await this.crowdsale.calculateBonusPercentage(10000e18) // 1000$
    assert.equal(20, bonusPercentage.div(1e18).toNumber())
    bonusPercentage = await this.crowdsale.calculateBonusPercentage(29999e18) // 2999$
    assert.equal(20, bonusPercentage.div(1e18).toNumber())

    // 30%
    bonusPercentage = await this.crowdsale.calculateBonusPercentage(30000e18) // 3000$
    assert.equal(30, bonusPercentage.div(1e18).toNumber())
    bonusPercentage = await this.crowdsale.calculateBonusPercentage(49999e18) // 4999$
    assert.equal(30, bonusPercentage.div(1e18).toNumber())

    // 40%
    bonusPercentage = await this.crowdsale.calculateBonusPercentage(50000e18) // 5000$
    assert.equal(40, bonusPercentage.div(1e18).toNumber())
    bonusPercentage = await this.crowdsale.calculateBonusPercentage(69999e18) // 6999$
    assert.equal(40, bonusPercentage.div(1e18).toNumber())
  })

  // it('should withdraw', async function () {
  //   await increaseTimeTo(this.startTime)
  //   await this.etmToken.transfer(this.crowdsale.address, 5000e18)
  //   await increaseTimeTo(this.endTime)

  //   const balanceBefore = await this.etmToken.balanceOf(beneficiary);

  //   await this.crowdsale.withdraw()

  //   const balanceAfter = await this.etmToken.balanceOf(beneficiary);
  //   const balanceCrowdsaleAfter = await this.etmToken.balanceOf(this.crowdsale.address);

  //   assert.equal(5000, balanceAfter.sub(balanceBefore).div(1e18).toNumber())
  //   assert.equal(0, balanceCrowdsaleAfter.div(1e18).toNumber())
  // })

  it('should user_redeem', async function () {
    await increaseTimeTo(this.startTime)
    await this.etmToken.transfer(this.crowdsale.address, 123e18)
    await this.etmToken.transfer(this.crowdsale.address, 877e18, {
      from: firstAccount
    })
    await increaseTimeTo(this.endTime)

    const balanceBefore = await this.etmToken.balanceOf(beneficiary)
    const musicBalanceBefore = await this.musicToken.balanceOf(beneficiary)
    const copyrightBalanceBefore = await this.copyrightToken.balanceOf(beneficiary)
    await this.crowdsale.user_redeem()

    const balanceAfter = await this.etmToken.balanceOf(beneficiary)
    const balanceCrowdsaleAfter = await this.etmToken.balanceOf(this.crowdsale.address)
    const musicBalanceAfter = await this.musicToken.balanceOf(beneficiary)
    const copyrightBalanceAfter = await this.copyrightToken.balanceOf(beneficiary)

    assert.equal(0, balanceAfter.sub(balanceBefore).div(1e18).toNumber())
    assert.equal(1000, balanceCrowdsaleAfter.div(1e18).toNumber())
    assert.equal(12300, musicBalanceAfter.sub(musicBalanceBefore).div(1e18).toNumber())
    assert.equal(12300, copyrightBalanceAfter.sub(copyrightBalanceBefore).div(1e18).toNumber())
  })

  it('should admin_redeem', async function () {
    await increaseTimeTo(this.startTime)
    await this.etmToken.transfer(this.crowdsale.address, 123e18)
    await this.etmToken.transfer(this.crowdsale.address, 877e18, {
      from: firstAccount
    })
    await increaseTimeTo(this.endTime)

    const balanceBefore = await this.etmToken.balanceOf(firstAccount)
    const musicBalanceBefore = await this.musicToken.balanceOf(firstAccount)
    const copyrightBalanceBefore = await this.copyrightToken.balanceOf(firstAccount)
    await this.crowdsale.admin_redeem(firstAccount)

    const balanceAfter = await this.etmToken.balanceOf(firstAccount)
    const balanceCrowdsaleAfter = await this.etmToken.balanceOf(this.crowdsale.address)
    const musicBalanceAfter = await this.musicToken.balanceOf(firstAccount)
    const copyrightBalanceAfter = await this.copyrightToken.balanceOf(firstAccount)

    assert.equal(0, balanceAfter.sub(balanceBefore).div(1e18).toNumber())
    assert.equal(1000, balanceCrowdsaleAfter.div(1e18).toNumber())
    assert.equal(87700, musicBalanceAfter.sub(musicBalanceBefore).div(1e18).toNumber())
    assert.equal(87700, copyrightBalanceAfter.sub(copyrightBalanceBefore).div(1e18).toNumber())
  })

  it('should finalizeIt', async function () {
    await increaseTimeTo(this.startTime)
    await this.etmToken.transfer(this.crowdsale.address, 123e18)
    await this.etmToken.transfer(this.crowdsale.address, 877e18, {
      from: firstAccount
    })
    await increaseTimeTo(this.endTime)
    await this.crowdsale.user_redeem()

    const balanceBefore = await this.etmToken.balanceOf(beneficiary)
    const copyrightOwnerBefore = await this.copyrightToken.owner()
    const musicOwnerBefore = await this.musicToken.owner()
    
    await this.crowdsale.finalizeIt(beneficiary)

    const balanceAfter = await this.etmToken.balanceOf(beneficiary)
    const musicOwnerAfter = await this.musicToken.owner()
    const copyrightOwnerAfter = await this.copyrightToken.owner()

    assert.equal(1000, balanceAfter.sub(balanceBefore).div(1e18).toNumber())
    assert.equal(this.crowdsale.address, copyrightOwnerBefore)
    assert.equal(this.crowdsale.address, musicOwnerBefore)
    assert.equal(beneficiary, musicOwnerAfter)
    assert.equal(beneficiary, copyrightOwnerAfter)
  })
})
