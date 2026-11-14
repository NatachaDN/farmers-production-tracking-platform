import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { IconDots, IconChevronRight, IconTrash, IconPencil } from './Icons';

export function PlotCard({
  icon,
  title,
  farmName,
  area,
  stage,
  progress = 0,
  imageUrl,
  imageUrls,
  updated = "Updated today",
  onViewDetails,
  onEditPlot,
  onDeletePlot
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const coverImage = !imgFailed ? (imageUrl || (Array.isArray(imageUrls) && imageUrls[0]) || null) : null;
  const photoCount = Array.isArray(imageUrls) ? imageUrls.length : (imageUrl ? 1 : 0);

  return (
    <div style={{
      backgroundColor: 'var(--color-card-bg)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-xl)',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow-card)',
      transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
    }}>
      {/* Top Header */}
      <div>
        {coverImage && (
          <div style={{
            position: 'relative',
            width: '100%',
            height: '132px',
            borderRadius: '14px',
            overflow: 'hidden',
            marginBottom: '14px',
            border: '1px solid var(--color-card-border)',
            backgroundColor: '#F4F1EA',
          }}>
            <img
              src={coverImage}
              alt={title}
              onError={() => setImgFailed(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {photoCount > 1 && (
              <span style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(22, 66, 48, 0.82)',
                color: '#FFFFFF',
                fontSize: '0.7rem',
                fontWeight: 600,
              }}>
                +{photoCount - 1} more
              </span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-brand-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StatusBadge status={stage} />
            {onEditPlot && (
              <button
                onClick={onEditPlot}
                title="Edit Plot"
                aria-label="Edit Plot"
                style={{
                  color: 'var(--color-brand-primary, #164230)',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-brand-primary, #164230)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F0FDF4';
                  e.currentTarget.style.color = 'var(--color-brand-primary, #164230)';
                }}
              >
                <IconPencil size={15} />
              </button>
            )}
            {onDeletePlot && (
              <button
                onClick={onDeletePlot}
                title="Delete Plot"
                aria-label="Delete Plot"
                style={{
                  color: '#DC2626',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#DC2626';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FEF2F2';
                  e.currentTarget.style.color = '#DC2626';
                }}
              >
                <IconTrash size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Title & Area */}
        <h3 style={{
          fontSize: '1.0625rem',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.01em',
          marginBottom: '4px'
        }}>
          {title}
        </h3>
        {farmName && (
          <p style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: farmName === 'Unassigned' ? '#92400E' : '#3E7B52',
            marginBottom: '4px'
          }}>
            {farmName === 'Unassigned' ? 'Unassigned farm' : `Farm: ${farmName}`}
          </p>
        )}
        <p style={{
          fontSize: '0.8125rem',
          color: 'var(--color-text-muted)',
          marginBottom: '20px'
        }}>
          {area}
        </p>

        {/* Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Cycle progress</span>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{progress}%</span>
          </div>
          <div style={{
            height: '6px',
            width: '100%',
            backgroundColor: '#ECE7DC',
            borderRadius: '9999px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: 'var(--color-brand-primary)',
              borderRadius: '9999px',
              transition: 'width 400ms ease-out'
            }} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '22px',
        paddingTop: '14px',
        borderTop: '1px solid #F4EFE6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#A4B0AA' }} />
          <span>{updated}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onViewDetails}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              transition: 'color var(--transition-fast)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-brand-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
          >
            View details →
          </button>
        </div>
      </div>
    </div>
  );
}
