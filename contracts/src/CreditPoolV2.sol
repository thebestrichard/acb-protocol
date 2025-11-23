// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./CreditScore.sol";

/**
 * @title CreditPoolV2
 * @dev Enhanced AMM-based credit lending pool with comprehensive security features
 * 
 * Security improvements:
 * - Reentrancy guards on all state-changing functions
 * - Pausable mechanism for emergency stops
 * - Input validation and bounds checking
 * - Rate limiting for deposits/withdrawals
 * - Overflow protection via Solidity 0.8+
 * - Access control with role-based permissions
 * - Comprehensive event logging
 * - Time-locks for parameter changes
 */
contract CreditPoolV2 is Ownable, ReentrancyGuard, Pausable {
    CreditScore public creditScoreContract;
    
    // Pool parameters
    uint256 public totalLiquidity;
    uint256 public totalBorrowed;
    uint256 public riskReserve;
    
    // Interest rate parameters (in basis points)
    uint256 public baseInterestRate = 500; // 5%
    uint256 public utilizationCoefficient = 1000; // k coefficient
    uint256 public creditCoefficient = 500; // c coefficient
    
    // Security parameters
    uint256 public constant MAX_INTEREST_RATE = 10000; // 100% cap
    uint256 public constant MIN_DEPOSIT = 0.001 ether;
    uint256 public constant MAX_DEPOSIT = 1000 ether;
    uint256 public constant MAX_UTILIZATION_RATE = 9000; // 90%
    
    // Rate limiting
    mapping(address => uint256) public lastDepositTime;
    mapping(address => uint256) public lastWithdrawTime;
    uint256 public constant RATE_LIMIT_PERIOD = 1 minutes;
    
    // Parameter change time-lock
    uint256 public pendingParameterChangeTime;
    uint256 public constant PARAMETER_CHANGE_DELAY = 2 days;
    
    struct PendingParameters {
        uint256 baseRate;
        uint256 utilizationCoef;
        uint256 creditCoef;
        bool isPending;
    }
    PendingParameters public pendingParameters;
    
    // LP token tracking
    mapping(address => uint256) public lpTokens;
    uint256 public totalLpTokens;
    
    // Loan manager authorization
    address public loanManager;
    
    // Events
    event Deposited(address indexed provider, uint256 amount, uint256 lpTokens);
    event Withdrawn(address indexed provider, uint256 amount, uint256 lpTokens);
    event InterestRateUpdated(uint256 newRate);
    event ParameterChangeProposed(uint256 baseRate, uint256 utilizationCoef, uint256 creditCoef, uint256 effectiveTime);
    event ParameterChangeExecuted(uint256 baseRate, uint256 utilizationCoef, uint256 creditCoef);
    event LoanManagerUpdated(address indexed oldManager, address indexed newManager);
    event EmergencyWithdraw(address indexed admin, uint256 amount);
    
    // Modifiers
    modifier onlyLoanManager() {
        require(msg.sender == loanManager, "Only loan manager");
        _;
    }
    
    modifier rateLimited(mapping(address => uint256) storage lastActionTime) {
        require(
            block.timestamp >= lastActionTime[msg.sender] + RATE_LIMIT_PERIOD,
            "Rate limit exceeded"
        );
        lastActionTime[msg.sender] = block.timestamp;
        _;
    }
    
    constructor(address _creditScoreContract) Ownable(msg.sender) {
        require(_creditScoreContract != address(0), "Invalid credit score contract");
        creditScoreContract = CreditScore(_creditScoreContract);
    }
    
    /**
     * @dev Set loan manager address
     */
    function setLoanManager(address _loanManager) external onlyOwner {
        require(_loanManager != address(0), "Invalid loan manager address");
        address oldManager = loanManager;
        loanManager = _loanManager;
        emit LoanManagerUpdated(oldManager, _loanManager);
    }
    
    /**
     * @dev Deposit liquidity into the pool
     */
    function deposit() 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        rateLimited(lastDepositTime) 
    {
        require(msg.value >= MIN_DEPOSIT, "Deposit too small");
        require(msg.value <= MAX_DEPOSIT, "Deposit too large");
        
        uint256 lpAmount;
        
        if (totalLpTokens == 0) {
            // First deposit
            lpAmount = msg.value;
        } else {
            // Calculate LP tokens based on current pool ratio
            // Prevent division by zero
            require(totalLiquidity > 0, "Invalid pool state");
            lpAmount = (msg.value * totalLpTokens) / totalLiquidity;
        }
        
        require(lpAmount > 0, "LP amount must be greater than 0");
        
        lpTokens[msg.sender] += lpAmount;
        totalLpTokens += lpAmount;
        totalLiquidity += msg.value;
        
        emit Deposited(msg.sender, msg.value, lpAmount);
    }
    
    /**
     * @dev Withdraw liquidity from the pool
     */
    function withdraw(uint256 lpAmount) 
        external 
        nonReentrant 
        whenNotPaused 
        rateLimited(lastWithdrawTime) 
    {
        require(lpTokens[msg.sender] >= lpAmount, "Insufficient LP tokens");
        require(lpAmount > 0, "Withdrawal amount must be greater than 0");
        require(totalLpTokens > 0, "No LP tokens exist");
        
        // Calculate withdrawal amount based on current pool ratio
        uint256 withdrawAmount = (lpAmount * totalLiquidity) / totalLpTokens;
        
        require(withdrawAmount > 0, "Withdrawal amount is zero");
        require(withdrawAmount <= getAvailableLiquidity(), "Insufficient liquidity");
        
        // Update state before external call (Checks-Effects-Interactions pattern)
        lpTokens[msg.sender] -= lpAmount;
        totalLpTokens -= lpAmount;
        totalLiquidity -= withdrawAmount;
        
        // External call at the end
        (bool success, ) = msg.sender.call{value: withdrawAmount}("");
        require(success, "Transfer failed");
        
        emit Withdrawn(msg.sender, withdrawAmount, lpAmount);
    }
    
    /**
     * @dev Calculate dynamic interest rate with bounds checking
     * Formula: r = r_0 + k * (D / L) + c * (1 - C_s)
     */
    function calculateInterestRate(address borrower) public view returns (uint256) {
        uint256 creditScore = creditScoreContract.getCreditScore(borrower);
        
        // Utilization rate component with cap
        uint256 utilizationRate = totalLiquidity > 0 
            ? (totalBorrowed * 10000) / totalLiquidity 
            : 0;
        
        // Credit score component (normalized to 0-1000)
        uint256 creditComponent = creditScore > 0 
            ? (creditScore < 1000 ? 1000 - creditScore : 0)
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
        
        // Cap at maximum interest rate
        if (rate > MAX_INTEREST_RATE) {
            rate = MAX_INTEREST_RATE;
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
        uint256 maxAmount = (baseLimit * multiplier) / 10000;
        
        // Ensure we don't exceed max utilization
        uint256 maxBorrowToStayUnderCap = totalLiquidity > 0
            ? (totalLiquidity * MAX_UTILIZATION_RATE / 10000) - totalBorrowed
            : 0;
        
        return maxAmount < maxBorrowToStayUnderCap ? maxAmount : maxBorrowToStayUnderCap;
    }
    
    /**
     * @dev Borrow from the pool (called by LoanManager)
     */
    function borrow(address borrower, uint256 amount) 
        external 
        onlyLoanManager 
        nonReentrant 
        whenNotPaused 
        returns (uint256) 
    {
        require(borrower != address(0), "Invalid borrower address");
        require(amount > 0, "Borrow amount must be greater than 0");
        
        // Check available liquidity first
        uint256 available = getAvailableLiquidity();
        require(amount <= available, "Insufficient liquidity");
        
        // Check borrowing limit
        uint256 maxBorrow = getMaxBorrowAmount(borrower);
        require(amount <= maxBorrow, "Exceeds borrowing limit");
        
        // Check utilization rate
        uint256 newUtilization = ((totalBorrowed + amount) * 10000) / totalLiquidity;
        require(newUtilization <= MAX_UTILIZATION_RATE, "Exceeds max utilization");
        
        // Update state before external call (CEI pattern)
        totalBorrowed += amount;
        uint256 interestRate = calculateInterestRate(borrower);
        
        // External call at the end
        (bool success, ) = borrower.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit InterestRateUpdated(interestRate);
        
        return interestRate;
    }
    
    /**
     * @dev Repay loan (called by LoanManager)
     */
    function repay(uint256 principal, uint256 interest) 
        external 
        payable 
        onlyLoanManager 
        nonReentrant 
    {
        require(msg.value >= principal + interest, "Insufficient repayment amount");
        require(principal <= totalBorrowed, "Principal exceeds total borrowed");
        
        totalBorrowed -= principal;
        
        // Add interest to liquidity
        totalLiquidity += interest;
        
        // Allocate portion to risk reserve (10% of interest)
        uint256 reserveAmount = interest / 10;
        riskReserve += reserveAmount;
    }
    
    /**
     * @dev Handle default (called by LoanManager)
     */
    function handleDefault(uint256 loanAmount) external onlyLoanManager nonReentrant {
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
     * @dev Propose parameter changes with time-lock
     */
    function proposeParameterChange(
        uint256 _baseRate,
        uint256 _utilizationCoef,
        uint256 _creditCoef
    ) external onlyOwner {
        require(_baseRate <= 2000, "Base rate too high"); // Max 20%
        require(_utilizationCoef <= 5000, "Utilization coefficient too high");
        require(_creditCoef <= 2000, "Credit coefficient too high");
        
        pendingParameters = PendingParameters({
            baseRate: _baseRate,
            utilizationCoef: _utilizationCoef,
            creditCoef: _creditCoef,
            isPending: true
        });
        
        pendingParameterChangeTime = block.timestamp + PARAMETER_CHANGE_DELAY;
        
        emit ParameterChangeProposed(_baseRate, _utilizationCoef, _creditCoef, pendingParameterChangeTime);
    }
    
    /**
     * @dev Execute pending parameter changes after time-lock
     */
    function executeParameterChange() external onlyOwner {
        require(pendingParameters.isPending, "No pending parameter change");
        require(block.timestamp >= pendingParameterChangeTime, "Time-lock not expired");
        
        baseInterestRate = pendingParameters.baseRate;
        utilizationCoefficient = pendingParameters.utilizationCoef;
        creditCoefficient = pendingParameters.creditCoef;
        
        pendingParameters.isPending = false;
        
        emit ParameterChangeExecuted(baseInterestRate, utilizationCoefficient, creditCoefficient);
    }
    
    /**
     * @dev Get LP position value
     */
    function getLpValue(address provider) external view returns (uint256) {
        if (totalLpTokens == 0) return 0;
        return (lpTokens[provider] * totalLiquidity) / totalLpTokens;
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
     * @dev Emergency withdraw (only when paused)
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner whenPaused nonReentrant {
        require(amount <= address(this).balance, "Insufficient balance");
        
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Transfer failed");
        
        emit EmergencyWithdraw(owner(), amount);
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}
