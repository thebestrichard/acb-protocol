import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO, APP_TITLE } from "@/const";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useCreditScore, useMaxBorrowAmount, useInterestRate, useRequestLoan, useUserLoans, useLoanDetails } from "@/hooks/useContracts";
import { useState, useEffect } from "react";
import { formatEther } from "viem";
import { toast } from "sonner";

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
    A: "text-green-400",
    B: "text-blue-400",
    C: "text-yellow-400",
    D: "text-red-400",
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
          {/* Credit Score Card */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Your Credit Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-5xl font-bold ${tierColors[tier as keyof typeof tierColors]}`}>
                  {tier}
                </div>
                <div className="text-2xl text-slate-300 mt-2">{score}/1000</div>
                <div className="mt-4 space-y-2 text-sm text-slate-400">
                  <div className="flex justify-between">
                    <span>Total Loans:</span>
                    <span>{totalLoans}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Successful Repayments:</span>
                    <span>{successfulRepayments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Defaults:</span>
                    <span>{defaults}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Borrow Form */}
          <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Request a Loan</CardTitle>
              <CardDescription className="text-slate-400">
                Borrow without collateral based on your credit score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-slate-300">Loan Amount (ETH)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="duration" className="text-slate-300">Duration (Days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="30"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Estimated Interest Rate:</span>
                    <span className="text-white font-medium">~{ratePercent}% APR</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Your Borrowing Limit:</span>
                    <span className="text-white font-medium">{parseFloat(maxBorrowEth).toFixed(4)} ETH</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleBorrow}
                  disabled={isPending}
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
        <Card className="mt-6 bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Your Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            {!loanIds || loanIds.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No active loans</p>
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
    <div className="bg-slate-800 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-white font-medium">Loan #{loanId.toString()}</div>
          <div className="text-sm text-slate-400">
            Amount: {parseFloat(amount).toFixed(4)} ETH • Rate: {interestRate.toFixed(2)}%
          </div>
        </div>
        <Button variant="outline" className="border-slate-700 hover:bg-slate-700">
          Repay
        </Button>
      </div>
    </div>
  );
}
