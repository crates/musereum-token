pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/token/StandardToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract MusicToken is StandardToken, Ownable {
  string public constant name = "Music Token"; // solium-disable-line uppercase
  string public constant symbol = "EMT"; // solium-disable-line uppercase
  uint8 public constant decimals = 18; // solium-disable-line uppercase

  uint256 public constant INITIAL_SUPPLY = 35000000 * (10 ** uint256(decimals));

  function MusicToken() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
    Transfer(0x0, msg.sender, INITIAL_SUPPLY);
  }
}