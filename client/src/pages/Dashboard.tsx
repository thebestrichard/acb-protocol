import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: creditScore } = trpc.creditScore.getMine.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: loans } = trpc.loan.getMyLoans.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: transactions } = trpc.transaction.getMyTransactions.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: lpPosition } = trpc.lp.getMyPosition.useQuery(undefined, {
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
                Please login to access your dashboard
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
          <div className="flex items-center gap-4">
            <span className="text-slate-300">{user?.name || user?.email}</span>
            <Button 
              variant="outline" 
              className="border-slate-700 hover:bg-slate-800"
              onClick={() => logout()}
            >
              Logout
            </Button>
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

        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm text-slate-400">Credit Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${tierColors[tier as keyof typeof tierColors]}`}>
                {tier} ({score})
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm text-slate-400">Active Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {loans?.filter(l => l.status === 'active').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm text-slate-400">LP Position</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {lpPosition ? (parseFloat(lpPosition.depositedAmount) / 1e18).toFixed(2) : "0.00"} ETH
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm text-slate-400">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {transactions?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="loans" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="loans" className="data-[state=active]:bg-slate-800">Loans</TabsTrigger>
            <TabsTrigger value="lp" className="data-[state=active]:bg-slate-800">LP Position</TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-slate-800">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="loans">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Your Loans</CardTitle>
              </CardHeader>
              <CardContent>
                {!loans || loans.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No loans yet</p>
                ) : (
                  <div className="space-y-4">
                    {loans.map((loan) => (
                      <div key={loan.id} className="bg-slate-800 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-white font-medium">Loan #{loan.id}</div>
                            <div className="text-sm text-slate-400 mt-1">
                              Amount: {loan.amount} • Rate: {loan.interestRate / 100}% • Duration: {loan.duration} days
                            </div>
                            <div className="text-sm text-slate-400">
                              Status: <span className={
                                loan.status === 'active' ? 'text-yellow-400' :
                                loan.status === 'repaid' ? 'text-green-400' :
                                'text-red-400'
                              }>{loan.status}</span>
                            </div>
                          </div>
                          {loan.status === 'active' && (
                            <Button size="sm" variant="outline" className="border-slate-700 hover:bg-slate-700">
                              Repay
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lp">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Liquidity Provider Position</CardTitle>
              </CardHeader>
              <CardContent>
                {!lpPosition ? (
                  <p className="text-slate-400 text-center py-8">No LP position</p>
                ) : (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-slate-800 p-4 rounded-lg">
                        <div className="text-sm text-slate-400">Deposited</div>
                        <div className="text-2xl font-bold text-white">
                          {(parseFloat(lpPosition.depositedAmount) / 1e18).toFixed(4)} ETH
                        </div>
                      </div>
                      <div className="bg-slate-800 p-4 rounded-lg">
                        <div className="text-sm text-slate-400">LP Tokens</div>
                        <div className="text-2xl font-bold text-white">
                          {(parseFloat(lpPosition.lpTokens) / 1e18).toFixed(4)}
                        </div>
                      </div>
                      <div className="bg-slate-800 p-4 rounded-lg">
                        <div className="text-sm text-slate-400">Earned Interest</div>
                        <div className="text-2xl font-bold text-green-400">
                          {(parseFloat(lpPosition.earnedInterest) / 1e18).toFixed(4)} ETH
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {!transactions || transactions.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No transactions yet</p>
                ) : (
                  <div className="space-y-2">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="bg-slate-800 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <div className="text-white font-medium capitalize">{tx.type}</div>
                          <div className="text-sm text-slate-400">
                            {new Date(tx.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-white font-medium">
                          {tx.amount} ETH
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
