// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CreditScore.sol";
import "../src/CreditPoolV2.sol";
import "../src/LoanManager.sol";
import "../src/MatchingEngine.sol";

/**
 * @title DeployAll
 * @dev Comprehensive deployment script for all ACB Protocol contracts
 */
contract DeployAll is Script {
    // Deployment addresses will be saved here
    CreditScore public creditScore;
    CreditPoolV2 public creditPool;
    LoanManager public loanManager;
    MatchingEngine public matchingEngine;
    
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy CreditScore
        console.log("\n=== Deploying CreditScore ===");
        creditScore = new CreditScore();
        console.log("CreditScore deployed at:", address(creditScore));
        
        // 2. Deploy CreditPoolV2
        console.log("\n=== Deploying CreditPoolV2 ===");
        creditPool = new CreditPoolV2(address(creditScore));
        console.log("CreditPoolV2 deployed at:", address(creditPool));
        
        // 3. Deploy LoanManager
        console.log("\n=== Deploying LoanManager ===");
        loanManager = new LoanManager(
            address(creditScore),
            address(creditPool)
        );
        console.log("LoanManager deployed at:", address(loanManager));
        
        // 4. Deploy MatchingEngine
        console.log("\n=== Deploying MatchingEngine ===");
        matchingEngine = new MatchingEngine(
            address(creditScore),
            address(creditPool)
        );
        console.log("MatchingEngine deployed at:", address(matchingEngine));
        
        // 5. Configure contracts
        console.log("\n=== Configuring Contracts ===");
        
        // Set LoanManager in CreditPool
        creditPool.setLoanManager(address(loanManager));
        console.log("LoanManager set in CreditPool");
        
        // Transfer CreditScore ownership to MatchingEngine for settlement
        creditScore.transferOwnership(address(matchingEngine));
        console.log("CreditScore ownership transferred to MatchingEngine");
        
        vm.stopBroadcast();
        
        // 6. Print deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("Network: Base Sepolia");
        console.log("Deployer:", deployer);
        console.log("\nContract Addresses:");
        console.log("-------------------");
        console.log("CreditScore:     ", address(creditScore));
        console.log("CreditPoolV2:    ", address(creditPool));
        console.log("LoanManager:     ", address(loanManager));
        console.log("MatchingEngine:  ", address(matchingEngine));
        
        console.log("\n=== Next Steps ===");
        console.log("1. Verify contracts on BaseScan:");
        console.log("   forge verify-contract <address> <contract> --chain base-sepolia");
        console.log("\n2. Update frontend config with these addresses");
        console.log("\n3. Initialize credit scores for test users");
        console.log("\n4. Add initial liquidity to the pool");
        
        // Save deployment addresses to file
        string memory deploymentInfo = string(abi.encodePacked(
            "# ACB Protocol Deployment\n\n",
            "**Network:** Base Sepolia\n",
            "**Deployer:** ", vm.toString(deployer), "\n",
            "**Timestamp:** ", vm.toString(block.timestamp), "\n\n",
            "## Contract Addresses\n\n",
            "- **CreditScore:** `", vm.toString(address(creditScore)), "`\n",
            "- **CreditPoolV2:** `", vm.toString(address(creditPool)), "`\n",
            "- **LoanManager:** `", vm.toString(address(loanManager)), "`\n",
            "- **MatchingEngine:** `", vm.toString(address(matchingEngine)), "`\n\n",
            "## Verification Commands\n\n",
            "```bash\n",
            "forge verify-contract ", vm.toString(address(creditScore)), " CreditScore --chain base-sepolia --watch\n",
            "forge verify-contract ", vm.toString(address(creditPool)), " CreditPoolV2 --chain base-sepolia --watch --constructor-args $(cast abi-encode \"constructor(address)\" ", vm.toString(address(creditScore)), ")\n",
            "forge verify-contract ", vm.toString(address(loanManager)), " LoanManager --chain base-sepolia --watch --constructor-args $(cast abi-encode \"constructor(address,address)\" ", vm.toString(address(creditScore)), " ", vm.toString(address(creditPool)), ")\n",
            "forge verify-contract ", vm.toString(address(matchingEngine)), " MatchingEngine --chain base-sepolia --watch --constructor-args $(cast abi-encode \"constructor(address,address)\" ", vm.toString(address(creditScore)), " ", vm.toString(address(creditPool)), ")\n",
            "```\n"
        ));
        
        vm.writeFile("deployment-addresses.md", deploymentInfo);
        console.log("\nDeployment info saved to: deployment-addresses.md");
    }
}
