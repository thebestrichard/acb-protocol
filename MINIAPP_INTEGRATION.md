# Worldcoin Mini App Integration Guide

This guide explains how ACB Protocol is integrated as a Worldcoin Mini App.

---

## Overview

ACB Protocol is now a fully functional Worldcoin Mini App that leverages:
- **World ID** for secure, privacy-preserving user verification
- **MiniKit-JS SDK** for seamless integration with World App
- **On-chain credit scoring** combined with World ID proof-of-personhood

---

## Features

### 1. World ID Verification
- Users verify their identity using World ID (Orb or Device level)
- Proof-of-personhood ensures one person = one credit score
- Privacy-preserving: no personal data is stored on-chain

### 2. MiniKit Payment Integration
- Send and receive payments directly within World App
- Support for USDC, ETH, and other tokens
- Seamless transaction signing

### 3. Wallet Authentication
- Sign in with World App wallet
- No need for external wallet extensions
- Secure message signing for authentication

### 4. Smart Contract Interactions
- Borrow and lend directly from World App
- View credit scores and loan history
- Transparent on-chain operations

---

## Setup Instructions

### Step 1: Register Your Mini App

1. Visit [World Developer Portal](https://developer.worldcoin.org/)
2. Create a new Mini App
3. Fill in the required information:
   - **Name**: ACB Protocol
   - **Description**: AMM-based unsecured credit borrowing protocol
   - **Categories**: DeFi, Lending
   - **Permissions**: verify, wallet-auth, send-transaction, sign-message, pay

4. Get your `app_id` from the dashboard

### Step 2: Update Configuration

Update `client/src/lib/minikit.ts` with your `app_id`:

```typescript
// Add this configuration
export const MINIAPP_CONFIG = {
  app_id: 'your_app_id_here', // From World Developer Portal
  action: 'acb-protocol-login',
};
```

### Step 3: Deploy to World App

1. Build your application:
   ```bash
   pnpm build
   ```

2. Deploy to a public URL (e.g., Vercel, Netlify)

3. Submit your Mini App for review:
   - Go to World Developer Portal
   - Navigate to your Mini App
   - Click "Submit for Review"
   - Provide the deployed URL

### Step 4: Test in World App

1. Download World App on your mobile device
2. Enable Developer Mode in Settings
3. Add your local development URL for testing
4. Test all features:
   - World ID verification
   - Borrowing flow
   - Lending flow
   - Credit score display
   - Transaction signing

---

## Key Components

### MiniKit Initialization

```typescript
import { initMiniKit, isInWorldApp } from '@/lib/minikit';

// Initialize on app load
useEffect(() => {
  initMiniKit();
}, []);
```

### World ID Verification

```typescript
import { useWorldID } from '@/hooks/useWorldID';

const { verify, isVerifying } = useWorldID();

const handleVerify = async () => {
  const result = await verify('acb-protocol-login');
  if (result) {
    // User verified successfully
    console.log('Verification proof:', result.proof);
  }
};
```

### Sending Payments

```typescript
import { sendPayment } from '@/lib/minikit';

const handlePayment = async () => {
  await sendPayment({
    reference: 'loan-repayment-123',
    to: '0xRecipientAddress',
    tokens: [{
      symbol: 'USDC',
      token_amount: '100.00',
    }],
    description: 'Loan repayment',
  });
};
```

### Signing Transactions

```typescript
import { sendTransaction } from '@/lib/minikit';

const handleBorrow = async () => {
  await sendTransaction({
    transaction: [{
      address: CONTRACT_ADDRESSES.loanManager,
      abi: LoanManagerABI,
      functionName: 'requestLoan',
      args: [parseEther('1.0'), BigInt(30)],
    }],
  });
};
```

---

## User Flow

### Borrowing Flow

1. **Verify Identity**: User verifies with World ID
2. **Check Credit Score**: System calculates on-chain credit score
3. **Request Loan**: User enters amount and duration
4. **Sign Transaction**: MiniKit prompts for transaction approval
5. **Receive Funds**: Loan is disbursed to user's wallet

### Lending Flow

1. **Verify Identity**: User verifies with World ID
2. **Deposit Funds**: User deposits assets to liquidity pool
3. **Receive LP Tokens**: System mints LP tokens representing share
4. **Earn Interest**: User earns yield from borrower repayments
5. **Withdraw**: User can withdraw anytime based on liquidity

---

## Security Considerations

### World ID Integration

- **Proof Verification**: Always verify World ID proofs on-chain
- **Nullifier Hashing**: Prevent duplicate verifications
- **Verification Level**: Use Orb level for highest security

### Smart Contract Security

- **Reentrancy Guards**: All state-changing functions protected
- **Access Control**: Only verified users can borrow
- **Rate Limiting**: Prevent abuse with time-based limits

### Privacy

- **Zero-Knowledge Proofs**: World ID uses ZK proofs
- **No PII Storage**: No personal information stored on-chain
- **Pseudonymous**: Users identified by nullifier hash only

---

## Testing

### Local Testing

```bash
# Start development server
pnpm dev

# In World App, add local URL:
# Settings → Developer Mode → Add Mini App
# URL: http://your-local-ip:3000
```

### Testnet Testing

1. Deploy contracts to Base Sepolia
2. Update contract addresses in `client/src/lib/contracts.ts`
3. Deploy frontend to public URL
4. Test with World App testnet mode

---

## Submission Checklist

Before submitting to World App Store:

- [ ] World ID verification working
- [ ] All transactions signing correctly
- [ ] Payment flows tested
- [ ] Credit scoring functional
- [ ] UI optimized for mobile
- [ ] Error handling implemented
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Smart contracts audited
- [ ] Testnet testing complete

---

## Resources

- [MiniKit-JS Documentation](https://docs.world.org/mini-apps)
- [World ID Documentation](https://docs.world.org/world-id)
- [Mini App Store Guidelines](https://docs.world.org/mini-apps/store-guidelines)
- [ACB Protocol GitHub](https://github.com/thebestrichard/acb-protocol)

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/thebestrichard/acb-protocol/issues
- World Developer Discord: https://discord.gg/worldcoin
