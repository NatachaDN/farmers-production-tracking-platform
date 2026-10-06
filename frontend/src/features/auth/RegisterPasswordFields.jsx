import React, { useState } from 'react';
import { IconEye, IconEyeOff } from '../../shared/components/Icons';

export function RegisterPasswordFields({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  labelStyle
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordStrongEnough = password.length >= 8;

  return (
    <div className="grid-two-cols">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={labelStyle}>Password</label>
          {password.length > 0 && (
            <span style={{
              fontSize: '0.75rem',
              color: isPasswordStrongEnough ? 'var(--color-brand-primary)' : 'var(--color-accent-amber)'
            }}>
              {isPasswordStrongEnough ? '✓ 8+ chars' : 'Min 8 chars'}
            </span>
          )}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border-input)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            style={{ border: 'none', outline: 'none', fontSize: '0.875rem', width: '100%', color: 'var(--color-text-primary)', backgroundColor: 'transparent' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}
          >
            {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={labelStyle}>Confirm</label>
          {confirmPassword.length > 0 && (
            <span style={{
              fontSize: '0.75rem',
              color: passwordsMatch ? 'var(--color-brand-primary)' : 'var(--color-accent-red)'
            }}>
              {passwordsMatch ? '✓ Matches' : 'Mismatch'}
            </span>
          )}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#FFFFFF',
          border: `1px solid ${confirmPassword.length > 0 ? (passwordsMatch ? 'var(--color-brand-primary)' : 'var(--color-accent-red)') : 'var(--color-border-input)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <input
            id="reg-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-type password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            style={{ border: 'none', outline: 'none', fontSize: '0.875rem', width: '100%', color: 'var(--color-text-primary)', backgroundColor: 'transparent' }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}
          >
            {showConfirmPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
