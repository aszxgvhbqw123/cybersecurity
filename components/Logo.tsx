
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = 'h-8 w-auto' }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="M-Sec Logo"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00BFFF" />
          <stop offset="100%" stopColor="#00FF7F" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
           <feGaussianBlur stdDeviation="2" result="blur" />
           <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <path 
        d="M20 90 L20 10 L40 10 L50 40 L60 10 L80 10 L80 90 L65 90 L65 45 L55 75 L45 75 L35 45 L35 90 Z" 
        fill="url(#logoGradient)"
        filter="url(#glow)"
        stroke="#000000"
        strokeWidth="1"
        strokeOpacity="0.3"
      />
    </svg>
  );
};

export default Logo;
