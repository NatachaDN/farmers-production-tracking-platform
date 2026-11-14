import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconClose, IconTrash, IconWarning } from './Icons';

export function ConfirmModal({
  isOpen,
  title = 'Confirm action',
  message = 'Are you sure you want to continue?',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger', // 'danger' | 'warning'
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !loading && onCancel) {
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const isWarning = tone === 'warning';
  const badgeBg = isWarning ? '#FEF3C7' : '#FEF2F2';
  const badgeColor = isWarning ? '#B45309' : '#DC2626';
  const confirmBg = isWarning ? '#D97706' : '#DC2626';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading && onCancel) onCancel();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(19, 32, 28, 0.48)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 1300,
      }}
    >
      <div
        className="fade-in-scale"
        style={{
          width: 'min(100%, 420px)',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #ECE7DC',
          boxShadow: '0 20px 48px rgba(22, 66, 48, 0.18)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: badgeBg,
                color: badgeColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isWarning ? <IconWarning size={22} /> : <IconTrash size={20} />}
            </div>
            <h2
              id="confirm-modal-title"
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#19201C',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close"
            style={{
              background: '#F9F6F0',
              border: '1px solid #ECE7DC',
              borderRadius: '9999px',
              width: '32px',
              height: '32px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4B5752',
              cursor: loading ? 'not-allowed' : 'pointer',
              flexShrink: 0,
            }}
          >
            <IconClose size={15} />
          </button>
        </div>

        <p
          style={{
            fontSize: '0.9375rem',
            lineHeight: 1.55,
            color: '#4B5752',
            margin: 0,
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            flexWrap: 'wrap',
            marginTop: '4px',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid #DFD8CA',
              backgroundColor: '#FFFFFF',
              color: '#4B5752',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: loading ? '#9CA3AF' : confirmBg,
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

