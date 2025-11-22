export function MobiusStripAnimation() {
  return (
    <div className="relative w-full h-96 flex items-center justify-center">
      <svg
        className="w-full h-full max-w-md"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient for glass effect */}
          <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(147, 197, 253, 0.3)" />
            <stop offset="50%" stopColor="rgba(96, 165, 250, 0.2)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
          </linearGradient>
          
          {/* Gradient for water */}
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(96, 165, 250, 0.6)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.8)" />
          </linearGradient>
          
          {/* Filter for glass blur */}
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>
        
        {/* Mobius strip path - outer edge */}
        <path
          d="M 200 80 
             C 280 80, 320 120, 320 200
             C 320 280, 280 320, 200 320
             C 120 320, 80 280, 80 200
             C 80 160, 100 130, 140 110
             L 200 80 Z"
          fill="url(#glassGradient)"
          stroke="rgba(59, 130, 246, 0.4)"
          strokeWidth="2"
          className="animate-float"
        />
        
        {/* Mobius strip path - inner twist */}
        <path
          d="M 200 120
             C 260 130, 280 160, 280 200
             C 280 240, 260 270, 200 280
             C 140 270, 120 240, 120 200
             C 120 180, 130 160, 150 145
             L 200 120 Z"
          fill="rgba(255, 255, 255, 0.1)"
          stroke="rgba(59, 130, 246, 0.3)"
          strokeWidth="1.5"
        />
        
        {/* Water droplets flowing through the strip */}
        <g className="animate-flow">
          <circle cx="200" cy="100" r="6" fill="url(#waterGradient)" opacity="0.7" />
          <circle cx="190" cy="105" r="4" fill="url(#waterGradient)" opacity="0.5" />
        </g>
        
        <g className="animate-flow" style={{ animationDelay: '0.8s' }}>
          <circle cx="280" cy="180" r="6" fill="url(#waterGradient)" opacity="0.7" />
          <circle cx="275" cy="185" r="4" fill="url(#waterGradient)" opacity="0.5" />
        </g>
        
        <g className="animate-flow" style={{ animationDelay: '1.6s' }}>
          <circle cx="200" cy="280" r="6" fill="url(#waterGradient)" opacity="0.7" />
          <circle cx="210" cy="275" r="4" fill="url(#waterGradient)" opacity="0.5" />
        </g>
        
        <g className="animate-flow" style={{ animationDelay: '2.4s' }}>
          <circle cx="120" cy="220" r="6" fill="url(#waterGradient)" opacity="0.7" />
          <circle cx="125" cy="215" r="4" fill="url(#waterGradient)" opacity="0.5" />
        </g>
        
        {/* Flowing water particles inside */}
        <g opacity="0.4">
          <circle cx="200" cy="200" r="3" fill="#3b82f6" className="animate-flow" />
          <circle cx="220" cy="180" r="2" fill="#60a5fa" className="animate-flow" style={{ animationDelay: '0.5s' }} />
          <circle cx="180" cy="220" r="2" fill="#60a5fa" className="animate-flow" style={{ animationDelay: '1s' }} />
          <circle cx="240" cy="200" r="2.5" fill="#3b82f6" className="animate-flow" style={{ animationDelay: '1.5s' }} />
          <circle cx="160" cy="200" r="2.5" fill="#3b82f6" className="animate-flow" style={{ animationDelay: '2s' }} />
        </g>
        
        {/* Ripple effects */}
        <g opacity="0.3">
          <circle cx="200" cy="200" r="30" stroke="#3b82f6" strokeWidth="1" fill="none" className="animate-ripple" />
          <circle cx="200" cy="200" r="30" stroke="#60a5fa" strokeWidth="1" fill="none" className="animate-ripple" style={{ animationDelay: '1s' }} />
        </g>
        
        {/* Highlight on glass */}
        <ellipse
          cx="240"
          cy="140"
          rx="40"
          ry="20"
          fill="rgba(255, 255, 255, 0.3)"
          transform="rotate(-30 240 140)"
          filter="url(#blur)"
        />
      </svg>
      
      {/* Additional floating particles around */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-blue-400 opacity-40 animate-float" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-blue-300 opacity-30 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 rounded-full bg-blue-500 opacity-50 animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 rounded-full bg-blue-400 opacity-35 animate-float" style={{ animationDelay: '3s' }} />
      </div>
    </div>
  );
}
