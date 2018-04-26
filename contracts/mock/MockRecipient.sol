pragma solidity ^0.4.18;

import "../token/TokenRecipient.sol";

contract MockRecipient is TokenRecipient {
  address public allowedToken;

  function MockRecipient(address _token) public {
    allowedToken = _token;
  }

  function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) public {
    require(_token == allowedToken);
  }
}