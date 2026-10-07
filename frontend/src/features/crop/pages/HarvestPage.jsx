import React, { useState, useEffect } from 'react';
import { HarvestForm } from '../components/HarvestForm';
import { HarvestResult } from '../components/HarvestResult';
import { harvestService } from '../services/harvestService';
import { MetricCard } from '../../../shared/components/MetricCard';
import {
  IconCrop,
  IconSprout,
  IconProduction,
  IconCheck
} from '../../../shared/components/Icons';

const DEMO_CYCLES = [
  { id: 1, name: 'Maize (Plot A)', crop: 'Maize', plot: 'Plot A', status: 'ACTIVE', area: '2.5 ha' },
  { id: 2, name: 'Rice Season 2025 (Plot B)', crop: 'Rice', plot: 'Plot B', status: 'COMPLETED', area: '1.8 ha' },
  { id: 3, name: 'Tomatoes (Plot C)', crop: 'Tomatoes', plot: 'Plot C', status: 'ACTIVE', area: '1.0 ha' },
];

const DEMO_COMPLETED_HARVEST = {
  id: 1,
  cycleId: 2,
  cycleName: 'Rice Season 2025 (Plot B)',
  cycleStatus: 'COMPLETED',
  quantity: 900,
  unit: 'KG',
  harvestDate: '2026-09-26',
  acreage: 1.8,
  calculatedYield: 500.0,
  yieldDisplay: '500.00 kg / ha',
  notes: 'Good season — uniform grain size, minimal pest impact.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function HarvestPage({ farmerId = 1 }) {
  const [selectedCycleId, setSelectedCycleId] = useState(1);
  const [harvest, setHarvest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const selectedCycle = DEMO_CYCLES.find((c) => c.id === selectedCycleId) || DEMO_CYCLES[0];

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const loadHarvest = async (cycleId) => {
    setIsLoading(true);
    try {
      const data = await harvestService.getHarvest(farmerId, cycleId);
      if (data) {
        setHarvest(data);
      } else {
        setHarvest(null);
      }
    } catch {
      if (cycleId === 2) {
        setHarvest(DEMO_COMPLETED_HARVEST);
      } else {
        setHarvest(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHarvest(selectedCycleId);
  }, [selectedCycleId]);

  const handleRecordHarvest = async (formData) => {
    setIsSubmitting(true);
    try {
      let recorded;
      try {
        recorded = await harvestService.recordHarvest(farmerId, selectedCycleId, formData);
      } catch {
        const qty = formData.quantity;
        const acreage = parseFloat(selectedCycle.area) || 2.5;
        const calcYield = Math.round((qty / acreage) * 100) / 100;
        recorded = {
          id: Date.now(),
          cycleId: selectedCycleId,
          cycleName: selectedCycle.name,
          cycleStatus: 'COMPLETED',
          quantity: qty,
          unit: formData.unit,
          harvestDate: formData.harvestDate,
          acreage,
          calculatedYield: calcYield,
          yieldDisplay: `${calcYield.toFixed(2)} ${formData.unit.toLowerCase()} / ha`,
          notes: formData.notes || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      setHarvest(recorded);
      showToast('🌾 Harvest recorded successfully! Cycle marked as Completed.');
    } catch (err) {
      showToast(err?.message || 'Failed to record harvest. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          padding: '12px 20px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: toastMessage.type === 'error' ? 'var(--color-accent-red-bg)' : 'var(--color-brand-tint)',
          color: toastMessage.type === 'error' ? 'var(--color-accent-red)' : 'var(--color-brand-primary)',
          border: `1px solid ${toastMessage.type === 'error' ? 'var(--color-accent-red-border)' : 'var(--color-brand-border)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 600,
          fontSize: '0.875rem'
        }}>
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ fontSize: '1rem', color: 'inherit', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Control Bar: Cycle Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', marginRight: '4px' }}>
            SELECT CROP CYCLE:
          </span>
          {DEMO_CYCLES.map((c) => {
            const isSelected = selectedCycleId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCycleId(c.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 700 : 500,
                  backgroundColor: isSelected ? 'var(--color-brand-primary)' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : 'var(--color-text-primary)',
                  border: isSelected ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-card-border)',
                  boxShadow: isSelected ? '0 2px 8px rgba(62, 123, 82, 0.25)' : 'var(--shadow-subtle)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px'
      }}>
        <MetricCard
          label="Cycle"
          value={selectedCycle.name}
          subtext={`${selectedCycle.area} · Status: ${harvest ? 'COMPLETED' : selectedCycle.status}`}
          icon={<IconSprout size={20} color="#2D7A52" />}
          iconBg="#EAF4ED"
        />
        <MetricCard
          label="Harvest Status"
          value={harvest ? 'Recorded' : 'Pending'}
          subtext={harvest ? `${harvest.quantity?.toLocaleString()} ${harvest.unit}` : 'Awaiting harvest log'}
          icon={<IconProduction size={20} color="#0D9488" />}
          iconBg="#E6F6F4"
        />
        <MetricCard
          label="Calculated Yield"
          value={harvest ? harvest.yieldDisplay : '—'}
          subtext={harvest ? 'Final yield per hectare' : 'Available post-harvest'}
          icon={<IconCrop size={20} color="#D97706" />}
          iconBg="#FEF3C7"
        />
        <MetricCard
          label="Harvest Date"
          value={harvest?.harvestDate ? harvest.harvestDate : '—'}
          subtext={harvest ? 'End of cycle' : 'Pending record'}
          icon={<IconCheck size={20} color="#2D7A52" />}
          iconBg="#E8F5E9"
        />
      </div>

      {/* Main Content: Form or Result */}
      {isLoading ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-card-border)',
          padding: '48px 24px',
          textAlign: 'center',
          color: 'var(--color-text-muted)'
        }}>
          <p>Loading harvest records...</p>
        </div>
      ) : harvest ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-card-border)',
          padding: '32px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <HarvestResult harvest={harvest} />
        </div>
      ) : (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-card-border)',
          padding: '32px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <HarvestForm onSubmit={handleRecordHarvest} isSubmitting={isSubmitting} />
        </div>
      )}
    </div>
  );
}

export default HarvestPage;
