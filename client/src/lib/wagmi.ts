import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, base } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'ACB Protocol',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [baseSepolia, base],
  ssr: false,
});

// Contract addresses (will be updated after deployment)
export const CONTRACT_ADDRESSES = {
  creditScore: '0x0000000000000000000000000000000000000000',
  creditPool: '0x0000000000000000000000000000000000000000',
  loanManager: '0x0000000000000000000000000000000000000000',
} as const;
