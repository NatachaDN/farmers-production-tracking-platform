import React, { useState, useEffect, useRef } from 'react';
import { HarvestForm } from '../components/HarvestForm';
import { HarvestResult } from '../components/HarvestResult';
import { harvestService } from '../services/harvestService';
import { cropCycleService } from '../../crops/services/cropCycleService';
import { MetricCard } from '../../../shared/components/MetricCard';
import {
  IconCrop,
  IconSprout,
  IconProduction,
  IconCheck,
  IconClose,
  IconWheat
} from '../../../shared/components/Icons';

export function HarvestPage({ farmerId }) {
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState(null);
  const [harvest, setHarvest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  // Load real cycles from DB
  useEffect(() => {
    async function fetchCycles() {
      if (!farmerId) return;
      try {
        const data = await cropCycleService.getCycles(farmerId);
        const list = Array.isArray(data) ? data : [];
        setCycles(list);
        if (list.length > 0) {
          // Default to first active cycle, or first cycle
          const first = list.find((c) => (c.status || '').toUpperCase() === 'ACTIVE') || list[0];
          setSelectedCycleId(first.id);
        }
      } catch (err) {
        console.error('Failed to load cycles for harvest:', err);
        setCycles([]);
      }
    }
    fetchCycles();
  }, [farmerId]);

  const selectedCycle = cycles.find((c) => c.id === selectedCycleId) || (cycles.length > 0 ? cycles[0] : null);

  const showToast = (text, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage({ text, type });
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 5000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const loadHarvest = async (cycleId) => {
    if (!cycleId || !farmerId) {
      setHarvest(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await harvestService.getHarvest(farmerId, cycleId);
      setHarvest(data || null);
    } catch {
      setHarvest(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCycleId) {
      loadHarvest(selectedCycleId);
    } else {
      setHarvest(null);
    }
  }, [selectedCycleId, farmerId]);

  const handleRecordHarvest = async (formData) => {
    if (!selectedCycleId) return;
    setIsSubmitting(true);
    try {
      const recorded = await harvestService.recordHarvest(farmerId, selectedCycleId, formData);
      setHarvest(recorded);
      setCycles((prev) =>
        prev.map((c) => (c.id === selectedCycleId ? { ...c, status: 'COMPLETED' } : c))
      );
      showToast('Harvest recorded successfully! Cycle marked as Completed.');
    } catch (err) {
      showToast(err?.message || 'Failed to record harvest. Please check input values.', 'error');
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconWheat size={18} color="currentColor" />
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <IconClose size={16} color="currentColor" />
          </button>
        </div>
      )}

      {/* Control Bar: Cycle Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', marginRight: '4px' }}>
            SELECT CROP CYCLE:
          </span>
          {cycles.length > 0 ? (
            cycles.map((c) => {
              const isSelected = selectedCycleId === c.id;
              const displayName = c.name || `${c.cropName || 'Crop'} (${c.plotName || 'Plot'})`;
              return (
                <button
                  key={c.id}
                  type="button"
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
                  {displayName}
                </button>
              );
            })
          ) : (
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              No crop cycles registered yet
            </span>
          )}
        </div>
      </div>

      {cycles.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 20px',
          backgroundColor: '#FAF8F5',
          borderRadius: '16px',
          border: '1px dashed #ECE7DC'
        }}>
          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            No crop cycles found
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Register plots and create production cycles in the Crops module before recording harvest yields.
          </p>
        </div>
      ) : (
        <>
          {/* 4 Summary KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px'
          }}>
            <MetricCard
              label="Selected Cycle"
              value={selectedCycle?.name || '—'}
              subtext={`${selectedCycle?.acreage || selectedCycle?.area || 0} ha · Status: ${harvest ? 'COMPLETED' : (selectedCycle?.status || '—')}`}
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
              value={harvest ? (harvest.yieldDisplay || `${harvest.calculatedYield} / ha`) : '—'}
              subtext={harvest ? 'Final yield rate' : 'Available post-harvest'}
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
        </>
      )}
    </div>
  );
}

export default HarvestPage;
