export const CreditScoreABI = [
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getCreditScore",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getCreditData",
    "outputs": [{
      "components": [
        {"internalType": "uint256", "name": "score", "type": "uint256"},
        {"internalType": "enum CreditScore.Tier", "name": "tier", "type": "uint8"},
        {"internalType": "uint256", "name": "totalLoans", "type": "uint256"},
        {"internalType": "uint256", "name": "successfulRepayments", "type": "uint256"},
        {"internalType": "uint256", "name": "defaults", "type": "uint256"},
        {"internalType": "uint256", "name": "lastCalculated", "type": "uint256"}
      ],
      "internalType": "struct CreditScore.Score",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const CreditPoolABI = [
  {
    "inputs": [],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "lpAmount", "type": "uint256"}],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalLiquidity",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalBorrowed",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "borrower", "type": "address"}],
    "name": "calculateInterestRate",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "borrower", "type": "address"}],
    "name": "getMaxBorrowAmount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "provider", "type": "address"}],
    "name": "getLpValue",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "lpTokens",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const LoanManagerABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint256", "name": "durationDays", "type": "uint256"}
    ],
    "name": "requestLoan",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "loanId", "type": "uint256"}],
    "name": "repayLoan",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "loanId", "type": "uint256"}],
    "name": "getLoan",
    "outputs": [{
      "components": [
        {"internalType": "address", "name": "borrower", "type": "address"},
        {"internalType": "uint256", "name": "amount", "type": "uint256"},
        {"internalType": "uint256", "name": "interestRate", "type": "uint256"},
        {"internalType": "uint256", "name": "duration", "type": "uint256"},
        {"internalType": "uint256", "name": "borrowedAt", "type": "uint256"},
        {"internalType": "uint256", "name": "dueDate", "type": "uint256"},
        {"internalType": "uint256", "name": "repaidAmount", "type": "uint256"},
        {"internalType": "enum LoanManager.LoanStatus", "name": "status", "type": "uint8"},
        {"internalType": "uint256", "name": "creditScoreAtBorrow", "type": "uint256"}
      ],
      "internalType": "struct LoanManager.Loan",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserLoans",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "loanId", "type": "uint256"}],
    "name": "calculateTotalOwed",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
