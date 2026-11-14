import React, { useState } from 'react';
import {
  IconArrowLeft,
  IconCamera,
  IconCalendar,
  IconLivestock,
  IconPencil,
  IconPin,
  IconShield,
  IconTrash
} from '../../shared/components/Icons';
import { resolveAnimalImageUrl } from './AnimalGroupFormPage';

function getStatusBadge(status) {
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

export function AnimalGroupDetailsPage({ group, onBack, onEdit, onDelete }) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  if (!group) return null;

  const statusInfo = getStatusBadge(group.status);
  const currentPop = group.currentPopulation ?? group.initialPopulation ?? 0;
  const initialPop = group.initialPopulation ?? currentPop;
  const diff = currentPop - initialPop;
  const imageUrls = Array.isArray(group.imageUrls) ? group.imageUrls : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1040px', margin: '0 auto' }}>
      {/* Top Action Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 14px',
            borderRadius: '10px',
            border: '1px solid var(--color-border-input)',
            backgroundColor: '#FFFFFF',
            color: 'var(--color-text-primary)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <IconArrowLeft size={16} />
          <span>Back to Livestock</span>
        </button>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            type="button"
            onClick={() => onEdit(group)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '10px',
              border: '1px solid var(--color-border-input)',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-text-primary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <IconPencil size={15} />
            <span>Edit Group</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(group)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '10px',
              border: '1px solid #FECACA',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <IconTrash size={15} color="#DC2626" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Details Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid var(--color-card-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)'
      }}>
        {/* Photo Gallery */}
        <div style={{ backgroundColor: '#F4EFE6', borderBottom: '1px solid var(--color-card-border)' }}>
          {imageUrls.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px' }}>
              <div style={{
                width: '100%',
                height: 'clamp(220px, 38vw, 380px)',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#EAE4D8'
              }}>
                <img
                  src={resolveAnimalImageUrl(imageUrls[activePhotoIndex] || imageUrls[0])}
                  alt={group.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>

              {imageUrls.length > 1 && (
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {imageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      style={{
                        width: '72px',
                        height: '56px',
                        flexShrink: 0,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        padding: 0,
                        cursor: 'pointer',
                        border: idx === activePhotoIndex ? '2px solid var(--color-brand-primary)' : '1px solid #DFD8CA'
                      }}
                    >
                      <img
                        src={resolveAnimalImageUrl(url)}
                        alt={`${group.name} ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              padding: '36px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: '#FEF3C7',
                border: '1px solid #FDE68A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IconLivestock size={28} color="#D97706" />
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                No photos uploaded for this animal group yet.
              </div>
              <button
                type="button"
                onClick={() => onEdit(group)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border-input)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <IconCamera size={14} />
                <span>Add Photos</span>
              </button>
            </div>
          )}
        </div>

        {/* Details Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Title & Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {group.name}
            </h2>
            <span style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#92400E',
              backgroundColor: '#FEF3C7',
              border: '1px solid #FDE68A',
              padding: '4px 12px',
              borderRadius: '999px'
            }}>
              {group.animalTypeDisplay || group.animalType}
            </span>
            {group.breed && (
              <span style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#3D4944',
                backgroundColor: '#F4EFE6',
                border: '1px solid #DFD9CE',
                padding: '4px 12px',
                borderRadius: '999px'
              }}>
                {group.breed}
              </span>
            )}
            <span style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: statusInfo.text,
              backgroundColor: statusInfo.bg,
              border: `1px solid ${statusInfo.border}`,
              padding: '4px 12px',
              borderRadius: '999px'
            }}>
              {statusInfo.label}
            </span>
          </div>

          {/* Population & Health Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))',
            gap: '12px'
          }}>
            <InfoTile label="Current Headcount" value={currentPop.toLocaleString()} highlight />
            <InfoTile label="Initial Headcount" value={initialPop.toLocaleString()} />
            <InfoTile
              label="Population Change"
              value={diff === 0 ? 'No change' : `${diff > 0 ? '+' : ''}${diff.toLocaleString()}`}
            />
            <InfoTile
              label="Average Weight"
              value={group.averageWeightKg != null ? `${group.averageWeightKg} kg` : 'Not recorded'}
            />
          </div>

          {/* Description */}
          <div style={{
            padding: '18px',
            borderRadius: '12px',
            backgroundColor: '#FCFAF7',
            border: '1px solid var(--color-card-border)'
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--color-text-muted)',
              marginBottom: '8px'
            }}>
              Description & Management Overview
            </div>
            <p style={{
              margin: 0,
              fontSize: '0.9375rem',
              lineHeight: 1.65,
              color: group.description ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              whiteSpace: 'pre-line'
            }}>
              {group.description || 'No detailed description recorded yet. Click "Edit Group" to add origin, vaccination, or management notes.'}
            </p>
            {group.notes && (
              <div style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid var(--color-card-border)',
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)'
              }}>
                <strong>Operational Note:</strong> {group.notes}
              </div>
            )}
          </div>

          {/* Husbandry Specs Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: '12px'
          }}>
            <SpecTile
              icon={<IconPin size={16} color="#D97706" />}
              label="Housing / Pen / Pasture"
              value={group.location || 'Not specified'}
            />
            <SpecTile
              icon={<IconLivestock size={16} color="var(--color-brand-primary)" />}
              label="Primary Purpose"
              value={group.purpose || 'Not specified'}
            />
            <SpecTile
              icon={<IconShield size={16} color="#2A6740" />}
              label="Health Status"
              value={group.healthStatus || 'Not specified'}
            />
            <SpecTile
              icon={<IconLivestock size={16} color="#0D9488" />}
              label="Feeding Regime"
              value={group.feedingRegime || 'Not specified'}
            />
            <SpecTile
              icon={<IconPin size={16} color="var(--color-text-muted)" />}
              label="Associated Farm"
              value={group.farmName || 'Unassigned'}
            />
            <SpecTile
              icon={<IconCalendar size={16} color="var(--color-text-muted)" />}
              label="Establishment Date"
              value={group.startDate || 'Not specified'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value, highlight = false }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: '12px',
      backgroundColor: highlight ? '#EAF4ED' : '#FAF8F5',
      border: `1px solid ${highlight ? '#CDE2D4' : 'var(--color-card-border)'}`
    }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: highlight ? '#164230' : 'var(--color-text-primary)'
      }}>
        {value}
      </div>
    </div>
  );
}

function SpecTile({ icon, label, value }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: '12px',
      backgroundColor: '#FFFFFF',
      border: '1px solid var(--color-card-border)',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
        {icon}
        <span>{label}</span>
      </div>
      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

