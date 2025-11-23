import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MobiusStripAnimation } from "@/components/MobiusStripAnimation";
import { Link } from "wouter";
import { Zap, TrendingUp, Shield } from "lucide-react";
import { APP_TITLE } from "@/const";
import { useWorldID } from "@/hooks/useWorldID";
import { toast } from "sonner";

export default function Home() {
  const { isInstalled, isVerifying, verify } = useWorldID();

  const handleVerify = async () => {
    const result = await verify("acb-protocol-login");
    if (result) {
      toast.success("World ID verified successfully!");
    } else {
      toast.error("Verification failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white">
      {/* Navigation */}
      <nav className="glass-card border-b border-blue-200/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              {APP_TITLE}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/borrow">
              <a className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Borrow
              </a>
            </Link>
            <Link href="/lend">
              <a className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Lend
              </a>
            </Link>
            <Link href="/order-book">
              <a className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Order Book
              </a>
            </Link>
            <Link href="/dashboard">
              <a className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Dashboard
              </a>
            </Link>
          </div>
          {isInstalled ? (
            <Button 
              onClick={handleVerify}
              disabled={isVerifying}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg"
            >
              {isVerifying ? "Verifying..." : "Verify with World ID"}
            </Button>
          ) : (
            <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg">
              Connect Wallet
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Unsecured Credit
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Powered by AMM
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Borrow without collateral using on-chain credit scores. Earn yield by providing liquidity with complete transparency.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/borrow">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg px-8">
                  Start Borrowing →
                </Button>
              </Link>
              <Link href="/lend">
                <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8">
                  Become a Lender
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <MobiusStripAnimation />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="glass-card border border-blue-200/20 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">No Collateral Required</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Borrow based on your on-chain credit score without locking up assets
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="glass-card border border-blue-200/20 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Dynamic Interest Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                AMM-based rates that adjust based on supply, demand, and credit scores
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="glass-card border border-blue-200/20 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Transparent & Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Credit tiering, risk reserves, and transparent on-chain operations
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-12">
          {/* For Borrowers */}
          <Card className="glass-card border border-blue-200/20">
            <CardHeader>
              <CardTitle className="text-2xl">For Borrowers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Connect your wallet and get your credit score calculated</h3>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Request a loan based on your borrowing limit</h3>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Receive funds instantly with dynamic interest rates</h3>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Repay on time to improve your credit score</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* For Lenders */}
          <Card className="glass-card border border-blue-200/20">
            <CardHeader>
              <CardTitle className="text-2xl">For Lenders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Deposit assets into the liquidity pool</h3>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Earn interest from borrower repayments</h3>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Receive LP tokens representing your share</h3>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Withdraw anytime based on available liquidity</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="glass-card border border-blue-200/20 text-center">
          <CardHeader>
            <CardTitle className="text-3xl mb-4">Ready to get started?</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Join the future of decentralized credit lending on Base Chain
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap justify-center gap-4">
            <Link href="/borrow">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg px-8">
                Start Borrowing
              </Button>
            </Link>
            <Link href="/lend">
              <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8">
                Start Lending
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-200/20 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <div>© 2024 {APP_TITLE} · AMM-based Credit Borrowing Protocol. Built on Ethereum Base Chain.</div>
          <div className="flex gap-6">
            <a href="https://github.com/thebestrichard/acb-protocol" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
