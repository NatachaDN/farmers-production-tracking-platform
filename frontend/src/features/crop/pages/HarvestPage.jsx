import React, { useState, useEffect, useRef } from 'react';
import { HarvestForm } from '../components/HarvestForm';
import { HarvestResult } from '../components/HarvestResult';
import { harvestService } from '../services/harvestService';
import { MetricCard } from '../../../shared/components/MetricCard';
import { ProductionHistory, emptyFilters } from '../components/ProductionHistory';
import { ProductionCycleRecords } from '../components/ProductionCycleRecords';
import { filterProductionCycles } from '../productionHistory';
import './ProductionHistory.css';
import { useFarmerCycles, cycleLabel } from '../hooks/useFarmerCycles';
import {
  IconCrop,
  IconSprout,
  IconProduction,
  IconCheck,
  IconClose
} from '../../../shared/components/Icons';

export function HarvestPage({ farmerId }) {
  const {
    cycles, selectedCycleId, setSelectedCycleId,
    isLoading: cyclesLoading, error: cyclesError, reload: reloadCycles
  } = useFarmerCycles(farmerId);
  const [filters, setFilters] = useState(emptyFilters);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimer = useRef(null);
  const results = filterProductionCycles(cycles, filters);
  const selectedCycle = results.find(cycle => cycle.id === selectedCycleId) ?? results[0];

  const showToast = (message, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToastMessage({ message, type });
    toastTimer.current = setTimeout(() => setToastMessage(null), 5000);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  return (
    <div className="production-page">
      <ProductionHistory cycles={cycles} results={results} filters={filters} onFiltersChange={setFilters}
        selectedId={selectedCycle?.id} onSelect={setSelectedCycleId}
        loading={cyclesLoading} error={cyclesError} onRetry={reloadCycles} disabled={isSubmitting} />
      {toastMessage && (
        <div className="production-history-card production-feedback" role={toastMessage.type === 'error' ? 'alert' : 'status'}>
          <span>{toastMessage.message}</span>
          <button type="button" onClick={() => setToastMessage(null)} aria-label="Dismiss message"><IconClose size={16} /></button>
        </div>
      )}
      {selectedCycle && (
        <HarvestCycleDetail key={`${farmerId}:${selectedCycle.id}`} farmerId={farmerId} selectedCycle={selectedCycle}
          reloadCycles={reloadCycles} isSubmitting={isSubmitting} setIsSubmitting={setIsSubmitting} showToast={showToast} />
      )}
    </div>
  );
}

function HarvestCycleDetail({ farmerId, selectedCycle, reloadCycles, isSubmitting, setIsSubmitting, showToast }) {
  const selectedCycleId = selectedCycle.id;
  const [harvest, setHarvest] = useState(null);
  const [correcting, setCorrecting] = useState(false);
  const [corrections, setCorrections] = useState([]);
  const [historyError, setHistoryError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!correcting) return;
    const form = document.getElementById('harvest-form-container');
    form?.scrollIntoView({ block: 'start' });
    form?.querySelector('input')?.focus({ preventScroll: true });
  }, [correcting]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    setHarvest(null);
    setCorrecting(false); setCorrections([]); setHistoryError('');
    setLoadError(null);
    if (!selectedCycleId) return;
    let isMounted = true;
    setIsLoading(true);
    harvestService.getHarvest(farmerId, selectedCycleId)
      .then(async (data) => {
        if (!isMounted) return;
        setHarvest(data || null);
        if (data) {
          try { const history = await harvestService.getCorrections(farmerId, selectedCycleId); if (isMounted) setCorrections(history); }
          catch (error) { if (isMounted) setHistoryError(error.message || 'Could not load correction history.'); }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        // 404 simply means no harvest has been recorded for this cycle yet.
        if (err?.status !== 404) setLoadError(err?.message || 'Could not load the harvest record.');
      })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [farmerId, selectedCycleId, reload]);

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

  const handleCorrectHarvest = async (formData) => {
    setIsSubmitting(true);
    try {
      const updated = await harvestService.correctHarvest(farmerId, selectedCycleId, formData);
      setHarvest(updated); setCorrecting(false);
      showToast('Harvest corrected. Previous values are saved in the history.');
      try { setCorrections(await harvestService.getCorrections(farmerId, selectedCycleId)); setHistoryError(''); }
      catch (error) { setHistoryError(error.message || 'Could not load correction history.'); }
    } catch (error) { showToast(error.message || 'Could not save the correction.', 'error'); }
    finally { setIsSubmitting(false); }
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
      {/* 4 Summary KPI Cards */}
      <div className="acrea-responsive-grid" style={{
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
        <div role="alert" style={{ ...messageBox, color: 'var(--color-accent-red)' }}><p>{loadError}</p><button onClick={() => setReload(value => value + 1)}>Try again</button></div>
      ) : harvest ? (
        <div style={cardBox}>
          {correcting ? <>
            <HarvestForm key={`${selectedCycleId}-${harvest.revision}`} initialData={harvest} plantingDate={selectedCycle?.plantingDate} onSubmit={handleCorrectHarvest} isSubmitting={isSubmitting} onCancel={() => setCorrecting(false)} />
            <button type="button" disabled={isSubmitting} onClick={() => setReload(value => value + 1)}>Reload latest harvest</button>
          </> : <>
            <HarvestResult harvest={harvest} cycle={selectedCycle} />
            {harvest.cycleStatus === 'COMPLETED' && <button type="button" className="btn btn-harvest" onClick={() => setCorrecting(true)}>Correct harvest</button>}
          </>}
          <section className="harvest-correction-history" aria-label="Harvest correction history">
            <h3>Correction history</h3>
            {historyError ? <div role="alert"><p>{historyError}</p><button type="button" onClick={() => setReload(value => value + 1)}>Reload harvest and history</button></div> : corrections.length === 0 ? <p>No corrections recorded.</p> : <ol>{corrections.map(row => <li key={row.id}>
              <strong>Correction {row.revision} · {new Date(row.correctedAt).toLocaleString()}</strong>
              <p>{row.beforeValues.quantity} {row.beforeValues.unit.toLowerCase()} on {row.beforeValues.harvestDate} → {row.afterValues.quantity} {row.afterValues.unit.toLowerCase()} on {row.afterValues.harvestDate}</p>
              <p>Reason: {row.reason}</p>
              {row.beforeValues.notes !== row.afterValues.notes && <p>Notes: {row.beforeValues.notes || 'None'} → {row.afterValues.notes || 'None'}</p>}
            </li>)}</ol>}
          </section>
        </div>
      ) : selectedCycle.status === 'ACTIVE' ? (
        <div style={cardBox}>
          <HarvestForm key={selectedCycleId} plantingDate={selectedCycle?.plantingDate} onSubmit={handleRecordHarvest} isSubmitting={isSubmitting} />
        </div>
      ) : (
        <div style={messageBox}>
          <p>This cycle is {selectedCycle.status.toLowerCase()} and has no harvest record. A harvest can only be recorded on an active cycle.</p>
        </div>
      )}
      <ProductionCycleRecords farmerId={farmerId} cycleId={selectedCycleId} />
    </div>
  );
}

export default HarvestPage;
