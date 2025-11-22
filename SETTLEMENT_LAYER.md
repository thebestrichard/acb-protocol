# Verifiable Settlement Layer Architecture

## Overview

The ACB Protocol implements a fully transparent, on-chain verifiable settlement layer that records all lending and borrowing activities. Every matching operation is publicly auditable on the blockchain.

## Architecture Components

### 1. Order Book Structure

```
BorrowOrder {
  orderId: uint256
  borrower: address
  amount: uint256
  maxInterestRate: uint256
  duration: uint256
  creditScore: uint256
  timestamp: uint256
  status: OrderStatus (Pending, Matched, Cancelled, Expired)
}

LendOrder {
  orderId: uint256
  lender: address
  amount: uint256
  minInterestRate: uint256
  minCreditScore: uint256
  timestamp: uint256
  status: OrderStatus (Pending, Matched, Cancelled, Withdrawn)
}
```

### 2. Matching Record

```
MatchRecord {
  matchId: uint256
  borrowOrderId: uint256
  lendOrderId: uint256
  borrower: address
  lender: address
  amount: uint256
  interestRate: uint256
  duration: uint256
  matchedAt: uint256
  settledAt: uint256
  status: MatchStatus (Matched, Settled, Defaulted)
  matchingProof: bytes32 (hash of matching parameters)
}
```

### 3. Settlement Verification

Each match generates a cryptographic proof that can be independently verified:

```
matchingProof = keccak256(
  borrowOrderId,
  lendOrderId,
  amount,
  interestRate,
  duration,
  timestamp,
  matchingAlgorithmVersion
)
```

## Matching Algorithm

### Price-Time Priority

1. **Borrow Orders**: Sorted by highest acceptable interest rate (willing to pay more = higher priority)
2. **Lend Orders**: Sorted by lowest required interest rate (willing to accept less = higher priority)
3. **Time Priority**: Among same rates, earlier orders get matched first

### Matching Process

```
1. Borrower submits order with:
   - Desired amount
   - Maximum interest rate willing to pay
   - Loan duration
   - Credit score (calculated on-chain)

2. System checks available lend orders:
   - Filter by lender's minimum credit score requirement
   - Filter by interest rate compatibility
   - Sort by best terms for borrower

3. Match execution:
   - Calculate final interest rate (AMM-based)
   - Create match record with proof
   - Transfer funds from lender to borrower
   - Emit MatchExecuted event

4. Settlement tracking:
   - Record repayment schedule
   - Track each payment on-chain
   - Update match status
   - Emit settlement events
```

## Transparency Features

### 1. Public Order Book

All orders are publicly visible on-chain:
- Anyone can query pending orders
- Historical orders are permanently stored
- Order modifications are tracked with timestamps

### 2. Matching Events

Every match emits comprehensive events:

```solidity
event BorrowOrderCreated(
    uint256 indexed orderId,
    address indexed borrower,
    uint256 amount,
    uint256 maxInterestRate,
    uint256 duration
);

event LendOrderCreated(
    uint256 indexed orderId,
    address indexed lender,
    uint256 amount,
    uint256 minInterestRate
);

event OrdersMatched(
    uint256 indexed matchId,
    uint256 indexed borrowOrderId,
    uint256 indexed lendOrderId,
    address borrower,
    address lender,
    uint256 amount,
    uint256 interestRate,
    bytes32 matchingProof
);

event MatchSettled(
    uint256 indexed matchId,
    uint256 principalPaid,
    uint256 interestPaid,
    uint256 timestamp
);
```

### 3. Verification Functions

Public functions for independent verification:

```solidity
function verifyMatch(uint256 matchId) external view returns (bool);
function getMatchProof(uint256 matchId) external view returns (bytes32);
function getOrderHistory(address user) external view returns (Order[] memory);
function getMatchHistory(address user) external view returns (Match[] memory);
```

## Security Considerations

### 1. Front-Running Protection

- Orders are committed with a hash first
- Actual parameters revealed in separate transaction
- Time-lock between commit and reveal

### 2. Manipulation Prevention

- Minimum order size to prevent spam
- Rate limiting on order creation
- Credit score requirements enforced on-chain

### 3. Dispute Resolution

- All matching parameters recorded on-chain
- Cryptographic proofs for each match
- Immutable audit trail

## Query Interface

### For Users

```solidity
// Get my pending borrow orders
function getMyBorrowOrders() external view returns (BorrowOrder[] memory);

// Get my pending lend orders
function getMyLendOrders() external view returns (LendOrder[] memory);

// Get my matching history
function getMyMatches() external view returns (MatchRecord[] memory);
```

### For Auditors

```solidity
// Get all matches in a time range
function getMatchesByTimeRange(uint256 from, uint256 to) 
    external view returns (MatchRecord[] memory);

// Get matching statistics
function getMatchingStats() external view returns (
    uint256 totalMatches,
    uint256 totalVolume,
    uint256 averageInterestRate
);

// Verify matching algorithm execution
function verifyMatchingAlgorithm(uint256 matchId) 
    external view returns (bool isValid, string memory reason);
```

## Benefits

1. **Complete Transparency**: Every step is recorded on-chain
2. **Independent Verification**: Anyone can audit the matching process
3. **Dispute Prevention**: Cryptographic proofs eliminate ambiguity
4. **Regulatory Compliance**: Full audit trail for compliance
5. **Trust Minimization**: No need to trust centralized matching engine

## Implementation Status

- [x] Architecture design
- [ ] MatchingEngine smart contract
- [ ] Order book implementation
- [ ] Matching algorithm
- [ ] Settlement verification
- [ ] Frontend integration
- [ ] Testing and audit
