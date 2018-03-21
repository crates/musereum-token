pragma solidity ^0.4.18;
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "./TokenRecipient.sol";

contract MusereumToken is StandardToken {
  string public constant name = "Musereum Token"; // solium-disable-line uppercase
  string public constant symbol = "ETM"; // solium-disable-line uppercase
  uint8 public constant decimals = 18; // solium-disable-line uppercase

  uint256 public constant INITIAL_SUPPLY = 10000000 * (10 ** uint256(decimals));

  function MusereumToken() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
    Transfer(0x0, msg.sender, INITIAL_SUPPLY);
  }

  function approveAndCall(address _spender, uint _value, bytes _data) public returns (bool) {
    TokenRecipient spender = TokenRecipient(_spender);
    if (approve(_spender, _value)) {
      spender.receiveApproval(msg.sender, _value, address(this), _data);
      return true;
    }
    return false;
  }
}