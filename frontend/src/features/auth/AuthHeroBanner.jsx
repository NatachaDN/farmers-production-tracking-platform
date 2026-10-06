import React from 'react';
import { AcreaLogo, IconCrop, IconLivestock } from '../../shared/components/Icons';

export function AuthHeroBanner() {
  return (
    <div className="auth-hero-banner" style={{
      flex: 1,
      minHeight: '100%',
      background: 'linear-gradient(175deg, #184D35 0%, #123C29 45%, #0C281B 100%)',
      color: '#FFFFFF',
      padding: '48px 56px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle organic field contour lines SVG background */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.12,
          pointerEvents: 'none'
        }}
        viewBox="0 0 800 1000"
        fill="none"
      >
        <path d="M-100 200 C 200 150, 400 450, 900 350" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M-100 380 C 150 320, 450 620, 900 500" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M-100 560 C 250 500, 500 800, 900 680" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M-100 740 C 300 680, 550 950, 900 860" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="650" cy="250" r="140" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="6 6" />
      </svg>

      {/* Brand Header */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <AcreaLogo size={36} textColor="#FFFFFF" />
      </div>

      {/* Hero Headline & Message */}
      <div style={{ maxWidth: '440px', position: 'relative', zIndex: 2, margin: '40px 0' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          lineHeight: 1.18,
          letterSpacing: '-0.025em',
          marginBottom: '18px'
        }}>
          From data to a thriving farm.
        </h1>
        <p style={{
          fontSize: '0.9375rem',
          lineHeight: 1.55,
          color: 'rgba(255, 255, 255, 0.8)',
          marginBottom: '28px'
        }}>
          Acrea brings crop cycles, animal groups, daily activities and production records into one calm, practical workspace.
        </p>

        {/* Feature Badges matching mockup */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: '#164230',
            padding: '7px 16px',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <IconCrop size={16} color="#2D7A52" />
            <span>Crop Cycles</span>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: '#164230',
            padding: '7px 16px',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <IconLivestock size={16} color="#D97706" />
            <span>Animal Groups</span>
          </div>
        </div>
      </div>
    </div>
  );
}
