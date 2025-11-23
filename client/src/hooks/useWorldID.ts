import { useState, useEffect } from 'react';
import { initMiniKit, isInWorldApp, verifyWorldID, type WorldIDVerification } from '@/lib/minikit';

export function useWorldID() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verification, setVerification] = useState<WorldIDVerification | null>(null);

  useEffect(() => {
    // Initialize MiniKit
    initMiniKit();
    setIsInstalled(isInWorldApp());
  }, []);

  const verify = async (action: string, signal?: string) => {
    setIsVerifying(true);
    try {
      const result = await verifyWorldID(action, signal);
      setVerification(result);
      return result;
    } catch (error) {
      console.error('Verification error:', error);
      return null;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    isInstalled,
    isVerifying,
    verification,
    verify,
  };
}
