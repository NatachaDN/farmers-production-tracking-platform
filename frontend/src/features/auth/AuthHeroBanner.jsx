import React from 'react';
import { AcreaLogo, IconCrop, IconLivestock } from '../../shared/components/Icons';
import authFarmBg from '../../assets/auth-farm-bg.jpg';

export function AuthHeroBanner() {
  return (
    <div className="auth-hero-banner" style={{
      flex: 1,
      minHeight: '100%',
      backgroundColor: '#123C29',
      backgroundImage: `linear-gradient(180deg, rgba(14, 38, 27, 0.36) 0%, rgba(12, 34, 24, 0.50) 48%, rgba(8, 24, 17, 0.84) 100%), url(${authFarmBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      color: '#FFFFFF',
      padding: '48px 56px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>

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
