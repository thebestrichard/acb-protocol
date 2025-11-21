// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CreditScore
 * @dev Manages credit scores for users in the ACB protocol
 */
contract CreditScore is Ownable {
    // Credit tier enum
    enum Tier { D, C, B, A }
    
    // Credit score data structure
    struct Score {
        uint256 score; // 0-1000 range
        Tier tier;
        uint256 totalLoans;
        uint256 successfulRepayments;
        uint256 defaults;
        uint256 lastCalculated;
    }
    
    // Mapping from user address to credit score
    mapping(address => Score) public creditScores;
    
    // Events
    event CreditScoreUpdated(address indexed user, uint256 score, Tier tier);
    event LoanRecorded(address indexed user, bool success);
    
    constructor() Ownable(msg.sender) {
        // Initialize with owner
    }
    
    /**
     * @dev Initialize credit score for a new user
     */
    function initializeCreditScore(address user) external onlyOwner {
        require(creditScores[user].lastCalculated == 0, "User already has credit score");
        
        creditScores[user] = Score({
            score: 500, // Default score 0.5
            tier: Tier.C,
            totalLoans: 0,
            successfulRepayments: 0,
            defaults: 0,
            lastCalculated: block.timestamp
        });
        
        emit CreditScoreUpdated(user, 500, Tier.C);
    }
    
    /**
     * @dev Record a loan event and update credit score
     */
    function recordLoan(address user, bool isRepayment, bool isDefault) external onlyOwner {
        Score storage userScore = creditScores[user];
        
        if (userScore.lastCalculated == 0) {
            // Initialize if not exists
            this.initializeCreditScore(user);
            userScore = creditScores[user];
        }
        
        userScore.totalLoans++;
        
        if (isRepayment) {
            userScore.successfulRepayments++;
            // Increase score for successful repayment
            if (userScore.score < 1000) {
                userScore.score += 50;
                if (userScore.score > 1000) userScore.score = 1000;
            }
        } else if (isDefault) {
            userScore.defaults++;
            // Decrease score for default
            if (userScore.score > 150) {
                userScore.score -= 150;
            } else {
                userScore.score = 0;
            }
        }
        
        // Update tier based on score
        userScore.tier = _calculateTier(userScore.score);
        userScore.lastCalculated = block.timestamp;
        
        emit CreditScoreUpdated(user, userScore.score, userScore.tier);
        emit LoanRecorded(user, isRepayment);
    }
    
    /**
     * @dev Get credit score for a user
     */
    function getCreditScore(address user) external view returns (uint256) {
        return creditScores[user].score;
    }
    
    /**
     * @dev Get credit tier for a user
     */
    function getCreditTier(address user) external view returns (Tier) {
        return creditScores[user].tier;
    }
    
    /**
     * @dev Get full credit data for a user
     */
    function getCreditData(address user) external view returns (Score memory) {
        return creditScores[user];
    }
    
    /**
     * @dev Calculate tier based on score
     */
    function _calculateTier(uint256 score) internal pure returns (Tier) {
        if (score >= 800) return Tier.A;
        if (score >= 600) return Tier.B;
        if (score >= 400) return Tier.C;
        return Tier.D;
    }
    
    /**
     * @dev Get borrowing limit multiplier based on tier
     * Returns basis points (10000 = 100%)
     */
    function getBorrowingLimitMultiplier(address user) external view returns (uint256) {
        Tier tier = creditScores[user].tier;
        
        if (tier == Tier.A) return 10000; // 100%
        if (tier == Tier.B) return 7000;  // 70%
        if (tier == Tier.C) return 5000;  // 50%
        return 2000; // 20% for Tier D
    }
    
    /**
     * @dev Get interest rate adjustment based on tier
     * Returns basis points adjustment (negative for discount, positive for premium)
     */
    function getInterestRateAdjustment(address user) external view returns (int256) {
        Tier tier = creditScores[user].tier;
        
        if (tier == Tier.A) return -1000; // -10%
        if (tier == Tier.B) return -500;  // -5%
        if (tier == Tier.C) return 500;   // +5%
        return 1500; // +15% for Tier D
    }
}
