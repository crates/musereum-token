pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import './ERC223Recipient.sol';

contract ERC223Token is StandardToken {
  event TransferWithData(address indexed from, address indexed to, uint256 value, bytes data);
  
  // Function that is called when a user or another contract wants to transfer funds .
  function transfer(address _to, uint _value, bytes _data, string _custom_fallback) public returns (bool) {
    if(isContract(_to)) {
      require(transferBalance(_to, _value));
      assert(_to.call.value(0)(bytes4(keccak256(_custom_fallback)), msg.sender, _value, _data));
      Transfer(msg.sender, _to, _value);
      
      if (_data.length > 0) {
        TransferWithData(msg.sender, _to, _value, _data);
      }

      return true;
    } else {
      return transferToAddress(_to, _value, _data);
    }
  }
  // Function that is called when a user or another contract wants to transfer funds .
  function transfer(address _to, uint _value, bytes _data) public returns (bool) {
    if(isContract(_to)) {
      return transferToContract(_to, _value, _data);
    } else {
      return transferToAddress(_to, _value, _data);
    }
  }

  // Standard function transfer similar to ERC20 transfer with no _data .
  // Added due to backwards compatibility reasons .
  function transfer(address _to, uint _value) public returns (bool) {      
    //standard function transfer similar to ERC20 transfer with no _data
    //added due to backwards compatibility reasons
    bytes memory empty;
    if(isContract(_to)) {
      return transferToContract(_to, _value, empty);
    } else {
      return transferToAddress(_to, _value, empty);
    }
  }
  //assemble the given address bytecode. If bytecode exists then the _addr is a contract.
  function isContract(address _addr) internal view returns (bool) {
    uint length;
    assembly {
      //retrieve the size of the code on target address, this needs assembly
      length := extcodesize(_addr)
    }
    return length > 0;
  }

  //function that is called when transaction target is an address
  function transferToAddress(address _to, uint _value, bytes _data) internal returns (bool success) {
    require(transferBalance(_to, _value));
    Transfer(msg.sender, _to, _value);

    if (_data.length > 0) {
      TransferWithData(msg.sender, _to, _value, _data);
    }

    return true;
  }
  
  //function that is called when transaction target is a contract
  function transferToContract(address _to, uint _value, bytes _data) internal returns (bool success) {
    require(transferBalance(_to, _value));
    ERC223Recipient receiver = ERC223Recipient(_to);
    receiver.tokenFallback(msg.sender, _value, _data);
    Transfer(msg.sender, _to, _value);

    if (_data.length > 0) {
      TransferWithData(msg.sender, _to, _value, _data);
    }

    return true;
  }

  function transferBalance(address _to, uint _value) internal returns (bool) {
    require(_to != address(0x0));
    require(_value <= balanceOf(msg.sender));
    balances[msg.sender] = balanceOf(msg.sender).sub(_value);
    balances[_to] = balanceOf(_to).add(_value);
    return true;
  }
}