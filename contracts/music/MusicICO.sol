pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./MusicToken.sol";
import "./CopyrightToken.sol";
import "./../MusereumToken.sol";
import "./../TokenRecipient.sol";

contract MusicICO is TokenRecipient, Ownable {
  using SafeMath for uint;

  string public constant name = "Music Token ICO";

  // TODO: change it
  uint public constant dust = 180 finney;
  uint public constant tokensCap = 100000 * (10 ** uint256(18));
  uint public constant priceUsd = 10 ether; // 10 cent

  address public beneficiary;
  MusicToken public musicToken;
  CopyrightToken public copyrightToken;
  MusereumToken public musereumToken;
  uint public startTime;
  uint public endTime;

  uint public investorCount;
  uint public tokenReceived;
  uint public tokenCollected;
  mapping (address => uint) public tokenDeposits;
  

  event Received(address _from, uint _tokens);
  event Collected(address _from, uint _tokens);
  event Redeemed(address _from, uint _tokens);

  modifier only_during_period {require(block.timestamp >= startTime && block.timestamp < endTime); _;}
  modifier only_after_period { require(block.timestamp >= endTime); _; }
  modifier is_not_dust(uint _value) {require(_value >= dust); _;}

  function MusicICO(
    address _beneficiary,

    address _musicToken,
    address _copyrightToken,
    address _musereumToken,

    uint _startTime,
    uint _endTime
  ) public {
    beneficiary = _beneficiary;

    musicToken = MusicToken(_musicToken);
    copyrightToken = CopyrightToken(_copyrightToken);
    musereumToken = MusereumToken(_musereumToken);

    startTime = _startTime;
    endTime = _endTime;
  }

  /**
    * Fallback function
    * Preventing someone to send ether to this contract
    */
  function () public payable {
    require(false);
  }

  function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) 
    public only_during_period is_not_dust(_value)
  {
    _extraData;
    require(_token == address(musereumToken));

    uint bonus = calculateBonusPercentage(_value);
    uint tokens = _value;
    if (bonus > 0) {
      // Use 100 ether and ether because we don't want loose percision
      tokens = tokens.add(tokens.mul(bonus).div(100 ether)); // tokens + tokens * 0.(bonus percentage)
    }

    MusereumToken(_token).transferFrom(_from, address(this), _value);

    if (tokenDeposits[_from] == 0) investorCount = investorCount.add(1);
    tokenReceived = tokenReceived.add(_value);
    tokenCollected = tokenCollected.add(tokens);
    tokenDeposits[_from] = tokenDeposits[_from].add(tokens);

    Received(_from, _value);
    Collected(_from, tokens);
  }

  function calculateBonusPercentage(uint tokens) 
    internal pure returns (uint bonus) 
  {
    uint tokensUsd = tokens.div(100 ether).mul(priceUsd);
    bonus = 0;

    // from $500 + 10%
    if (tokensUsd >= 500 ether && tokensUsd < 1000 ether) {
      bonus = 10 ether;
    // from $1000 + 20%
    } else if (tokensUsd >= 1000 ether && tokensUsd < 3000 ether) {
      bonus = 20 ether;
    // from $3000 + 30%
    } else if (tokensUsd >= 3000 ether && tokensUsd < 5000 ether) {
      bonus = 30 ether;
    // from $5000 + 40%
    } else if (tokensUsd >= 5000 ether) {
      bonus = 40 ether;
    } 
    return bonus;
  }

  function redeem() public only_after_period {
    require(tokenDeposits[msg.sender] > 0);

    uint percentage = tokenDeposits[msg.sender].mul(100 ether).div(tokenCollected);
    uint tokens = tokensCap.mul(percentage).div(100 ether); // tokenCollected * 0.(percentage)

    musicToken.mint(msg.sender, tokens);
    copyrightToken.mint(msg.sender, tokens);
    tokenDeposits[msg.sender] = 0;

    Redeemed(msg.sender, tokens);
  }

  // function withdraw() public only_after_period onlyOwner {
  //   musereumToken.transfer(beneficiary, musereumToken.balanceOf(this));
  // }

  function finalizeIt(address _newOwner) public only_after_period onlyOwner {
    require(_newOwner != 0x0);

    musereumToken.transfer(beneficiary, musereumToken.balanceOf(this));

    musicToken.transferOwnership(_newOwner);
    copyrightToken.transferOwnership(_newOwner);
  }
}

