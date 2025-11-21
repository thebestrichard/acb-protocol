import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO, APP_TITLE } from "@/const";
import { ArrowLeft, TrendingUp, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { usePoolStats, useLpValue, useLpTokens, useDeposit, useWithdraw } from "@/hooks/useContracts";
import { useState, useEffect } from "react";
import { formatEther } from "viem";
import { toast } from "sonner";

export default function Lend() {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const { totalLiquidity, totalBorrowed } = usePoolStats();
  const { data: lpValue } = useLpValue(address);
  const { data: lpTokenBalance } = useLpTokens(address);
  
  const { deposit, isPending: isDepositing, isSuccess: depositSuccess } = useDeposit();
  const { withdraw, isPending: isWithdrawing, isSuccess: withdrawSuccess } = useWithdraw();

  useEffect(() => {
    if (depositSuccess) {
      toast.success("Deposit successful!");
      setDepositAmount("");
    }
  }, [depositSuccess]);

  useEffect(() => {
    if (withdrawSuccess) {
      toast.success("Withdrawal successful!");
      setWithdrawAmount("");
    }
  }, [withdrawSuccess]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between py-4">
            <Link href="/">
              <a className="flex items-center gap-2">
                <img src={APP_LOGO} alt="ACB Logo" className="h-8 w-8" />
                <span className="text-xl font-bold text-white">{APP_TITLE}</span>
              </a>
            </Link>
            <ConnectButton />
          </div>
        </nav>
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Connect Wallet</CardTitle>
              <CardDescription className="text-slate-400">
                Please connect your wallet to access lending features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectButton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const utilizationRate = parseFloat(totalLiquidity) > 0
    ? ((parseFloat(totalBorrowed) / parseFloat(totalLiquidity)) * 100).toFixed(2)
    : "0";

  const lpValueEth = lpValue ? formatEther(lpValue) : "0";
  const lpTokensFormatted = lpTokenBalance ? formatEther(lpTokenBalance) : "0";

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    deposit(depositAmount);
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    withdraw(withdrawAmount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between py-4">
          <Link href="/">
            <a className="flex items-center gap-2">
              <img src={APP_LOGO} alt="ACB Logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-white">{APP_TITLE}</span>
            </a>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <a className="text-slate-300 hover:text-white transition-colors">Dashboard</a>
            </Link>
            <ConnectButton />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <a className="inline-flex items-center text-slate-400 hover:text-white mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </a>
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pool Stats */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Pool Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-slate-400">Total Liquidity</div>
                <div className="text-2xl font-bold text-white">{parseFloat(totalLiquidity).toFixed(4)} ETH</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Total Borrowed</div>
                <div className="text-2xl font-bold text-white">{parseFloat(totalBorrowed).toFixed(4)} ETH</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Utilization Rate</div>
                <div className="text-2xl font-bold text-cyan-400">{utilizationRate}%</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Base APY</div>
                <div className="text-2xl font-bold text-green-400">~12.5%</div>
              </div>
            </CardContent>
          </Card>

          {/* Deposit Form */}
          <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Provide Liquidity</CardTitle>
              <CardDescription className="text-slate-400">
                Deposit ETH to earn interest from borrowers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deposit-amount" className="text-slate-300">Deposit Amount (ETH)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="bg-slate-800 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">You will receive:</span>
                    <span className="text-white font-medium">~{depositAmount || "0.00"} LP Tokens</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Estimated APY:</span>
                    <span className="text-green-400 font-medium">~12.5%</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleDeposit}
                  disabled={isDepositing}
                >
                  {isDepositing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Deposit
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Position */}
        <Card className="mt-6 bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Your LP Position</CardTitle>
          </CardHeader>
          <CardContent>
            {parseFloat(lpTokensFormatted) === 0 ? (
              <p className="text-slate-400 text-center py-8">No active position</p>
            ) : (
              <div>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-slate-400">LP Tokens</div>
                    <div className="text-2xl font-bold text-white">
                      {parseFloat(lpTokensFormatted).toFixed(4)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Current Value</div>
                    <div className="text-2xl font-bold text-green-400">
                      {parseFloat(lpValueEth).toFixed(4)} ETH
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="withdraw-amount" className="text-slate-300">Withdraw LP Tokens</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-slate-700 hover:bg-slate-700"
                    onClick={handleWithdraw}
                    disabled={isWithdrawing}
                  >
                    {isWithdrawing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Withdraw"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
