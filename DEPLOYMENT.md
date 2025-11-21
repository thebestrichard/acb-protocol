# ACB Protocol Deployment Guide

This guide will help you deploy the ACB Protocol smart contracts to Base Sepolia testnet and Base mainnet.

## Prerequisites

1. **Foundry installed**: Make sure you have Foundry installed
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Private Key**: You need a private key with ETH on Base Sepolia for deployment
   - Get Base Sepolia ETH from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

3. **BaseScan API Key**: Get a free API key from https://basescan.org/apis

## Environment Setup

Create a `.env` file in the project root:

```env
# Deployment
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here

# RPC URLs
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org
```

## Deployment Steps

### 1. Compile Contracts

```bash
cd /path/to/acb-protocol
forge build
```

### 2. Deploy to Base Sepolia (Testnet)

```bash
forge script contracts/script/Deploy.s.sol:Deploy \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY \
  -vvvv
```

### 3. Save Contract Addresses

After deployment, you'll see output like:

```
CreditScore deployed at: 0x...
CreditPool deployed at: 0x...
LoanManager deployed at: 0x...
```

**Important**: Copy these addresses!

### 4. Update Frontend Configuration

Update `client/src/lib/wagmi.ts` with the deployed contract addresses:

```typescript
export const CONTRACT_ADDRESSES = {
  creditScore: '0xYourCreditScoreAddress',
  creditPool: '0xYourCreditPoolAddress',
  loanManager: '0xYourLoanManagerAddress',
} as const;
```

### 5. Initialize the Pool (Optional)

If you want to add initial liquidity for testing:

```bash
cast send $CREDIT_POOL_ADDRESS \
  "deposit()" \
  --value 1ether \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

## Deploy to Base Mainnet

⚠️ **Warning**: Only deploy to mainnet after thorough testing on testnet!

```bash
forge script contracts/script/Deploy.s.sol:Deploy \
  --rpc-url $BASE_MAINNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY \
  -vvvv
```

## Verify Contracts Manually (if auto-verify fails)

If automatic verification fails, verify manually:

```bash
forge verify-contract \
  --chain-id 84532 \
  --num-of-optimizations 200 \
  --watch \
  --constructor-args $(cast abi-encode "constructor()") \
  --etherscan-api-key $BASESCAN_API_KEY \
  --compiler-version v0.8.20+commit.a1b79de6 \
  $CONTRACT_ADDRESS \
  contracts/src/CreditScore.sol:CreditScore
```

## Useful Commands

### Check Contract Balance
```bash
cast balance $CONTRACT_ADDRESS --rpc-url $BASE_SEPOLIA_RPC_URL
```

### Call Read Functions
```bash
# Get credit score
cast call $CREDIT_SCORE_ADDRESS \
  "getCreditScore(address)(uint256)" \
  $USER_ADDRESS \
  --rpc-url $BASE_SEPOLIA_RPC_URL

# Get pool stats
cast call $CREDIT_POOL_ADDRESS \
  "totalLiquidity()(uint256)" \
  --rpc-url $BASE_SEPOLIA_RPC_URL
```

### Send Transactions
```bash
# Request a loan
cast send $LOAN_MANAGER_ADDRESS \
  "requestLoan(uint256,uint256)" \
  1000000000000000000 30 \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

## Troubleshooting

### Gas Estimation Failed
- Make sure you have enough ETH in your wallet
- Check if the transaction would revert (e.g., insufficient credit score)

### Verification Failed
- Wait a few minutes and try again
- Verify manually using the commands above
- Check that your BaseScan API key is correct

### Contract Not Found
- Make sure the contract was deployed successfully
- Check the transaction on BaseScan
- Verify you're using the correct RPC URL

## Network Information

### Base Sepolia Testnet
- Chain ID: 84532
- RPC URL: https://sepolia.base.org
- Explorer: https://sepolia.basescan.org
- Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### Base Mainnet
- Chain ID: 8453
- RPC URL: https://mainnet.base.org
- Explorer: https://basescan.org

## Security Considerations

1. **Never commit private keys** to version control
2. **Test thoroughly** on testnet before mainnet deployment
3. **Audit contracts** before mainnet deployment
4. **Use a hardware wallet** for mainnet deployments
5. **Set up monitoring** for deployed contracts

## Next Steps

After deployment:
1. Update the README with contract addresses
2. Test all functions through the frontend
3. Monitor contract activity
4. Set up event listeners for important events
5. Consider setting up a subgraph for easier querying

## Support

If you encounter issues:
- Check the [Foundry documentation](https://book.getfoundry.sh/)
- Visit [Base documentation](https://docs.base.org/)
- Open an issue on GitHub
