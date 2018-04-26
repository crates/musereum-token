import expectThrow from 'zeppelin-solidity/test/helpers/expectThrow'
import { toBytes } from './../utils'

const contract = global.contract || {}
// const describe = global.describe || {}
// const before = global.before || {}
// const after = global.after || {}
const it = global.it || {}
const assert = global.assert || {}
const artifacts = global.artifacts || {}

const MusereumToken = artifacts.require('./MusereumToken.sol')
const MockERC223Recipient = artifacts.require('./MockERC223Recipient.sol')
const Erc20DepositContract = artifacts.require('./Erc20DepositContract.sol')

contract('Token test', ([owner]) => {
  it('should create new instance of ETM token', async () => {
    await MusereumToken.new()
  })

  it('should create 110M tokens for creator', async () => {
    const instance = await MusereumToken.new()
    const balance = await instance.balanceOf(owner)
    // Should create 110M tokens for a owner
    assert.equal(110e6, balance.div(1e18).toNumber())
  })

  it('should execute recipient fallback', async () => {
    const instance = await MusereumToken.new()

    const recipient = await MockERC223Recipient.new(instance.address)
    await instance.transfer(recipient.address, 1000 * 1e18)
    const fallbackBalance = await recipient.balances(owner)
    assert.equal(1000, fallbackBalance.div(1e18).toNumber())
  })

  it('should allow to send tokens to Lykke deposit wallet', async () => {
    const instance = await MusereumToken.new()
    const lykke = await Erc20DepositContract.new()

    await instance.transfer(lykke.address, 1000 * 1e18)
    const lykkeBalance = await instance.balanceOf(lykke.address)

    assert.equal(1000, lykkeBalance.div(1e18).toNumber())
  })
})
