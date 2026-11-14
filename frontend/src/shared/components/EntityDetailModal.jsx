import React from 'react';
import { IconClose, IconEdit } from './Icons';

export function EntityDetailModal({
  open,
  onClose,
  title,
  subtitle,
  badge,
  badgeStyle,
  fields = [],
  longFields = [],
  onEdit,
  editLabel = 'Edit',
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 18, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #ECE7DC',
          maxWidth: '640px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 'clamp(18px, 3vw, 26px)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.16)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '18px' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#164230' }}>
                {title}
              </h3>
              {badge && (
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    backgroundColor: '#EAF4ED',
                    color: '#164230',
                    ...badgeStyle,
                  }}
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: '#64716B' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            style={{
              border: 'none',
              background: '#F4EFE6',
              color: '#4B5752',
              borderRadius: '9999px',
              width: '32px',
              height: '32px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <IconClose size={16} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}
        >
          {fields.map((f, idx) => (
            <div
              key={f.label || idx}
              style={{
                backgroundColor: '#F9F6F0',
                border: '1px solid #ECE7DC',
                borderRadius: '12px',
                padding: '10px 12px',
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64716B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {f.label}
              </div>
              <div style={{ marginTop: '4px', fontSize: '0.875rem', fontWeight: 600, color: '#19201C', wordBreak: 'break-word' }}>
                {f.value !== null && f.value !== undefined && f.value !== '' ? f.value : '—'}
              </div>
            </div>
          ))}
        </div>

        {longFields.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
            {longFields.map((f, idx) => (
              <div
                key={f.label || idx}
                style={{
                  backgroundColor: '#F9F6F0',
                  border: '1px solid #ECE7DC',
                  borderRadius: '12px',
                  padding: '12px 14px',
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64716B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {f.label}
                </div>
                <div style={{ marginTop: '5px', fontSize: '0.875rem', color: '#19201C', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {f.value !== null && f.value !== undefined && f.value !== '' ? f.value : '—'}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '9999px',
                border: '1px solid #DFD8CA',
                backgroundColor: '#FFFFFF',
                color: '#19201C',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <IconEdit size={13} /> {editLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: '#164230',
              color: '#FFFFFF',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
