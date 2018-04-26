pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract MusicToken is MintableToken {
  string public constant name = "Musereum Music Token"; // solium-disable-line uppercase
  string public constant symbol = "EMT"; // solium-disable-line uppercase
  uint8 public constant decimals = 18; // solium-disable-line uppercase
}