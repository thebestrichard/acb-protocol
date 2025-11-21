# ACB Protocol - AMM-based Credit Borrowing Protocol

![ACB Protocol](https://img.shields.io/badge/License-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-orange.svg)
![Base Chain](https://img.shields.io/badge/Chain-Base-blue.svg)

**ACB Protocol** is a decentralized, unsecured credit lending platform built on Ethereum Base Chain. It leverages an Automated Market Maker (AMM) mechanism combined with on-chain credit scoring to enable borrowing without collateral.

## 🌟 Features

**For Borrowers:**
- **No Collateral Required**: Borrow based on your on-chain credit score without locking up assets
- **Dynamic Interest Rates**: AMM-based rates that adjust based on supply, demand, and credit scores
- **Credit Score System**: Build your credit history through timely repayments
- **Transparent Terms**: All loan terms and rates are clearly displayed before commitment

**For Lenders (Liquidity Providers):**
- **Earn Yield**: Deposit assets into the liquidity pool to earn interest from borrowers
- **Risk Management**: Protected by credit tiering, risk reserves, and transparent liquidation mechanisms
- **Flexible Withdrawals**: Withdraw your assets anytime based on available liquidity
- **LP Token Rewards**: Receive LP tokens representing your share of the pool

## 📋 Table of Contents

- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## 🏗️ Architecture

The ACB Protocol consists of three main components:

### 1. Smart Contracts (Solidity)
- **CreditScore.sol**: Manages user credit scores and tiering
- **CreditPool.sol**: AMM-based liquidity pool with dynamic interest rates
- **LoanManager.sol**: Handles loan lifecycle including borrowing, repayment, and defaults

### 2. Backend (tRPC + Express)
- Credit score calculation and querying
- Loan management procedures
- LP position tracking
- Transaction history

### 3. Frontend (React + Tailwind)
- Landing page with protocol overview
- Borrower dashboard
- Lender dashboard
- Loan request and repayment interface

## 📜 Smart Contracts

### CreditScore Contract

Manages credit scores for users based on their on-chain activities and repayment history.

**Key Features:**
- Credit score range: 0-1000
- Four credit tiers: A, B, C, D
- Automatic tier calculation based on score
- Borrowing limit multipliers per tier
- Interest rate adjustments per tier

### CreditPool Contract

AMM-based liquidity pool that manages deposits, withdrawals, and lending.

**Interest Rate Formula:**
```
r = r_0 + k * (D / L) + c * (1 - C_s)
```

Where:
- `r_0`: Base interest rate
- `D`: Total borrowed amount
- `L`: Total liquidity
- `C_s`: Borrower's credit score (0-1)
- `k`, `c`: Adjustment coefficients

### LoanManager Contract

Handles the complete loan lifecycle from request to repayment or default.

**Features:**
- Loan request with credit limit checks
- Automatic interest calculation
- Repayment processing
- Default handling and liquidation

## 🚀 Installation

### Prerequisites

- Node.js 18+ and pnpm
- Foundry (for smart contract development)
- Git

### Clone the Repository

```bash
git clone https://github.com/yourusername/acb-protocol.git
cd acb-protocol
```

### Install Dependencies

```bash
# Install Node.js dependencies
pnpm install

# Install Foundry dependencies
forge install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=your_database_url

# Smart Contract Deployment
PRIVATE_KEY=your_private_key
BASESCAN_API_KEY=your_basescan_api_key
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org

# Application
VITE_APP_TITLE=ACB Protocol
```

**Important**: You also need to set up WalletConnect Project ID. See [WALLETCONNECT_SETUP.md](./WALLETCONNECT_SETUP.md) for instructions.

### Database Setup

```bash
# Push database schema
pnpm db:push
```

## 💻 Usage

### Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
pnpm build
```

## 🛠️ Development

### Smart Contract Development

Compile contracts:
```bash
forge build
```

Run contract tests:
```bash
forge test
```

### Backend Development

The backend uses tRPC for type-safe API calls. Add new procedures in `server/routers.ts` and database queries in `server/db.ts`.

### Frontend Development

The frontend is built with React 19 and Tailwind CSS 4. Components are located in `client/src/components/` and pages in `client/src/pages/`.

## 🧪 Testing

### Run All Tests

```bash
pnpm test
```

### Run Specific Tests

```bash
# Backend tests only
pnpm test server/

# Smart contract tests
forge test
```

## 🚢 Deployment

### Deploy Smart Contracts

**For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

Quick deployment to Base Sepolia testnet:

```bash
forge script contracts/script/Deploy.s.sol:Deploy \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY
```

After deployment, update contract addresses in `client/src/lib/wagmi.ts`

### Contract Addresses

| Contract | Base Sepolia | Base Mainnet |
|----------|--------------|--------------|
| CreditScore | TBD | TBD |
| CreditPool | TBD | TBD |
| LoanManager | TBD | TBD |

## 📚 Documentation

For detailed documentation, please refer to:

- [Whitepaper](./whitepaper.md) - Complete protocol overview and economics
- [Technical Document](./technical_document.md) - Technical architecture and implementation
- [Functional Document](./functional_document.md) - Feature specifications
- [Requirements Document](./requirements_document.md) - System requirements

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- Website: [Coming Soon]
- Documentation: [Coming Soon]
- Twitter: [Coming Soon]
- Discord: [Coming Soon]

## ⚠️ Disclaimer

This protocol is in active development and has not been audited. Use at your own risk. Never invest more than you can afford to lose.

## 👥 Team

Built with ❤️ by the ACB Protocol team.

---

**Built on Ethereum Base Chain** 🔵
