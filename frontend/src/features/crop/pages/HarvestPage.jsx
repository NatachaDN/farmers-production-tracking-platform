import React, { useState, useEffect, useRef } from 'react';
import { HarvestForm } from '../components/HarvestForm';
import { HarvestResult } from '../components/HarvestResult';
import { harvestService } from '../services/harvestService';
import { MetricCard } from '../../../shared/components/MetricCard';
import { CycleSelector } from '../components/CycleSelector';
import { useFarmerCycles, cycleLabel } from '../hooks/useFarmerCycles';
import {
  IconCrop,
  IconSprout,
  IconProduction,
  IconCheck,
  IconClose,
  IconWheat
} from '../../../shared/components/Icons';

export function HarvestPage({ farmerId }) {
  const {
    cycles, selectedCycle, selectedCycleId, setSelectedCycleId,
    isLoading: cyclesLoading, error: cyclesError, reload: reloadCycles
  } = useFarmerCycles(farmerId);
  const [harvest, setHarvest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (text, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage({ text, type });
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 5000);
  };

  // Clear any pending toast timer when the component unmounts
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setHarvest(null);
    setLoadError(null);
    if (!selectedCycleId) return;
    let isMounted = true;
    setIsLoading(true);
    harvestService.getHarvest(farmerId, selectedCycleId)
      .then((data) => { if (isMounted) setHarvest(data || null); })
      .catch((err) => {
        if (!isMounted) return;
        // 404 simply means no harvest has been recorded for this cycle yet.
        if (err?.status !== 404) setLoadError(err?.message || 'Could not load the harvest record.');
      })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [farmerId, selectedCycleId]);

  const handleRecordHarvest = async (formData) => {
    setIsSubmitting(true);
    try {
      const recorded = await harvestService.recordHarvest(farmerId, selectedCycleId, formData);
      setHarvest(recorded);
      showToast('Harvest recorded successfully! Cycle marked as Completed.');
      reloadCycles();
    } catch (err) {
      showToast(err?.message || 'Failed to record harvest. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardBox = {
    backgroundColor: '#FFFFFF',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--color-card-border)',
    padding: '32px',
    boxShadow: 'var(--shadow-card)'
  };
  const messageBox = { ...cardBox, padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)', boxShadow: undefined };

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
        <CycleSelector
          cycles={cycles}
          selectedCycleId={selectedCycleId}
          onSelect={setSelectedCycleId}
          isLoading={cyclesLoading}
          error={cyclesError}
          onRetry={reloadCycles}
        />
      </div>

      {/* 4 Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px'
      }}>
        <MetricCard
          label="Cycle"
          value={selectedCycle ? cycleLabel(selectedCycle) : '—'}
          subtext={selectedCycle ? `${selectedCycle.acreage ?? '—'} ha · Status: ${harvest ? 'COMPLETED' : selectedCycle.status}` : 'No cycle selected'}
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
      {!selectedCycle ? null : isLoading ? (
        <div style={messageBox}><p>Loading harvest records...</p></div>
      ) : loadError ? (
        <div style={{ ...messageBox, color: 'var(--color-accent-red)' }}><p>{loadError}</p></div>
      ) : harvest ? (
        <div style={cardBox}>
          <HarvestResult harvest={harvest} />
        </div>
      ) : selectedCycle.status === 'ACTIVE' ? (
        <div style={cardBox}>
          <HarvestForm onSubmit={handleRecordHarvest} isSubmitting={isSubmitting} />
        </div>
      ) : (
        <div style={messageBox}>
          <p>This cycle is {selectedCycle.status.toLowerCase()} and has no harvest record. A harvest can only be recorded on an active cycle.</p>
        </div>
      )}
    </div>
  );
}

export default HarvestPage;