import React, { useState, useRef } from 'react';

export default function Marquee({ 
  children, 
  direction = 'left',
  speed = 50,
  pauseOnHover = true,
  className = ''
}) {
  const [isPaused, setIsPaused] = useState(false);

  const getKeyframes = () => {
    return `
      @keyframes marquee {
        0% { transform: translateX(0%); }
        100% { transform: translateX(-50%); }
      }
    `;
  };

  return (
    <div 
      className={`relative overflow-hidden w-full bg-transparent ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <style>{getKeyframes()}</style>
      <div 
        className="flex w-max whitespace-nowrap text-white" 
        style={{
          animation: `marquee ${speed}s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}