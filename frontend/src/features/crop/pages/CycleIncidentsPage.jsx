import React, { useState, useEffect } from 'react';
import './CycleIncidentsPage.css';
import { cycleIncidentService } from '../services/cycleIncidentService';
import { IncidentForm } from '../components/IncidentForm';
import { IncidentList } from '../components/IncidentList';
import { MetricCard } from '../../../shared/components/MetricCard';

// ------------------------------------------------------------------ //
//  Demo / fallback data (used when API is unreachable)                //
// ------------------------------------------------------------------ //
const DEMO_CYCLES = [
  { id: 1, name: 'Maize (Plot A)',    crop: 'Maize',    plot: 'Plot A', status: 'ACTIVE', area: '2.5 ha' },
  { id: 2, name: 'Tomatoes (Plot B)', crop: 'Tomatoes', plot: 'Plot B', status: 'ACTIVE', area: '1.0 ha' },
  { id: 3, name: 'Beans (Plot C)',    crop: 'Beans',    plot: 'Plot C', status: 'ACTIVE', area: '0.8 ha' },
];

const INITIAL_DEMO_INCIDENTS = [
  {
    id: 1,
    cycleId: 1,
    incidentType: 'DISEASE',
    incidentDate: '2026-10-10',
    description: 'Early blight (Alternaria solani) detected on lower leaves of plants in rows 3–7. Yellowing margins visible on approximately 30% of foliage.',
    severityLevel: 3,
    actionTaken: 'Applied copper-based fungicide at 2g/L concentration across all affected rows at 08:00.',
    createdAt: '2026-10-10T09:30:00',
  },
  {
    id: 2,
    cycleId: 1,
    incidentType: 'PEST',
    incidentDate: '2026-10-05',
    description: 'Aphid infestation spotted on stems and undersides of leaves near irrigation channels. Ant activity observed suggesting honey-dew secretion.',
    severityLevel: 2,
    actionTaken: 'Sprayed neem oil solution (5mL/L) and released ladybug colony.',
    createdAt: '2026-10-05T14:15:00',
  },
  {
    id: 3,
    cycleId: 1,
    incidentType: 'WEATHER',
    incidentDate: '2026-09-28',
    description: 'Heavy rainfall (87mm in 4 hours) caused waterlogging in low-lying section of Plot A. Standing water observed for 18+ hours.',
    severityLevel: 4,
    actionTaken: 'Opened drainage channels, added emergency ridge furrows, applied potassium boost to aid root recovery.',
    createdAt: '2026-09-28T11:00:00',
  },
  {
    id: 4,
    cycleId: 2,
    incidentType: 'PEST',
    incidentDate: '2026-10-08',
    description: 'Whitefly colony detected on tomato foliage. Honeydew deposits and sooty mold beginning to develop.',
    severityLevel: 2,
    actionTaken: 'Yellow sticky traps deployed, insecticidal soap spray applied.',
    createdAt: '2026-10-08T10:00:00',
  },
];

// ------------------------------------------------------------------ //
//  Page component                                                     //
// ------------------------------------------------------------------ //

/**
 * CycleIncidentsPage — Record and view incidents (disease, pest, damage) per cycle.
 */
export function CycleIncidentsPage({ farmerId = 1 }) {
  const [selectedCycleId, setSelectedCycleId] = useState(1);
  const [incidents, setIncidents] = useState(INITIAL_DEMO_INCIDENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const selectedCycle = DEMO_CYCLES.find((c) => c.id === selectedCycleId) || DEMO_CYCLES[0];

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // ---- Load incidents from API ----
  const loadIncidents = async (cycleId) => {
    setIsLoading(true);
    try {
      const data = await cycleIncidentService.getIncidents(farmerId, cycleId);
      if (Array.isArray(data) && data.length > 0) {
        setIncidents((prev) => {
          // Merge: keep other cycle data, replace this cycle's data
          const others = prev.filter((i) => i.cycleId !== cycleId);
          return [...others, ...data];
        });
      }
    } catch {
      // Fallback to demo state — already set
      console.info('Using session state for incidents (API unreachable).');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents(selectedCycleId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCycleId]);

  // ---- Save (Create or Update) ----
  const handleSaveIncident = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingIncident) {
        // UPDATE
        try {
          const updated = await cycleIncidentService.updateIncident(
            farmerId, selectedCycleId, editingIncident.id, formData
          );
          setIncidents((prev) =>
            prev.map((i) => (i.id === editingIncident.id ? { ...i, ...updated } : i))
          );
        } catch {
          // Optimistic local update on API failure
          setIncidents((prev) =>
            prev.map((i) =>
              i.id === editingIncident.id
                ? { ...i, ...formData, updatedAt: new Date().toISOString() }
                : i
            )
          );
        }
        showToast('Incident record updated successfully.');
        setEditingIncident(null);
        setShowForm(false);
      } else {
        // CREATE
        try {
          const created = await cycleIncidentService.createIncident(
            farmerId, selectedCycleId, formData
          );
          setIncidents((prev) => [created, ...prev]);
        } catch {
          // Optimistic local create on API failure
          const localNew = {
            id: Date.now(),
            cycleId: selectedCycleId,
            ...formData,
            createdAt: new Date().toISOString(),
          };
          setIncidents((prev) => [localNew, ...prev]);
        }
        showToast('Incident logged successfully to this cycle.');
        setShowForm(false);
      }
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
      try {
        await cycleIncidentService.deleteIncident(farmerId, selectedCycleId, incidentId);
      } catch {
        // continue with local removal
      }
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
  const cycleIncidents = incidents.filter((i) => i.cycleId === selectedCycleId);
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
      <div className="control-bar">
        <div className="cycle-pills">
          <span className="cycle-pills-label">Select Cycle:</span>
          {DEMO_CYCLES.map((c) => (
            <button
              key={c.id}
              className={`cycle-pill ${selectedCycleId === c.id ? 'selected' : ''}`}
              onClick={() => setSelectedCycleId(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="record-btn"
          style={{
            backgroundColor:
              showForm && !editingIncident ? 'var(--color-text-muted)' : '#DC2626',
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
          label="Active Cycle"
          value={selectedCycle.name}
          subtext={`${selectedCycle.area} · Status: ${selectedCycle.status}`}
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
      {showForm && (
        <div className="form-container">
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
