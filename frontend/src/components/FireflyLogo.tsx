import React from 'react';

interface FireflyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FireflyLogo({ className = '', size = 'md' }: FireflyLogoProps) {
  const dimensions = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 40, height: 40 }
  };

  const { width, height } = dimensions[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Core glow gradient */}
        <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e40af" />
        </radialGradient>
        
        {/* Firefly glow */}
        <radialGradient id="firefly-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
      
      {/* Simple radio wave rings */}
      <circle cx="16" cy="16" r="12" fill="none" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.3">
        <animate attributeName="strokeOpacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
      </circle>
      
      <circle cx="16" cy="16" r="8" fill="none" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.4">
        <animate attributeName="strokeOpacity" values="0.4;0.15;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
      
      {/* Central firefly core */}
      <circle cx="16" cy="16" r="4" fill="url(#core-glow)" opacity="0.9">
        <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" />
      </circle>
      
      {/* Firefly glow center */}
      <circle cx="16" cy="16" r="2" fill="url(#firefly-glow)" opacity="0.8">
        <animate attributeName="opacity" values="0.8;1;0.8" dur="1s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}