# Post-Deployment Configuration Guide

After deploying smart contracts to Base Sepolia, follow these steps to update the frontend configuration.

---

## Step 1: Deploy Contracts

Run the deployment script:

```bash
# Set your private key (NEVER commit this!)
export PRIVATE_KEY="your_private_key_here"

# Deploy all contracts
cd contracts
forge script script/DeployAll.s.sol:DeployAll --rpc-url https://sepolia.base.org --broadcast --verify

# Or use the shortcut (if configured in foundry.toml)
forge script script/DeployAll.s.sol:DeployAll --chain base-sepolia --broadcast --verify
```

The script will output contract addresses and save them to `deployment-addresses.md`.

---

## Step 2: Update Frontend Configuration

Open `client/src/lib/contracts.ts` and update the `BASE_SEPOLIA_ADDRESSES` object with your deployed contract addresses:

```typescript
export const BASE_SEPOLIA_ADDRESSES: ContractAddresses = {
  creditScore: "0xYourCreditScoreAddress",
  creditPool: "0xYourCreditPoolAddress",
  loanManager: "0xYourLoanManagerAddress",
  matchingEngine: "0xYourMatchingEngineAddress",
};
```

---

## Step 3: Get WalletConnect Project ID

1. Visit [https://cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Sign up for a free account
3. Create a new project
4. Copy your Project ID

Update `client/src/lib/wagmi.ts`:

```typescript
export const config = getDefaultConfig({
  appName: 'ACB Protocol',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // ← Paste here
  chains: [baseSepolia, base],
  ssr: false,
});
```

---

## Step 4: Verify Contracts on BaseScan

The deployment script provides verification commands. Run them to verify your contracts:

```bash
# Example (use the actual commands from deployment-addresses.md)
forge verify-contract 0xYourAddress ContractName --chain base-sepolia --watch
```

---

## Step 5: Initialize Test Data

After deployment, you'll want to set up some test data:

### 5.1 Initialize Credit Scores

Use Foundry's `cast` to initialize credit scores for test accounts:

```bash
# Initialize credit score for a test address
cast send 0xYourCreditScoreAddress \
  "initializeCreditScore(address)" \
  0xTestUserAddress \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY
```

### 5.2 Add Initial Liquidity

Deposit some test ETH into the credit pool:

```bash
# Deposit 1 ETH to the pool
cast send 0xYourCreditPoolAddress \
  "deposit()" \
  --value 1ether \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY
```

---

## Step 6: Test the Frontend

1. Restart the development server:
   ```bash
   pnpm dev
   ```

2. Connect your wallet (make sure you're on Base Sepolia network)

3. Test key functions:
   - View your credit score
   - Check borrowing limits
   - Try depositing as a liquidity provider
   - Create a borrow order
   - Create a lend order
   - Check the order book

---

## Step 7: Monitor Transactions

Use BaseScan to monitor your transactions:

- **Base Sepolia Explorer**: https://sepolia.basescan.org/

Search for your contract addresses to see:
- Transaction history
- Contract interactions
- Event logs
- Verified source code

---

## Troubleshooting

### Contract Addresses Not Updating

If the frontend still shows `0x0000...`, make sure you:
1. Updated `client/src/lib/contracts.ts` with the correct addresses
2. Restarted the development server
3. Hard-refreshed your browser (Ctrl+Shift+R or Cmd+Shift+R)

### Wallet Connection Issues

If you can't connect your wallet:
1. Verify you added a valid WalletConnect Project ID
2. Make sure you're on Base Sepolia network in your wallet
3. Check browser console for errors

### Transaction Failures

Common reasons for transaction failures:
1. **Insufficient gas**: Add more Sepolia ETH to your wallet
2. **Wrong network**: Switch to Base Sepolia in your wallet
3. **Contract not initialized**: Make sure you initialized credit scores
4. **Insufficient liquidity**: Add more liquidity to the pool

### Getting Sepolia ETH

You need Sepolia ETH to interact with Base Sepolia. Get it from:
1. [Sepolia Faucet](https://sepoliafaucet.com/)
2. [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
3. Bridge from Ethereum Sepolia to Base Sepolia using the [Base Bridge](https://bridge.base.org/)

---

## Security Checklist

Before going to mainnet, ensure:

- [ ] All contracts verified on BaseScan
- [ ] Professional security audit completed
- [ ] Multi-signature wallet configured for admin functions
- [ ] Emergency pause mechanism tested
- [ ] Rate limits tested and configured appropriately
- [ ] All test transactions successful on testnet
- [ ] Frontend error handling implemented
- [ ] User documentation completed
- [ ] Incident response plan prepared

---

## Next Steps

After successful testnet deployment:

1. **Gather Feedback**: Share with beta testers and collect feedback
2. **Monitor Performance**: Track gas costs, transaction success rates
3. **Iterate**: Fix any issues discovered during testing
4. **Audit**: Get a professional security audit before mainnet
5. **Mainnet Deployment**: Follow the same process for Base Mainnet

---

## Support

If you encounter issues:
- Check the [Foundry Book](https://book.getfoundry.sh/)
- Review [Base documentation](https://docs.base.org/)
- Join the [Base Discord](https://discord.gg/buildonbase)
