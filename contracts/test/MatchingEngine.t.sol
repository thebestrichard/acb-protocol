// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MatchingEngine.sol";
import "../src/CreditScore.sol";
import "../src/CreditPoolV2.sol";

contract MatchingEngineTest is Test {
    MatchingEngine public matchingEngine;
    CreditScore public creditScore;
    CreditPoolV2 public creditPool;
    
    address public owner = address(1);
    address public borrower1 = address(2);
    address public borrower2 = address(3);
    address public lender1 = address(4);
    address public lender2 = address(5);
    
    function setUp() public {
        vm.startPrank(owner);
        
        // Deploy contracts
        creditScore = new CreditScore();
        creditPool = new CreditPoolV2(address(creditScore));
        matchingEngine = new MatchingEngine(address(creditScore), address(creditPool));
        
        // Initialize credit scores for borrowers
        creditScore.initializeCreditScore(borrower1);
        creditScore.recordLoan(borrower1, true, false); // Boost score
        creditScore.recordLoan(borrower1, true, false);
        
        creditScore.initializeCreditScore(borrower2);
        creditScore.recordLoan(borrower2, true, false);
        
        vm.stopPrank();
        
        // Fund lenders
        vm.deal(lender1, 10 ether);
        vm.deal(lender2, 10 ether);
    }
    
    function testCreateBorrowOrder() public {
        vm.startPrank(borrower1);
        
        uint256 orderId = matchingEngine.createBorrowOrder(
            1 ether,
            800, // 8% interest rate
            30 days
        );
        
        assertEq(orderId, 1);
        
        (
            uint256 returnedOrderId,
            address returnedBorrower,
            uint256 amount,
            uint256 maxInterestRate,
            uint256 duration,
            uint256 creditScoreValue,
            ,
            MatchingEngine.OrderStatus status
        ) = matchingEngine.borrowOrders(orderId);
        
        assertEq(returnedOrderId, 1);
        assertEq(returnedBorrower, borrower1);
        assertEq(amount, 1 ether);
        assertEq(maxInterestRate, 800);
        assertEq(duration, 30 days);
        assertGt(creditScoreValue, 0);
        assertTrue(status == MatchingEngine.OrderStatus.Pending);
        
        vm.stopPrank();
    }
    
    function testCreateLendOrder() public {
        vm.startPrank(lender1);
        
        uint256 orderId = matchingEngine.createLendOrder{value: 2 ether}(
            500, // 5% min interest rate
            600  // Min credit score
        );
        
        assertEq(orderId, 1);
        
        (
            uint256 returnedOrderId,
            address returnedLender,
            uint256 amount,
            uint256 minInterestRate,
            uint256 minCreditScore,
            ,
            MatchingEngine.OrderStatus status
        ) = matchingEngine.lendOrders(orderId);
        
        assertEq(returnedOrderId, 1);
        assertEq(returnedLender, lender1);
        assertEq(amount, 2 ether);
        assertEq(minInterestRate, 500);
        assertEq(minCreditScore, 600);
        assertTrue(status == MatchingEngine.OrderStatus.Pending);
        
        vm.stopPrank();
    }
    
    function testAutoMatchingOnBorrowOrder() public {
        // Create lend order first
        vm.prank(lender1);
        matchingEngine.createLendOrder{value: 2 ether}(
            500, // 5% min interest rate
            600  // Min credit score
        );
        
        // Create borrow order that matches
        vm.prank(borrower1);
        uint256 borrowOrderId = matchingEngine.createBorrowOrder(
            1 ether,
            800, // 8% interest rate
            30 days
        );
        
        // Check that orders were matched
        (, , , , , , , MatchingEngine.OrderStatus borrowStatus) = matchingEngine.borrowOrders(borrowOrderId);
        assertTrue(borrowStatus == MatchingEngine.OrderStatus.Matched);
        
        // Check that a match record was created
        (
            uint256 matchId,
            ,
            ,
            address matchedBorrower,
            address matchedLender,
            uint256 matchedAmount,
            uint256 interestRate,
            ,
            ,
            ,
            MatchingEngine.MatchStatus matchStatus,
        ) = matchingEngine.matchRecords(1);
        
        assertEq(matchId, 1);
        assertEq(matchedBorrower, borrower1);
        assertEq(matchedLender, lender1);
        assertEq(matchedAmount, 1 ether);
        assertEq(interestRate, 650); // Average of 800 and 500
        assertTrue(matchStatus == MatchingEngine.MatchStatus.Active);
    }
    
    function testAutoMatchingOnLendOrder() public {
        // Create borrow order first
        vm.prank(borrower1);
        matchingEngine.createBorrowOrder(
            1 ether,
            800, // 8% interest rate
            30 days
        );
        
        // Create lend order that matches
        vm.prank(lender1);
        uint256 lendOrderId = matchingEngine.createLendOrder{value: 2 ether}(
            500, // 5% min interest rate
            600  // Min credit score
        );
        
        // Check that orders were matched
        (, , , , , , MatchingEngine.OrderStatus lendStatus) = matchingEngine.lendOrders(lendOrderId);
        assertTrue(lendStatus == MatchingEngine.OrderStatus.Matched);
    }
    
    function testMatchingRequiresCreditScore() public {
        // Create lend order with high credit score requirement
        vm.prank(lender1);
        matchingEngine.createLendOrder{value: 2 ether}(
            500,
            800 // High min credit score
        );
        
        // Create borrow order from borrower with lower credit score
        vm.prank(borrower2);
        uint256 borrowOrderId = matchingEngine.createBorrowOrder(
            1 ether,
            800,
            30 days
        );
        
        // Check that orders were NOT matched (credit score too low)
        (, , , , , , , MatchingEngine.OrderStatus status) = matchingEngine.borrowOrders(borrowOrderId);
        assertTrue(status == MatchingEngine.OrderStatus.Pending);
    }
    
    function testMatchingRequiresInterestRateCompatibility() public {
        // Create lend order with high min interest rate
        vm.prank(lender1);
        matchingEngine.createLendOrder{value: 2 ether}(
            900, // 9% min interest rate
            600
        );
        
        // Create borrow order with lower max interest rate
        vm.prank(borrower1);
        uint256 borrowOrderId = matchingEngine.createBorrowOrder(
            1 ether,
            800, // 8% max interest rate
            30 days
        );
        
        // Check that orders were NOT matched (interest rate incompatible)
        (, , , , , , , MatchingEngine.OrderStatus status) = matchingEngine.borrowOrders(borrowOrderId);
        assertTrue(status == MatchingEngine.OrderStatus.Pending);
    }
    
    function testSettleMatch() public {
        // Transfer ownership to allow recordLoan
        vm.prank(owner);
        creditScore.transferOwnership(address(matchingEngine));
        
        // Create and match orders
        vm.prank(lender1);
        matchingEngine.createLendOrder{value: 2 ether}(500, 600);
        
        vm.prank(borrower1);
        matchingEngine.createBorrowOrder(1 ether, 800, 30 days);
        
        // Fast forward time
        vm.warp(block.timestamp + 31 days);
        
        // Calculate repayment amount
        uint256 principal = 1 ether;
        uint256 interestRate = 650; // Average of 800 and 500
        uint256 duration = 30 days;
        uint256 interest = (principal * interestRate * duration) / (10000 * 365 days);
        uint256 totalRepayment = principal + interest;
        
        // Fund borrower for repayment
        vm.deal(borrower1, totalRepayment);
        
        // Settle the match
        vm.prank(borrower1);
        matchingEngine.settleMatch{value: totalRepayment}(1);
        
        // Check match status
        (, , , , , , , , , , MatchingEngine.MatchStatus status, ) = matchingEngine.matchRecords(1);
        assertTrue(status == MatchingEngine.MatchStatus.Settled);
    }
    
    function testCancelBorrowOrder() public {
        vm.startPrank(borrower1);
        
        uint256 orderId = matchingEngine.createBorrowOrder(
            1 ether,
            800,
            30 days
        );
        
        matchingEngine.cancelOrder(orderId, true);
        
        (, , , , , , , MatchingEngine.OrderStatus status) = matchingEngine.borrowOrders(orderId);
        assertTrue(status == MatchingEngine.OrderStatus.Cancelled);
        
        vm.stopPrank();
    }
    
    function testCancelLendOrder() public {
        vm.startPrank(lender1);
        
        uint256 orderId = matchingEngine.createLendOrder{value: 2 ether}(500, 600);
        
        uint256 balanceBefore = lender1.balance;
        matchingEngine.cancelOrder(orderId, false);
        uint256 balanceAfter = lender1.balance;
        
        // Check refund
        assertEq(balanceAfter - balanceBefore, 2 ether);
        
        (, , , , , , MatchingEngine.OrderStatus status) = matchingEngine.lendOrders(orderId);
        assertTrue(status == MatchingEngine.OrderStatus.Cancelled);
        
        vm.stopPrank();
    }
    
    function testVerifyMatchProof() public {
        // Create and match orders
        vm.prank(lender1);
        matchingEngine.createLendOrder{value: 2 ether}(500, 600);
        
        vm.prank(borrower1);
        matchingEngine.createBorrowOrder(1 ether, 800, 30 days);
        
        // Verify the match proof
        bool isValid = matchingEngine.verifyMatch(1);
        assertTrue(isValid);
    }
    
    function testGetPendingOrders() public {
        // Create multiple orders
        vm.prank(borrower1);
        matchingEngine.createBorrowOrder(1 ether, 800, 30 days);
        
        vm.prank(borrower2);
        matchingEngine.createBorrowOrder(0.5 ether, 900, 60 days);
        
        vm.prank(lender1);
        matchingEngine.createLendOrder{value: 2 ether}(500, 600);
        
        // Get pending orders
        MatchingEngine.BorrowOrder[] memory borrowOrders = matchingEngine.getPendingBorrowOrders();
        MatchingEngine.LendOrder[] memory lendOrders = matchingEngine.getPendingLendOrders();
        
        // One borrow order should be matched, one pending
        assertEq(borrowOrders.length, 1);
        assertEq(lendOrders.length, 0); // Lend order was matched
    }
}
