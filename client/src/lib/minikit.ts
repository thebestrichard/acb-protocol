import { MiniKit, type Tokens, type TokensPayload, VerificationLevel } from '@worldcoin/minikit-js';

// Initialize MiniKit
export const initMiniKit = () => {
  MiniKit.install();
  
  return MiniKit;
};

// Check if running in World App
export const isInWorldApp = () => {
  return MiniKit.isInstalled();
};

// World ID verification
export interface WorldIDVerification {
  proof: string;
  merkle_root: string;
  nullifier_hash: string;
  verification_level: 'orb' | 'device';
}

export const verifyWorldID = async (
  action: string,
  signal?: string
): Promise<WorldIDVerification | null> => {
  if (!MiniKit.isInstalled()) {
    console.warn('MiniKit is not installed');
    return null;
  }

  try {
    const { finalPayload } = await MiniKit.commandsAsync.verify({
      action,
      signal: signal || '',
      verification_level: VerificationLevel.Orb, // Use Orb for highest security
    });

    if (finalPayload.status === 'success') {
      return finalPayload as WorldIDVerification;
    }

    return null;
  } catch (error) {
    console.error('World ID verification failed:', error);
    return null;
  }
};

// MiniKit payment
export interface PaymentPayload {
  reference: string;
  to: string;
  tokens: TokensPayload[];
  description: string;
}

export const sendPayment = async (payload: PaymentPayload) => {
  if (!MiniKit.isInstalled()) {
    throw new Error('MiniKit is not installed');
  }

  try {
    const { finalPayload } = await MiniKit.commandsAsync.pay(payload);

    if (finalPayload.status === 'success') {
      return finalPayload;
    }

    throw new Error('Payment failed');
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
};

// Sign message
export const signMessage = async (message: string) => {
  if (!MiniKit.isInstalled()) {
    throw new Error('MiniKit is not installed');
  }

  try {
    const { finalPayload } = await MiniKit.commandsAsync.signMessage({
      message,
    });

    if (finalPayload.status === 'success') {
      return finalPayload;
    }

    throw new Error('Signing failed');
  } catch (error) {
    console.error('Sign message error:', error);
    throw error;
  }
};

// Send transaction
export interface SendTransactionPayload {
  transaction: Array<{
    address: string;
    abi: any[];
    functionName: string;
    args: any[];
  }>;
}

export const sendTransaction = async (payload: SendTransactionPayload) => {
  if (!MiniKit.isInstalled()) {
    throw new Error('MiniKit is not installed');
  }

  try {
    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction(payload);

    if (finalPayload.status === 'success') {
      return finalPayload;
    }

    throw new Error('Transaction failed');
  } catch (error) {
    console.error('Send transaction error:', error);
    throw error;
  }
};

// Wallet authentication
export const walletAuth = async () => {
  if (!MiniKit.isInstalled()) {
    throw new Error('MiniKit is not installed');
  }

  try {
    const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
      nonce: Math.random().toString(),
      expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      notBefore: new Date(),
      statement: 'Sign in to ACB Protocol',
    });

    if (finalPayload.status === 'success') {
      return finalPayload;
    }

    throw new Error('Wallet authentication failed');
  } catch (error) {
    console.error('Wallet auth error:', error);
    throw error;
  }
};
