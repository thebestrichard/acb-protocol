# NFT Minting Feature Guide

## Overview

The ACB Protocol now includes an **exclusive NFT minting feature** for users who complete World ID verification. This feature allows verified users to mint a unique Credit NFT that represents their on-chain credit identity.

## Features

### 1. **Exclusive Access**
- Only users who have completed World ID verification can mint NFTs
- Each user can mint only ONE NFT per account
- Each World ID verification (nullifier hash) can only be used once

### 2. **Dynamic Credit NFT**
- The NFT displays a visual representation of the user's credit score
- Visual appearance changes based on credit tier (S, A, B, C, D)
- NFT includes credit score, tier, and verification timestamp

### 3. **Minting Process**

#### Prerequisites
1. Complete World ID verification on the Profile page
2. Connect your Web3 wallet
3. Have a valid credit score

#### Steps to Mint
1. Navigate to the **Profile** page
2. Verify your identity with World ID (if not already verified)
3. Click the **"🎨 Mint Your Exclusive Credit NFT"** button
4. Wait for the transaction to complete
5. Your NFT will be displayed with a "NFT Already Minted" badge

### 4. **Minting Status Display**

The minting button shows different states:

- **Not Verified**: "Complete World ID Verification to Mint NFT" (disabled)
- **Ready to Mint**: "🎨 Mint Your Exclusive Credit NFT" (clickable)
- **Minting**: "Minting Your Credit NFT..." (with loading spinner)
- **Already Minted**: Green badge showing "NFT Already Minted" with Token ID

## Technical Implementation

### Database Schema

A new `nft_mints` table tracks all minted NFTs:

```sql
CREATE TABLE nft_mints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_id INT NOT NULL,
  nullifier_hash VARCHAR(256) NOT NULL,
  credit_score INT NOT NULL,
  tier VARCHAR(10) NOT NULL,
  minted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

#### Get User's Minted NFT
```typescript
trpc.nft.getMyMint.useQuery()
```

Returns the user's minted NFT or `undefined` if not minted.

#### Mint NFT
```typescript
trpc.nft.mint.useMutation()
```

**Input:**
- `nullifierHash`: World ID verification hash
- `creditScore`: User's current credit score
- `tier`: Credit tier (S, A, B, C, D)
- `tokenId`: Unique token identifier

**Returns:**
- `success`: Boolean indicating success
- `tokenId`: The minted NFT's token ID

### Security Features

1. **Duplicate Prevention**
   - Users cannot mint multiple NFTs
   - Each nullifier hash can only be used once
   - Database-level uniqueness constraints

2. **Verification Required**
   - Only World ID verified users can mint
   - Nullifier hash must be valid and unique

3. **Error Handling**
   - Clear error messages for duplicate attempts
   - Transaction rollback on failures
   - Comprehensive logging

## Testing

All NFT minting functionality is covered by comprehensive tests:

```bash
pnpm test server/nft.mint.test.ts
```

**Test Coverage:**
- ✅ Successfully mint NFT for verified user
- ✅ Prevent duplicate minting for same user
- ✅ Prevent reusing same nullifier hash
- ✅ Retrieve minted NFT for user
- ✅ Return undefined for user without minted NFT

**Test Results:** 5/5 tests passing

## User Experience

### Profile Page Integration

The NFT minting button is integrated into the Profile page within the "Your Credit NFT" card:

1. **Before Minting:**
   - Shows "Mint Your Exclusive Credit NFT" button
   - Button is disabled if not verified

2. **During Minting:**
   - Shows loading spinner with "Minting Your Credit NFT..." message
   - Button is disabled during transaction

3. **After Minting:**
   - Shows green success badge with "NFT Already Minted"
   - Displays Token ID
   - Button is replaced with status display

### Visual Design

- Gradient button with blue-to-purple color scheme
- Smooth animations and transitions
- Glassmorphism styling consistent with ACB Protocol theme
- Responsive design for mobile and desktop

## Future Enhancements

Potential improvements for future versions:

1. **On-Chain NFT Contract**
   - Deploy ERC-721 contract on Base Sepolia
   - Mint actual on-chain NFTs
   - Enable NFT transfers and marketplace listing

2. **Dynamic NFT Updates**
   - Automatically update NFT metadata when credit score changes
   - Implement ERC-721 metadata refresh mechanism

3. **NFT Utilities**
   - Governance voting rights based on NFT ownership
   - Exclusive access to premium features
   - NFT staking for additional rewards

4. **Social Features**
   - Share NFT on social media
   - NFT gallery page
   - Leaderboard based on credit scores

## Troubleshooting

### Common Issues

**Issue:** Button shows "Complete World ID Verification to Mint NFT"
- **Solution:** Click "Verify with World ID" button first

**Issue:** Error "NFT already minted for this user"
- **Solution:** You have already minted your NFT. Check the Profile page for your existing NFT.

**Issue:** Error "This World ID verification has already been used"
- **Solution:** This World ID has been used by another account. Each verification can only mint one NFT.

**Issue:** Button shows loading spinner indefinitely
- **Solution:** Refresh the page and check your wallet connection. Ensure you have sufficient gas fees.

## Support

For issues or questions:
- Check the [GitHub repository](https://github.com/thebestrichard/acb-protocol)
- Review the [Technical Documentation](./TECHNICAL_DOCUMENT.md)
- Open an issue on GitHub

---

**Built with ❤️ by the ACB Protocol Team**
