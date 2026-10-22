import React, { useState } from 'react';
import { farmService } from '../services/farmService';
import { IconClose } from '../../../shared/components/Icons';

export function NewFarmModal({ isOpen, onClose, onFarmCreated, farmerId = 1 }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || name.trim() === '') {
      setErrorMsg('Farm name is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        name: name.trim(),
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        isDefault
      };
      const created = await farmService.createFarm(farmerId, payload);
      setName('');
      setLocation('');
      setDescription('');
      setIsDefault(false);
      if (onFarmCreated) {
        onFarmCreated(created);
      }
      onClose();
    } catch (err) {
      console.error('Failed to create farm:', err);
      setErrorMsg(err.message || 'Failed to create farm. Please verify your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(19, 32, 28, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 20px 40px rgba(22, 66, 48, 0.15)',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid var(--color-card-border)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: 0
            }}>
              Register New Farm
            </h2>
            <p style={{
              fontSize: '0.8125rem',
              color: 'var(--color-text-muted)',
              marginTop: '4px',
              margin: 0
            }}>
              Create a main farm structure to group and organize all your plots.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-muted)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer'
            }}
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {errorMsg && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-md)',
              color: '#991B1B',
              fontSize: '0.875rem'
            }}>
              {errorMsg}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              Farm Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Green Acres Farm, Highland Valley"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-input)',
                fontSize: '0.9375rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              General Location / County
            </label>
            <input
              type="text"
              placeholder="e.g. Nakuru County, Kenya · Sub-county / District"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-input)',
                fontSize: '0.9375rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              Description / Farm Type
            </label>
            <input
              type="text"
              placeholder="e.g. Main crop farm, Commercial greenhouse"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-input)',
                fontSize: '0.9375rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            marginTop: '4px'
          }}>
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              style={{ accentColor: 'var(--color-brand-primary)' }}
            />
            <span>Set as primary default container for new plots</span>
          </label>

          {/* Action Footer */}
          <div style={{
            marginTop: '12px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid var(--color-border-subtle)',
            paddingTop: '18px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 22px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-brand-primary)',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              {submitting ? 'Creating Farm...' : 'Create Farm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
