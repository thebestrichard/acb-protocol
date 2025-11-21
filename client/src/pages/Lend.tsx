import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Lend() {
  const { user, isAuthenticated } = useAuth();
  const { data: lpPosition } = trpc.lp.getMyPosition.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: poolInfo } = trpc.pool.getInfo.useQuery();

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
                Please login to access lending features
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

  const totalLiquidity = poolInfo?.totalLiquidity || "0";
  const totalBorrowed = poolInfo?.totalBorrowed || "0";
  const utilizationRate = totalLiquidity !== "0" 
    ? ((parseFloat(totalBorrowed) / parseFloat(totalLiquidity)) * 100).toFixed(2)
    : "0";

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
          {/* Pool Stats */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Pool Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-slate-400">Total Liquidity</div>
                <div className="text-2xl font-bold text-white">{(parseFloat(totalLiquidity) / 1e18).toFixed(4)} ETH</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Total Borrowed</div>
                <div className="text-2xl font-bold text-white">{(parseFloat(totalBorrowed) / 1e18).toFixed(4)} ETH</div>
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
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="bg-slate-800 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">You will receive:</span>
                    <span className="text-white font-medium">~0.00 LP Tokens</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Estimated APY:</span>
                    <span className="text-green-400 font-medium">~12.5%</span>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Deposit
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
            {!lpPosition ? (
              <p className="text-slate-400 text-center py-8">No active position</p>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-slate-400">Deposited Amount</div>
                  <div className="text-2xl font-bold text-white">
                    {(parseFloat(lpPosition.depositedAmount) / 1e18).toFixed(4)} ETH
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">LP Tokens</div>
                  <div className="text-2xl font-bold text-white">
                    {(parseFloat(lpPosition.lpTokens) / 1e18).toFixed(4)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Earned Interest</div>
                  <div className="text-2xl font-bold text-green-400">
                    {(parseFloat(lpPosition.earnedInterest) / 1e18).toFixed(4)} ETH
                  </div>
                </div>
              </div>
            )}
            {lpPosition && (
              <div className="mt-6">
                <Button variant="outline" className="border-slate-700 hover:bg-slate-700">
                  Withdraw
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
