pragma solidity 0.4.24;

import './DistributeEther.sol';

contract ToTheMoonDistribution is DistributeEther {
  address[] private recipients = [
    // Artists
    address(0x0),
    // McAfee
    address(0x0),
    // Marketing
    address(0x0),
    // Musereum
    address(0x0)
  ];

  uint[] private partions = [
    5000,
    2500,
    700,
    1200
  ];

  constructor() DistributionEther(recipients, partions) public {}
}