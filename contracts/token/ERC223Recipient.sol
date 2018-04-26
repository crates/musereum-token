pragma solidity ^0.4.18;

contract ERC223Recipient {
  function tokenFallback(address _token, uint256 _value, bytes _data) public;
}