pragma solidity ^0.4.18;

import "../token/ERC223Recipient.sol";

contract MockERC223Recipient is ERC223Recipient {
  address public allowedToken;

  mapping (address => uint) public balances;

  event Fallback(address indexed sender, address indexed from, uint value, bytes data);

  function MockERC223Recipient(address _token) public {
    allowedToken = _token;
  }

  function tokenFallback(address _from, uint256 _value, bytes _data) public {
    // _data;
    require(msg.sender == allowedToken);
    balances[_from] = balances[_from] + _value;
    Fallback(msg.sender, _from, _value, _data);
  }
}