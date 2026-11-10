import React from 'react';
import {
  IconClose,
  IconLivestock,
  IconPencil,
  IconTrash,
  IconPin,
  IconCalendar,
  IconProduction,
  IconInputs,
  IconActivities
} from '../../../shared/components/Icons';

export function AnimalGroupDetailsModal({ isOpen, onClose, group, onEdit, onDelete }) {
  if (!isOpen || !group) return null;

  const currentPop = group.currentPopulation ?? group.initialPopulation ?? 0;
  const initialPop = group.initialPopulation ?? currentPop;
  const diff = currentPop - initialPop;

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
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid var(--color-card-border)',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconLivestock size={24} color="#D97706" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: '#92400E',
                    backgroundColor: '#FFFBEB',
                    padding: '2px 8px',
                    borderRadius: '999px'
                  }}
                >
                  {group.animalTypeDisplay || group.animalType || 'Livestock'}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: group.status === 'ACTIVE' ? '#EAF4ED' : '#F1F5F9',
                    color: group.status === 'ACTIVE' ? '#2A6740' : '#475569',
                    padding: '2px 8px',
                    borderRadius: '999px'
                  }}
                >
                  {group.status || 'ACTIVE'}
                </span>
              </div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                {group.name}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                onClose();
                onEdit(group);
              }}
              title="Edit animal group"
              style={{
                background: '#FFFFFF',
                border: '1px solid #DFD8CA',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)'
              }}
            >
              <IconPencil size={15} color="#4B5752" /> Edit
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(group);
              }}
              title="Delete animal group"
              style={{
                background: '#FFFFFF',
                border: '1px solid #DFD8CA',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                color: '#B91C1C'
              }}
            >
              <IconTrash size={15} color="#B91C1C" />
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '6px' }}
            >
              <IconClose size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Population Highlight Card */}
          <div
            style={{
              backgroundColor: '#FBF9F4',
              borderRadius: '14px',
              border: '1px solid #ECE7DC',
              padding: '18px 20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase' }}>
                Current Headcount
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                {currentPop}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase' }}>
                Initial Population
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {initialPop}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase' }}>
                Net Population Shift
              </span>
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: diff > 0 ? '#2E7D32' : diff < 0 ? '#B91C1C' : 'var(--color-text-muted)',
                  marginTop: '2px'
                }}
              >
                {diff > 0 ? `+${diff}` : `${diff}`}
              </div>
            </div>
          </div>

          {/* Group Details Grid */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px 0' }}>
              Group Specifications
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px',
                fontSize: '0.875rem'
              }}
            >
              <div style={{ backgroundColor: '#F9F6F0', padding: '12px 14px', borderRadius: '10px', border: '1px solid #ECE7DC' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>Breed</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{group.breed || 'Not specified'}</strong>
              </div>

              <div style={{ backgroundColor: '#F9F6F0', padding: '12px 14px', borderRadius: '10px', border: '1px solid #ECE7DC' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>Purpose</span>
                <strong style={{ color: '#2A6740' }}>{group.purpose || 'General'}</strong>
              </div>

              <div style={{ backgroundColor: '#F9F6F0', padding: '12px 14px', borderRadius: '10px', border: '1px solid #ECE7DC' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>Housing / Location</span>
                <strong style={{ color: 'var(--color-text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <IconPin size={13} color="#788680" /> {group.location || 'Farm main holding'}
                </strong>
              </div>

              <div style={{ backgroundColor: '#F9F6F0', padding: '12px 14px', borderRadius: '10px', border: '1px solid #ECE7DC' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>Acquisition / Start Date</span>
                <strong style={{ color: 'var(--color-text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <IconCalendar size={13} color="#788680" /> {group.startDate || 'Recorded at registration'}
                </strong>
              </div>
            </div>

            {group.farmName && (
              <div style={{ marginTop: '10px', backgroundColor: '#F9F6F0', padding: '10px 14px', borderRadius: '10px', border: '1px solid #ECE7DC', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Assigned Farm: </span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{group.farmName}</strong>
              </div>
            )}

            {group.notes && (
              <div style={{ marginTop: '10px', backgroundColor: '#F9F6F0', padding: '12px 14px', borderRadius: '10px', border: '1px solid #ECE7DC' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>Notes & Observations</span>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  {group.notes}
                </p>
              </div>
            )}
          </div>

          {/* Foundation Panels for Future Modules */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px 0' }}>
              Future Tracking Modules
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px dashed #DFD8CA',
                  backgroundColor: '#FAF8F4',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#E6F6F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconProduction size={16} color="#0D9488" />
                </div>
                <div>
                  <strong style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', display: 'block' }}>Daily Production Records</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Milk liters, egg counts, meat yield, and wool weight tracking (scheduled for next module).
                  </span>
                </div>
              </div>

              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px dashed #DFD8CA',
                  backgroundColor: '#FAF8F4',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EAF4ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconActivities size={16} color="#2D7A52" />
                </div>
                <div>
                  <strong style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', display: 'block' }}>Veterinary & Health Interventions</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Vaccination schedules, vet visits, and medication logs foundation.
                  </span>
                </div>
              </div>

              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px dashed #DFD8CA',
                  backgroundColor: '#FAF8F4',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconInputs size={16} color="#D97706" />
                </div>
                <div>
                  <strong style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', display: 'block' }}>Feed & Nutrition Logs</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Feed stock consumption and cost accounting foundation.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 28px',
            borderTop: '1px solid #ECE7DC',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: '#FAF8F4',
            borderRadius: '0 0 20px 20px'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: '1px solid #DFD8CA',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

