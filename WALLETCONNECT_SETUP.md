# WalletConnect Setup Guide

To use RainbowKit wallet connection, you need a WalletConnect Project ID.

## Steps to Get Your Project ID

1. **Visit WalletConnect Cloud**
   - Go to https://cloud.walletconnect.com/

2. **Sign Up / Log In**
   - Create a free account or log in

3. **Create a New Project**
   - Click "Create New Project"
   - Enter project name: "ACB Protocol"
   - Select "App" as project type

4. **Get Your Project ID**
   - After creating the project, you'll see your Project ID
   - Copy this ID

5. **Update the Configuration**
   - Open `client/src/lib/wagmi.ts`
   - Replace `'YOUR_PROJECT_ID'` with your actual Project ID:

```typescript
export const config = getDefaultConfig({
  appName: 'ACB Protocol',
  projectId: 'your_actual_project_id_here', // ← Replace this
  chains: [baseSepolia, base],
  ssr: false,
});
```

## Important Notes

- The Project ID is **free** and has no cost
- It's safe to commit the Project ID to GitHub (it's not a secret)
- You can use the same Project ID for development and production
- Rate limits apply to the free tier, but they're generous for most projects

## Alternative: Skip WalletConnect

If you don't want to use WalletConnect, you can:
1. Remove WalletConnect-dependent wallets from the configuration
2. Use only browser extension wallets (MetaMask, Coinbase Wallet)

However, this will limit mobile wallet support.

## Troubleshooting

### "Invalid Project ID" Error
- Make sure you copied the entire Project ID
- Check for extra spaces or characters
- Try creating a new project

### Wallet Connection Not Working
- Clear browser cache
- Try a different wallet
- Check browser console for errors

## Resources

- WalletConnect Docs: https://docs.walletconnect.com/
- RainbowKit Docs: https://www.rainbowkit.com/docs/introduction
