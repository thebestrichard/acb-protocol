import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <img src={APP_LOGO} alt="ACB Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-white">{APP_TITLE}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/borrow">
              <a className="text-slate-300 hover:text-white transition-colors">Borrow</a>
            </Link>
            <Link href="/lend">
              <a className="text-slate-300 hover:text-white transition-colors">Lend</a>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Unsecured Credit Lending
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mt-2">
              Powered by AMM
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Borrow without collateral using on-chain credit scores. Earn yield by providing liquidity to our dynamic interest rate pool.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/borrow">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Borrowing <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/lend">
              <Button size="lg" variant="outline" className="border-slate-700 hover:bg-slate-800">
                Become a Lender
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-600/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle className="text-white">No Collateral Required</CardTitle>
              <CardDescription className="text-slate-400">
                Borrow based on your on-chain credit score without locking up assets
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-cyan-600/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-cyan-400" />
              </div>
              <CardTitle className="text-white">Dynamic Interest Rates</CardTitle>
              <CardDescription className="text-slate-400">
                AMM-based rates that adjust based on supply, demand, and credit scores
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-600/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">Risk Management</CardTitle>
              <CardDescription className="text-slate-400">
                Credit tiering, risk reserves, and transparent on-chain liquidation
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">For Borrowers</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 space-y-3">
                <p>1. Connect your wallet and get your credit score calculated</p>
                <p>2. Request a loan based on your borrowing limit</p>
                <p>3. Receive funds instantly with dynamic interest rates</p>
                <p>4. Repay on time to improve your credit score</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">For Lenders</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 space-y-3">
                <p>1. Deposit assets into the liquidity pool</p>
                <p>2. Earn interest from borrower repayments</p>
                <p>3. Receive LP tokens representing your share</p>
                <p>4. Withdraw anytime based on available liquidity</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-400">
            <p>© 2024 ACB Protocol. Built on Ethereum Base Chain.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
