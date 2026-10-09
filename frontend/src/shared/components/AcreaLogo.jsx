import React from 'react';

export function AcreaLogo({ 
  size = 40, 
  showText = true, 
  showTagline = true, 
  textColor = "#FFFFFF",
  taglineColor
}) {
  const effectiveTaglineColor = taglineColor || (textColor === "#FFFFFF" ? "rgba(255, 255, 255, 0.75)" : "var(--color-text-muted)");

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
      {/* Acrea Icon Mark */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Stylized White Letter 'A' Arc */}
        <path 
          d="M21 7C17 12 11 25 8 39C10.5 40 14 39.5 17 38C19 30 23 18 25 12C26.5 17 30 26 32 33C29 33.5 24 35 20 37C24 38.5 29 38 35 37C37 38.5 39 39.5 41 40C37 28 31 14 26 7C24.5 5 22.5 5 21 7Z" 
          fill={textColor === '#FFFFFF' ? '#FFFFFF' : 'var(--color-sidebar-bg)'}
        />

        {/* Golden Harvest Corn / Grain Ear (Center Right) */}
        <g id="corn-ear">
          <path 
            d="M24 24C27 20 33 22 36 26C38 29 37 36 34 38C31 40 26 37 24 33C23 29 23 26 24 24Z" 
            fill="#F59E0B" 
          />
          <path 
            d="M25 26C27.5 23 32 24.5 34.5 28C36 31 35 36 33 37C30.5 38.5 27 36 25 32C24.2 29 24.3 27 25 26Z" 
            fill="#FBBF24" 
          />
          {/* Kernel grain texture lines */}
          <path d="M26 29C28 28 31 29 33 31" stroke="#D97706" strokeWidth="1" strokeLinecap="round" />
          <path d="M25 32C28 31 31 32 33 34" stroke="#D97706" strokeWidth="1" strokeLinecap="round" />
          <path d="M26 35C28 34 30 35 32 36" stroke="#D97706" strokeWidth="1" strokeLinecap="round" />
          <path d="M29 26L30 37" stroke="#D97706" strokeWidth="0.8" strokeDasharray="1.5 1.5" strokeLinecap="round" />
        </g>

        {/* Vibrant Organic Green Leaf (Curving across Left and Base) */}
        <g id="sprout-leaf">
          {/* Main Leaf Body */}
          <path 
            d="M7 38C9 28 17 19 28 16C31 22 29 31 20 35C15 37 10 38 7 38Z" 
            fill="#3E9B4F" 
          />
          {/* Top highlight leaf gradient/fill */}
          <path 
            d="M9 37C11 29 18 22 27 18C28 23 26 29 19 33C15 35 11 36.5 9 37Z" 
            fill="#52B764" 
          />
          {/* Light green inner curve */}
          <path 
            d="M11 36C13 30 19 25 25 21C24 25 21 29 16 32C13.5 34 11.8 35.5 11 36Z" 
            fill="#86EFAC" 
          />
          {/* Leaf spine vein */}
          <path 
            d="M8 38C14 34 20 28 26 19" 
            stroke="#236E33" 
            strokeWidth="1.2" 
            strokeLinecap="round" 
          />
        </g>
      </svg>

      {/* Brand Text & Tagline */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            color: textColor,
            fontFamily: 'inherit',
            lineHeight: 1
          }}>
            Acrea
          </span>
          {showTagline && (
            <span style={{
              fontSize: '0.475rem',
              fontWeight: 700,
              letterSpacing: '0.085em',
              color: effectiveTaglineColor,
              textTransform: 'uppercase',
              marginTop: '4px',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap'
            }}>
              FROM DATA TO A THRIVING FARM
            </span>
          )}
        </div>
      )}
    </div>
  );
}
