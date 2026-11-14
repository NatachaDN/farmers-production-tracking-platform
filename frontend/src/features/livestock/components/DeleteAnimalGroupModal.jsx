import React, { useState } from 'react';
import { IconClose, IconTrash, IconWarning } from '../../../shared/components/Icons';

export function DeleteAnimalGroupModal({ isOpen, onClose, group, onConfirmDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !group) return null;

  const handleDelete = async () => {
    setErrorMessage('');
    setIsDeleting(true);
    try {
      await onConfirmDelete(group.id);
      onClose();
    } catch (err) {
      setErrorMessage(
        err.message || 'Failed to delete animal group. Protected records or network error occurred.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(19, 32, 28, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid var(--color-card-border)',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 16px 40px rgba(22, 66, 48, 0.12)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid #ECE7DC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconTrash size={20} color="#B91C1C" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                Delete Animal Group
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Confirm permanent removal of this group.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '6px' }}
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {errorMessage && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                color: '#B91C1C',
                fontSize: '0.875rem'
              }}
            >
              <IconWarning size={18} color="#B91C1C" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '2px' }}>Deletion Blocked</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Are you sure you want to delete <strong>{group.name}</strong> ({group.animalTypeDisplay || group.animalType})?
          </p>

          <div
            style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '0.8125rem',
              color: '#92400E'
            }}
          >
            <strong>Data Integrity Policy:</strong> Groups with protected historical records or active production logs cannot be deleted. If you only wish to retire this group, you can update its status to <em>Archived</em> or <em>Sold</em> instead.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 28px',
            borderTop: '1px solid #ECE7DC',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            backgroundColor: '#FAF8F4',
            borderRadius: '0 0 20px 20px'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid #DFD8CA',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: isDeleting ? 'not-allowed' : 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#B91C1C',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.7 : 1
            }}
          >
            {isDeleting ? 'Deleting...' : 'Confirm deletion'}
          </button>
        </div>
      </div>
    </div>
  );
}

