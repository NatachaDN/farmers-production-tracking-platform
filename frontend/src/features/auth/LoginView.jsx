import React, { useState } from 'react';
import { AuthHeroBanner } from './AuthHeroBanner';
import { IconGlobe, IconUser, IconLock } from '../../shared/components/Icons';

export function LoginView({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('joyce@example.com');
  const [password, setPassword] = useState('••••••••');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLoginSuccess) {
      onLoginSuccess();
    } else if (onNavigate) {
      onNavigate('dashboard');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FBF9F4' }}>
      {/* Left 50% Agricultural Hero Banner */}
      <AuthHeroBanner />

      {/* Right 50% Form Area */}
      <div style={{
        flex: 1,
        minHeight: '100vh',
        padding: '36px 64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box'
      }}>
        {/* Top Meta Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8125rem',
          color: 'var(--color-text-muted)'
        }}>
          <span>Secure farmer access</span>
          <button style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-text-secondary)',
            fontSize: '0.8125rem'
          }}>
            <IconGlobe size={15} />
            <span>English</span>
          </button>
        </div>

        {/* Centered Login Form Container */}
        <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto', padding: '24px 0' }}>
          <h2 style={{
            fontSize: '1.875rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '6px'
          }}>
            Welcome back
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
            marginBottom: '32px'
          }}>
            Sign in to continue tracking your farm's work and production.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                marginBottom: '8px'
              }}>
                Email or phone number
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border-input)',
                borderRadius: 'var(--radius-md)',
                padding: '11px 16px',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <IconUser size={18} color="var(--color-text-muted)" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.9375rem',
                    width: '100%',
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'transparent'
                  }}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border-input)',
                borderRadius: 'var(--radius-md)',
                padding: '11px 16px',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <IconLock size={18} color="var(--color-text-muted)" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.9375rem',
                    width: '100%',
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'transparent'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500 }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-brand-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
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
                transition: 'background-color var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-brand-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-brand-primary)'}
            >
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '28px 0',
            color: 'var(--color-text-muted)',
            fontSize: '0.8125rem'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E2D5' }} />
            <span style={{ padding: '0 12px' }}>New to Acrea?</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E2D5' }} />
          </div>

          {/* Create Farmer Account Outline Button */}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('register')}
            style={{
              backgroundColor: '#FFFFFF',
              color: 'var(--color-brand-primary)',
              border: '1px solid var(--color-border-input)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 20px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              width: '100%',
              transition: 'background-color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F6F2EA'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            Create farmer account
          </button>
        </div>

        {/* Footer Legal Terms */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
          paddingTop: '20px'
        }}>
          By continuing, you agree to Acrea's Terms of Use and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
