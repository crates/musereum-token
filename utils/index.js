export const numberToBytearray = (long, size) => {
  // we want to represent the input as a 8-bytes array
  const byteArray = Array(size).fill(0)

  for (let index = byteArray.length - 1; index >= 0; index--) {
    let byte = long & 0xff
    byteArray[index] = byte
    long = (long - byte) / 256
  }

  return byteArray
}

export const toHex = (bytes) => {
  let out = '0x'
  for (let index = 0; index < bytes.length; index++) {
    let byte = bytes[index]
    out += ('00' + (byte & 0xFF).toString(16)).slice(-2)
  }
  return out
}

export const toBytes = (bn) => {
  return toHex(numberToBytearray(typeof bn === 'object' ? bn.toNumber() : bn, 32))
}

export const hexToBytes = (hexString) => {
  let out = []
  for (let index = 2; index < hexString.length; index += 2) {
    out.push(`0x${hexString[index]}${hexString[index + 1]}`)
  }

  return out
}

// https://github.com/OpenZeppelin/zeppelin-solidity/blob/dd1fd0002ad6b72c917db9e1fadb2938df96c398/test/helpers/latestTime.js#L1
export const latestTime = () => {
  return web3.eth.getBlock('latest').timestamp;
}

// https://github.com/OpenZeppelin/zeppelin-solidity/blob/dd1fd0002ad6b72c917db9e1fadb2938df96c398/test/helpers/increaseTime.js#L3
export const increaseTime = (duration) => {
  const id = Date.now()

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [duration],
      id: id,
    }, err1 => {
      if (err1) return reject(err1)

      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: id+1,
      }, (err2, res) => {
        return err2 ? reject(err2) : resolve(res)
      })
    })
  })
}

// https://github.com/OpenZeppelin/zeppelin-solidity/blob/dd1fd0002ad6b72c917db9e1fadb2938df96c398/test/helpers/increaseTime.js#L27
export const increaseTimeTo = (target) => {
  let now = latestTime();
  if (target < now) throw Error(`Cannot increase current time(${now}) to a moment in the past(${target})`);
  let diff = target - now;
  return increaseTime(diff);
}

// https://github.com/OpenZeppelin/zeppelin-solidity/blob/c05918c3cc10d9394fd5fb95deb04036204ac896/test/helpers/increaseTime.js#L41
export const duration = {
  seconds: function (val) { return val; },
  minutes: function (val) { return val * this.seconds(60); },
  hours: function (val) { return val * this.minutes(60); },
  days: function (val) { return val * this.hours(24); },
  weeks: function (val) { return val * this.days(7); },
  years: function (val) { return val * this.days(365); },
};