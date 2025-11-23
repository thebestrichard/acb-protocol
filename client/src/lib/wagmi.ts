import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, base } from 'wagmi/chains';
import { getContractAddresses } from './contracts';

export const config = getDefaultConfig({
  appName: 'ACB Protocol',
  projectId: 'YOUR_PROJECT_ID', // Get from https://cloud.walletconnect.com
  chains: [baseSepolia, base],
  ssr: false,
});

// Get contract addresses for Base Sepolia (default chain)
export const CONTRACT_ADDRESSES = getContractAddresses(84532);
