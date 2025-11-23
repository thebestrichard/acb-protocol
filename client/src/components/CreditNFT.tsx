import { useMemo } from "react";

interface CreditNFTProps {
  creditScore: number;
  tier: string;
  size?: number;
}

export function CreditNFT({ creditScore, tier, size = 400 }: CreditNFTProps) {
  const { color, gradient, tierLabel } = useMemo(() => {
    switch (tier) {
      case "A":
        return {
          color: "#10b981",
          gradient: "from-emerald-500 to-emerald-600",
          tierLabel: "Tier A - Excellent",
        };
      case "B":
        return {
          color: "#3b82f6",
          gradient: "from-blue-500 to-blue-600",
          tierLabel: "Tier B - Good",
        };
      case "C":
        return {
          color: "#f59e0b",
          gradient: "from-amber-500 to-amber-600",
          tierLabel: "Tier C - Fair",
        };
      default:
        return {
          color: "#ef4444",
          gradient: "from-red-500 to-red-600",
          tierLabel: "Tier D - Poor",
        };
    }
  }, [tier]);

  return (
    <div
      className="relative rounded-3xl overflow-hidden shadow-2xl"
      style={{ width: size, height: size }}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

      {/* Animated Circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-48 h-48 rounded-full border-4 border-white/20 animate-pulse" />
        <div className="absolute w-36 h-36 rounded-full border-6 border-white shadow-lg shadow-white/50" />
      </div>

      {/* Credit Score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-white font-bold text-7xl mb-8 drop-shadow-lg">
          {creditScore}
        </div>
        <div className="text-white font-semibold text-2xl mb-4 drop-shadow-md">
          {tierLabel}
        </div>
        <div className="text-white/80 text-lg drop-shadow-sm">
          ACB Credit Score
        </div>
      </div>

      {/* Bottom Label */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <div className="text-white/60 text-sm">
          Dynamic NFT - Updates with your credit
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-8 right-8 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm" />
      <div className="absolute bottom-24 left-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm" />
    </div>
  );
}

// SVG Export Version for download
export function generateNFTSVG(creditScore: number, tier: string): string {
  let color = "#ef4444";
  let tierLabel = "Tier D - Poor";

  switch (tier) {
    case "A":
      color = "#10b981";
      tierLabel = "Tier A - Excellent";
      break;
    case "B":
      color = "#3b82f6";
      tierLabel = "Tier B - Good";
      break;
    case "C":
      color = "#f59e0b";
      tierLabel = "Tier C - Fair";
      break;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color};stop-opacity:0.7" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <rect width="400" height="400" fill="url(#bg)" rx="20"/>
    
    <circle cx="200" cy="150" r="90" fill="none" stroke="white" stroke-width="4" opacity="0.2"/>
    <circle cx="200" cy="150" r="70" fill="none" stroke="white" stroke-width="6" filter="url(#glow)"/>
    
    <text x="200" y="175" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle">
      ${creditScore}
    </text>
    
    <text x="200" y="260" font-family="Arial, sans-serif" font-size="24" font-weight="600" fill="white" text-anchor="middle">
      ${tierLabel}
    </text>
    
    <text x="200" y="300" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" opacity="0.8">
      ACB Credit Score
    </text>
    
    <text x="200" y="360" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" opacity="0.6">
      Dynamic NFT - Updates with your credit
    </text>
    
    <circle cx="330" cy="70" r="30" fill="white" opacity="0.1"/>
    <circle cx="70" cy="310" r="24" fill="white" opacity="0.1"/>
  </svg>`;
}

// Download NFT as image
export function downloadNFT(creditScore: number, tier: string) {
  const svg = generateNFTSVG(creditScore, tier);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `acb-credit-nft-${creditScore}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
