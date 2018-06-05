pragma solidity ^0.4.24;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract MusicICO is Ownable {
    using SafeMath for uint;

    string public constant name = "Music Token ICO";

    // TODO: change it
    uint public constant dust = 50 finney; // 50$
    uint public constant tokensCap = 100000 * (10 ** uint256(18));
    uint public constant priceUsd = 50000; // 1 ETH -> 500$ 

    address public beneficiary;
    MintableToken public musicToken;
    MintableToken public copyrightToken;
    uint public startTime;
    uint public endTime;

    uint public investorCount;
    uint public etherReceived;
    uint public etherCollected;
    mapping (address => uint) public etherDeposits;
    

    event Received(address _from, uint _value);
    event Collected(address _from, uint _value);
    event Redeemed(address _from, uint _tokens);
    event Finalized(address _newOwner);

    modifier only_during_period {require(block.timestamp >= startTime && block.timestamp < endTime); _;}
    modifier only_after_period { require(block.timestamp >= endTime); _; }
    modifier is_not_dust(uint _value) {require(_value >= dust); _;}

    constructor(
        address _beneficiary,

        address _musicToken,
        address _copyrightToken,

        uint _startTime,
        uint _endTime
    ) public {
        beneficiary = _beneficiary;
        musicToken = MintableToken(_musicToken);
        copyrightToken = MintableToken(_copyrightToken);
        startTime = _startTime;
        endTime = _endTime;
    }

    /**
      * Fallback function
      * Preventing someone to send ether to this contract
      */
    function() public payable {
        buyTokens(msg.sender);
    }

    function buyTokens(address buyer) public payable only_during_period is_not_dust(msg.value) {
        uint bonus = calculateBonusPercentage(msg.value);
        uint value = msg.value;
        if (bonus > 0) {
            // Use 100 ether and ether because we don't want loose percision
            value = value.add(value.mul(bonus).div(100 ether)); // value + value * 0.(bonus percentage)
        }

        if (etherDeposits[buyer] == 0) {
            investorCount = investorCount.add(1);
        }
        etherReceived = etherReceived.add(msg.value);
        etherCollected = etherCollected.add(value);
        etherDeposits[buyer] = etherDeposits[buyer].add(value);

        emit Received(buyer, msg.value);
        emit Collected(buyer, value);

        require(beneficiary.call.value(msg.value)());
    }

    function calculateBonusPercentage(uint value) 
        public pure returns (uint bonus) 
    {
        uint valueUsd = value.mul(priceUsd);

        // 5000$ -> 40% bonus
        if (valueUsd >= 500000 ether) {
            return 40 ether;
        }

        // 3000$ -> 30% bonus
        if (valueUsd >= 300000 ether) {
            return 30 ether;
        }

        // 1000$ -> 20% bonus
        if (valueUsd >= 100000 ether) { 
            return 20 ether;
        }

        // 500$ -> 10% bonus
        if (valueUsd >= 50000 ether) {
            return 10 ether;
        }
        
        return 0;
    }

    function admin_redeem(address _to) public only_after_period onlyOwner {
        redeem(_to);
    }

    function user_redeem() public only_after_period {
        redeem(msg.sender);
    }

    function redeem(address _from) internal {
        require(etherDeposits[_from] > 0);

        uint percentage = etherDeposits[_from].mul(100 ether).div(etherCollected);
        uint tokens = tokensCap.mul(percentage).div(100 ether); // etherCollected * 0.(percentage)

        musicToken.mint(_from, tokens);
        copyrightToken.mint(_from, tokens);
        etherDeposits[_from] = 0;

        emit Redeemed(_from, tokens);
    }

    function finalizeIt(address _newOwner) public only_after_period onlyOwner {
        require(_newOwner != 0x0);
        musicToken.transferOwnership(_newOwner);
        copyrightToken.transferOwnership(_newOwner);

        emit Finalized(_newOwner);
    }
}

