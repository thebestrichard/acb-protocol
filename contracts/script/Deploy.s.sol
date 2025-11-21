// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CreditScore.sol";
import "../src/CreditPool.sol";
import "../src/LoanManager.sol";

/**
 * @title Deploy
 * @dev Deployment script for ACB Protocol contracts
 * 
 * Usage:
 * forge script contracts/script/Deploy.s.sol:Deploy --rpc-url base_sepolia --broadcast --verify
 */
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy CreditScore contract
        CreditScore creditScore = new CreditScore();
        console.log("CreditScore deployed at:", address(creditScore));
        
        // Deploy CreditPool contract
        CreditPool creditPool = new CreditPool(address(creditScore));
        console.log("CreditPool deployed at:", address(creditPool));
        
        // Deploy LoanManager contract
        LoanManager loanManager = new LoanManager(
            address(creditPool),
            address(creditScore)
        );
        console.log("LoanManager deployed at:", address(loanManager));
        
        // Transfer ownership of CreditPool and CreditScore to LoanManager
        creditPool.transferOwnership(address(loanManager));
        creditScore.transferOwnership(address(loanManager));
        
        console.log("Ownership transferred to LoanManager");
        
        vm.stopBroadcast();
        
        // Log deployment addresses
        console.log("\n=== Deployment Summary ===");
        console.log("CreditScore:", address(creditScore));
        console.log("CreditPool:", address(creditPool));
        console.log("LoanManager:", address(loanManager));
        console.log("========================\n");
    }
}
