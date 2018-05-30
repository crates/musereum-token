pragma solidity ^0.4.24;
import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract DistributeEther {
    using SafeMath for uint;

    /// @notice Map of recipients parts of total received tokens
    /// @dev Should be in range of 1 to 10000 (1 is 0.01% and 10000 is 100%)
    mapping(address => uint) public shares;

    /// @notice Map of total values at moment of latest withdrawal per each recipient
    mapping(address => uint) public totalAtWithdrawal;

    /// @notice Total amount of received token on smart-contract
    uint public totalReceived;

    /// @notice Construction method of Extra Holding contract
    /// @dev Arrays of recipients and their share parts should be equal and not empty
    /// @dev Sum of all shares should be exact equal to 10000
    /// @param _recipients is array of recipients
    /// @param _partions is array of recipients shares
    constructor(address[] _recipients, uint[] _partions)
    public
    {
        require(_recipients.length > 0);
        require(_recipients.length == _partions.length);

        uint ensureFullfield;

        for(uint index = 0; index < _recipients.length; index++) {
            // overflow check isn't required.. I suppose :D
            ensureFullfield = ensureFullfield + _partions[index];
            require(_partions[index] > 0);
            require(_recipients[index] != address(0x0));

            shares[_recipients[index]] = _partions[index];
        }

        // Require to setup exact 100% sum of partions
        require(ensureFullfield == 10000);
    }

    function () payable public {
        totalReceived = totalReceived.add(msg.value);
    }

    /// @notice Method to withdraw shared part of received tokens for providen address
    /// @dev Any address could fire method, but only for known recipient
    /// @param _recipient address of recipient who should receive withdrawed tokens
    function withdraw(address _recipient)
    public returns (bool) 
    {
        require(shares[_recipient] > 0);
        require(totalAtWithdrawal[_recipient] < totalReceived);
        uint left = totalReceived.sub(totalAtWithdrawal[_recipient]);
        uint share = left.mul(shares[_recipient]).div(10000);
        totalAtWithdrawal[_recipient] = totalReceived;
        require(_recipient.call.value(share)());
        return true;
    }
}