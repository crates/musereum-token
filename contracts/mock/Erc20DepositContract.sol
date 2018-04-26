pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol";

contract Erc20DepositContract {
    
    address public _owner = msg.sender;

    modifier onlyOwner { 
        if (msg.sender == _owner) {
            _;
        }
    }

	function() public payable {
		throw;
	}

    function transferAllTokens(address _tokenAddress, address _to) onlyOwner public returns (bool success) {
        
        ERC20Basic erc20Contract = ERC20Basic(_tokenAddress);
        uint balance = erc20Contract.balanceOf(this); 

        if (balance <= 0 || _to == address(this)) {
            return false;
        }

        return erc20Contract.transfer(_to, balance);
    }

    //Add compatibility for erc223 contract reciever
    function tokenFallback(address _from, uint _value, bytes _data) public pure returns(bool ok) {
        return true;
    }
}