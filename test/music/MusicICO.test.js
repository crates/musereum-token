import { increaseTimeTo, duration } from 'zeppelin-solidity/test/helpers/increaseTime'
import latestTime from 'zeppelin-solidity/test/helpers/latestTime'
import { first } from 'rxjs/operator/first';

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
const DistributeEther = artifacts.require('DistributeEther')

contract('MusicICO', function ([beneficiary, firstAccount, w1, w2, w3]) {
  beforeEach(async function () {
    this.musicToken = await MusicToken.new()
    this.copyrightToken = await CopyrightToken.new()

    this.startTime = latestTime() + duration.days(1)
    this.endTime = this.startTime + duration.weeks(1)

    this.crowdsaleDistribution = (await DistributeEther.new([w1, w2, w3], [5000, 3000, 2000])).address
    this.crowdsale = await MusicICO.new(
      this.crowdsaleDistribution,
      this.musicToken.address, this.copyrightToken.address,
      this.startTime, this.endTime
    )
    this.musicToken.transferOwnership(this.crowdsale.address)
    this.copyrightToken.transferOwnership(this.crowdsale.address)
  })

  it('should sell tokens', async function () {
    await increaseTimeTo(this.startTime)

    const investorCountBefore = await this.crowdsale.investorCount()
    const etherReceivedBefore = await this.crowdsale.etherReceived()
    const etherCollectedBefore = await this.crowdsale.etherCollected()
    const etherDepositsBefore = await this.crowdsale.etherDeposits.call(beneficiary)
    const balanceCrowdsaleBefore = await web3.eth.getBalance(this.crowdsaleDistribution)

    await this.crowdsale.buyTokens(beneficiary, {
      value: 1e18,
      from: beneficiary
    })

    const investorCountAfter = await this.crowdsale.investorCount()
    const etherReceivedAfter = await this.crowdsale.etherReceived()
    const etherCollectedAfter = await this.crowdsale.etherCollected()
    const etherDepositsAfter = await this.crowdsale.etherDeposits.call(beneficiary)
    const balanceCrowdsaleAfter = await web3.eth.getBalance(this.crowdsaleDistribution)

    assert.equal(1, investorCountAfter.sub(investorCountBefore).toNumber(), `incorrect investor count: got ${investorCountAfter.sub(investorCountBefore).toNumber()} expected 1`)
    assert.equal(1, etherReceivedAfter.sub(etherReceivedBefore).div(1e18).toNumber(), `incorrect etherReceived value: got ${etherReceivedAfter.sub(etherReceivedBefore).div(1e18).toNumber()} expected 1`)
    assert.equal(1.1, etherCollectedAfter.sub(etherCollectedBefore).div(1e18).toNumber(), `incorrect etherCollected value: got ${etherCollectedAfter.sub(etherCollectedBefore).div(1e18).toNumber()} expected 1.1`) // with 10% bonus
    assert.equal(1.1, etherDepositsAfter.sub(etherDepositsBefore).div(1e18).toNumber(), `incorrect etherDeposits value: got ${etherDepositsAfter.sub(etherDepositsBefore).div(1e18).toNumber()} expected 1.1`) // with 10% bonus
    assert.equal(1, balanceCrowdsaleAfter.sub(balanceCrowdsaleBefore).div(1e18).toNumber())

    await this.crowdsale.buyTokens(firstAccount, {
      value: 2e18,
      from: firstAccount
    })

    const investorCountAtEnd = await this.crowdsale.investorCount()
    const etherReceivedAtEnd = await this.crowdsale.etherReceived()
    const etherCollectedAtEnd = await this.crowdsale.etherCollected()
    const etherDepositsAtEnd = await this.crowdsale.etherDeposits.call(firstAccount)
    const balanceCrowdsaleAtEnd = await web3.eth.getBalance(this.crowdsaleDistribution)

    assert.equal(2, investorCountAtEnd.toNumber())
    assert.equal(3, etherReceivedAtEnd.sub(etherReceivedBefore).div(1e18).toNumber())
    assert.equal(1.1 + 2.4, etherCollectedAtEnd.sub(etherCollectedBefore).div(1e18).toNumber()) // with 20% bonus
    assert.equal(2.4, etherDepositsAtEnd.sub(etherDepositsBefore).div(1e18).toNumber()) // with 20% bonus
    assert.equal(3, balanceCrowdsaleAtEnd.sub(balanceCrowdsaleBefore).div(1e18).toNumber())

  })

  it('should calculateBonusPercentage', async function () {
    await increaseTimeTo(this.startTime)

    let bonusPercentage

    // 0%
    bonusPercentage = await this.crowdsale.calculateBonusPercentage(1e17) // 0.1 ETH -> 50$
    assert.equal(0, bonusPercentage.div(1e18).toNumber())

    // 10%
    bonusPercentage = await this.crowdsale.calculateBonusPercentage(1e18) // 1 ETH > 500$
    assert.equal(10, bonusPercentage.div(1e18).toNumber())
    bonusPercentage = await this.crowdsale.calculateBonusPercentage(1.9e18) // 1.9 ETH < 1000$
    assert.equal(10, bonusPercentage.div(1e18).toNumber())

    // 20%
    bonusPercentage = await this.crowdsale.calculateBonusPercentage(2e18) // 2 ETH > 1000$
    assert.equal(20, bonusPercentage.div(1e18).toNumber())
    bonusPercentage = await this.crowdsale.calculateBonusPercentage(5.9e18) // 2.9 ETH < 3000$
    assert.equal(20, bonusPercentage.div(1e18).toNumber())

    // 30%
    bonusPercentage = await this.crowdsale.calculateBonusPercentage(6e18) // 3 ETH > 3000$
    assert.equal(30, bonusPercentage.div(1e18).toNumber())
    bonusPercentage = await this.crowdsale.calculateBonusPercentage(9.9e18) // 9.9 ETH < 5000$
    assert.equal(30, bonusPercentage.div(1e18).toNumber())

    // 40%
    bonusPercentage = await this.crowdsale.calculateBonusPercentage(10e18) // 5000$
    assert.equal(40, bonusPercentage.div(1e18).toNumber())
  })

  it('should user_redeem', async function () {
    await increaseTimeTo(this.startTime)
    await this.crowdsale.buyTokens(beneficiary, {
      value: 123e18,
      from: beneficiary
    })
    await this.crowdsale.buyTokens(firstAccount, {
      value: 877e18,
      from: firstAccount
    })
    await increaseTimeTo(this.endTime)

    const musicBalanceBefore = await this.musicToken.balanceOf(beneficiary)
    const copyrightBalanceBefore = await this.copyrightToken.balanceOf(beneficiary)
    await this.crowdsale.user_redeem()

    const balanceCrowdsaleAfter = await web3.eth.getBalance(this.crowdsaleDistribution)
    const musicBalanceAfter = await this.musicToken.balanceOf(beneficiary)
    const copyrightBalanceAfter = await this.copyrightToken.balanceOf(beneficiary)

    assert.equal(1000, balanceCrowdsaleAfter.div(1e18).toNumber())
    assert.equal(12300, musicBalanceAfter.sub(musicBalanceBefore).div(1e18).toNumber())
    assert.equal(12300, copyrightBalanceAfter.sub(copyrightBalanceBefore).div(1e18).toNumber())
  })

  it('should admin_redeem', async function () {
    await increaseTimeTo(this.startTime)
    await this.crowdsale.buyTokens(beneficiary, {
      value: 123e18,
      from: beneficiary
    })
    await this.crowdsale.buyTokens(firstAccount, {
      value: 877e18,
      from: firstAccount
    })
    await increaseTimeTo(this.endTime)

    const musicBalanceBefore = await this.musicToken.balanceOf(firstAccount)
    const copyrightBalanceBefore = await this.copyrightToken.balanceOf(firstAccount)
    await this.crowdsale.admin_redeem(firstAccount)

    const musicBalanceAfter = await this.musicToken.balanceOf(firstAccount)
    const copyrightBalanceAfter = await this.copyrightToken.balanceOf(firstAccount)

    assert.equal(87700, musicBalanceAfter.sub(musicBalanceBefore).div(1e18).toNumber())
    assert.equal(87700, copyrightBalanceAfter.sub(copyrightBalanceBefore).div(1e18).toNumber())
  })

  it('should finalizeIt', async function () {
    await increaseTimeTo(this.startTime)
    await this.crowdsale.buyTokens(beneficiary, {
      value: 1e18,
      from: beneficiary,
      gasPrice: 0
    })
    await this.crowdsale.buyTokens(firstAccount, {
      value: 2e18,
      from: firstAccount,
      gasPrice: 0
    })
    await increaseTimeTo(this.endTime)
    await this.crowdsale.user_redeem()

    const copyrightOwnerBefore = await this.copyrightToken.owner()
    const musicOwnerBefore = await this.musicToken.owner()

    await this.crowdsale.finalizeIt(beneficiary)

    const balance = await web3.eth.getBalance(this.crowdsaleDistribution)
    const musicOwnerAfter = await this.musicToken.owner()
    const copyrightOwnerAfter = await this.copyrightToken.owner()

    assert.equal(3, balance.div(1e18).toNumber())
    assert.equal(this.crowdsale.address, copyrightOwnerBefore)
    assert.equal(this.crowdsale.address, musicOwnerBefore)
    assert.equal(beneficiary, musicOwnerAfter)
    assert.equal(beneficiary, copyrightOwnerAfter)
  })
})
