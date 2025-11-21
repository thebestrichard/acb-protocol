// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CreditScore.sol";

/**
 * @title CreditPool
 * @dev AMM-based credit lending pool with dynamic interest rates
 */
contract CreditPool is Ownable, ReentrancyGuard {
    CreditScore public creditScoreContract;
    
    // Pool parameters
    uint256 public totalLiquidity;
    uint256 public totalBorrowed;
    uint256 public riskReserve;
    
    // Interest rate parameters (in basis points)
    uint256 public baseInterestRate = 500; // 5%
    uint256 public utilizationCoefficient = 1000; // k coefficient
    uint256 public creditCoefficient = 500; // c coefficient
    
    // LP token tracking
    mapping(address => uint256) public lpTokens;
    uint256 public totalLpTokens;
    
    // Events
    event Deposited(address indexed provider, uint256 amount, uint256 lpTokens);
    event Withdrawn(address indexed provider, uint256 amount, uint256 lpTokens);
    event InterestRateUpdated(uint256 newRate);
    
    constructor(address _creditScoreContract) Ownable(msg.sender) {
        creditScoreContract = CreditScore(_creditScoreContract);
    }
    
    /**
     * @dev Deposit liquidity into the pool
     */
    function deposit() external payable nonReentrant {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        uint256 lpAmount;
        
        if (totalLpTokens == 0) {
            // First deposit
            lpAmount = msg.value;
        } else {
            // Calculate LP tokens based on current pool ratio
            lpAmount = (msg.value * totalLpTokens) / totalLiquidity;
        }
        
        lpTokens[msg.sender] += lpAmount;
        totalLpTokens += lpAmount;
        totalLiquidity += msg.value;
        
        emit Deposited(msg.sender, msg.value, lpAmount);
    }
    
    /**
     * @dev Withdraw liquidity from the pool
     */
    function withdraw(uint256 lpAmount) external nonReentrant {
        require(lpTokens[msg.sender] >= lpAmount, "Insufficient LP tokens");
        require(lpAmount > 0, "Withdrawal amount must be greater than 0");
        
        // Calculate withdrawal amount based on current pool ratio
        uint256 withdrawAmount = (lpAmount * totalLiquidity) / totalLpTokens;
        
        require(withdrawAmount <= getAvailableLiquidity(), "Insufficient liquidity");
        
        lpTokens[msg.sender] -= lpAmount;
        totalLpTokens -= lpAmount;
        totalLiquidity -= withdrawAmount;
        
        (bool success, ) = msg.sender.call{value: withdrawAmount}("");
        require(success, "Transfer failed");
        
        emit Withdrawn(msg.sender, withdrawAmount, lpAmount);
    }
    
    /**
     * @dev Calculate dynamic interest rate
     * Formula: r = r_0 + k * (D / L) + c * (1 - C_s)
     */
    function calculateInterestRate(address borrower) public view returns (uint256) {
        uint256 creditScore = creditScoreContract.getCreditScore(borrower);
        
        // Utilization rate component
        uint256 utilizationRate = totalLiquidity > 0 
            ? (totalBorrowed * 10000) / totalLiquidity 
            : 0;
        
        // Credit score component (normalized to 0-1000)
        uint256 creditComponent = creditScore > 0 
            ? 1000 - creditScore 
            : 1000;
        
        // Calculate interest rate
        uint256 rate = baseInterestRate 
            + (utilizationRate * utilizationCoefficient) / 10000
            + (creditComponent * creditCoefficient) / 1000;
        
        // Apply tier-based adjustment
        int256 adjustment = creditScoreContract.getInterestRateAdjustment(borrower);
        
        if (adjustment < 0) {
            uint256 discount = uint256(-adjustment);
            rate = rate > discount ? rate - discount : 0;
        } else {
            rate += uint256(adjustment);
        }
        
        return rate;
    }
    
    /**
     * @dev Get available liquidity for borrowing
     */
    function getAvailableLiquidity() public view returns (uint256) {
        return totalLiquidity > totalBorrowed 
            ? totalLiquidity - totalBorrowed 
            : 0;
    }
    
    /**
     * @dev Get maximum borrowing amount for a user
     */
    function getMaxBorrowAmount(address borrower) public view returns (uint256) {
        uint256 available = getAvailableLiquidity();
        uint256 multiplier = creditScoreContract.getBorrowingLimitMultiplier(borrower);
        
        // Base limit is 10% of available liquidity
        uint256 baseLimit = available / 10;
        
        // Apply credit tier multiplier
        return (baseLimit * multiplier) / 10000;
    }
    
    /**
     * @dev Borrow from the pool (called by LoanManager)
     */
    function borrow(address borrower, uint256 amount) external onlyOwner returns (uint256) {
        require(amount > 0, "Borrow amount must be greater than 0");
        require(amount <= getMaxBorrowAmount(borrower), "Exceeds borrowing limit");
        require(amount <= getAvailableLiquidity(), "Insufficient liquidity");
        
        totalBorrowed += amount;
        
        uint256 interestRate = calculateInterestRate(borrower);
        
        (bool success, ) = borrower.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit InterestRateUpdated(interestRate);
        
        return interestRate;
    }
    
    /**
     * @dev Repay loan (called by LoanManager)
     */
    function repay(uint256 principal, uint256 interest) external payable onlyOwner {
        require(msg.value >= principal + interest, "Insufficient repayment amount");
        
        totalBorrowed -= principal;
        
        // Add interest to liquidity
        totalLiquidity += interest;
        
        // Allocate portion to risk reserve
        uint256 reserveAmount = interest / 10; // 10% of interest
        riskReserve += reserveAmount;
    }
    
    /**
     * @dev Handle default (called by LoanManager)
     */
    function handleDefault(uint256 loanAmount) external onlyOwner {
        require(loanAmount <= totalBorrowed, "Invalid loan amount");
        
        totalBorrowed -= loanAmount;
        
        // Use risk reserve to cover loss
        if (riskReserve >= loanAmount) {
            riskReserve -= loanAmount;
        } else {
            // Deduct from total liquidity if reserve insufficient
            uint256 shortfall = loanAmount - riskReserve;
            riskReserve = 0;
            totalLiquidity = totalLiquidity > shortfall 
                ? totalLiquidity - shortfall 
                : 0;
        }
    }
    
    /**
     * @dev Update pool parameters (governance)
     */
    function updateParameters(
        uint256 _baseRate,
        uint256 _utilizationCoef,
        uint256 _creditCoef
    ) external onlyOwner {
        baseInterestRate = _baseRate;
        utilizationCoefficient = _utilizationCoef;
        creditCoefficient = _creditCoef;
    }
    
    /**
     * @dev Get LP position value
     */
    function getLpValue(address provider) external view returns (uint256) {
        if (totalLpTokens == 0) return 0;
        return (lpTokens[provider] * totalLiquidity) / totalLpTokens;
    }
}
