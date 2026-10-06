import React, { useState } from 'react';
import { AuthHeroBanner } from './AuthHeroBanner';
import { AuthMetaHeader } from './AuthMetaHeader';
import { FarmTypeSelector } from './FarmTypeSelector';
import { RegisterPasswordFields } from './RegisterPasswordFields';
import { IconLocation } from '../../shared/components/Icons';
import { authService } from './services/authService';

export function RegisterView({ onNavigate, onRegisterSuccess }) {
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [location, setLocation] = useState('');
  const [farmType, setFarmType] = useState('MIXED');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        fullName,
        emailOrPhone,
        location,
        farmType,
        password
      });

      if (onRegisterSuccess) {
        onRegisterSuccess(response.farmer);
      } else if (onNavigate) {
        onNavigate('dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-border-input)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    color: 'var(--color-text-primary)',
    outline: 'none',
    boxShadow: 'var(--shadow-subtle)'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: '6px'
  };

  return (
    <div className="auth-container">
      {/* Left — Agricultural Hero Banner (hidden on mobile) */}
      <AuthHeroBanner />

      {/* Right — Registration Form */}
      <div className="auth-form-wrapper">
        <AuthMetaHeader subtitle="Free registration for farmers" />

        {/* Centered Form Body */}
        <div style={{ maxWidth: '480px', width: '100%', margin: '0 auto', padding: '16px 0' }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '4px'
          }}>
            Create your account
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
            marginBottom: '20px'
          }}>
            Join Acrea to track plots, livestock, daily activities, and yields.
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
              marginBottom: '18px',
              lineHeight: 1.5,
              animation: 'fadeIn 200ms ease forwards'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Full Name & Email/Phone — 2 columns */}
            <div className="grid-two-cols">
              <div>
                <label style={labelStyle}>Full name</label>
                <input
                  id="reg-fullname"
                  type="text"
                  placeholder="Joyce Muthoni"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Email or phone number</label>
                <input
                  id="reg-identifier"
                  type="text"
                  placeholder="you@example.com"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  autoComplete="username"
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label style={labelStyle}>Location</label>
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
                  id="reg-location"
                  type="text"
                  placeholder="County, district or nearest town"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{ border: 'none', outline: 'none', fontSize: '0.875rem', width: '100%', color: 'var(--color-text-primary)', backgroundColor: 'transparent' }}
                />
              </div>
            </div>

            {/* Farm Type Selector Component */}
            <FarmTypeSelector value={farmType} onChange={setFarmType} />

            {/* Password & Confirm Password Component */}
            <RegisterPasswordFields
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              labelStyle={labelStyle}
            />

            {/* Terms checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
              <input
                id="reg-terms-check"
                type="checkbox"
                defaultChecked
                required
                style={{ marginTop: '3px', accentColor: 'var(--color-brand-primary)' }}
              />
              <label htmlFor="reg-terms-check" style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                I agree to the Acrea Terms of Service and acknowledge the platform privacy policy.
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="register-submit-button"
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
                marginTop: '8px'
              }}
            >
              {loading ? 'Creating your account...' : 'Create Farmer Account'}
            </button>
          </form>

          {/* Switch to Login */}
          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)'
          }}>
            Already have an account?{' '}
            <button
              id="goto-login-button"
              onClick={() => onNavigate && onNavigate('login')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-brand-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0
              }}
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
          paddingTop: '16px'
        }}>
          Acrea Agricultural Platform · Supporting farmers everywhere
        </div>
      </div>
    </div>
  );
}
