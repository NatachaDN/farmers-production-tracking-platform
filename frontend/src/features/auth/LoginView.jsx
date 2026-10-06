import React, { useState } from 'react';
import { AuthHeroBanner } from './AuthHeroBanner';
import { AuthMetaHeader } from './AuthMetaHeader';
import { IconUser, IconLock, IconEye, IconEyeOff } from '../../shared/components/Icons';
import { authService } from './services/authService';

export function LoginView({ onNavigate, onLoginSuccess }) {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(emailOrPhone, password);
      if (onLoginSuccess) {
        onLoginSuccess(response.farmer);
      } else if (onNavigate) {
        onNavigate('dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left — Agricultural Hero Banner (hidden on mobile) */}
      <AuthHeroBanner />

      {/* Right — Form Area */}
      <div className="auth-form-wrapper">
        <AuthMetaHeader subtitle="Secure farmer access" />

        {/* Centered Login Form */}
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
            marginBottom: '28px'
          }}>
            Sign in to continue tracking your farm's work and production.
          </p>

          {/* Error Alert */}
          {error && (
            <div style={{
              backgroundColor: 'var(--color-accent-red-bg)',
              border: '1px solid var(--color-accent-red-border)',
              color: 'var(--color-accent-red)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              marginBottom: '20px',
              lineHeight: 1.5,
              animation: 'fadeIn 200ms ease forwards'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email or Phone */}
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
                gap: '10px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border-input)',
                borderRadius: 'var(--radius-md)',
                padding: '11px 14px',
                boxShadow: 'var(--shadow-subtle)',
                transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)'
              }}>
                <IconUser size={18} color="var(--color-text-muted)" />
                <input
                  id="login-identifier"
                  type="text"
                  placeholder="name@example.com or phone"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  autoComplete="username"
                  required
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

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)'
                }}>
                  Password
                </label>
                <button
                  type="button"
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--color-brand-primary)',
                    fontWeight: 500,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border-input)',
                borderRadius: 'var(--radius-md)',
                padding: '11px 14px',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <IconLock size={18} color="var(--color-text-muted)" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.875rem',
                    width: '100%',
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'transparent'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-button"
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'var(--color-brand-primary)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9375rem',
                fontWeight: 600,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1,
                boxShadow: '0 2px 6px rgba(22, 66, 48, 0.25)',
                transition: 'background-color var(--transition-fast), transform 100ms ease',
                marginTop: '6px'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Switch to Register */}
          <div style={{
            marginTop: '32px',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)'
          }}>
            Don't have an account yet?{' '}
            <button
              id="goto-register-button"
              onClick={() => onNavigate && onNavigate('register')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-brand-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0
              }}
            >
              Create account
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
          paddingTop: '20px'
        }}>
          Acrea Agricultural Platform · Secure & Private
        </div>
      </div>
    </div>
  );
}
