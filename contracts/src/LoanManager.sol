// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CreditPool.sol";
import "./CreditScore.sol";

/**
 * @title LoanManager
 * @dev Manages loan lifecycle including borrowing, repayment, and defaults
 */
contract LoanManager is Ownable, ReentrancyGuard {
    CreditPool public creditPool;
    CreditScore public creditScore;
    
    // Loan status enum
    enum LoanStatus { Active, Repaid, Defaulted }
    
    // Loan structure
    struct Loan {
        address borrower;
        uint256 amount;
        uint256 interestRate; // Basis points
        uint256 duration; // In days
        uint256 borrowedAt;
        uint256 dueDate;
        uint256 repaidAmount;
        LoanStatus status;
        uint256 creditScoreAtBorrow;
    }
    
    // Loan storage
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;
    uint256 public nextLoanId = 1;
    
    // Events
    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 interestRate,
        uint256 duration
    );
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower);
    
    constructor(address _creditPool, address _creditScore) Ownable(msg.sender) {
        creditPool = CreditPool(payable(_creditPool));
        creditScore = CreditScore(_creditScore);
    }
    
    /**
     * @dev Request a loan
     */
    function requestLoan(uint256 amount, uint256 durationDays) external nonReentrant returns (uint256) {
        require(amount > 0, "Loan amount must be greater than 0");
        require(durationDays > 0 && durationDays <= 365, "Invalid duration");
        
        // Check borrowing limit
        uint256 maxBorrow = creditPool.getMaxBorrowAmount(msg.sender);
        require(amount <= maxBorrow, "Exceeds borrowing limit");
        
        // Get current credit score
        uint256 currentScore = creditScore.getCreditScore(msg.sender);
        
        // Borrow from pool
        uint256 interestRate = creditPool.borrow(msg.sender, amount);
        
        // Create loan record
        uint256 loanId = nextLoanId++;
        uint256 dueDate = block.timestamp + (durationDays * 1 days);
        
        loans[loanId] = Loan({
            borrower: msg.sender,
            amount: amount,
            interestRate: interestRate,
            duration: durationDays,
            borrowedAt: block.timestamp,
            dueDate: dueDate,
            repaidAmount: 0,
            status: LoanStatus.Active,
            creditScoreAtBorrow: currentScore
        });
        
        userLoans[msg.sender].push(loanId);
        
        emit LoanCreated(loanId, msg.sender, amount, interestRate, durationDays);
        
        return loanId;
    }
    
    /**
     * @dev Repay a loan
     */
    function repayLoan(uint256 loanId) external payable nonReentrant {
        Loan storage loan = loans[loanId];
        
        require(loan.borrower == msg.sender, "Not loan borrower");
        require(loan.status == LoanStatus.Active, "Loan not active");
        
        uint256 totalOwed = calculateTotalOwed(loanId);
        require(msg.value >= totalOwed, "Insufficient repayment amount");
        
        // Calculate interest
        uint256 interest = totalOwed - loan.amount;
        
        // Update loan
        loan.repaidAmount = msg.value;
        loan.status = LoanStatus.Repaid;
        
        // Repay to pool
        creditPool.repay{value: msg.value}(loan.amount, interest);
        
        // Update credit score
        creditScore.recordLoan(msg.sender, true, false);
        
        emit LoanRepaid(loanId, msg.sender, msg.value);
        
        // Refund excess
        if (msg.value > totalOwed) {
            (bool success, ) = msg.sender.call{value: msg.value - totalOwed}("");
            require(success, "Refund failed");
        }
    }
    
    /**
     * @dev Mark loan as defaulted (can be called by anyone after due date)
     */
    function markAsDefault(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(block.timestamp > loan.dueDate, "Loan not yet due");
        
        loan.status = LoanStatus.Defaulted;
        
        // Handle default in pool
        creditPool.handleDefault(loan.amount);
        
        // Update credit score
        creditScore.recordLoan(loan.borrower, false, true);
        
        emit LoanDefaulted(loanId, loan.borrower);
    }
    
    /**
     * @dev Calculate total amount owed for a loan
     */
    function calculateTotalOwed(uint256 loanId) public view returns (uint256) {
        Loan memory loan = loans[loanId];
        
        if (loan.status != LoanStatus.Active) {
            return 0;
        }
        
        // Calculate interest based on duration
        // Interest = Principal * Rate * Duration / (365 * 10000)
        uint256 interest = (loan.amount * loan.interestRate * loan.duration) / (365 * 10000);
        
        return loan.amount + interest;
    }
    
    /**
     * @dev Get loan details
     */
    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }
    
    /**
     * @dev Get all loans for a user
     */
    function getUserLoans(address user) external view returns (uint256[] memory) {
        return userLoans[user];
    }
    
    /**
     * @dev Get active loans for a user
     */
    function getActiveLoans(address user) external view returns (uint256[] memory) {
        uint256[] memory allLoans = userLoans[user];
        uint256 activeCount = 0;
        
        // Count active loans
        for (uint256 i = 0; i < allLoans.length; i++) {
            if (loans[allLoans[i]].status == LoanStatus.Active) {
                activeCount++;
            }
        }
        
        // Build active loans array
        uint256[] memory activeLoans = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allLoans.length; i++) {
            if (loans[allLoans[i]].status == LoanStatus.Active) {
                activeLoans[index] = allLoans[i];
                index++;
            }
        }
        
        return activeLoans;
    }
    
    /**
     * @dev Check if loan is overdue
     */
    function isOverdue(uint256 loanId) external view returns (bool) {
        Loan memory loan = loans[loanId];
        return loan.status == LoanStatus.Active && block.timestamp > loan.dueDate;
    }
}
