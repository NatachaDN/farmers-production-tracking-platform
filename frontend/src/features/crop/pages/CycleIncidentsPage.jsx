import React, { useState, useEffect } from 'react';
import './CycleIncidentsPage.css';
import { cycleIncidentService } from '../services/cycleIncidentService';
import { cropCycleService } from '../../crops/services/cropCycleService';
import { IncidentList } from '../components/IncidentList';
import { MetricCard } from '../../../shared/components/MetricCard';
import { Skeleton } from '../../../shared/components/Skeleton';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import {
  IconAlertTriangle,
  IconShieldAlert,
  IconBug,
  IconAlertCircle,
  IconClose,
  IconPlus,
  IconCheck
} from '../../../shared/components/Icons';

/**
 * CycleIncidentsPage — Select a cycle from a dropdown, see whether incidents
 * have occurred, and navigate to CreateIncidentPage to log or edit incidents.
 */
export function CycleIncidentsPage({
  farmerId,
  initialCycleId = null,
  onCreateIncident,
  onEditIncident
}) {
  const [cycles, setCycles] = useState([]);
  const [cyclesLoading, setCyclesLoading] = useState(true);
  const [selectedCycleId, setSelectedCycleId] = useState(initialCycleId || null);
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [incidentToDelete, setIncidentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch cycles from database
  useEffect(() => {
    async function fetchCycles() {
      if (!farmerId) {
        setCyclesLoading(false);
        return;
      }
      setCyclesLoading(true);
      try {
        const data = await cropCycleService.getCycles(farmerId);
        const list = Array.isArray(data) ? data : [];
        setCycles(list);
        if (list.length > 0) {
          const targetId = initialCycleId && list.some((c) => c.id === initialCycleId)
            ? initialCycleId
            : (list.find((c) => (c.status || '').toUpperCase() === 'ACTIVE') || list[0]).id;
          setSelectedCycleId(targetId);
        } else {
          setSelectedCycleId(null);
        }
      } catch (err) {
        console.error('Failed to load cycles for incidents:', err);
        setCycles([]);
      } finally {
        setCyclesLoading(false);
      }
    }
    fetchCycles();
  }, [farmerId, initialCycleId]);

  const selectedCycle = cycles.find((c) => c.id === selectedCycleId) || null;

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Load incidents for selected cycle
  useEffect(() => {
    async function loadIncidents() {
      if (!selectedCycleId || !farmerId) {
        setIncidents([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await cycleIncidentService.getIncidents(farmerId, selectedCycleId);
        setIncidents(Array.isArray(data) ? data : []);
      } catch {
        setIncidents([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadIncidents();
  }, [selectedCycleId, farmerId]);

  // Confirm delete
  const confirmDelete = async () => {
    if (!incidentToDelete || !selectedCycleId) return;
    setIsDeleting(true);
    try {
      await cycleIncidentService.deleteIncident(farmerId, selectedCycleId, incidentToDelete.id);
      setIncidents((prev) => prev.filter((i) => i.id !== incidentToDelete.id));
      showToast('Incident record deleted.');
    } catch (err) {
      showToast(err?.message || 'Failed to delete incident.', 'error');
    } finally {
      setIsDeleting(false);
      setIncidentToDelete(null);
    }
  };

  // KPIs
  const totalIncidents = incidents.length;
  const diseaseCount = incidents.filter((i) => i.incidentType === 'DISEASE').length;
  const pestCount = incidents.filter((i) => i.incidentType === 'PEST').length;
  const highSeverity = incidents.filter((i) => i.severityLevel && i.severityLevel >= 4).length;

  const latestIncidentDate = incidents.length > 0
    ? incidents
        .map((i) => i.incidentDate)
        .filter(Boolean)
        .sort()
        .reverse()[0]
    : null;

  const formattedLatestDate = latestIncidentDate
    ? new Date(latestIncidentDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : null;

  const cycleDisplayName = selectedCycle
    ? selectedCycle.name || `${selectedCycle.cropName || 'Crop'}${selectedCycle.plotName ? ` (${selectedCycle.plotName})` : ''}`
    : 'No cycle selected';

  return (
    <div className="cycle-incidents-page fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className={`toast-bar ${toastMessage.type}`}>
          <span>{toastMessage.text}</span>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setToastMessage(null)}
            aria-label="Close"
          >
            <IconClose size={14} />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(incidentToDelete)}
        title="Delete Incident Record"
        message="Are you sure you want to remove this incident report? This action cannot be undone."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Incident'}
        isDestructive
        onConfirm={confirmDelete}
        onCancel={() => setIncidentToDelete(null)}
      />

      {/* Cycle Dropdown Selector + Report Incident Action */}
      <div className="incident-selector-card">
        <div className="incident-selector-group">
          <label htmlFor="incidents-cycle-dropdown" className="incident-selector-label">
            Select Crop Cycle:
          </label>
          {cyclesLoading ? (
            <Skeleton width="260px" height="40px" borderRadius="10px" />
          ) : cycles.length > 0 ? (
            <select
              id="incidents-cycle-dropdown"
              className="incident-cycle-select"
              value={selectedCycleId || ''}
              onChange={(e) => setSelectedCycleId(Number(e.target.value))}
            >
              {cycles.map((c) => {
                const label = c.name || `${c.cropName || 'Crop'}${c.plotName ? ` (${c.plotName})` : ''}`;
                return (
                  <option key={c.id} value={c.id}>
                    {label} — [{(c.status || 'ACTIVE').toUpperCase()}]
                  </option>
                );
              })}
            </select>
          ) : (
            <span style={{ fontSize: '0.875rem', color: '#788680' }}>
              No crop cycles registered yet
            </span>
          )}
        </div>

        {!cyclesLoading && cycles.length > 0 && (
          <button
            id="report-incident-btn"
            type="button"
            className="record-incident-btn"
            onClick={() => onCreateIncident?.(selectedCycleId)}
          >
            <IconPlus size={16} color="#FFFFFF" />
            <span>Report Incident</span>
          </button>
        )}
      </div>

      {/* Incident Occurrence Indicator Banner */}
      {!cyclesLoading && selectedCycle && (
        isLoading ? (
          <Skeleton width="100%" height="68px" borderRadius="16px" />
        ) : totalIncidents > 0 ? (
          <div className="incident-status-banner has-incidents">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <IconAlertTriangle size={20} color="#DC2626" />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#991B1B' }}>
                  Incidents Occurred on {cycleDisplayName}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#B91C1C', marginTop: '2px' }}>
                  {totalIncidents} incident{totalIncidents > 1 ? 's' : ''} recorded
                  {formattedLatestDate ? ` • Latest on ${formattedLatestDate}` : ''}
                  {highSeverity > 0 ? ` • ${highSeverity} high-severity` : ''}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onCreateIncident?.(selectedCycleId)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #FCA5A5',
                backgroundColor: '#FFFFFF',
                color: '#991B1B',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              + Add Another Incident
            </button>
          </div>
        ) : (
          <div className="incident-status-banner no-incidents">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <IconCheck size={20} color="#2A6740" />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#164230' }}>
                  No Incidents Occurred on {cycleDisplayName}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#2A6740', marginTop: '2px' }}>
                  No pests, diseases, weather damage, or field issues have been reported for this cycle.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onCreateIncident?.(selectedCycleId)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #C8E2D0',
                backgroundColor: '#FFFFFF',
                color: '#164230',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              + Report an Incident
            </button>
          </div>
        )
      )}

      {/* KPI Row */}
      <div className="kpi-grid">
        <MetricCard
          label="Total Incidents"
          value={String(totalIncidents)}
          subtext={`Cycle: ${cycleDisplayName}`}
          icon={<IconAlertTriangle size={20} color="#DC2626" />}
          iconBg="#FEF2F2"
          loading={cyclesLoading || isLoading}
        />
        <MetricCard
          label="Disease Reports"
          value={String(diseaseCount)}
          subtext="Fungal / bacterial / viral"
          icon={<IconShieldAlert size={20} color="#7C3AED" />}
          iconBg="#EDE9FE"
          loading={cyclesLoading || isLoading}
        />
        <MetricCard
          label="Pest Infestations"
          value={String(pestCount)}
          subtext="Insects / mites / nematodes"
          icon={<IconBug size={20} color="#D97706" />}
          iconBg="#FEF3C7"
          loading={cyclesLoading || isLoading}
        />
        <MetricCard
          label="High Severity"
          value={String(highSeverity)}
          subtext="Level 4 (Serious) or 5 (Critical)"
          icon={<IconAlertCircle size={20} color="#DC2626" />}
          iconBg="#FEE2E2"
          loading={cyclesLoading || isLoading}
        />
      </div>

      {/* Incident List */}
      <div className="incident-list-container">
        <div className="list-header">
          <div>
            <h3>Cycle Incident Log</h3>
            <p>Pests, diseases, damages, and remedial actions recorded for this cycle.</p>
          </div>
        </div>

        {cyclesLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton width="100%" height="76px" borderRadius="12px" />
            <Skeleton width="100%" height="76px" borderRadius="12px" />
          </div>
        ) : cycles.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            backgroundColor: '#FAF8F5',
            borderRadius: '12px',
            border: '1px dashed #ECE7DC'
          }}>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#19201C', margin: 0 }}>
              No crop cycles registered
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#788680', marginTop: '4px', marginBottom: 0 }}>
              Create a crop cycle in the Crop Production module before logging incidents.
            </p>
          </div>
        ) : (
          <IncidentList
            incidents={incidents}
            isLoading={isLoading}
            onEdit={(inc) => onEditIncident?.(selectedCycleId, inc)}
            onDelete={(id) => {
              const target = incidents.find((i) => i.id === id);
              if (target) setIncidentToDelete(target);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default CycleIncidentsPage;
