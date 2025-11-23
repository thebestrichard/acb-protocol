/**
 * Smart Contract Addresses Configuration
 * 
 * Update these addresses after deploying contracts to Base Sepolia
 */

export interface ContractAddresses {
  creditScore: `0x${string}`;
  creditPool: `0x${string}`;
  loanManager: `0x${string}`;
  matchingEngine: `0x${string}`;
}

// Base Sepolia Testnet Addresses
// TODO: Update these after deployment
export const BASE_SEPOLIA_ADDRESSES: ContractAddresses = {
  creditScore: "0x0000000000000000000000000000000000000000",
  creditPool: "0x0000000000000000000000000000000000000000",
  loanManager: "0x0000000000000000000000000000000000000000",
  matchingEngine: "0x0000000000000000000000000000000000000000",
};

// Base Mainnet Addresses (for future production deployment)
export const BASE_MAINNET_ADDRESSES: ContractAddresses = {
  creditScore: "0x0000000000000000000000000000000000000000",
  creditPool: "0x0000000000000000000000000000000000000000",
  loanManager: "0x0000000000000000000000000000000000000000",
  matchingEngine: "0x0000000000000000000000000000000000000000",
};

// Get contract addresses based on chain ID
export function getContractAddresses(chainId: number): ContractAddresses {
  switch (chainId) {
    case 84532: // Base Sepolia
      return BASE_SEPOLIA_ADDRESSES;
    case 8453: // Base Mainnet
      return BASE_MAINNET_ADDRESSES;
    default:
      console.warn(`Unknown chain ID: ${chainId}, using Base Sepolia addresses`);
      return BASE_SEPOLIA_ADDRESSES;
  }
}

// Helper to check if contracts are deployed
export function areContractsDeployed(addresses: ContractAddresses): boolean {
  return Object.values(addresses).every(
    (address) => address !== "0x0000000000000000000000000000000000000000"
  );
}
