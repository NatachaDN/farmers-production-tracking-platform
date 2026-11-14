import React, { useEffect, useState } from 'react';
import {
  IconAlertCircle,
  IconCheck,
  IconCheckCircle,
  IconEye,
  IconEyeOff,
  IconLock,
  IconShield,
  IconWarning
} from '../../../shared/components/Icons';
import { authService } from '../../auth/services/authService';

const STATUS_STYLES = {
  PENDING: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', label: 'Pending Admin Approval' },
  APPROVED: { bg: '#EAF4ED', text: '#2A6740', border: '#C8E2D0', label: 'Approved' },
  REJECTED: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', label: 'Rejected' },
  CANCELLED: { bg: '#F4EFE6', text: '#4B5752', border: '#DFD8CA', label: 'Cancelled' },
};

const formatDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function PasswordField({ id, label, value, onChange, placeholder, autoComplete, hint, hintValid }) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        htmlFor={id}
        style={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--color-text-primary, #19201C)',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span
          style={{
            position: 'absolute',
            left: '12px',
            color: 'var(--color-text-muted, #788680)',
            display: 'flex',
            pointerEvents: 'none',
          }}
        >
          <IconLock size={16} />
        </span>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          style={{
            width: '100%',
            padding: '10px 40px 10px 36px',
            borderRadius: '10px',
            border: '1px solid var(--color-border-input, #DFD8CA)',
            backgroundColor: '#FFFFFF',
            color: 'var(--color-text-primary, #19201C)',
            fontSize: '0.9375rem',
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          style={{
            position: 'absolute',
            right: '10px',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted, #788680)',
            cursor: 'pointer',
            display: 'flex',
            padding: '4px',
          }}
        >
          {visible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
        </button>
      </div>
      {hint && (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: hintValid ? '#2E7D32' : 'var(--color-text-muted, #788680)',
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}

export function PasswordChangeRequestCard({ user }) {
  const isGoogleUser = user?.authProvider === 'GOOGLE';

  const [requests, setRequests] = useState([]);
  const [loadingList, setLoadingList] = useState(!isGoogleUser);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadRequests = async () => {
    if (isGoogleUser) return;
    setLoadingList(true);
    try {
      const data = await authService.getMyPasswordChangeRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      // Non-blocking if history fails to load
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isGoogleUser]);

  const pendingRequest = requests.find((r) => r.status === 'PENDING');
  const recentHistory = requests.filter((r) => r.status !== 'PENDING').slice(0, 3);

  const isMinLength = newPassword.length >= 8;
  const isDifferent = newPassword.length > 0 && currentPassword.length > 0 && newPassword !== currentPassword;
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit = currentPassword.length > 0 && isMinLength && isDifferent && isMatching && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Please enter your former (current) password to verify your identity.');
      return;
    }
    if (!isMinLength) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (!isDifferent) {
      setError('New password must be different from your former password.');
      return;
    }
    if (!isMatching) {
      setError('New password and confirmation do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await authService.requestPasswordChange({
        currentPassword,
        newPassword,
        confirmPassword,
        reason: reason.trim(),
      });
      setRequests((prev) => [created, ...prev]);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setReason('');
      setSuccess('Your password change request has been sent to the administrator for approval.');
    } catch (err) {
      setError(err.message || 'Could not submit password change request. Please verify your former password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (requestId) => {
    setError('');
    setSuccess('');
    setCancellingId(requestId);
    try {
      const updated = await authService.cancelPasswordChangeRequest(requestId);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
      setSuccess('Your pending password change request has been cancelled.');
    } catch (err) {
      setError(err.message || 'Could not cancel the request.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <section
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-border-subtle, #ECE7DC)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-subtle, 0 1px 3px rgba(25, 32, 28, 0.04))',
      }}
    >
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#EAF4ED',
              color: '#3E7B52',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconShield size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text-primary, #19201C)', margin: 0 }}>
              Password &amp; Security
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted, #788680)', margin: '2px 0 0' }}>
              Request a password change from the platform administrator by verifying your former password.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '10px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#B91C1C',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '16px',
          }}
        >
          <IconAlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '10px',
            backgroundColor: '#EAF4ED',
            border: '1px solid #C8E2D0',
            color: '#2A6740',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '16px',
          }}
        >
          <IconCheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {isGoogleUser ? (
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '12px',
            backgroundColor: '#F4EFE6',
            border: '1px solid #ECE7DC',
            color: 'var(--color-text-secondary, #4B5752)',
            fontSize: '0.875rem',
          }}
        >
          You signed in with Google. Your password and sign-in security are managed directly through your Google account.
        </div>
      ) : loadingList ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #788680)' }}>
          Checking password request status…
        </p>
      ) : pendingRequest ? (
        <div
          style={{
            padding: '16px 18px',
            borderRadius: '12px',
            backgroundColor: '#FEF3C7',
            border: '1px solid #FDE68A',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: '1 1 280px' }}>
            <IconWarning size={20} color="#92400E" />
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#92400E' }}>
                Password change request pending administrator approval
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#78350F', marginTop: '4px' }}>
                Submitted on {formatDateTime(pendingRequest.createdAt)}
                {pendingRequest.reason ? ` · Reason: "${pendingRequest.reason}"` : ''}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#78350F', marginTop: '2px' }}>
                Your former password remains active until the administrator approves this request.
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={cancellingId === pendingRequest.id}
            onClick={() => handleCancel(pendingRequest.id)}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid #D97706',
              backgroundColor: '#FFFFFF',
              color: '#92400E',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: cancellingId === pendingRequest.id ? 'not-allowed' : 'pointer',
            }}
          >
            {cancellingId === pendingRequest.id ? 'Cancelling…' : 'Cancel request'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <PasswordField
            id="former-password"
            label="Former (Current) Password *"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Enter your current password"
            autoComplete="current-password"
            hint="Required to verify your identity before sending the request to an administrator."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            <PasswordField
              id="new-password"
              label="New Password *"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              hint={
                newPassword.length === 0
                  ? 'Minimum 8 characters'
                  : !isMinLength
                    ? 'Must be at least 8 characters'
                    : currentPassword && !isDifferent
                      ? 'Must be different from your former password'
                      : 'Strong length'
              }
              hintValid={isMinLength && (!currentPassword || isDifferent)}
            />

            <PasswordField
              id="confirm-new-password"
              label="Confirm New Password *"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              hint={
                confirmPassword.length === 0
                  ? 'Repeat your new password'
                  : isMatching
                    ? 'Passwords match'
                    : 'Passwords do not match'
              }
              hintValid={isMatching}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="password-change-reason"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-text-primary, #19201C)',
              }}
            >
              Note to Administrator <span style={{ fontWeight: 400, color: 'var(--color-text-muted, #788680)' }}>(optional)</span>
            </label>
            <input
              id="password-change-reason"
              type="text"
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Routine security update or shared device precaution"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--color-border-input, #DFD8CA)',
                backgroundColor: '#FFFFFF',
                color: 'var(--color-text-primary, #19201C)',
                fontSize: '0.9375rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              type="submit"
              id="submit-password-request-btn"
              disabled={!canSubmit}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: canSubmit ? 'var(--color-brand-primary, #3E7B52)' : '#A4B0AA',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                transition: 'background-color 150ms',
              }}
            >
              <IconCheck size={16} />
              <span>{submitting ? 'Sending request…' : 'Send Request to Admin'}</span>
            </button>
          </div>
        </form>
      )}

      {!isGoogleUser && recentHistory.length > 0 && (
        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--color-border-subtle, #ECE7DC)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted, #788680)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            Recent Password Requests
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentHistory.map((item) => {
              const st = STATUS_STYLES[item.status] || STATUS_STYLES.CANCELLED;
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#F9F6F0',
                    border: '1px solid #ECE7DC',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary, #19201C)' }}>
                      Requested {formatDateTime(item.createdAt)}
                    </span>
                    {item.adminNote && (
                      <span style={{ color: 'var(--color-text-secondary, #4B5752)', marginLeft: '8px' }}>
                        · Admin note: “{item.adminNote}”
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      padding: '2px 10px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: st.bg,
                      color: st.text,
                      border: `1px solid ${st.border}`,
                    }}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

