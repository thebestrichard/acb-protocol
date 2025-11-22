import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { Logo, LogoText } from "@/components/Logo";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BookOpen, CheckCircle2, Clock, XCircle } from "lucide-react";

export default function OrderBook() {
  // Mock data for demonstration
  const borrowOrders = [
    {
      orderId: "1",
      borrower: "0x1234...5678",
      amount: "1.5 ETH",
      maxInterestRate: "8%",
      duration: "30 days",
      creditScore: 750,
      status: "pending",
      timestamp: "2024-11-22 10:30",
    },
    {
      orderId: "2",
      borrower: "0x2345...6789",
      amount: "2.0 ETH",
      maxInterestRate: "10%",
      duration: "60 days",
      creditScore: 680,
      status: "matched",
      timestamp: "2024-11-22 09:15",
    },
  ];

  const lendOrders = [
    {
      orderId: "1",
      lender: "0x3456...7890",
      amount: "5.0 ETH",
      minInterestRate: "5%",
      minCreditScore: 600,
      status: "pending",
      timestamp: "2024-11-22 11:00",
    },
    {
      orderId: "2",
      lender: "0x4567...8901",
      amount: "3.0 ETH",
      minInterestRate: "7%",
      minCreditScore: 700,
      status: "matched",
      timestamp: "2024-11-22 08:45",
    },
  ];

  const matchRecords = [
    {
      matchId: "1",
      borrower: "0x2345...6789",
      lender: "0x4567...8901",
      amount: "2.0 ETH",
      interestRate: "8.5%",
      duration: "60 days",
      matchedAt: "2024-11-22 09:20",
      dueDate: "2025-01-21",
      status: "active",
      matchingProof: "0xabcd...ef12",
    },
    {
      matchId: "2",
      borrower: "0x5678...9012",
      lender: "0x6789...0123",
      amount: "1.0 ETH",
      interestRate: "7.0%",
      duration: "30 days",
      matchedAt: "2024-11-21 14:30",
      dueDate: "2024-12-21",
      status: "settled",
      matchingProof: "0x1234...5678",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: React.ReactNode }> = {
      pending: { variant: "secondary", icon: <Clock className="w-3 h-3 mr-1" /> },
      matched: { variant: "default", icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
      active: { variant: "default", icon: <Clock className="w-3 h-3 mr-1" /> },
      settled: { variant: "outline", icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
      cancelled: { variant: "destructive", icon: <XCircle className="w-3 h-3 mr-1" /> },
      defaulted: { variant: "destructive", icon: <XCircle className="w-3 h-3 mr-1" /> },
    };

    const config = variants[status] || variants.pending;
    
    return (
      <Badge variant={config.variant} className="flex items-center w-fit">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-blue-50/20">
      {/* Navigation */}
      <nav className="glass-strong sticky top-0 z-50 border-b border-white/20">
        <div className="container mx-auto flex items-center justify-between py-4">
          <Link href="/">
            <a className="flex items-center gap-2">
              <Logo />
              <LogoText />
            </a>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/borrow">
              <a className="text-foreground/70 hover:text-foreground transition-colors">Borrow</a>
            </Link>
            <Link href="/lend">
              <a className="text-foreground/70 hover:text-foreground transition-colors">Lend</a>
            </Link>
            <Link href="/order-book">
              <a className="text-foreground font-medium">Order Book</a>
            </Link>
            <Link href="/dashboard">
              <a className="text-foreground/70 hover:text-foreground transition-colors">Dashboard</a>
            </Link>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Order Book</h1>
          </div>
          <p className="text-foreground/60 text-lg">
            Transparent on-chain order matching - all lending and borrowing activities are publicly verifiable
          </p>
        </div>

        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList className="glass-card border-white/40">
            <TabsTrigger value="matches">Match Records</TabsTrigger>
            <TabsTrigger value="borrow">Borrow Orders</TabsTrigger>
            <TabsTrigger value="lend">Lend Orders</TabsTrigger>
          </TabsList>

          {/* Match Records Tab */}
          <TabsContent value="matches">
            <Card className="glass-card border-white/40">
              <CardHeader>
                <CardTitle>Match Records</CardTitle>
                <CardDescription>
                  All matched loans with cryptographic proofs - fully transparent and verifiable
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Match ID</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Lender</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Interest Rate</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Matched At</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Proof</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matchRecords.map((record) => (
                      <TableRow key={record.matchId}>
                        <TableCell className="font-mono">#{record.matchId}</TableCell>
                        <TableCell className="font-mono text-sm">{record.borrower}</TableCell>
                        <TableCell className="font-mono text-sm">{record.lender}</TableCell>
                        <TableCell className="font-semibold">{record.amount}</TableCell>
                        <TableCell className="text-blue-600 font-medium">{record.interestRate}</TableCell>
                        <TableCell>{record.duration}</TableCell>
                        <TableCell className="text-sm text-foreground/60">{record.matchedAt}</TableCell>
                        <TableCell className="text-sm text-foreground/60">{record.dueDate}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>
                          <a 
                            href={`https://basescan.org/tx/${record.matchingProof}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-600 hover:text-blue-700 underline"
                          >
                            {record.matchingProof}
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Borrow Orders Tab */}
          <TabsContent value="borrow">
            <Card className="glass-card border-white/40">
              <CardHeader>
                <CardTitle>Borrow Orders</CardTitle>
                <CardDescription>
                  All borrow requests waiting to be matched with lenders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Max Interest Rate</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Credit Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {borrowOrders.map((order) => (
                      <TableRow key={order.orderId}>
                        <TableCell className="font-mono">#{order.orderId}</TableCell>
                        <TableCell className="font-mono text-sm">{order.borrower}</TableCell>
                        <TableCell className="font-semibold">{order.amount}</TableCell>
                        <TableCell className="text-blue-600 font-medium">{order.maxInterestRate}</TableCell>
                        <TableCell>{order.duration}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {order.creditScore}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-sm text-foreground/60">{order.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lend Orders Tab */}
          <TabsContent value="lend">
            <Card className="glass-card border-white/40">
              <CardHeader>
                <CardTitle>Lend Orders</CardTitle>
                <CardDescription>
                  All liquidity available for lending to qualified borrowers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Lender</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Min Interest Rate</TableHead>
                      <TableHead>Min Credit Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lendOrders.map((order) => (
                      <TableRow key={order.orderId}>
                        <TableCell className="font-mono">#{order.orderId}</TableCell>
                        <TableCell className="font-mono text-sm">{order.lender}</TableCell>
                        <TableCell className="font-semibold">{order.amount}</TableCell>
                        <TableCell className="text-blue-600 font-medium">{order.minInterestRate}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {order.minCreditScore}+
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-sm text-foreground/60">{order.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Verification Info */}
        <Card className="glass-card border-white/40 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Verifiable Settlement Layer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground/70">
              Every match in the ACB Protocol is cryptographically verifiable. Each matching operation generates a unique proof that can be independently verified on the blockchain.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <h4 className="font-semibold text-foreground mb-2">Transparent Matching</h4>
                <p className="text-sm text-foreground/60">
                  All order matching happens on-chain with publicly auditable algorithms
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <h4 className="font-semibold text-foreground mb-2">Cryptographic Proofs</h4>
                <p className="text-sm text-foreground/60">
                  Each match generates a unique hash that proves the integrity of the settlement
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <h4 className="font-semibold text-foreground mb-2">Immutable Records</h4>
                <p className="text-sm text-foreground/60">
                  All transactions are permanently recorded on the blockchain for full auditability
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
