import { useWorldID } from "@/hooks/useWorldID";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Shield, User, CreditCard, History, Download } from "lucide-react";
import { CreditNFT, downloadNFT } from "@/components/CreditNFT";

export default function Profile() {
  const { verification, verify } = useWorldID();
  const isVerified = !!verification;
  const verificationLevel = verification?.verification_level || "device";
  const nullifierHash = verification?.nullifier_hash || "";
  
  const { data: creditScore } = trpc.creditScore.getMine.useQuery(
    undefined,
    { enabled: isVerified }
  );
  const { data: loans } = trpc.loan.getMyLoans.useQuery(
    undefined,
    { enabled: isVerified }
  );

  // Mock data for demonstration
  const mockCreditScore = creditScore || { score: 750, tier: "B" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="glass-card border-b border-white/20 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              My Profile
            </h1>
            <a href="/" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              ← Back to Home
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* World ID Verification Status */}
          <Card className="glass-card border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <div>
                    <CardTitle>World ID Verification</CardTitle>
                    <CardDescription>Your identity verification status</CardDescription>
                  </div>
                </div>
                {isVerified ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-gray-300">
                    <XCircle className="w-4 h-4 mr-1" />
                    Not Verified
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isVerified ? (
                <>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Verification Level</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {verificationLevel === "orb" ? "🌐 Orb Verified" : "📱 Device Verified"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Nullifier Hash</span>
                    <span className="text-xs font-mono text-gray-600">
                      {nullifierHash.slice(0, 16)}...{nullifierHash.slice(-8)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">Verify your identity with World ID to access all features</p>
                  <Button onClick={() => verify("verify")} className="bg-blue-600 hover:bg-blue-700">
                    Verify with World ID
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dynamic Credit NFT Card */}
          {isVerified && (
            <Card className="glass-card border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-blue-600" />
                    <div>
                      <CardTitle>Your Credit NFT</CardTitle>
                      <CardDescription>Dynamic NFT representing your credit score</CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={() => downloadNFT(mockCreditScore.score, mockCreditScore.tier)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-6">
                  <CreditNFT creditScore={mockCreditScore.score} tier={mockCreditScore.tier} size={350} />
                </div>
                <div className="mt-6 text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    🎨 This dynamic NFT represents your credit score and updates automatically as your credit changes.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Credit Score Card */}
          {isVerified && (
            <Card className="glass-card border-white/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-blue-600" />
                  <div>
                    <CardTitle>Credit Score</CardTitle>
                    <CardDescription>Your current creditworthiness</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-6">
                  <div className="text-6xl font-bold text-blue-600 mb-2">{mockCreditScore.score}</div>
                  <div className="text-xl font-semibold text-gray-700">Tier {mockCreditScore.tier}</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all"
                    style={{ width: `${(mockCreditScore.score / 1000) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Borrowing History */}
          {isVerified && (
            <Card className="glass-card border-white/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <History className="w-8 h-8 text-blue-600" />
                  <div>
                    <CardTitle>Borrowing History</CardTitle>
                    <CardDescription>Your recent loan activities</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loans && loans.length > 0 ? (
                  <div className="space-y-3">
                    {loans.slice(0, 5).map((loan: any) => (
                      <div key={loan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">${loan.amount}</p>
                          <p className="text-sm text-gray-600">{new Date(loan.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={loan.status === "active" ? "default" : "outline"}>
                          {loan.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No borrowing history yet
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
