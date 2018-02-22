import expectThrow from 'zeppelin-solidity/test/helpers/expectThrow'

const ETM = artifacts.require('./ETM.sol')
const MockRecipient = artifacts.require('./MockRecipient.sol')

function numberToBytearray (long, size) {
  // we want to represent the input as a 8-bytes array
  const byteArray = Array(size).fill(0)

  for (let index = byteArray.length - 1; index >= 0; index--) {
    let byte = long & 0xff
    byteArray[index] = byte
    long = (long - byte) / 256
  }

  return byteArray
}
function toHex (bytes) {
  let out = '0x'
  for (let index = 0; index < bytes.length; index++) {
    let byte = bytes[index]
    out += ('00' + (byte & 0xFF).toString(16)).slice(-2)
  }
  return out
}

function toBytes (bn) {
  return toHex(numberToBytearray(typeof bn === 'object' ? bn.toNumber() : bn, 32))
}

function hexToBytes (hexString) {
  let out = []
  for (let index = 2; index < hexString.length; index += 2) {
    out.push(`0x${hexString[index]}${hexString[index + 1]}`)
  }

  return out
}

contract('Token test', accounts => {
  const [owner] = accounts
  let etm

  it('should create new instance of ETM token', async () => {
    etm = await ETM.new()
  })

  it('should create 10M tokens for creator', async () => {
    const balance = await etm.balanceOf(owner)
    console.log(balance.div(1e18).toString(10))
    assert.equal(10e6, balance.div(1e18).toString(10))
  })

  it('should call recipient method', async () => {
    const recipient = await MockRecipient.new(etm.address)
    const recipientFail = await MockRecipient.new(owner)

    await etm.approveAndCall(recipient.address, 1000 * 1e18, toBytes(100))
    await expectThrow(etm.approveAndCall(recipientFail.address, 1000 * 1e18, toBytes(100)))
  })
})
