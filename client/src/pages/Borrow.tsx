import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_TITLE } from "@/const";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useCreditScore, useMaxBorrowAmount, useInterestRate, useRequestLoan, useUserLoans, useLoanDetails } from "@/hooks/useContracts";
import { useState, useEffect } from "react";
import { formatEther } from "viem";
import { toast } from "sonner";
import { Logo, LogoText } from "@/components/Logo";

export default function Borrow() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("30");

  const { data: creditData } = useCreditScore(address);
  const { data: maxBorrow } = useMaxBorrowAmount(address);
  const { data: interestRate } = useInterestRate(address);
  const { data: loanIds } = useUserLoans(address);
  
  const { requestLoan, isPending, isSuccess } = useRequestLoan();

  useEffect(() => {
    if (isSuccess) {
      toast.success("Loan requested successfully!");
      setAmount("");
      setDuration("30");
    }
  }, [isSuccess]);

  if (!isConnected) {
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
            <ConnectButton />
          </div>
        </nav>
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto glass-card border-white/40">
            <CardHeader>
              <CardTitle className="text-foreground">Connect Wallet</CardTitle>
              <CardDescription className="text-foreground/60">
                Please connect your wallet to access borrowing features
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

  const score = creditData ? Number(creditData.score) : 500;
  const tier = creditData ? ["D", "C", "B", "A"][Number(creditData.tier)] : "C";
  const totalLoans = creditData ? Number(creditData.totalLoans) : 0;
  const successfulRepayments = creditData ? Number(creditData.successfulRepayments) : 0;
  const defaults = creditData ? Number(creditData.defaults) : 0;

  const tierColors = {
    A: "text-green-600",
    B: "text-blue-600",
    C: "text-yellow-600",
    D: "text-red-600",
  };

  const tierBgColors = {
    A: "bg-green-500/10",
    B: "bg-blue-500/10",
    C: "bg-yellow-500/10",
    D: "bg-red-500/10",
  };

  const maxBorrowEth = maxBorrow ? formatEther(maxBorrow) : "0";
  const ratePercent = interestRate ? (Number(interestRate) / 100).toFixed(2) : "8.50";

  const handleBorrow = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!duration || parseInt(duration) <= 0) {
      toast.error("Please enter a valid duration");
      return;
    }
    requestLoan(amount, parseInt(duration));
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
          {/* Credit Score Card */}
          <Card className="glass-card border-white/40">
            <CardHeader>
              <CardTitle className="text-foreground">Your Credit Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-6xl font-bold ${tierColors[tier as keyof typeof tierColors]} ${tierBgColors[tier as keyof typeof tierBgColors]} rounded-2xl py-6 mb-4`}>
                  {tier}
                </div>
                <div className="text-3xl font-semibold text-foreground mb-4">{score}/1000</div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-foreground/70">
                    <span>Total Loans:</span>
                    <span className="font-medium text-foreground">{totalLoans}</span>
                  </div>
                  <div className="flex justify-between text-foreground/70">
                    <span>Successful Repayments:</span>
                    <span className="font-medium text-foreground">{successfulRepayments}</span>
                  </div>
                  <div className="flex justify-between text-foreground/70">
                    <span>Defaults:</span>
                    <span className="font-medium text-foreground">{defaults}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Borrow Form */}
          <Card className="lg:col-span-2 glass-card border-white/40">
            <CardHeader>
              <CardTitle className="text-foreground text-2xl">Request a Loan</CardTitle>
              <CardDescription className="text-foreground/60">
                Borrow without collateral based on your credit score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="amount" className="text-foreground">Loan Amount (ETH)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="glass-strong border-white/40 text-foreground mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="duration" className="text-foreground">Duration (Days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="30"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="glass-strong border-white/40 text-foreground mt-2"
                  />
                </div>
                <div className="glass-strong rounded-xl p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">Estimated Interest Rate:</span>
                    <span className="text-foreground font-semibold">~{ratePercent}% APR</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">Your Borrowing Limit:</span>
                    <span className="text-foreground font-semibold">{parseFloat(maxBorrowEth).toFixed(4)} ETH</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  onClick={handleBorrow}
                  disabled={isPending}
                  size="lg"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Request Loan"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Loans */}
        <Card className="mt-6 glass-card border-white/40">
          <CardHeader>
            <CardTitle className="text-foreground text-2xl">Your Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            {!loanIds || loanIds.length === 0 ? (
              <p className="text-foreground/60 text-center py-12">No active loans</p>
            ) : (
              <div className="space-y-4">
                {loanIds.map((loanId) => (
                  <LoanItem key={loanId.toString()} loanId={loanId} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoanItem({ loanId }: { loanId: bigint }) {
  const { data: loan } = useLoanDetails(loanId);
  
  if (!loan) return null;

  const amount = formatEther(loan.amount);
  const interestRate = Number(loan.interestRate) / 100;
  const status = ["Active", "Repaid", "Defaulted"][Number(loan.status)];

  if (status !== "Active") return null;

  return (
    <div className="glass-strong rounded-xl p-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-foreground font-semibold text-lg">Loan #{loanId.toString()}</div>
          <div className="text-sm text-foreground/60 mt-1">
            Amount: {parseFloat(amount).toFixed(4)} ETH • Rate: {interestRate.toFixed(2)}%
          </div>
        </div>
        <Button variant="outline" className="glass-card border-white/40 hover:glass-strong">
          Repay
        </Button>
      </div>
    </div>
  );
}
