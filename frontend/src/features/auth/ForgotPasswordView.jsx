import React, { useState } from 'react';
import { AuthHeroBanner } from './AuthHeroBanner';
import { AuthMetaHeader } from './AuthMetaHeader';
import { IconUser, IconLock, IconEye, IconEyeOff, IconCheck, IconWarning } from '../../shared/components/Icons';
import { authService } from './services/authService';

export function ForgotPasswordView({ onNavigate, onResetSuccess }) {
  const [step, setStep] = useState(1); // 1: request code, 2: enter code & set new password, 3: completed
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Request reset code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedIdentifier = emailOrPhone.trim();

    if (!trimmedIdentifier) {
      setError('Please enter your registered email or phone number.');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(trimmedIdentifier);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Unable to find an account with this email or phone number.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedCode = resetCode.trim();
    if (!trimmedCode) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(emailOrPhone.trim(), trimmedCode, newPassword);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your verification code.');
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValid = newPassword.length >= 8;
  const doPasswordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    <div className="auth-container">
      {/* Left — Agricultural Hero Banner */}
      <AuthHeroBanner />

      {/* Right — Form Area */}
      <div className="auth-form-wrapper">
        <AuthMetaHeader subtitle="Account recovery" />

        <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto', padding: '24px 0' }}>
          {step === 1 && (
            <>
              <h2 style={{
                fontSize: '1.875rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '6px'
              }}>
                Forgot password?
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
                marginBottom: '28px',
                lineHeight: 1.5
              }}>
                Enter your registered email address or phone number. We'll send you a 6-digit verification code to reset your password.
              </p>

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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <IconWarning size={18} color="var(--color-accent-red)" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRequestCode} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    boxShadow: 'var(--shadow-subtle)'
                  }}>
                    <IconUser size={18} color="var(--color-text-muted)" />
                    <input
                      id="forgot-identifier"
                      type="text"
                      placeholder="name@example.com or phone"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
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

                <button
                  id="request-reset-code-btn"
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
                    transition: 'background-color var(--transition-fast)',
                    marginTop: '6px'
                  }}
                >
                  {loading ? 'Sending code...' : 'Send Recovery Code'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{
                fontSize: '1.875rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '6px'
              }}>
                Set new password
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
                marginBottom: '20px',
                lineHeight: 1.5
              }}>
                We sent a 6-digit code to <strong style={{ color: 'var(--color-text-primary)' }}>{emailOrPhone}</strong>. Check your inbox (and your spam folder), then enter the code below.
              </p>

              {/* Email sent confirmation banner */}
              <div style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <IconCheck size={18} color="#059669" />
                <span>A recovery code has been sent to your email address.</span>
              </div>

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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <IconWarning size={18} color="var(--color-accent-red)" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Verification Code */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    marginBottom: '8px'
                  }}>
                    6-Digit Verification Code
                  </label>
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
                      id="reset-code-input"
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.trim())}
                      required
                      style={{
                        border: 'none',
                        outline: 'none',
                        fontSize: '1.0625rem',
                        fontWeight: 600,
                        letterSpacing: '0.2em',
                        width: '100%',
                        color: 'var(--color-brand-primary)',
                        backgroundColor: 'transparent'
                      }}
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    marginBottom: '8px'
                  }}>
                    New Password
                  </label>
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
                      id="new-password-input"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-muted)',
                        padding: 0,
                        display: 'flex'
                      }}
                    >
                      {showNewPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    marginBottom: '8px'
                  }}>
                    Confirm New Password
                  </label>
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
                      id="confirm-password-input"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-muted)',
                        padding: 0,
                        display: 'flex'
                      }}
                    >
                      {showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Validation checklist */}
                <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '-6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isPasswordValid ? '#059669' : '#9CA3AF' }}>
                    <IconCheck size={14} color={isPasswordValid ? '#059669' : '#D1D5DB'} />
                    <span>Password is at least 8 characters</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: doPasswordsMatch ? '#059669' : '#9CA3AF' }}>
                    <IconCheck size={14} color={doPasswordsMatch ? '#059669' : '#D1D5DB'} />
                    <span>Passwords match</span>
                  </div>
                </div>

                <button
                  id="reset-password-btn"
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
                    transition: 'background-color var(--transition-fast)',
                    marginTop: '6px'
                  }}
                >
                  {loading ? 'Saving password...' : 'Save New Password & Log In'}
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}>
                <IconCheck size={32} color="#059669" />
              </div>

              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '10px'
              }}>
                Password reset complete
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
                marginBottom: '28px',
                lineHeight: 1.5
              }}>
                Your password has been securely updated. You can now log into your Acrea account with your new credentials.
              </p>

              <button
                id="back-to-login-btn"
                onClick={() => {
                  if (onResetSuccess) {
                    onResetSuccess();
                  } else if (onNavigate) {
                    onNavigate('login');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'var(--color-brand-primary)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(22, 66, 48, 0.25)'
                }}
              >
                Sign In Now
              </button>
            </div>
          )}

          {/* Return to Sign In */}
          {step !== 3 && (
            <div style={{
              marginTop: '32px',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)'
            }}>
              Remember your password?{' '}
              <button
                id="back-to-login-link"
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
          )}
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
