import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { MiniKit } from "@worldcoin/minikit-js";

interface MintNFTButtonProps {
  isVerified: boolean;
  nullifierHash: string | null;
  onMintSuccess?: () => void;
}

export function MintNFTButton({ isVerified, nullifierHash, onMintSuccess }: MintNFTButtonProps) {
  const { address } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  
  const { data: existingMint, isLoading: checkingMint } = trpc.nft.getMyMint.useQuery();
  const mintMutation = trpc.nft.mint.useMutation();
  const { data: creditScore } = trpc.creditScore.getMine.useQuery();

  const handleMint = async () => {
    if (!isVerified || !nullifierHash) {
      toast.error("Please verify with World ID first");
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!creditScore) {
      toast.error("Credit score not found");
      return;
    }

    setIsMinting(true);

    try {
      // Generate a unique token ID based on timestamp and user data
      const tokenId = Math.floor(Date.now() / 1000);

      // Call the mint mutation
      const result = await mintMutation.mutateAsync({
        nullifierHash,
        creditScore: creditScore.score,
        tier: creditScore.tier,
        tokenId,
      });

      toast.success(`NFT Minted Successfully! Token ID: ${result.tokenId}`);
      
      // Log success
      console.log("NFT minting success", result);

      onMintSuccess?.();
    } catch (error: any) {
      console.error("Minting error:", error);
      toast.error(error.message || "Failed to mint NFT");
    } finally {
      setIsMinting(false);
    }
  };

  // Show loading state while checking
  if (checkingMint) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking NFT Status...
      </Button>
    );
  }

  // Already minted
  if (existingMint) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        <div className="text-sm">
          <p className="font-medium text-green-900 dark:text-green-100">NFT Already Minted</p>
          <p className="text-green-700 dark:text-green-300">Token ID: {existingMint.tokenId}</p>
        </div>
      </div>
    );
  }

  // Not verified yet
  if (!isVerified) {
    return (
      <Button disabled className="w-full" variant="outline">
        Complete World ID Verification to Mint NFT
      </Button>
    );
  }

  // Ready to mint
  return (
    <Button 
      onClick={handleMint} 
      disabled={isMinting}
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
    >
      {isMinting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Minting Your Credit NFT...
        </>
      ) : (
        "🎨 Mint Your Exclusive Credit NFT"
      )}
    </Button>
  );
}
