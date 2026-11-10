import React, { useState } from 'react';
import {
  IconLivestock,
  IconPin,
  IconPencil,
  IconTrash,
  IconArrowRight
} from '../../../shared/components/Icons';

function getStatusStyle(status) {
  switch (status) {
    case 'ACTIVE':
      return { bg: '#EAF4ED', text: '#2A6740', border: '#CDE2D4', label: 'Active' };
    case 'SOLD':
      return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', label: 'Sold' };
    case 'ARCHIVED':
      return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0', label: 'Archived' };
    case 'INACTIVE':
      return { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB', label: 'Inactive' };
    default:
      return { bg: '#EAF4ED', text: '#2A6740', border: '#CDE2D4', label: status || 'Active' };
  }
}

export function AnimalGroupCard({ group, onViewDetails, onEdit, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);

  const statusInfo = getStatusStyle(group.status);
  const currentPop = group.currentPopulation ?? group.initialPopulation ?? 0;
  const initialPop = group.initialPopulation ?? currentPop;
  const diff = currentPop - initialPop;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: '#FFFFFF',
        border: `1px solid ${isHovered ? '#DFD8CA' : 'var(--color-card-border)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: isHovered
          ? '0 8px 24px rgba(22, 66, 48, 0.08)'
          : 'var(--shadow-card)',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
      }}
    >
      <div>
        {/* Top Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <IconLivestock size={24} color="#D97706" />
            </div>
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#92400E',
                  backgroundColor: '#FFFBEB',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  display: 'inline-block',
                  marginBottom: '4px'
                }}
              >
                {group.animalTypeDisplay || group.animalType || 'Livestock'}
              </span>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  lineHeight: 1.3
                }}
              >
                {group.name}
              </h3>
            </div>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: statusInfo.bg,
              color: statusInfo.text,
              border: `1px solid ${statusInfo.border}`,
              padding: '3px 10px',
              borderRadius: '999px',
              flexShrink: 0
            }}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* Breed and Purpose tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {group.breed && (
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
                backgroundColor: '#F9F6F0',
                padding: '3px 10px',
                borderRadius: '6px',
                border: '1px solid #ECE7DC'
              }}
            >
              Breed: <strong>{group.breed}</strong>
            </span>
          )}
          {group.purpose && (
            <span
              style={{
                fontSize: '0.8125rem',
                color: '#2A6740',
                backgroundColor: '#EAF4ED',
                padding: '3px 10px',
                borderRadius: '6px',
                border: '1px solid #CDE2D4'
              }}
            >
              {group.purpose}
            </span>
          )}
          {group.location && (
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-muted)',
                backgroundColor: '#F9F6F0',
                padding: '3px 10px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                border: '1px solid #ECE7DC'
              }}
            >
              <IconPin size={12} color="#788680" />
              {group.location}
            </span>
          )}
        </div>

        {/* Population Box */}
        <div
          style={{
            backgroundColor: '#FBF9F4',
            borderRadius: '12px',
            border: '1px solid #ECE7DC',
            padding: '14px 16px',
            marginBottom: '18px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Current Population
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Initial: {initialPop}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
              {currentPop}
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              head / units
            </span>
            {diff !== 0 && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: diff > 0 ? '#2E7D32' : '#B91C1C',
                  marginLeft: 'auto'
                }}
              >
                {diff > 0 ? `+${diff}` : `${diff}`} vs initial
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div
        style={{
          borderTop: '1px solid #F4EFE6',
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <button
          onClick={() => onViewDetails && onViewDetails(group)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-brand-primary)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 0'
          }}
        >
          View details <IconArrowRight size={14} color="var(--color-brand-primary)" />
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onEdit && onEdit(group)}
            title="Edit group"
            style={{
              background: '#FFFFFF',
              border: '1px solid #DFD8CA',
              borderRadius: '8px',
              padding: '6px 10px',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 120ms'
            }}
          >
            <IconPencil size={15} color="#4B5752" />
          </button>
          <button
            onClick={() => onDelete && onDelete(group)}
            title="Delete group"
            style={{
              background: '#FFFFFF',
              border: '1px solid #DFD8CA',
              borderRadius: '8px',
              padding: '6px 10px',
              cursor: 'pointer',
              color: '#B91C1C',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 120ms'
            }}
          >
            <IconTrash size={15} color="#B91C1C" />
          </button>
        </div>
      </div>
    </div>
  );
}

