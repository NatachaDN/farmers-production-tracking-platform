import React, { useState, useEffect } from 'react';
import './CycleIncidentsPage.css';
import { cycleIncidentService } from '../services/cycleIncidentService';
import { IncidentForm } from '../components/IncidentForm';
import { IncidentList } from '../components/IncidentList';
import { MetricCard } from '../../../shared/components/MetricCard';
import { CycleSelector } from '../components/CycleSelector';
import { useFarmerCycles, cycleLabel } from '../hooks/useFarmerCycles';

/**
 * CycleIncidentsPage — Record and view incidents (disease, pest, damage) per cycle.
 */
export function CycleIncidentsPage({ farmerId, initialCycleId }) {
  const {
    cycles, selectedCycle, selectedCycleId, setSelectedCycleId,
    isLoading: cyclesLoading, error: cyclesError, reload: reloadCycles
  } = useFarmerCycles(farmerId, initialCycleId);
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const canRecord = selectedCycle?.status === 'ACTIVE';

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // ---- Load incidents of the selected cycle ----
  useEffect(() => {
    setShowForm(false);
    setEditingIncident(null);
    if (!selectedCycleId) {
      setIncidents([]);
      return;
    }
    let isMounted = true;
    setIsLoading(true);
    cycleIncidentService.getIncidents(farmerId, selectedCycleId)
      .then((data) => { if (isMounted) setIncidents(Array.isArray(data) ? data : []); })
      .catch((err) => {
        if (!isMounted) return;
        setIncidents([]);
        showToast(err?.message || 'Could not load incidents for this cycle.', 'error');
      })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [farmerId, selectedCycleId]);

  // ---- Save (Create or Update) ----
  const handleSaveIncident = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingIncident) {
        const updated = await cycleIncidentService.updateIncident(
          farmerId, selectedCycleId, editingIncident.id, formData
        );
        setIncidents((prev) => prev.map((i) => (i.id === editingIncident.id ? updated : i)));
        showToast('Incident record updated successfully.');
        setEditingIncident(null);
      } else {
        const created = await cycleIncidentService.createIncident(farmerId, selectedCycleId, formData);
        setIncidents((prev) => [created, ...prev]);
        showToast('Incident logged successfully to this cycle.');
      }
      setShowForm(false);
    } catch (err) {
      showToast(err?.message || 'Failed to save incident.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Delete ----
  const handleDeleteIncident = async (incidentId) => {
    if (!window.confirm('Are you sure you want to delete this incident record?')) return;
    try {
      await cycleIncidentService.deleteIncident(farmerId, selectedCycleId, incidentId);
      setIncidents((prev) => prev.filter((i) => i.id !== incidentId));
      showToast('Incident record deleted.');
      if (editingIncident?.id === incidentId) {
        setEditingIncident(null);
        setShowForm(false);
      }
    } catch (err) {
      showToast(err?.message || 'Failed to delete incident.', 'error');
    }
  };

  // ---- Edit trigger ----
  const handleEditTrigger = (incident) => {
    setEditingIncident(incident);
    setShowForm(true);
    setTimeout(() => {
      const el = document.getElementById('incident-form-container');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // ---- KPI metrics ----
  const cycleIncidents = incidents;
  const totalCount     = cycleIncidents.length;
  const diseaseCount   = cycleIncidents.filter((i) => i.incidentType === 'DISEASE').length;
  const pestCount      = cycleIncidents.filter((i) => i.incidentType === 'PEST').length;
  const highSeverity   = cycleIncidents.filter((i) => (i.severityLevel || 0) >= 4).length;

  return (
    <div className="incidents-page fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className={`toast-bar ${toastMessage.type}`}>
          <span>{toastMessage.text}</span>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setToastMessage(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Control bar: cycle selector + action button */}
      <div className="control-bar workspace-toolbar-panel">
        <CycleSelector
          cycles={cycles}
          selectedCycleId={selectedCycleId}
          onSelect={setSelectedCycleId}
          isLoading={cyclesLoading}
          error={cyclesError}
          onRetry={reloadCycles}
        />

        <button
          type="button"
          className="record-btn"
          aria-expanded={showForm}
          disabled={!canRecord}
          title={canRecord ? undefined : 'Incidents can only be recorded on an active cycle'}
          style={{
            backgroundColor:
              showForm && !editingIncident ? 'var(--color-text-muted)' : 'var(--color-brand-hover)',
            opacity: canRecord ? 1 : 0.5,
            cursor: canRecord ? 'pointer' : 'not-allowed',
          }}
          onClick={() => {
            setEditingIncident(null);
            setShowForm((v) => !v);
          }}
        >
          {showForm && !editingIncident ? '✕ Close Form' : '+ Record Incident'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <MetricCard
          label="Selected Cycle"
          value={selectedCycle ? cycleLabel(selectedCycle) : '—'}
          subtext={selectedCycle ? `${selectedCycle.acreage ?? '—'} ha · Status: ${selectedCycle.status}` : 'No cycle selected'}
          icon={<span style={{ fontSize: '1.25rem' }}>🌱</span>}
          iconBg="#EAF4ED"
        />
        <MetricCard
          label="Total Incidents"
          value={totalCount}
          subtext={totalCount === 0 ? 'No problems recorded' : 'Problems encountered'}
          icon={<span style={{ fontSize: '1.25rem' }}>⚠️</span>}
          iconBg="#FEF3C7"
        />
        <MetricCard
          label="Disease & Pest"
          value={`${diseaseCount + pestCount} logged`}
          subtext={`${diseaseCount} disease · ${pestCount} pest`}
          icon={<span style={{ fontSize: '1.25rem' }}>🦠</span>}
          iconBg="#EDE9FE"
        />
        <MetricCard
          label="High Severity (4–5)"
          value={highSeverity}
          subtext={highSeverity === 0 ? 'No critical issues' : 'Require urgent attention'}
          icon={<span style={{ fontSize: '1.25rem' }}>🚨</span>}
          iconBg="#FEE2E2"
        />
      </div>

      {/* Form drawer */}
      {showForm && canRecord && (
        <div id="incident-form-container" className="form-container">
          <IncidentForm
            onSubmit={handleSaveIncident}
            isSubmitting={isSubmitting}
            initialData={editingIncident}
            onCancel={() => {
              setShowForm(false);
              setEditingIncident(null);
            }}
          />
        </div>
      )}

      {/* Incident list */}
      <div className="list-container">
        <IncidentList
          incidents={cycleIncidents}
          isLoading={isLoading}
          onEdit={handleEditTrigger}
          onDelete={handleDeleteIncident}
        />
      </div>
    </div>
  );
}

export default CycleIncidentsPage;
