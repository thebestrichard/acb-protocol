# Requirements Document: AMM-based Unsecured Credit Lending Protocol

## 1. Introduction

### 1.1 Purpose

This document outlines the functional and non-functional requirements for the AMM-based Unsecured Credit Lending Protocol. The protocol aims to provide a decentralized, non-collateralized lending solution by leveraging an Automated Market Maker (AMM) and a credit scoring system.

### 1.2 Scope

The scope of this document covers the core functionalities of the protocol, including user registration, credit assessment, lending and borrowing, risk management, and the associated incentive mechanisms.

### 1.3 Intended Audience

This document is intended for project stakeholders, including the development team, product managers, and quality assurance engineers, to ensure a common understanding of the system's requirements.

## 2. User Requirements

### 2.1 Borrower Requirements

- **Unsecured Loans:** Users must be able to borrow assets without providing collateral.
- **Credit-based Borrowing:** The borrowing limit and interest rate for a user must be determined by their credit score.
- **Transparent Terms:** The interest rate and loan terms must be clearly displayed to the user before they commit to a loan.

### 2.2 Lender (Liquidity Provider) Requirements

- **Earning Yield:** Users must be able to deposit assets into a liquidity pool to earn interest.
- **Risk Mitigation:** The protocol must have mechanisms in place to protect lenders' capital from borrower defaults.
- **Liquidity Management:** Lenders must be able to withdraw their assets from the liquidity pool, subject to the protocol's terms and conditions.

## 3. System Requirements

### 3.1 Functional Requirements

#### 3.1.1 Credit Scoring System

- The system shall calculate a credit score for each user based on their on-chain activities, including transaction history, repayment history, and social signals.
- The credit score shall be a numerical value, for instance, between 0 and 1, and will be used to determine a user's creditworthiness.
- The system shall periodically update the credit scores based on new on-chain data.

#### 3.1.2 AMM-based Lending Pool

- The protocol shall utilize an AMM to manage the liquidity pool.
- The AMM shall automatically match borrowers and lenders.
- The AMM shall determine the interest rates for loans based on the supply and demand of assets in the pool.

#### 3.1.3 Dynamic Interest Rate Mechanism

- The interest rate for a loan shall be dynamically adjusted based on the borrower's credit score and the utilization of the liquidity pool.
- The formula for calculating the interest rate shall be transparent and publicly available.

#### 3.1.4 Loan Management

- The system shall allow users to initiate loan requests, specifying the desired amount and duration.
- The system shall disburse the loan to the borrower upon approval.
- The system shall facilitate the repayment of loans, including principal and interest.

#### 3.1.5 Risk Management

- The system shall implement a credit tiering system, where different credit score ranges correspond to different borrowing limits and interest rates.
- The system shall maintain a risk reserve, funded by a portion of the protocol's revenue, to cover losses from defaults.
- In the event of a default, the system shall automatically liquidate the borrower's position and record the event, which will negatively impact their credit score.

#### 3.1.6 Incentive and Governance Mechanism

- The protocol shall have a native governance token that allows holders to participate in the governance of the protocol.
- The protocol shall have an incentive mechanism to reward users for positive behaviors, such as timely repayments and providing liquidity.

### 3.2 Non-Functional Requirements

- **Security:** The smart contracts shall be audited by a reputable third-party security firm to identify and mitigate potential vulnerabilities.
- **Transparency:** All transactions, interest rate calculations, and credit score data shall be publicly accessible on the blockchain.
- **Scalability:** The protocol shall be designed to handle a growing number of users and transactions without significant performance degradation.
- **Usability:** The front-end dApp shall provide a user-friendly interface for interacting with the protocol.
