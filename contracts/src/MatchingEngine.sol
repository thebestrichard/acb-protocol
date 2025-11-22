// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./CreditScore.sol";
import "./CreditPoolV2.sol";

/**
 * @title MatchingEngine
 * @dev Transparent on-chain order book and matching engine for credit lending
 * All matching operations are publicly verifiable and recorded on-chain
 */
contract MatchingEngine is Ownable, ReentrancyGuard, Pausable {
    CreditScore public creditScoreContract;
    CreditPoolV2 public creditPool;
    
    // Order status enum
    enum OrderStatus { Pending, Matched, Cancelled, Expired }
    enum MatchStatus { Active, Settled, Defaulted }
    
    // Borrow order structure
    struct BorrowOrder {
        uint256 orderId;
        address borrower;
        uint256 amount;
        uint256 maxInterestRate;  // in basis points
        uint256 duration;         // in seconds
        uint256 creditScore;
        uint256 timestamp;
        OrderStatus status;
    }
    
    // Lend order structure
    struct LendOrder {
        uint256 orderId;
        address lender;
        uint256 amount;
        uint256 minInterestRate;  // in basis points
        uint256 minCreditScore;
        uint256 timestamp;
        OrderStatus status;
    }
    
    // Match record structure
    struct MatchRecord {
        uint256 matchId;
        uint256 borrowOrderId;
        uint256 lendOrderId;
        address borrower;
        address lender;
        uint256 amount;
        uint256 interestRate;
        uint256 duration;
        uint256 matchedAt;
        uint256 dueDate;
        MatchStatus status;
        bytes32 matchingProof;
    }
    
    // Storage
    mapping(uint256 => BorrowOrder) public borrowOrders;
    mapping(uint256 => LendOrder) public lendOrders;
    mapping(uint256 => MatchRecord) public matchRecords;
    
    uint256 public nextBorrowOrderId = 1;
    uint256 public nextLendOrderId = 1;
    uint256 public nextMatchId = 1;
    
    // User order tracking
    mapping(address => uint256[]) public userBorrowOrders;
    mapping(address => uint256[]) public userLendOrders;
    mapping(address => uint256[]) public userMatches;
    
    // Pending order queues
    uint256[] public pendingBorrowOrders;
    uint256[] public pendingLendOrders;
    
    // Constants
    uint256 public constant MIN_ORDER_AMOUNT = 0.01 ether;
    uint256 public constant MAX_ORDER_AMOUNT = 100 ether;
    uint256 public constant MIN_DURATION = 1 days;
    uint256 public constant MAX_DURATION = 365 days;
    uint256 public constant MATCHING_ALGORITHM_VERSION = 1;
    
    // Events
    event BorrowOrderCreated(
        uint256 indexed orderId,
        address indexed borrower,
        uint256 amount,
        uint256 maxInterestRate,
        uint256 duration,
        uint256 creditScore
    );
    
    event LendOrderCreated(
        uint256 indexed orderId,
        address indexed lender,
        uint256 amount,
        uint256 minInterestRate,
        uint256 minCreditScore
    );
    
    event OrdersMatched(
        uint256 indexed matchId,
        uint256 indexed borrowOrderId,
        uint256 indexed lendOrderId,
        address borrower,
        address lender,
        uint256 amount,
        uint256 interestRate,
        uint256 duration,
        bytes32 matchingProof
    );
    
    event MatchSettled(
        uint256 indexed matchId,
        uint256 principalPaid,
        uint256 interestPaid,
        uint256 timestamp
    );
    
    event OrderCancelled(uint256 indexed orderId, bool isBorrowOrder);
    
    constructor(address _creditScoreContract, address _creditPool) Ownable(msg.sender) {
        require(_creditScoreContract != address(0), "Invalid credit score contract");
        require(_creditPool != address(0), "Invalid credit pool");
        creditScoreContract = CreditScore(_creditScoreContract);
        creditPool = CreditPoolV2(payable(_creditPool));
    }
    
    /**
     * @dev Create a borrow order
     */
    function createBorrowOrder(
        uint256 amount,
        uint256 maxInterestRate,
        uint256 duration
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(amount >= MIN_ORDER_AMOUNT, "Amount too small");
        require(amount <= MAX_ORDER_AMOUNT, "Amount too large");
        require(duration >= MIN_DURATION, "Duration too short");
        require(duration <= MAX_DURATION, "Duration too long");
        require(maxInterestRate > 0 && maxInterestRate <= 10000, "Invalid interest rate");
        
        // Get borrower's credit score
        uint256 creditScore = creditScoreContract.getCreditScore(msg.sender);
        require(creditScore > 0, "No credit score");
        
        uint256 orderId = nextBorrowOrderId++;
        
        BorrowOrder memory order = BorrowOrder({
            orderId: orderId,
            borrower: msg.sender,
            amount: amount,
            maxInterestRate: maxInterestRate,
            duration: duration,
            creditScore: creditScore,
            timestamp: block.timestamp,
            status: OrderStatus.Pending
        });
        
        borrowOrders[orderId] = order;
        userBorrowOrders[msg.sender].push(orderId);
        pendingBorrowOrders.push(orderId);
        
        emit BorrowOrderCreated(
            orderId,
            msg.sender,
            amount,
            maxInterestRate,
            duration,
            creditScore
        );
        
        // Try to match immediately
        _tryMatchBorrowOrder(orderId);
        
        return orderId;
    }
    
    /**
     * @dev Create a lend order
     */
    function createLendOrder(
        uint256 minInterestRate,
        uint256 minCreditScore
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        require(msg.value >= MIN_ORDER_AMOUNT, "Amount too small");
        require(msg.value <= MAX_ORDER_AMOUNT, "Amount too large");
        require(minInterestRate <= 10000, "Invalid interest rate");
        require(minCreditScore <= 1000, "Invalid credit score");
        
        uint256 orderId = nextLendOrderId++;
        
        LendOrder memory order = LendOrder({
            orderId: orderId,
            lender: msg.sender,
            amount: msg.value,
            minInterestRate: minInterestRate,
            minCreditScore: minCreditScore,
            timestamp: block.timestamp,
            status: OrderStatus.Pending
        });
        
        lendOrders[orderId] = order;
        userLendOrders[msg.sender].push(orderId);
        pendingLendOrders.push(orderId);
        
        emit LendOrderCreated(
            orderId,
            msg.sender,
            msg.value,
            minInterestRate,
            minCreditScore
        );
        
        // Try to match immediately
        _tryMatchLendOrder(orderId);
        
        return orderId;
    }
    
    /**
     * @dev Try to match a borrow order with pending lend orders
     */
    function _tryMatchBorrowOrder(uint256 borrowOrderId) internal {
        BorrowOrder storage borrowOrder = borrowOrders[borrowOrderId];
        
        if (borrowOrder.status != OrderStatus.Pending) return;
        
        // Find best matching lend order
        for (uint256 i = 0; i < pendingLendOrders.length; i++) {
            uint256 lendOrderId = pendingLendOrders[i];
            LendOrder storage lendOrder = lendOrders[lendOrderId];
            
            if (lendOrder.status != OrderStatus.Pending) continue;
            
            // Check if orders can be matched
            if (_canMatch(borrowOrder, lendOrder)) {
                _executeMatch(borrowOrderId, lendOrderId);
                return;
            }
        }
    }
    
    /**
     * @dev Try to match a lend order with pending borrow orders
     */
    function _tryMatchLendOrder(uint256 lendOrderId) internal {
        LendOrder storage lendOrder = lendOrders[lendOrderId];
        
        if (lendOrder.status != OrderStatus.Pending) return;
        
        // Find best matching borrow order
        for (uint256 i = 0; i < pendingBorrowOrders.length; i++) {
            uint256 borrowOrderId = pendingBorrowOrders[i];
            BorrowOrder storage borrowOrder = borrowOrders[borrowOrderId];
            
            if (borrowOrder.status != OrderStatus.Pending) continue;
            
            // Check if orders can be matched
            if (_canMatch(borrowOrder, lendOrder)) {
                _executeMatch(borrowOrderId, lendOrderId);
                return;
            }
        }
    }
    
    /**
     * @dev Check if borrow and lend orders can be matched
     */
    function _canMatch(
        BorrowOrder memory borrowOrder,
        LendOrder memory lendOrder
    ) internal pure returns (bool) {
        // Check amount compatibility
        if (lendOrder.amount < borrowOrder.amount) return false;
        
        // Check credit score requirement
        if (borrowOrder.creditScore < lendOrder.minCreditScore) return false;
        
        // Check interest rate compatibility
        if (borrowOrder.maxInterestRate < lendOrder.minInterestRate) return false;
        
        return true;
    }
    
    /**
     * @dev Execute match between borrow and lend orders
     */
    function _executeMatch(
        uint256 borrowOrderId,
        uint256 lendOrderId
    ) internal {
        BorrowOrder storage borrowOrder = borrowOrders[borrowOrderId];
        LendOrder storage lendOrder = lendOrders[lendOrderId];
        
        uint256 matchId = nextMatchId++;
        
        // Create match record directly in storage
        MatchRecord storage matchRecord = matchRecords[matchId];
        matchRecord.matchId = matchId;
        matchRecord.borrowOrderId = borrowOrderId;
        matchRecord.lendOrderId = lendOrderId;
        matchRecord.borrower = borrowOrder.borrower;
        matchRecord.lender = lendOrder.lender;
        matchRecord.amount = borrowOrder.amount;
        matchRecord.interestRate = (borrowOrder.maxInterestRate + lendOrder.minInterestRate) / 2;
        matchRecord.duration = borrowOrder.duration;
        matchRecord.matchedAt = block.timestamp;
        matchRecord.dueDate = block.timestamp + borrowOrder.duration;
        matchRecord.status = MatchStatus.Active;
        matchRecord.matchingProof = keccak256(abi.encodePacked(
            borrowOrderId,
            lendOrderId,
            matchRecord.amount,
            matchRecord.interestRate,
            matchRecord.duration,
            block.timestamp,
            MATCHING_ALGORITHM_VERSION
        ));
        
        // Update order statuses
        borrowOrder.status = OrderStatus.Matched;
        lendOrder.status = OrderStatus.Matched;
        
        // Track user matches
        userMatches[borrowOrder.borrower].push(matchId);
        userMatches[lendOrder.lender].push(matchId);
        
        // Transfer funds from lender to borrower
        (bool success, ) = matchRecord.borrower.call{value: matchRecord.amount}("");
        require(success, "Transfer failed");
        
        // Handle remaining lend order amount
        if (lendOrder.amount > matchRecord.amount) {
            (bool refundSuccess, ) = matchRecord.lender.call{value: lendOrder.amount - matchRecord.amount}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit OrdersMatched(
            matchId,
            borrowOrderId,
            lendOrderId,
            matchRecord.borrower,
            matchRecord.lender,
            matchRecord.amount,
            matchRecord.interestRate,
            matchRecord.duration,
            matchRecord.matchingProof
        );
    }
    
    /**
     * @dev Settle a matched loan
     */
    function settleMatch(uint256 matchId) external payable nonReentrant {
        MatchRecord storage matchRecord = matchRecords[matchId];
        
        require(matchRecord.status == MatchStatus.Active, "Match not active");
        require(msg.sender == matchRecord.borrower, "Only borrower can settle");
        
        // Calculate total repayment
        uint256 interest = (matchRecord.amount * matchRecord.interestRate * matchRecord.duration) / (10000 * 365 days);
        uint256 totalRepayment = matchRecord.amount + interest;
        
        require(msg.value >= totalRepayment, "Insufficient repayment");
        
        // Update match status
        matchRecord.status = MatchStatus.Settled;
        
        // Transfer to lender
        (bool success, ) = matchRecord.lender.call{value: totalRepayment}("");
        require(success, "Transfer to lender failed");
        
        // Refund excess
        if (msg.value > totalRepayment) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - totalRepayment}("");
            require(refundSuccess, "Refund failed");
        }
        
        // Update credit score
        creditScoreContract.recordLoan(msg.sender, true, false);
        
        emit MatchSettled(matchId, matchRecord.amount, interest, block.timestamp);
    }
    
    /**
     * @dev Cancel a pending order
     */
    function cancelOrder(uint256 orderId, bool isBorrowOrder) external nonReentrant {
        if (isBorrowOrder) {
            BorrowOrder storage order = borrowOrders[orderId];
            require(order.borrower == msg.sender, "Not order owner");
            require(order.status == OrderStatus.Pending, "Order not pending");
            order.status = OrderStatus.Cancelled;
        } else {
            LendOrder storage order = lendOrders[orderId];
            require(order.lender == msg.sender, "Not order owner");
            require(order.status == OrderStatus.Pending, "Order not pending");
            order.status = OrderStatus.Cancelled;
            
            // Refund lender
            (bool success, ) = msg.sender.call{value: order.amount}("");
            require(success, "Refund failed");
        }
        
        emit OrderCancelled(orderId, isBorrowOrder);
    }
    
    /**
     * @dev Verify a match proof
     */
    function verifyMatch(uint256 matchId) external view returns (bool) {
        MatchRecord memory matchRecord = matchRecords[matchId];
        
        bytes32 computedProof = keccak256(abi.encodePacked(
            matchRecord.borrowOrderId,
            matchRecord.lendOrderId,
            matchRecord.amount,
            matchRecord.interestRate,
            matchRecord.duration,
            matchRecord.matchedAt,
            MATCHING_ALGORITHM_VERSION
        ));
        
        return computedProof == matchRecord.matchingProof;
    }
    
    /**
     * @dev Get user's borrow orders
     */
    function getMyBorrowOrders() external view returns (BorrowOrder[] memory) {
        uint256[] memory orderIds = userBorrowOrders[msg.sender];
        BorrowOrder[] memory orders = new BorrowOrder[](orderIds.length);
        
        for (uint256 i = 0; i < orderIds.length; i++) {
            orders[i] = borrowOrders[orderIds[i]];
        }
        
        return orders;
    }
    
    /**
     * @dev Get user's lend orders
     */
    function getMyLendOrders() external view returns (LendOrder[] memory) {
        uint256[] memory orderIds = userLendOrders[msg.sender];
        LendOrder[] memory orders = new LendOrder[](orderIds.length);
        
        for (uint256 i = 0; i < orderIds.length; i++) {
            orders[i] = lendOrders[orderIds[i]];
        }
        
        return orders;
    }
    
    /**
     * @dev Get user's matches
     */
    function getMyMatches() external view returns (MatchRecord[] memory) {
        uint256[] memory matchIds = userMatches[msg.sender];
        MatchRecord[] memory matches = new MatchRecord[](matchIds.length);
        
        for (uint256 i = 0; i < matchIds.length; i++) {
            matches[i] = matchRecords[matchIds[i]];
        }
        
        return matches;
    }
    
    /**
     * @dev Get all pending borrow orders
     */
    function getPendingBorrowOrders() external view returns (BorrowOrder[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < pendingBorrowOrders.length; i++) {
            if (borrowOrders[pendingBorrowOrders[i]].status == OrderStatus.Pending) {
                count++;
            }
        }
        
        BorrowOrder[] memory orders = new BorrowOrder[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < pendingBorrowOrders.length; i++) {
            BorrowOrder memory order = borrowOrders[pendingBorrowOrders[i]];
            if (order.status == OrderStatus.Pending) {
                orders[index++] = order;
            }
        }
        
        return orders;
    }
    
    /**
     * @dev Get all pending lend orders
     */
    function getPendingLendOrders() external view returns (LendOrder[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < pendingLendOrders.length; i++) {
            if (lendOrders[pendingLendOrders[i]].status == OrderStatus.Pending) {
                count++;
            }
        }
        
        LendOrder[] memory orders = new LendOrder[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < pendingLendOrders.length; i++) {
            LendOrder memory order = lendOrders[pendingLendOrders[i]];
            if (order.status == OrderStatus.Pending) {
                orders[index++] = order;
            }
        }
        
        return orders;
    }
    
    /**
     * @dev Pause contract (emergency)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Receive function
     */
    receive() external payable {}
}
