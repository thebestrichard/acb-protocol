export function WaterFlowAnimation() {
  return (
    <div className="relative w-64 h-96 mx-auto">
      {/* Bottle container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="w-full h-full"
          viewBox="0 0 200 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bottle outline */}
          <path
            d="M 80 30 L 80 50 Q 70 60 70 80 L 70 260 Q 70 280 90 280 L 110 280 Q 130 280 130 260 L 130 80 Q 130 60 120 50 L 120 30 Q 120 20 110 20 L 90 20 Q 80 20 80 30 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-gray-300"
            opacity="0.4"
          />
          
          {/* Water droplets flowing */}
          <g className="animate-flow">
            <circle cx="100" cy="100" r="4" fill="currentColor" className="text-blue-400" opacity="0.6" />
          </g>
          <g className="animate-flow" style={{ animationDelay: '0.5s' }}>
            <circle cx="100" cy="140" r="4" fill="currentColor" className="text-blue-400" opacity="0.6" />
          </g>
          <g className="animate-flow" style={{ animationDelay: '1s' }}>
            <circle cx="100" cy="180" r="4" fill="currentColor" className="text-blue-400" opacity="0.6" />
          </g>
          <g className="animate-flow" style={{ animationDelay: '1.5s' }}>
            <circle cx="100" cy="220" r="4" fill="currentColor" className="text-blue-400" opacity="0.6" />
          </g>
          
          {/* Ripple effects at bottom */}
          <g opacity="0.3">
            <circle cx="100" cy="260" r="10" stroke="currentColor" strokeWidth="1" fill="none" className="text-blue-400 animate-ripple" />
            <circle cx="100" cy="260" r="10" stroke="currentColor" strokeWidth="1" fill="none" className="text-blue-400 animate-ripple" style={{ animationDelay: '1s' }} />
          </g>
        </svg>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 w-2 h-2 rounded-full bg-blue-300 opacity-40 animate-float" />
        <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-blue-200 opacity-30 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-1 h-1 rounded-full bg-blue-400 opacity-50 animate-float" style={{ animationDelay: '4s' }} />
      </div>
    </div>
  );
}
