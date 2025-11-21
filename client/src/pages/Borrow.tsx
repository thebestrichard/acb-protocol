import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Borrow() {
  const { user, isAuthenticated } = useAuth();
  const { data: creditScore } = trpc.creditScore.getMine.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: loans } = trpc.loan.getMyLoans.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
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
          </div>
        </nav>
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Login Required</CardTitle>
              <CardDescription className="text-slate-400">
                Please login to access borrowing features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <a href={getLoginUrl()}>Login</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const tier = creditScore?.tier || "C";
  const score = creditScore?.score || 500;
  const tierColors = {
    A: "text-green-400",
    B: "text-blue-400",
    C: "text-yellow-400",
    D: "text-red-400",
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
          <Link href="/dashboard">
            <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
              Dashboard
            </Button>
          </Link>
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
                    <span>{creditScore?.totalLoans || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Successful Repayments:</span>
                    <span>{creditScore?.successfulRepayments || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Defaults:</span>
                    <span>{creditScore?.defaults || 0}</span>
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
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="duration" className="text-slate-300">Duration (Days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="30"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Estimated Interest Rate:</span>
                    <span className="text-white font-medium">~8.5% APR</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Your Borrowing Limit:</span>
                    <span className="text-white font-medium">0.5 ETH</span>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Request Loan
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
            {!loans || loans.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No active loans</p>
            ) : (
              <div className="space-y-4">
                {loans.filter(loan => loan.status === 'active').map((loan) => (
                  <div key={loan.id} className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-medium">Loan #{loan.id}</div>
                        <div className="text-sm text-slate-400">
                          Amount: {loan.amount} ETH • Rate: {loan.interestRate / 100}%
                        </div>
                      </div>
                      <Button variant="outline" className="border-slate-700 hover:bg-slate-700">
                        Repay
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
