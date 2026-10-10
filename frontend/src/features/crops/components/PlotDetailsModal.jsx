import React from 'react';
import {
  IconClose,
  IconSprout,
  IconTomato,
  IconBean,
  IconLeaf,
  IconMapPin,
  IconCalendar,
  IconScale,
  IconDroplets,
  IconCheckCircle,
  IconChevronRight,
  IconFarms,
  IconZap,
  IconActivities
} from '../../../shared/components/Icons';
import { StatusBadge } from '../../../shared/components/StatusBadge';

function getCropIcon(cropName) {
  const name = (cropName || '').toLowerCase();
  if (name.includes('tomato')) return <IconTomato size={24} color="#2D7A52" />;
  if (name.includes('bean')) return <IconBean size={24} color="#2D7A52" />;
  if (name.includes('cassava') || name.includes('potato')) return <IconLeaf size={24} color="#2D7A52" />;
  return <IconSprout size={24} color="#2D7A52" />;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function PlotDetailsModal({ isOpen, onClose, plot, onGoToActivities }) {
  if (!isOpen || !plot) return null;

  const cropName = plot.cropName || plot.crop || plot.title || 'Maize';
  const plotName = plot.plotName || plot.title || 'Plot A';
  const farmName = plot.farmName || plot.farm?.name || 'Green Acres Farm';
  const areaVal = plot.acreage || plot.areaVal || (parseFloat(plot.area) || 2.5);
  const stage = plot.stage || 'Vegetative growth';
  const progress = plot.progress ?? 62;
  const status = (plot.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? 'Active' : 'Completed';
  const plantingDate = plot.plantingDate || plot.startDate || '2026-07-12';
  const harvestDate = plot.plannedHarvestDate || plot.endDate || '2026-11-28';
  const targetYield = plot.expectedQuantity
    ? `${plot.expectedQuantity.toLocaleString()} ${plot.expectedQuantityUnit || 'kg'}`
    : '5,000 kg';
  const location = plot.location || 'North Field, Section 1 · Nakuru County';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(19, 32, 28, 0.48)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl, 16px)',
        boxShadow: '0 24px 48px rgba(22, 66, 48, 0.18)',
        width: '100%',
        maxWidth: '640px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid var(--color-card-border)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '22px 28px',
          backgroundColor: '#164230',
          color: '#FFFFFF',
          borderTopLeftRadius: 'var(--radius-xl, 16px)',
          borderTopRightRadius: 'var(--radius-xl, 16px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              {getCropIcon(cropName)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>
                  {cropName} · {plotName}
                </h2>
                <StatusBadge status={status} size="sm" />
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#D1E5D9', marginTop: '4px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconFarms size={14} color="#D1E5D9" />
                <span>{farmName}</span>
                <span>·</span>
                <IconMapPin size={14} color="#D1E5D9" />
                <span>{location}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-md, 8px)',
              color: '#D1E5D9',
              border: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
          >
            <IconClose size={20} color="#FFFFFF" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Key Metrics Grid (4 Stat Cards) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '14px'
          }}>
            <div style={{
              backgroundColor: '#F9F6F0',
              border: '1px solid #ECE7DC',
              borderRadius: 'var(--radius-md, 10px)',
              padding: '12px 14px'
            }}>
              <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Cultivated Area
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {areaVal} ha
              </div>
            </div>

            <div style={{
              backgroundColor: '#F9F6F0',
              border: '1px solid #ECE7DC',
              borderRadius: 'var(--radius-md, 10px)',
              padding: '12px 14px'
            }}>
              <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Target Yield
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
                {targetYield}
              </div>
            </div>

            <div style={{
              backgroundColor: '#F9F6F0',
              border: '1px solid #ECE7DC',
              borderRadius: 'var(--radius-md, 10px)',
              padding: '12px 14px'
            }}>
              <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Planting Date
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {formatDate(plantingDate)}
              </div>
            </div>

            <div style={{
              backgroundColor: '#F9F6F0',
              border: '1px solid #ECE7DC',
              borderRadius: 'var(--radius-md, 10px)',
              padding: '12px 14px'
            }}>
              <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Est. Harvest
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {formatDate(harvestDate)}
              </div>
            </div>
          </div>

          {/* Growth Stage Progress Section */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-card-border)',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconZap size={16} color="var(--color-brand-primary)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Current Growth Stage: <strong style={{ color: 'var(--color-brand-primary)' }}>{stage}</strong>
                </span>
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
                {progress}% Complete
              </span>
            </div>

            <div style={{
              height: '8px',
              width: '100%',
              backgroundColor: '#ECE7DC',
              borderRadius: '9999px',
              overflow: 'hidden',
              marginTop: '8px'
            }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                backgroundColor: 'var(--color-brand-primary)',
                borderRadius: '9999px',
                transition: 'width 500ms ease-out'
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '10px' }}>
              <span>1. Planting</span>
              <span>2. Vegetative</span>
              <span>3. Flowering</span>
              <span>4. Maturing</span>
              <span>5. Harvest</span>
            </div>
          </div>

          {/* Agronomic Condition & Soil Health */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '14px'
          }}>
            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-md, 10px)',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <IconDroplets size={22} color="#0284C7" />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Soil Moisture</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0369A1' }}>68% · Optimal</div>
              </div>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-md, 10px)',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <IconSprout size={22} color="#16A34A" />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Crop Health</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#15803D' }}>Good · Low Risk</div>
              </div>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-md, 10px)',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <IconCheckCircle size={22} color="#3E7B52" />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Cycle Status</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#164230' }}>{plot.subStatus || 'On Track'}</div>
              </div>
            </div>
          </div>

          {/* Recent Field Activities Timeline */}
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconActivities size={16} color="var(--color-brand-primary)" />
              <span>Recent Logged Field Activities</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: '#F9F6F0',
                border: '1px solid #ECE7DC',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8125rem'
              }}>
                <div>
                  <strong style={{ color: 'var(--color-text-primary)' }}>Top-Dressing Fertilizer Application</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>50 kg CAN Applied · Section A</div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-brand-primary)' }}>18 Sep 2026</span>
              </div>

              <div style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: '#F9F6F0',
                border: '1px solid #ECE7DC',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8125rem'
              }}>
                <div>
                  <strong style={{ color: 'var(--color-text-primary)' }}>Weed Control & Scouting Inspection</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>Manual weeding completed · No pest alert</div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-brand-primary)' }}>28 Aug 2026</span>
              </div>
            </div>
          </div>

          {/* Modal Action Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid #F4EFE6'
          }}>
            <button
              onClick={() => {
                onClose();
                if (onGoToActivities) onGoToActivities(plot);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'var(--color-brand-tint, #EAF4ED)',
                color: 'var(--color-brand-primary, #164230)',
                border: '1px solid #C8E2D0',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <IconActivities size={16} />
              <span>Go to Cycle Activities & Logs →</span>
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '10px 22px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'var(--color-brand-primary)',
                color: '#FFFFFF',
                border: 'none',
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
    </div>
  );
}
