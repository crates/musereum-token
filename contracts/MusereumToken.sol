pragma solidity ^0.4.18;

import "./token/ApproveAndCallToken.sol";

contract MusereumToken is ApproveAndCallToken {
  string public constant name = "Musereum Token"; // solium-disable-line uppercase
  string public constant symbol = "ETM"; // solium-disable-line uppercase
  uint8 public constant decimals = 18; // solium-disable-line uppercase

  uint256 public constant INITIAL_SUPPLY = 110000000 * (10 ** uint256(decimals));

  function MusereumToken() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
    Transfer(0x0, msg.sender, INITIAL_SUPPLY);
  }
}