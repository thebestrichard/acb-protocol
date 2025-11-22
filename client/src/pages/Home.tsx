import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Logo, LogoText } from "@/components/Logo";
import { MobiusStripAnimation } from "@/components/MobiusStripAnimation";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-blue-50/20">
      {/* Navigation */}
      <nav className="glass-strong sticky top-0 z-50 border-b border-white/20">
        <div className="container mx-auto flex items-center justify-between py-4">
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Logo className="h-8 w-8 text-primary" />
              <LogoText className="text-xl text-foreground" />
            </a>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/borrow">
              <a className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                Borrow
              </a>
            </Link>
            <Link href="/lend">
              <a className="text-foreground/70 hover:text-foreground transition-colors">Lend</a>
            </Link>
            <Link href="/order-book">
              <a className="text-foreground/70 hover:text-foreground transition-colors">Order Book</a>
            </Link>
            <Link href="/dashboard">
              <a className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                Dashboard
              </a>
            </Link>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Unsecured Credit
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 mt-2">
                Powered by AMM
              </span>
            </h1>
            <p className="text-xl text-foreground/60 mb-8 max-w-xl">
              Borrow without collateral using on-chain credit scores. Earn yield by providing liquidity with complete transparency.
            </p>
            <div className="flex gap-4">
              <Link href="/borrow">
                <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                  Start Borrowing <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/lend">
                <Button size="lg" variant="outline" className="glass-card hover:glass-strong">
                  Become a Lender
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Mobius Strip Animation */}
          <div className="flex justify-center">
            <MobiusStripAnimation />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="glass-card border-white/40 hover:glass-strong transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-foreground">No Collateral Required</CardTitle>
              <CardDescription className="text-foreground/60">
                Borrow based on your on-chain credit score without locking up assets
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card border-white/40 hover:glass-strong transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-foreground">Dynamic Interest Rates</CardTitle>
              <CardDescription className="text-foreground/60">
                AMM-based rates that adjust based on supply, demand, and credit scores
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card border-white/40 hover:glass-strong transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-foreground">Transparent & Secure</CardTitle>
              <CardDescription className="text-foreground/60">
                Credit tiering, risk reserves, and transparent on-chain operations
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-foreground text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="glass-card border-white/40">
            <CardHeader>
              <CardTitle className="text-foreground text-2xl">For Borrowers</CardTitle>
            </CardHeader>
            <div className="px-6 pb-6 text-foreground/70 space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-semibold">
                  1
                </div>
                <p>Connect your wallet and get your credit score calculated</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-semibold">
                  2
                </div>
                <p>Request a loan based on your borrowing limit</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-semibold">
                  3
                </div>
                <p>Receive funds instantly with dynamic interest rates</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-semibold">
                  4
                </div>
                <p>Repay on time to improve your credit score</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-white/40">
            <CardHeader>
              <CardTitle className="text-foreground text-2xl">For Lenders</CardTitle>
            </CardHeader>
            <div className="px-6 pb-6 text-foreground/70 space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-semibold">
                  1
                </div>
                <p>Deposit assets into the liquidity pool</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-semibold">
                  2
                </div>
                <p>Earn interest from borrower repayments</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-semibold">
                  3
                </div>
                <p>Receive LP tokens representing your share</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-semibold">
                  4
                </div>
                <p>Withdraw anytime based on available liquidity</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="glass-card border-white/40 rounded-3xl p-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-foreground/60 mb-8 text-lg">
            Join the future of decentralized credit lending on Base Chain
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/borrow">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Borrowing
              </Button>
            </Link>
            <Link href="/lend">
              <Button size="lg" variant="outline" className="glass-strong">
                Start Lending
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 mt-20 glass">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Logo className="h-6 w-6 text-primary" />
              <span className="text-sm text-foreground/60">© 2024 {APP_TITLE}. Built on Ethereum Base Chain.</span>
            </div>
            <div className="flex gap-6">
              <a href="https://github.com/thebestrichard/acb-protocol" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                GitHub
              </a>
              <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
