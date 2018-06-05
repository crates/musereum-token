pragma solidity 0.4.24;

import './DistributeEther.sol';

contract ToTheMoonDistribution is DistributeEther {
  address[] private recipients = [
    // McAfee
    address(0x0),
    // Artists
    address(0x0),
    // Marketing
    address(0x0),
    // Musereum
    address(0x0),
    // Dev
    address(0x0)
  ];

  uint[] private partions = [
    5000, // mcafee
    2500, // artists
    800,  // marketing
    1200, // musereum
    500   // dev
  ];

  constructor() DistributeEther(recipients, partions) public {}
}