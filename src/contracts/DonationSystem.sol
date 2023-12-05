// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Importing the Ownable contract from OpenZeppelin contracts which provides basic authorization control
import "@openzeppelin/contracts/access/Ownable.sol";

// The DonationSystem contract inherits the Ownable contract, allowing for owner-specific functionality
contract DonationSystem is Ownable {
    // Private state variable to store the name of the system
    string private systemName;
    // Public state variable to store the total amount of donations received
    uint public totalDonations;

    // Mapping to track each address's donations
    mapping(address => uint) private donations;
    // Dynamic array to store all donor addresses
    address[] private donors;

    // Events to log actions to the blockchain for front-end applications to react accordingly
    event DonationReceived(address indexed donor, uint amount);
    event SystemNameChanged(string newName);
    event SystemBalanceChanged(uint newBalance);
    event FundsWithdrawn(uint amount);

    // Constructor sets the initial system name and the owner of the contract
    constructor(
        string memory _systemName,
        address initialOwner
    ) Ownable(initialOwner) {
        setSystemName(_systemName);
    }

    // Function to accept donations. It is marked 'external' so it can only be called from outside the contract
    // and 'payable' to allow it to receive Ether
    function donateMoney() external payable {
        require(msg.value > 0, "You need to send some ether");
        if (donations[msg.sender] == 0) {
            // If this is the first donation from this address, add it to the donors array
            donors.push(msg.sender);
        }
        // Update the donation amount for the sender
        donations[msg.sender] += msg.value;
        // Increase the total amount of donations
        totalDonations += msg.value;
        // Emit an event for the donation
        emit DonationReceived(msg.sender, msg.value);
        // Emit an event for the change in system's balance
        emit SystemBalanceChanged(address(this).balance);
    }

    // Function to allow the owner to withdraw all funds from the contract
    function withdrawAllToOwner() external onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
        // Emit an event for the withdrawal
        emit FundsWithdrawn(balance);
        // Emit an event for the balance change, which is now zero after withdrawal
        emit SystemBalanceChanged(0);
    }

    // Function to set the system name, only callable by the owner
    function setSystemName(string memory _name) public onlyOwner {
        systemName = _name;
        emit SystemNameChanged(_name);
    }

    // Function to get the system balance
    function getSystemBalance() public view returns (uint) {
        return address(this).balance;
    }

    // Function to get the system name
    function SystemName() public view returns (string memory) {
        return systemName;
    }

    // Function to get the owner of the system
    function SystemOwner() public view returns (address) {
        return owner();
    }

    // Function to get the donor balance for the caller
    function getdonorBalances() public view returns (uint) {
        return donations[msg.sender];
    }

    // Function to retrieve all donor addresses, only callable by the owner
    function getAllDonatedAddresses()
        public
        view
        onlyOwner
        returns (address[] memory)
    {
        return donors;
    }

    // Function to retrieve all donation amounts, only callable by the owner
    // This function could potentially run out of gas if there are many donors, due to the loop
    function getAllDonationAmounts()
        public
        view
        onlyOwner
        returns (uint[] memory)
    {
        uint[] memory amounts = new uint[](donors.length);
        for (uint i = 0; i < donors.length; i++) {
            amounts[i] = donations[donors[i]];
        }
        return amounts;
    }
}
