import { useWorldID } from "@/hooks/useWorldID";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Shield, User, CreditCard, History } from "lucide-react";
import { useEffect } from "react";

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
        <div className="max-w-4xl mx-auto space-y-6">
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
                  <Badge variant="outline" className="border-gray-300 text-gray-600">
                    <XCircle className="w-4 h-4 mr-1" />
                    Not Verified
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isVerified ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                      <div className="text-sm text-gray-600 mb-1">Verification Level</div>
                      <div className="font-semibold text-blue-600 capitalize">
                        {verificationLevel === "orb" ? "🌐 Orb Verified" : "📱 Device Verified"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {verificationLevel === "orb" 
                          ? "Highest level of verification" 
                          : "Standard verification level"}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-cyan-50/50 border border-cyan-100">
                      <div className="text-sm text-gray-600 mb-1">Nullifier Hash</div>
                      <div className="font-mono text-xs text-cyan-600 break-all">
                        {nullifierHash ? `${nullifierHash.slice(0, 20)}...` : "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Your unique anonymous identifier
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-900">Verification Complete</div>
                        <div className="text-sm text-gray-600 mt-1">
                          You can now access all features of ACB Protocol, including borrowing and lending with enhanced credit limits.
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Verify Your Identity
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Complete World ID verification to access borrowing and lending features with better rates and higher limits.
                  </p>
                  <Button 
                    onClick={() => verify("verify")}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    Verify with World ID
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Credit Score */}
          {isVerified && (
            <Card className="glass-card border-white/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                  <div>
                    <CardTitle>Credit Score</CardTitle>
                    <CardDescription>Your on-chain credit rating</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {creditScore ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-4xl font-bold text-blue-600">
                          {creditScore.score}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Out of 1000
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-semibold text-gray-900">
                          Tier {creditScore.tier}
                        </div>
                        <div className="text-sm text-gray-600">
                          Credit Tier
                        </div>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all"
                        style={{ width: `${(creditScore.score / 1000) * 100}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <div className="text-sm text-gray-600">Total Loans</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {creditScore.totalLoans}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Successful Repayments</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {creditScore.successfulRepayments}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-600">
                      No credit history yet. Start borrowing to build your credit score.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Loan History */}
          {isVerified && loans && loans.length > 0 && (
            <Card className="glass-card border-white/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <History className="w-8 h-8 text-blue-600" />
                  <div>
                    <CardTitle>Loan History</CardTitle>
                    <CardDescription>Your recent borrowing activity</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loans.slice(0, 5).map((loan: any) => (
                    <div 
                      key={loan.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50 border border-gray-100"
                    >
                      <div>
                        <div className="font-semibold text-gray-900">
                          ${loan.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(loan.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge 
                        variant={loan.status === "active" ? "default" : "outline"}
                        className={
                          loan.status === "active" 
                            ? "bg-blue-100 text-blue-700 border-blue-200" 
                            : "border-green-200 text-green-700"
                        }
                      >
                        {loan.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
