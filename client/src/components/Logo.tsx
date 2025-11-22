export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Mathematical integral symbol representing continuous flow */}
      <path
        d="M 30 20 Q 25 20 25 30 L 25 70 Q 25 80 30 80"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 70 20 Q 75 20 75 30 L 75 70 Q 75 80 70 80"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Circular flow representing AMM pool */}
      <circle
        cx="50"
        cy="50"
        r="15"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        opacity="0.6"
      />
      
      {/* Arrow indicating direction of flow */}
      <path
        d="M 50 35 L 55 40 M 50 35 L 45 40"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoText({ className = "" }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight ${className}`}>
      ACB
    </span>
  );
}
