import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  variant?: 'light' | 'dark' | 'auto';
}

export function CivicEaseLogo({ className = '', size = 'md', showSubtitle = true, variant = 'auto' }: LogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const subtitleSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  };

  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* CivicEase Vector Emblem */}
      <div className={`${iconSizes[size]} relative flex-shrink-0 transition-transform duration-200 hover:scale-105`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-sm">
          {/* Shield Arch Outline */}
          <path
            d="M18 24C18 16.268 24.268 10 32 10C39.732 10 46 16.268 46 24V38C46 47 38 52 32 54C26 52 18 47 18 38V24Z"
            stroke={isLight ? '#FFFFFF' : '#17365D'}
            strokeWidth="5"
            strokeLinejoin="round"
            fill={isLight ? 'rgba(255,255,255,0.08)' : 'rgba(23,54,93,0.04)'}
          />
          {/* Apex Saffron Star Beacon */}
          <path
            d="M32 3L34.2 9.5L40.5 11.2L34.2 12.8L32 19.5L29.8 12.8L23.5 11.2L29.8 9.5L32 3Z"
            fill="#E88924"
          />
          {/* Uplifting Dynamic Blue Bridge Swoosh */}
          <path
            d="M10 44C16 32 26 27 42 27C48 27 52 28 54 29C48 35 38 38 24 38C17 38 12 41 10 44Z"
            fill="url(#civic-gradient)"
          />
          <defs>
            <linearGradient id="civic-gradient" x1="10" y1="44" x2="54" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#0066FF" />
              <stop offset="100%" stop-color="#00C2FF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center">
        <div className={`font-extrabold tracking-tight leading-none ${titleSizes[size]} ${isLight ? 'text-white' : 'text-gov-navy'}`}>
          <span>Civic</span>
          <span className={isLight ? 'text-gov-saffron' : 'text-gov-blue'}>Ease</span>
        </div>
        {showSubtitle && (
          <p className={`font-medium tracking-wide uppercase mt-1 ${subtitleSizes[size]} ${isLight ? 'text-gray-300' : 'text-gov-text-sec'}`}>
            Public Service Portal
          </p>
        )}
      </div>
    </div>
  );
}

export default CivicEaseLogo;
