import React from 'react';
import { IconAlertCircle } from '../../../shared/components/Icons';

export function FarmDetailSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 0' }}>
      <div className="acrea-skeleton" style={{ width: '180px', height: '40px', borderRadius: '9999px' }} />
      <div className="acrea-skeleton" style={{ width: '100%', height: '240px', borderRadius: '20px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[1, 2, 3].map((n) => (
          <div key={n} className="acrea-skeleton" style={{ height: '110px', borderRadius: '16px' }} />
        ))}
      </div>
    </div>
  );
}

export function FarmDetailError({ message, onBack }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '20px',
      border: '1px solid #ECE7DC',
      padding: '48px 24px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '56px', height: '56px', borderRadius: '50%',
        backgroundColor: '#FEE2E2', color: '#DC2626',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '16px'
      }}>
        <IconAlertCircle size={28} />
      </div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#164230', marginBottom: '8px' }}>
        {message || 'Farm Not Found'}
      </h2>
      <p style={{ color: '#5C6F64', fontSize: '0.9375rem', marginBottom: '24px' }}>
        We could not load the details for this farm. Please go back and try again.
      </p>
      <button
        type="button"
        onClick={onBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 18px',
          borderRadius: '9999px',
          backgroundColor: '#164230',
          color: '#FFFFFF',
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: 'pointer',
          border: 'none'
        }}
      >
        Return to My Farms
      </button>
    </div>
  );
}

