import React, { useState } from 'react';
import { passwordMeetsPolicy, passwordPolicyMessage } from './services/passwordRules';
import { AuthHeroBanner } from './AuthHeroBanner';
import { AuthMetaHeader } from './AuthMetaHeader';
import {
  IconUser,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowLeft,
  IconCheckCircle,
  IconCheck,
  IconRefresh
} from '../../shared/components/Icons';
import { authService } from './services/authService';

export function ForgotPasswordView({ onNavigate, onResetComplete, onResetSuccess }) {
  const [step, setStep] = useState(1); // 1 = Request code, 2 = Enter code & new password, 3 = Success
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const isMinLength = passwordMeetsPolicy(newPassword);
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid = isMinLength && isMatching && resetCode.trim().length >= 4;

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      const response = await authService.forgotPassword(emailOrPhone.trim());
      setStep(2);
      setNotice(response?.message || 'If an account exists, a reset code has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Could not send the reset code. Check your email address and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isMinLength) {
      setError(passwordPolicyMessage);
      return;
    }
    if (!isMatching) {
      setError('Password confirmation does not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authService.resetPassword({
        emailOrPhone: emailOrPhone.trim(),
        resetCode: resetCode.trim(),
        newPassword,
        confirmPassword
      });
      setStep(3);
    } catch (err) {
      setError(err.message || 'Password reset failed. Please verify your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setNotice('');
    setLoading(true);
    try {
      await authService.forgotPassword(emailOrPhone.trim());
      setResetCode('');
      setNotice('If an account exists, a new verification code has been sent.');
    } catch (err) {
      setError(err.message || 'Could not resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left — Agricultural Hero Banner */}
      <AuthHeroBanner />

      {/* Right — Form Canvas */}
      <main className="auth-form-wrapper">
        <AuthMetaHeader subtitle="Account recovery" />

        <div className="auth-panel" style={{ maxWidth: '420px', width: '100%', margin: '0 auto', padding: '24px 0' }}>
          {/* Back button */}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('login')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8125rem',
              color: 'var(--color-text-secondary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginBottom: '20px',
              fontWeight: 500
            }}
          >
            <IconArrowLeft size={16} color="var(--color-text-secondary)" />
            Back to sign in
          </button>

          {/* STEP 1: REQUEST CODE */}
          {step === 1 && (
            <div>
              <h1 style={{
                fontSize: '1.875rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '6px'
              }}>
                Reset your password
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
                marginBottom: '28px',
                lineHeight: 1.5
              }}>
                Enter the email address associated with your Acrea account. For accounts registered with a phone number, contact your administrator.
              </p>

              {/* Error Alert */}
              {error && (
                <div role="alert" style={{
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

              <form onSubmit={handleRequestCode} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label htmlFor="forgot-identifier-input" style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    marginBottom: '8px'
                  }}>
                    Email address
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
                      id="forgot-identifier-input"
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      required
                      autoFocus
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
                  id="send-reset-code-btn"
                  type="submit"
                  disabled={loading || !emailOrPhone.trim()}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'var(--color-brand-primary)',
                    color: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: loading || !emailOrPhone.trim() ? 'not-allowed' : 'pointer',
                    opacity: loading || !emailOrPhone.trim() ? 0.75 : 1,
                    boxShadow: '0 2px 6px rgba(22, 66, 48, 0.25)',
                    transition: 'all var(--transition-fast)',
                    marginTop: '4px'
                  }}
                >
                  {loading ? 'Sending code...' : 'Send reset code'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: ENTER CODE & NEW PASSWORD */}
          {step === 2 && (
            <div>
              <h1 style={{
                fontSize: '1.875rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '6px'
              }}>
                Set new password
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
                marginBottom: '20px',
                lineHeight: 1.5
              }}>
                Enter the verification code sent to <strong style={{ color: 'var(--color-text-primary)' }}>{emailOrPhone}</strong> and choose your new password.
              </p>

              {/* Informational notice banner */}
              {notice && (
                <div style={{
                  backgroundColor: 'var(--color-brand-tint, #EAF4ED)',
                  border: '1px solid var(--color-brand-border, #C8E2D0)',
                  color: 'var(--color-brand-primary, #3E7B52)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  marginBottom: '20px',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <IconCheckCircle size={18} color="var(--color-brand-primary, #3E7B52)" />
                  <span>{notice}</span>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div role="alert" style={{
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

              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Reset Code */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label htmlFor="reset-code-input" style={{
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--color-text-secondary)'
                    }}>
                      Verification code
                    </label>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={loading}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        color: 'var(--color-brand-primary)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <IconRefresh size={12} />
                      Resend code
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
                    <input
                      id="reset-code-input"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      required
                      maxLength={12}
                      style={{
                        border: 'none',
                        outline: 'none',
                        fontSize: '1.05rem',
                        letterSpacing: '0.15em',
                        fontWeight: 600,
                        width: '100%',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'transparent'
                      }}
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="new-password-input" style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    marginBottom: '8px'
                  }}>
                    New password
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
                      type={showPassword ? 'text' : 'password'}
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

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password-input" style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    marginBottom: '8px'
                  }}>
                    Confirm new password
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
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter your password"
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
                      onClick={() => setShowConfirm(!showConfirm)}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
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
                      {showConfirm ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Password Policy Hints */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  backgroundColor: 'var(--color-surface-subtle, #F4EFE6)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.75rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: isMinLength ? 'var(--color-brand-primary, #3E7B52)' : 'var(--color-text-muted)'
                  }}>
                    <IconCheck size={14} color={isMinLength ? 'var(--color-brand-primary, #3E7B52)' : '#A4B0AA'} />
                    <span>8+ characters, including a letter and a number (maximum 72 bytes)</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: isMatching ? 'var(--color-brand-primary, #3E7B52)' : 'var(--color-text-muted)'
                  }}>
                    <IconCheck size={14} color={isMatching ? 'var(--color-brand-primary, #3E7B52)' : '#A4B0AA'} />
                    <span>Passwords match</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  id="reset-password-submit-btn"
                  type="submit"
                  disabled={loading || !isFormValid}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'var(--color-brand-primary)',
                    color: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: loading || !isFormValid ? 'not-allowed' : 'pointer',
                    opacity: loading || !isFormValid ? 0.75 : 1,
                    boxShadow: '0 2px 6px rgba(22, 66, 48, 0.25)',
                    transition: 'all var(--transition-fast)',
                    marginTop: '4px'
                  }}
                >
                  {loading ? 'Updating password...' : 'Update password'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setNotice('');
                      setError('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      fontSize: '0.8125rem',
                      cursor: 'pointer'
                    }}
                  >
                    Use a different email or phone
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: SUCCESS STATE */}
          {step === 3 && (
            <div style={{
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border-subtle, #ECE7DC)',
              borderRadius: 'var(--radius-lg)',
              padding: '36px 24px',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-brand-tint, #EAF4ED)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                <IconCheckCircle size={32} color="var(--color-brand-primary, #3E7B52)" />
              </div>

              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '8px'
              }}>
                Password updated
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
                marginBottom: '28px'
              }}>
                Your password has been successfully reset. You can now sign in with your new credentials.
              </p>

              <button
                id="back-to-login-success-btn"
                type="button"
                onClick={() => {
                  if (onResetComplete) {
                    onResetComplete(emailOrPhone);
                  } else if (onResetSuccess) {
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
                Sign in with new password
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
      </main>
    </div>
  );
}
