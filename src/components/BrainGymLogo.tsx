import React from 'react';

interface BrainGymLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  subtitle?: string;
  variant?: 'light' | 'dark';
}

export const BrainGymLogo: React.FC<BrainGymLogoProps> = ({
  className = '',
  size = 'md',
  withText = false,
  subtitle,
  variant = 'light',
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]', badge: 'text-[8px] px-1' },
    md: { icon: 'w-10 h-10', text: 'text-lg', sub: 'text-[11px]', badge: 'text-[9px] px-1.5' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs', badge: 'text-[10px] px-2' },
    xl: { icon: 'w-20 h-20', text: 'text-3xl', sub: 'text-sm', badge: 'text-xs px-2.5' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Visual Vector Icon Container */}
      <div
        className={`${currentSize.icon} relative shrink-0 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-cyan-600 p-0.5 shadow-md shadow-indigo-600/25 flex items-center justify-center`}
      >
        <div className="w-full h-full bg-slate-950/20 backdrop-blur-xs rounded-[14px] flex items-center justify-center overflow-hidden relative">
          {/* SVG combining Brain convolutions with Gym dumbbell / pulse energy */}
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4/5 h-4/5 text-white drop-shadow-sm"
          >
            {/* Ambient Background Glow */}
            <circle cx="24" cy="24" r="18" fill="url(#bg-glow)" opacity="0.4" />

            {/* Left Brain Hemisphere Convolutions */}
            <path
              d="M22 10C17.5 10 14 13.5 14 18C14 19.5 14.5 21 15.5 22C13.5 23 12 25 12 27.5C12 30.5 14 33 17 33.5C17 35.5 18.5 37 20.5 37C21.5 37 22 36.5 22 36.5"
              stroke="#E0E7FF"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 18C19 19.5 20.5 22 22 24"
              stroke="#A5B4FC"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M15 27.5C17.5 27.5 19.5 29 22 31"
              stroke="#67E8F9"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Right Brain Hemisphere Convolutions */}
            <path
              d="M26 10C30.5 10 34 13.5 34 18C34 19.5 33.5 21 32.5 22C34.5 23 36 25 36 27.5C36 30.5 34 33 31 33.5C31 35.5 29.5 37 27.5 37C26.5 37 26 36.5 26 36.5"
              stroke="#E0E7FF"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M31 18C29 19.5 27.5 22 26 24"
              stroke="#A5B4FC"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M33 27.5C30.5 27.5 28.5 29 26 31"
              stroke="#67E8F9"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Central Gym Dumbbell Bar & Mental Power Node */}
            <line
              x1="9"
              y1="24"
              x2="39"
              y2="24"
              stroke="#22D3EE"
              strokeWidth="2.8"
              strokeLinecap="round"
            />

            {/* Dumbbell Weights Left */}
            <rect
              x="6"
              y="19"
              width="3.2"
              height="10"
              rx="1.6"
              fill="#FFFFFF"
            />
            <rect
              x="10.2"
              y="21"
              width="2.2"
              height="6"
              rx="1.1"
              fill="#A5B4FC"
            />

            {/* Dumbbell Weights Right */}
            <rect
              x="38.8"
              y="19"
              width="3.2"
              height="10"
              rx="1.6"
              fill="#FFFFFF"
            />
            <rect
              x="35.6"
              y="21"
              width="2.2"
              height="6"
              rx="1.1"
              fill="#A5B4FC"
            />

            {/* Central Synaptic Energy Core (Spark) */}
            <circle cx="24" cy="24" r="3.2" fill="#FFFFFF" />
            <circle cx="24" cy="24" r="5" stroke="#67E8F9" strokeWidth="1.2" opacity="0.8" />

            <defs>
              <radialGradient id="bg-glow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Optional Typography Stack */}
      {withText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight ${currentSize.text} ${
                variant === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              Brain<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">GYM</span>
            </span>
            <span className={`font-extrabold uppercase rounded-md bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 ${currentSize.badge}`}>
              Education Center
            </span>
          </div>

          <span
            className={`font-medium mt-1 leading-tight ${currentSize.sub} ${
              variant === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {subtitle || 'المركز النموذجي لتنمية القدرات والتعليم الذكي'}
          </span>
        </div>
      )}
    </div>
  );
};
