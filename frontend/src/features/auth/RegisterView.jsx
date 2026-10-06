import React, { useState } from 'react';
import { AuthHeroBanner } from './AuthHeroBanner';
import {
  IconLocation,
  IconCrop,
  IconLivestock,
  IconDashboard,
  IconCheck
} from '../../shared/components/Icons';

export function RegisterView({ onNavigate, onRegisterSuccess }) {
  const [fullName, setFullName] = useState('Joyce Muthoni');
  const [email, setEmail] = useState('you@example.com');
  const [location, setLocation] = useState('');
  const [farmType, setFarmType] = useState('mixed');
  const [password, setPassword] = useState('••••••••••');
  const [confirmPassword, setConfirmPassword] = useState('••••••••••');
  const [agreed, setAgreed] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onRegisterSuccess) {
      onRegisterSuccess();
    } else if (onNavigate) {
      onNavigate('dashboard');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FBF9F4' }}>
      {/* Left Hero Banner */}
      <AuthHeroBanner />

      {/* Right Form Area */}
      <div style={{
        flex: 1,
        minHeight: '100vh',
        padding: '36px 64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: '480px', width: '100%', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: 'var(--color-text-muted)',
                marginBottom: '4px'
              }}>
                CREATE YOUR ACREA ACCOUNT
              </div>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em'
              }}>
                Tell us about your farm
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate('login')}
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
                fontWeight: 500,
                marginTop: '18px'
              }}
            >
              Already registered? <span style={{ color: 'var(--color-brand-primary)', fontWeight: 600 }}>Sign in</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Full Name & Email 2-Column Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border-input)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-primary)',
                    boxShadow: 'var(--shadow-subtle)',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Email or phone number
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border-input)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-primary)',
                    boxShadow: 'var(--shadow-subtle)',
                    outline: 'none'
                  }}
                  required
                />
              </div>
            </div>

            {/* Location with Pin Icon */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Location
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border-input)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <IconLocation size={18} color="var(--color-text-muted)" />
                <input
                  type="text"
                  placeholder="County, district or nearest town"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.875rem',
                    width: '100%',
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'transparent'
                  }}
                />
              </div>
            </div>

            {/* Farm Type Selector (3 options) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                Farm type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { id: 'crop', label: 'Crop', icon: IconCrop },
                  { id: 'livestock', label: 'Livestock', icon: IconLivestock },
                  { id: 'mixed', label: 'Mixed', icon: IconDashboard }
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = farmType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFarmType(type.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSelected ? 'var(--color-brand-tint)' : '#FFFFFF',
                        border: isSelected ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--color-border-input)',
                        color: isSelected ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                        fontSize: '0.875rem',
                        fontWeight: isSelected ? 600 : 500,
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <Icon size={16} color="currentColor" />
                      <span>{type.label}</span>
                      {isSelected && <IconCheck size={14} color="var(--color-brand-primary)" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border-input)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-primary)',
                    boxShadow: 'var(--shadow-subtle)',
                    outline: 'none'
                  }}
                  required
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                  At least 8 characters
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border-input)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-primary)',
                    boxShadow: 'var(--shadow-subtle)',
                    outline: 'none'
                  }}
                  required
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                  Passwords match
                </span>
              </div>
            </div>

            {/* Checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '6px' }}>
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{
                  marginTop: '3px',
                  accentColor: 'var(--color-brand-primary)',
                  cursor: 'pointer'
                }}
              />
              <label htmlFor="terms" style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer', lineHeight: 1.4 }}>
                I agree to the Terms of Use and understand how Acrea stores production records.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!agreed}
              style={{
                backgroundColor: 'var(--color-brand-primary)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                padding: '13px 20px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                width: '100%',
                marginTop: '10px',
                boxShadow: 'var(--shadow-subtle)',
                transition: 'background-color var(--transition-fast)',
                opacity: agreed ? 1 : 0.6
              }}
              onMouseEnter={(e) => { if (agreed) e.currentTarget.style.backgroundColor = 'var(--color-brand-hover)'; }}
              onMouseLeave={(e) => { if (agreed) e.currentTarget.style.backgroundColor = 'var(--color-brand-primary)'; }}
            >
              Create account
            </button>

            {/* Helper Info Note */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--color-brand-tint)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              color: 'var(--color-brand-primary)',
              fontWeight: 500,
              marginTop: '8px'
            }}>
              <IconCrop size={16} color="var(--color-brand-primary)" />
              <span>You can add farms, plots and animal groups after creating your account.</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
