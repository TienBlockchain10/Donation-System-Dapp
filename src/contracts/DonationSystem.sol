// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DonationSystem is Ownable {
    string private systemName;
    uint public totalDonations;

    mapping(address => uint) private donations;
    address[] private donors;

    event DonationReceived(address indexed donor, uint amount);
    event SystemNameChanged(string newName);
    event SystemBalanceChanged(uint newBalance);
    event FundsWithdrawn(uint amount);


constructor(string memory _systemName, address initialOwner) Ownable(initialOwner) {
    setSystemName(_systemName);
}



    function donateMoney() external payable {
        require(msg.value > 0, "You need to send some ether");
        if(donations[msg.sender] == 0) {
            donors.push(msg.sender); // Track new donor
        }
        donations[msg.sender] += msg.value;
        totalDonations += msg.value;
        emit DonationReceived(msg.sender, msg.value);
        emit SystemBalanceChanged(address(this).balance);
    }

    function withdrawAllToOwner() external onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
        emit FundsWithdrawn(balance);
        emit SystemBalanceChanged(0);
    }

    function setSystemName(string memory _name) public onlyOwner {
        systemName = _name;
        emit SystemNameChanged(_name);
    }

    function getSystemBalance() public view returns (uint) {
        return address(this).balance;
    }

    function SystemName() public view returns (string memory) {
        return systemName;
    }

    function SystemOwner() public view returns (address) {
        return owner();
    }

    function getdonorBalances() public view returns (uint) {
        return donations[msg.sender];
    }

    function getAllDonatedAddresses() public view onlyOwner returns (address[] memory) {
        return donors;
    }

    function getAllDonationAmounts() public view onlyOwner returns (uint[] memory) {
        uint[] memory amounts = new uint[](donors.length);
        for (uint i = 0; i < donors.length; i++) {
            amounts[i] = donations[donors[i]];
        }
        return amounts;
    }
}
