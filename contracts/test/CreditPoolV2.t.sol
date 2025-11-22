// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CreditPoolV2.sol";
import "../src/CreditScore.sol";

/**
 * @title CreditPoolV2 Security Tests
 * @dev Comprehensive security testing for the credit pool contract
 */
contract CreditPoolV2Test is Test {
    CreditPoolV2 public pool;
    CreditScore public creditScore;
    
    address public owner;
    address public loanManager;
    address public alice;
    address public bob;
    address public attacker;
    
    function setUp() public {
        owner = address(this);
        loanManager = makeAddr("loanManager");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        attacker = makeAddr("attacker");
        
        // Deploy contracts
        creditScore = new CreditScore();
        pool = new CreditPoolV2(address(creditScore));
        pool.setLoanManager(loanManager);
        
        // Fund test accounts
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(attacker, 100 ether);
    }
    
    // ========== Basic Functionality Tests ==========
    
    function testDeposit() public {
        vm.warp(block.timestamp + 2 minutes); // Skip rate limit
        vm.startPrank(alice);
        pool.deposit{value: 1 ether}();
        vm.stopPrank();
        
        assertEq(pool.totalLiquidity(), 1 ether);
        assertEq(pool.lpTokens(alice), 1 ether);
    }
    
    function testWithdraw() public {
        vm.warp(block.timestamp + 2 minutes); // Skip rate limit
        // Alice deposits
        vm.startPrank(alice);
        pool.deposit{value: 1 ether}();
        
        // Wait for rate limit
        vm.warp(block.timestamp + 2 minutes);
        
        // Alice withdraws
        uint256 lpBalance = pool.lpTokens(alice);
        pool.withdraw(lpBalance);
        vm.stopPrank();
        
        assertEq(pool.totalLiquidity(), 0);
        assertEq(pool.lpTokens(alice), 0);
    }
    
    // ========== Security Tests ==========
    
    /// @dev Test: Prevent deposits below minimum
    function test_RevertWhen_DepositTooSmall() public {
        vm.warp(block.timestamp + 2 minutes);
        vm.startPrank(alice);
        vm.expectRevert("Deposit too small");
        pool.deposit{value: 0.0001 ether}();
        vm.stopPrank();
    }
    
    /// @dev Test: Prevent deposits above maximum
    function test_RevertWhen_DepositTooLarge() public {
        vm.warp(block.timestamp + 2 minutes);
        vm.deal(alice, 1100 ether); // Give alice enough ETH
        vm.startPrank(alice);
        vm.expectRevert("Deposit too large");
        pool.deposit{value: 1001 ether}();
        vm.stopPrank();
    }
    
    /// @dev Test: Rate limiting on deposits
    function testRateLimitDeposit() public {
        vm.warp(block.timestamp + 2 minutes);
        vm.startPrank(alice);
        pool.deposit{value: 1 ether}();
        
        // Try to deposit again immediately (should fail)
        vm.expectRevert("Rate limit exceeded");
        pool.deposit{value: 1 ether}();
        
        // Wait for rate limit period
        vm.warp(block.timestamp + 2 minutes);
        
        // Should succeed now
        pool.deposit{value: 1 ether}();
        vm.stopPrank();
        
        assertEq(pool.totalLiquidity(), 2 ether);
    }
    
    /// @dev Test: Rate limiting on withdrawals
    function testRateLimitWithdraw() public {
        vm.warp(block.timestamp + 2 minutes);
        vm.startPrank(alice);
        pool.deposit{value: 2 ether}();
        
        vm.warp(block.timestamp + 2 minutes);
        
        uint256 halfLp = pool.lpTokens(alice) / 2;
        pool.withdraw(halfLp);
        
        // Try to withdraw again immediately (should fail)
        vm.expectRevert("Rate limit exceeded");
        pool.withdraw(halfLp);
        
        vm.stopPrank();
    }
    
    /// @dev Test: Reentrancy protection on withdraw
    function testReentrancyProtection() public {
        vm.warp(block.timestamp + 2 minutes);
        // Deploy malicious contract
        MaliciousReceiver malicious = new MaliciousReceiver(address(pool));
        vm.deal(address(malicious), 10 ether);
        
        // Malicious contract deposits
        vm.startPrank(address(malicious));
        pool.deposit{value: 1 ether}();
        vm.stopPrank();
        
        // Wait for rate limit
        vm.warp(block.timestamp + 2 minutes);
        
        // Try reentrancy attack (should fail)
        vm.startPrank(address(malicious));
        vm.expectRevert();
        malicious.attack();
        vm.stopPrank();
    }
    
    /// @dev Test: Unauthorized borrow attempt
    function testUnauthorizedBorrow() public {
        vm.warp(block.timestamp + 2 minutes);
        vm.startPrank(alice);
        pool.deposit{value: 10 ether}();
        vm.stopPrank();
        
        // Attacker tries to borrow directly
        vm.startPrank(attacker);
        vm.expectRevert("Only loan manager");
        pool.borrow(attacker, 1 ether);
        vm.stopPrank();
    }
    
    /// @dev Test: Pause functionality
    function testPauseUnpause() public {
        vm.warp(block.timestamp + 2 minutes);
        // Owner pauses
        pool.pause();
        
        // Alice tries to deposit (should fail)
        vm.startPrank(alice);
        vm.expectRevert();
        pool.deposit{value: 1 ether}();
        vm.stopPrank();
        
        // Owner unpauses
        pool.unpause();
        
        // Alice can deposit now
        vm.startPrank(alice);
        pool.deposit{value: 1 ether}();
        vm.stopPrank();
        
        assertEq(pool.totalLiquidity(), 1 ether);
    }
    
    /// @dev Test: Parameter change time-lock
    function testParameterTimeLock() public {
        // Propose parameter change
        pool.proposeParameterChange(600, 1200, 600);
        
        // Try to execute immediately (should fail)
        vm.expectRevert("Time-lock not expired");
        pool.executeParameterChange();
        
        // Wait for time-lock period
        vm.warp(block.timestamp + 3 days);
        
        // Execute should succeed now
        pool.executeParameterChange();
        
        assertEq(pool.baseInterestRate(), 600);
    }
    
    /// @dev Test: Interest rate cap
    function testInterestRateCap() public {
        vm.warp(block.timestamp + 2 minutes);
        // Set up a scenario with very high utilization
        vm.startPrank(alice);
        pool.deposit{value: 1 ether}();
        vm.stopPrank();
        
        // Simulate high borrowing
        vm.startPrank(loanManager);
        pool.borrow(bob, 0.8 ether);
        vm.stopPrank();
        
        // Calculate interest rate
        uint256 rate = pool.calculateInterestRate(bob);
        
        // Rate should not exceed MAX_INTEREST_RATE (100%)
        assertLe(rate, 10000);
    }
    
    /// @dev Test: Division by zero protection
    function testDivisionByZeroProtection() public {
        // Try to withdraw when no LP tokens exist
        vm.startPrank(alice);
        vm.expectRevert();
        pool.withdraw(1 ether);
        vm.stopPrank();
    }
    
    /// @dev Test: Max utilization enforcement
    function testMaxUtilizationEnforcement() public {
        vm.warp(block.timestamp + 2 minutes);
        vm.startPrank(alice);
        pool.deposit{value: 10 ether}();
        vm.stopPrank();
        
        // Try to borrow beyond max utilization (90%)
        vm.startPrank(loanManager);
        vm.expectRevert("Exceeds max utilization");
        pool.borrow(bob, 9.5 ether);
        vm.stopPrank();
    }
    
    /// @dev Test: Insufficient liquidity check
    function testInsufficientLiquidityCheck() public {
        vm.warp(block.timestamp + 2 minutes);
        vm.startPrank(alice);
        pool.deposit{value: 1 ether}();
        vm.stopPrank();
        
        vm.startPrank(loanManager);
        pool.borrow(bob, 0.5 ether);
        vm.stopPrank();
        
        // Try to withdraw more than available
        vm.startPrank(alice);
        vm.warp(block.timestamp + 2 minutes);
        vm.expectRevert("Insufficient liquidity");
        pool.withdraw(pool.lpTokens(alice));
        vm.stopPrank();
    }
    
    /// @dev Test: Emergency withdraw only when paused
    function testEmergencyWithdrawOnlyWhenPaused() public {
        vm.warp(block.timestamp + 2 minutes);
        vm.startPrank(alice);
        pool.deposit{value: 1 ether}();
        vm.stopPrank();
        
        // Try emergency withdraw when not paused (should fail)
        vm.expectRevert();
        pool.emergencyWithdraw(0.5 ether);
        
        // Pause and try again
        pool.pause();
        pool.emergencyWithdraw(0.5 ether);
        
        // Owner should have received funds
        assertEq(owner.balance, 0.5 ether);
    }
    
    /// @dev Test: Zero address validation
    function testZeroAddressValidation() public {
        // Try to set loan manager to zero address
        vm.expectRevert("Invalid loan manager address");
        pool.setLoanManager(address(0));
    }
}

/**
 * @dev Malicious contract for testing reentrancy protection
 */
contract MaliciousReceiver {
    CreditPoolV2 public pool;
    bool public attacking;
    
    constructor(address _pool) {
        pool = CreditPoolV2(payable(_pool));
    }
    
    function attack() external {
        attacking = true;
        uint256 lpBalance = pool.lpTokens(address(this));
        pool.withdraw(lpBalance);
    }
    
    receive() external payable {
        if (attacking && address(pool).balance > 0) {
            // Try to reenter
            uint256 lpBalance = pool.lpTokens(address(this));
            if (lpBalance > 0) {
                pool.withdraw(lpBalance);
            }
        }
    }
}
