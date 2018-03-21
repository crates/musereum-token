pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./MusicToken.sol";
import "./../TokenRecipient.sol";

contract MusicICO is TokenRecipient {
  using SafeMath for uint;

  string public constant name = "Music Token ICO";

  MusicToken public token;

  function MusicICO(
    address _token
  ) public {
    token = MusereumToken(_token);
  }

  function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) public {
    require (_token == address(token));

    MusicToken(_token).transferFrom(_from, address(this), _value);
    // TODO: Give MusereumToken
  }

  /**
    * Fallback function
    * Preventing someone to send ether to this contract
    */
  function () public payable {
    require(false);
  }
}

