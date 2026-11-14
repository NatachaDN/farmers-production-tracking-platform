import React, { useState, useEffect } from 'react';
import './CycleInputsPage.css';
import { cycleInputService } from '../../crops/services/cycleInputService';
import { cropCycleService } from '../../crops/services/cropCycleService';
import { inputService } from '../../inputs/services/inputService';
import { CycleInputUsageForm } from '../components/CycleInputUsageForm';
import { CycleInputUsageList } from '../components/CycleInputUsageList';
import { MetricCard } from '../../../shared/components/MetricCard';
import {
  IconInputs,
  IconPlus,
  IconClose,
  IconSprout,
  IconPackage,
  IconCheck,
  IconWarning
} from '../../../shared/components/Icons';

export function CycleInputsPage({ farmerId, initialCycleId = null }) {
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState(initialCycleId || null);
  const [availableInputs, setAvailableInputs] = useState([]);
  const [usages, setUsages] = useState([]);
  const [costSummary, setCostSummary] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // 1. Load Farmer's Cycles
  useEffect(() => {
    async function fetchCycles() {
      if (!farmerId) return;
      try {
        const data = await cropCycleService.getCycles(farmerId);
        const list = Array.isArray(data) ? data : [];
        setCycles(list);
        if (list.length > 0 && !selectedCycleId) {
          const activeOne = list.find((c) => (c.status || '').toUpperCase() === 'ACTIVE') || list[0];
          setSelectedCycleId(activeOne.id);
        }
      } catch (err) {
        console.warn('Failed to fetch cycles:', err);
        setCycles([]);
      }
    }
    fetchCycles();
  }, [farmerId, initialCycleId]);

  // 2. Load Inventory Inputs for farmer
  const loadInventory = async () => {
    if (!farmerId) return;
    try {
      const data = await inputService.getInputs(farmerId);
      setAvailableInputs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load inputs:', err);
      setAvailableInputs([]);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [farmerId]);

  // 3. Load Consumed Inputs & Cost Summary for selected cycle
  const loadCycleInputs = async (cycleId) => {
    if (!cycleId) return;
    setIsLoading(true);
    setServerError(null);
    try {
      const [usagesData, summaryData] = await Promise.all([
        cycleInputService.getInputsByCycle(farmerId, cycleId),
        cycleInputService.getCostSummary(farmerId, cycleId)
      ]);

      if (Array.isArray(usagesData)) {
        setUsages(usagesData);
      } else {
        setUsages([]);
      }

      if (summaryData) {
        setCostSummary(summaryData);
      }
    } catch {
      console.info('No backend input usages found, using local view state.');
      setUsages([]);
      setCostSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCycleInputs(selectedCycleId);
  }, [selectedCycleId, farmerId]);

  const selectedCycle = cycles.find((c) => Number(c.id) === Number(selectedCycleId)) || cycles[0];

  // 4. Handle Recording Input Usage
  const handleRecordUsage = async (formData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = await cycleInputService.recordInputUsage(farmerId, selectedCycleId, formData);

      // Successfully recorded!
      showToast(
        `Recorded ${formData.quantityUsed} used of ${result?.inputName || 'input'}. Real cost: KES ${Number(result?.totalCost || 0).toLocaleString()} (Remaining stock: ${result?.remainingStock ?? 'updated'})`
      );

      setShowForm(false);

      // Refresh both usages, summary, and inventory stock!
      await Promise.all([
        loadCycleInputs(selectedCycleId),
        loadInventory()
      ]);
    } catch (err) {
      // Acceptance Criterion 2: Warning of insufficient stock or error
      const message = err.response?.data?.message || err.message || 'Failed to record input consumption.';
      setServerError(message);
      showToast(message, 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Handle Deleting Input Usage (restores stock)
  const handleDeleteUsage = async (usageId) => {
    try {
      await cycleInputService.deleteInputUsage(farmerId, selectedCycleId, usageId);
      showToast('Input consumption removed and stock successfully restored to inventory!');

      // Refresh usages and inventory stock
      await Promise.all([
        loadCycleInputs(selectedCycleId),
        loadInventory()
      ]);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove input record.', 'warning');
    }
  };

  // Calculate metrics
  const totalExpenditure = costSummary?.totalInputCost ?? usages.reduce((s, u) => s + (u.totalCost || 0), 0);
  const consumedItemsCount = costSummary?.inputCount ?? usages.length;

  const topCategoryEntry = costSummary?.costByType
    ? Object.entries(costSummary.costByType).sort((a, b) => b[1] - a[1])[0]
    : null;

  return (
    <div className="cycle-inputs-page fade-in" id="cycle-inputs-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`cycle-inputs-toast ${toastMessage.type === 'warning' ? 'warning' : ''}`}>
          {toastMessage.type === 'warning' ? <IconWarning size={18} /> : <IconCheck size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Cycle Selection & Header Bar */}
      <div className="cycle-selection-card">
        <div className="cycle-selection-left">
          <div className="cycle-icon-pill">
            <IconInputs size={24} color="var(--color-brand-primary, #3E7B52)" />
          </div>
          <div>
            <h3 className="cycle-selection-title">
              {selectedCycle ? (selectedCycle.name || `${selectedCycle.cropName} Cycle`) : 'Crop Cycle Inputs'}
            </h3>
            <p className="cycle-selection-subtitle">
              {selectedCycle ? (
                <>
                  Crop: <strong>{selectedCycle.cropName || '—'}</strong> · Cultivated Area: <strong>{selectedCycle.acreage || 0} ha</strong> · Status: <strong>{selectedCycle.status || 'ACTIVE'}</strong>
                </>
              ) : (
                'Create a crop production cycle first to record input consumption.'
              )}
            </p>
          </div>
        </div>

        <div className="cycle-selection-right">
          {/* Cycle Dropdown */}
          <select
            className="cycle-dropdown-select"
            value={selectedCycleId || ''}
            onChange={(e) => setSelectedCycleId(e.target.value ? Number(e.target.value) : null)}
            id="cycle-selector-dropdown"
          >
            {cycles.length === 0 && <option value="">No cycles available</option>}
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || `${c.cropName} (Plot ${c.plotId || c.id})`} — [{(c.status || 'ACTIVE').toUpperCase()}]
              </option>
            ))}
          </select>

          {/* Toggle Record Form Button */}
          <button
            type="button"
            className="btn-open-record-form"
            id="btn-toggle-record-input-form"
            onClick={() => {
              setShowForm((prev) => !prev);
              setServerError(null);
            }}
          >
            {showForm ? (
              <>
                <IconClose size={16} />
                <span>Hide Form</span>
              </>
            ) : (
              <>
                <IconPlus size={16} />
                <span>Record Input Usage</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Acrea Metric Cards Grid */}
      <div className="inputs-metrics-grid">
        <MetricCard
          label="Total Input Cost"
          value={`KES ${Number(totalExpenditure).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext="Real financial expenditure on crop"
          icon={<IconInputs size={20} color="var(--color-brand-primary, #3E7B52)" />}
          loading={isLoading}
        />
        <MetricCard
          label="Inputs Consumed"
          value={`${consumedItemsCount}`}
          subtext="Times inputs were deducted"
          icon={<IconPackage size={20} color="var(--color-brand-primary, #3E7B52)" />}
          loading={isLoading}
        />
        <MetricCard
          label="Top Cost Category"
          value={topCategoryEntry ? topCategoryEntry[0] : 'None'}
          subtext={topCategoryEntry ? `KES ${Number(topCategoryEntry[1]).toLocaleString()} spent` : 'No items logged'}
          icon={<IconSprout size={20} color="var(--color-brand-primary, #3E7B52)" />}
          loading={isLoading}
        />
        <MetricCard
          label="Inventory Stock Items"
          value={`${availableInputs.length}`}
          subtext="Available items in farm inventory"
          icon={<IconPackage size={20} color="var(--color-brand-primary, #3E7B52)" />}
          loading={isLoading}
        />
      </div>

      {/* Record Input Usage Form (Collapsible / Modal Drawer) */}
      {showForm && (
        <CycleInputUsageForm
          cycle={selectedCycle}
          availableInputs={availableInputs}
          onSubmit={handleRecordUsage}
          isSubmitting={isSubmitting}
          serverError={serverError}
          onCancel={() => {
            setShowForm(false);
            setServerError(null);
          }}
        />
      )}

      {/* Consumed Inputs Table & Cost Breakdown */}
      <CycleInputUsageList
        usages={usages}
        costSummary={costSummary}
        onDeleteUsage={handleDeleteUsage}
        isLoading={isLoading}
      />
    </div>
  );
}
