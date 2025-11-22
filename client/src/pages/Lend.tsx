import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_TITLE } from "@/const";
import { ArrowLeft, TrendingUp, Loader2, Droplets } from "lucide-react";
import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { usePoolStats, useLpValue, useLpTokens, useDeposit, useWithdraw } from "@/hooks/useContracts";
import { useState, useEffect } from "react";
import { formatEther } from "viem";
import { toast } from "sonner";
import { Logo, LogoText } from "@/components/Logo";

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-blue-50/20">
        <nav className="glass-strong sticky top-0 z-50 border-b border-white/20">
          <div className="container mx-auto flex items-center justify-between py-4">
            <Link href="/">
              <a className="flex items-center gap-2">
                <Logo className="h-8 w-8 text-primary" />
                <LogoText className="text-xl text-foreground" />
              </a>
            </Link>
            <ConnectButton />
          </div>
        </nav>
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto glass-card border-white/40">
            <CardHeader>
              <CardTitle className="text-foreground">Connect Wallet</CardTitle>
              <CardDescription className="text-foreground/60">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <nav className="glass-strong sticky top-0 z-50 border-b border-white/20">
        <div className="container mx-auto flex items-center justify-between py-4">
          <Link href="/">
            <a className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <LogoText className="text-xl text-foreground" />
            </a>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <a className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                Dashboard
              </a>
            </Link>
            <ConnectButton />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <a className="inline-flex items-center text-foreground/60 hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </a>
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pool Stats */}
          <Card className="glass-card border-white/40">
            <CardHeader>
              <CardTitle className="text-foreground">Pool Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-sm text-foreground/60 mb-1">Total Liquidity</div>
                <div className="text-3xl font-bold text-foreground">{parseFloat(totalLiquidity).toFixed(4)} ETH</div>
              </div>
              <div>
                <div className="text-sm text-foreground/60 mb-1">Total Borrowed</div>
                <div className="text-3xl font-bold text-foreground">{parseFloat(totalBorrowed).toFixed(4)} ETH</div>
              </div>
              <div>
                <div className="text-sm text-foreground/60 mb-1">Utilization Rate</div>
                <div className="text-3xl font-bold text-cyan-600">{utilizationRate}%</div>
              </div>
              <div className="glass-strong rounded-xl p-4">
                <div className="text-sm text-foreground/60 mb-1">Base APY</div>
                <div className="text-2xl font-bold text-green-600">~12.5%</div>
              </div>
            </CardContent>
          </Card>

          {/* Deposit Form */}
          <Card className="lg:col-span-2 glass-card border-white/40">
            <CardHeader>
              <CardTitle className="text-foreground text-2xl">Provide Liquidity</CardTitle>
              <CardDescription className="text-foreground/60">
                Deposit ETH to earn interest from borrowers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="deposit-amount" className="text-foreground">Deposit Amount (ETH)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="glass-strong border-white/40 text-foreground mt-2"
                  />
                </div>
                <div className="glass-strong rounded-xl p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">You will receive:</span>
                    <span className="text-foreground font-semibold">~{depositAmount || "0.00"} LP Tokens</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">Estimated APY:</span>
                    <span className="text-green-600 font-semibold">~12.5%</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  onClick={handleDeposit}
                  disabled={isDepositing}
                  size="lg"
                >
                  {isDepositing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Droplets className="mr-2 h-4 w-4" />
                      Deposit
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Position */}
        <Card className="mt-6 glass-card border-white/40">
          <CardHeader>
            <CardTitle className="text-foreground text-2xl">Your LP Position</CardTitle>
          </CardHeader>
          <CardContent>
            {parseFloat(lpTokensFormatted) === 0 ? (
              <p className="text-foreground/60 text-center py-12">No active position</p>
            ) : (
              <div>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="glass-strong rounded-xl p-6">
                    <div className="text-sm text-foreground/60 mb-2">LP Tokens</div>
                    <div className="text-3xl font-bold text-foreground">
                      {parseFloat(lpTokensFormatted).toFixed(4)}
                    </div>
                  </div>
                  <div className="glass-strong rounded-xl p-6">
                    <div className="text-sm text-foreground/60 mb-2">Current Value</div>
                    <div className="text-3xl font-bold text-green-600">
                      {parseFloat(lpValueEth).toFixed(4)} ETH
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="withdraw-amount" className="text-foreground">Withdraw LP Tokens</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="glass-strong border-white/40 text-foreground mt-2"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    className="glass-card border-white/40 hover:glass-strong"
                    onClick={handleWithdraw}
                    disabled={isWithdrawing}
                    size="lg"
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
