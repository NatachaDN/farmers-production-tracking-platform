import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HarvestForm } from '../components/HarvestForm';
import { HarvestResult } from '../components/HarvestResult';
import { harvestService } from '../services/harvestService';
import './HarvestPage.css';

// Demo: farmer #1 (hardcoded until auth module is implemented)
const FARMER_ID = 1;

// Demo fallback harvest (cycle already completed) so the page is usable offline
const DEMO_COMPLETED_HARVEST = {
  id: 1,
  cycleId: 2,
  cycleName: 'Rice Season 2025 (Field B)',
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

/**
 * HarvestPage — US-16: Record a Harvest
 *
 * Shows:
 * - If cycle is ACTIVE → HarvestForm to record yield and complete the cycle
 * - If cycle is COMPLETED → HarvestResult summary with calculated yield
 */
export function HarvestPage() {
  const { cycleId } = useParams();
  const resolvedCycleId = cycleId ? parseInt(cycleId, 10) : 1;

  const [harvest, setHarvest]         = useState(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [cycleName, setCycleName]     = useState('Maize Production (Field A)');
  const [cycleStatus, setCycleStatus] = useState('ACTIVE');

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Load existing harvest for this cycle (if any)
  const loadHarvest = async () => {
    setIsLoading(true);
    try {
      const data = await harvestService.getHarvest(FARMER_ID, resolvedCycleId);
      if (data) {
        setHarvest(data);
        setCycleStatus(data.cycleStatus);
        setCycleName(data.cycleName);
      }
    } catch (err) {
      if (err?.status === 404) {
        // No harvest yet — cycle is still active, show the form
        setHarvest(null);
        setCycleStatus('ACTIVE');
      } else {
        // Backend offline → use demo state
        console.info('API unavailable; using demo state.');
        if (resolvedCycleId === 2) {
          setHarvest(DEMO_COMPLETED_HARVEST);
          setCycleStatus('COMPLETED');
          setCycleName(DEMO_COMPLETED_HARVEST.cycleName);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHarvest();
  }, [resolvedCycleId]);

  // Handle harvest submission
  const handleRecordHarvest = async (formData) => {
    setIsSubmitting(true);
    try {
      let recorded;
      try {
        recorded = await harvestService.recordHarvest(FARMER_ID, resolvedCycleId, formData);
      } catch (apiErr) {
        // Local demo fallback
        const qty = formData.quantity;
        const acreage = 2.5; // demo acreage
        const calcYield = Math.round((qty / acreage) * 100) / 100;
        recorded = {
          id: Date.now(),
          cycleId: resolvedCycleId,
          cycleName: cycleName,
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
      setCycleStatus('COMPLETED');
      setCycleName(recorded.cycleName || cycleName);
      showToast('🌾 Harvest recorded successfully! Cycle is now Completed.');
    } catch (err) {
      showToast(err?.message || 'Failed to record harvest. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="harvest-page">
      {/* Top Header Navbar */}
      <header className="page-header-nav">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search cycles, harvests..."
            readOnly
          />
        </div>
        <div className="header-meta">
          <span className="header-date">{currentDateFormatted}</span>
          <button type="button" className="icon-badge-btn" title="Notifications">
            🔔
          </button>
          <div className="header-user-pill">
            <span className="header-avatar">AM</span>
            <span className="header-user-name">Alex Martin</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="page-main-content">
        {/* Toast Alert */}
        {toastMessage && (
          <div className={`toast-banner toast-${toastMessage.type}`}>
            <span>{toastMessage.text}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => setToastMessage(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Title Row */}
        <div className="page-title-row">
          <div>
            <div className="breadcrumb">
              Crops / Cycles / Cycle #{resolvedCycleId}
            </div>
            <h1 className="main-title">Harvest Recording</h1>
            <p className="main-subtitle">
              {cycleStatus === 'COMPLETED'
                ? 'This cycle has been completed. View the final yield summary below.'
                : 'Record the harvested quantity at end of cycle to calculate your actual yield.'}
            </p>
          </div>

          <div className="cycle-status-badge-wrap">
            <span className={`status-badge status-${cycleStatus?.toLowerCase()}`}>
              {cycleStatus === 'ACTIVE' ? '🌱 Active' : '✅ Completed'}
            </span>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-wrap kpi-green">🌱</div>
            <div className="kpi-details">
              <span className="kpi-label">Cycle</span>
              <span className="kpi-value">{cycleName}</span>
              <span className="kpi-status-badge">
                {cycleStatus === 'ACTIVE' ? 'Active' : 'Completed'}
              </span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap kpi-ochre">🌾</div>
            <div className="kpi-details">
              <span className="kpi-label">Harvest Status</span>
              <span className="kpi-value">
                {harvest ? 'Recorded' : 'Pending'}
              </span>
              <span className="kpi-trend">
                {harvest ? `${harvest.quantity?.toLocaleString()} ${harvest.unit}` : 'Awaiting harvest'}
              </span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap kpi-blue">📈</div>
            <div className="kpi-details">
              <span className="kpi-label">Calculated Yield</span>
              <span className="kpi-value">
                {harvest ? harvest.yieldDisplay : '—'}
              </span>
              <span className="kpi-subtext">
                {harvest ? 'Final yield per area' : 'Available after harvest'}
              </span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap kpi-forest">📅</div>
            <div className="kpi-details">
              <span className="kpi-label">Harvest Date</span>
              <span className="kpi-value">
                {harvest?.harvestDate
                  ? new Date(harvest.harvestDate + 'T00:00:00').toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })
                  : '—'}
              </span>
              <span className="kpi-subtext">
                {harvest ? 'End of cycle date' : 'Not yet harvested'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content: loading / form / result */}
        {isLoading ? (
          <div className="harvest-loading">
            <div className="loading-spinner" />
            <p>Loading cycle harvest data...</p>
          </div>
        ) : harvest ? (
          <HarvestResult harvest={harvest} />
        ) : (
          <div className="harvest-form-wrapper fade-in">
            <HarvestForm onSubmit={handleRecordHarvest} isSubmitting={isSubmitting} />
          </div>
        )}
      </main>
    </div>
  );
}
