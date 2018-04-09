import expectThrow from 'zeppelin-solidity/test/helpers/expectThrow'
import { toBytes } from './../utils'

const MusereumToken = artifacts.require('./MusereumToken.sol')
const MockRecipient = artifacts.require('./MockRecipient.sol')

contract('Token test', accounts => {
  const [owner] = accounts

  it('should create new instance of ETM token', async () => {
    const instance = await MusereumToken.new()
  })

  it('should create 10M tokens for creator', async () => {
    const instance = await MusereumToken.new()
    
    const balance = await instance.balanceOf(owner)
    assert.equal(10e6, balance.div(1e18).toString(10))
  })

  it('should call recipient method', async () => {
    const instance = await MusereumToken.new()

    const recipient = await MockRecipient.new(instance.address)
    const recipientFail = await MockRecipient.new(owner)

    await instance.approveAndCall(recipient.address, 1000 * 1e18, toBytes(100))
    await expectThrow(instance.approveAndCall(recipientFail.address, 1000 * 1e18, toBytes(100)))
  })
})
