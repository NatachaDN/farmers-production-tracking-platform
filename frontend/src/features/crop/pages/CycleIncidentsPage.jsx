import React, { useState, useEffect } from 'react';
import './CycleIncidentsPage.css';
import { cycleIncidentService } from '../services/cycleIncidentService';
import { cropCycleService } from '../../crops/services/cropCycleService';
import { IncidentForm } from '../components/IncidentForm';
import { IncidentList } from '../components/IncidentList';
import { MetricCard } from '../../../shared/components/MetricCard';
import {
  IconAlertTriangle,
  IconShieldAlert,
  IconBug,
  IconAlertCircle,
  IconClose,
  IconPlus,
} from '../../../shared/components/Icons';

/**
 * CycleIncidentsPage — Record and view incidents (disease, pest, damage) per cycle.
 */
export function CycleIncidentsPage({ farmerId }) {
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch cycles from database
  useEffect(() => {
    async function fetchCycles() {
      if (!farmerId) return;
      try {
        const data = await cropCycleService.getCycles(farmerId);
        const list = Array.isArray(data) ? data : [];
        setCycles(list);
        if (list.length > 0) {
          const active = list.find((c) => (c.status || '').toUpperCase() === 'ACTIVE') || list[0];
          setSelectedCycleId(active.id);
        }
      } catch (err) {
        console.error('Failed to load cycles for incidents:', err);
        setCycles([]);
      }
    }
    fetchCycles();
  }, [farmerId]);

  const selectedCycle = cycles.find((c) => c.id === selectedCycleId) || (cycles.length > 0 ? cycles[0] : null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // ---- Load incidents from API ----
  const loadIncidents = async (cycleId) => {
    if (!cycleId || !farmerId) {
      setIncidents([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await cycleIncidentService.getIncidents(farmerId, cycleId);
      setIncidents(Array.isArray(data) ? data : []);
    } catch {
      setIncidents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCycleId) {
      loadIncidents(selectedCycleId);
    } else {
      setIncidents([]);
    }
  }, [selectedCycleId, farmerId]);

  // ---- Create or update ----
  const handleSaveIncident = async (formData) => {
    if (!selectedCycleId) return;
    setIsSubmitting(true);
    try {
      if (editingIncident) {
        const updated = await cycleIncidentService.updateIncident(
          farmerId,
          selectedCycleId,
          editingIncident.id,
          formData
        );
        setIncidents((prev) =>
          prev.map((i) => (i.id === editingIncident.id ? { ...i, ...updated } : i))
        );
        showToast('Incident updated successfully.');
        setEditingIncident(null);
        setShowForm(false);
      } else {
        const created = await cycleIncidentService.createIncident(
          farmerId,
          selectedCycleId,
          formData
        );
        setIncidents((prev) => [created, ...prev]);
        showToast('Incident recorded successfully.');
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

  // ---- Trigger edit form ----
  const handleEditTrigger = (incident) => {
    setEditingIncident(incident);
    setShowForm(true);
    const formEl = document.getElementById('incident-form-container');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  // ---- KPIs ----
  const cycleIncidents = incidents;
  const totalIncidents = cycleIncidents.length;
  const diseaseCount = cycleIncidents.filter((i) => i.incidentType === 'DISEASE').length;
  const pestCount = cycleIncidents.filter((i) => i.incidentType === 'PEST').length;
  const highSeverity = cycleIncidents.filter(
    (i) => i.severityLevel && i.severityLevel >= 4
  ).length;

  return (
    <div className="cycle-incidents-page">
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

      {/* Control bar: cycle selector + action button */}
      <div className="control-bar">
        <div className="cycle-pills">
          <span className="cycle-pills-label">Select Cycle:</span>
          {cycles.length > 0 ? (
            cycles.map((c) => (
              <button
                key={c.id}
                className={`cycle-pill ${selectedCycleId === c.id ? 'selected' : ''}`}
                onClick={() => setSelectedCycleId(c.id)}
              >
                {c.name || `${c.cropName || 'Crop'} (${c.plotName || 'Plot'})`}
              </button>
            ))
          ) : (
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              No crop cycles registered yet
            </span>
          )}
        </div>

        {selectedCycle && (
          <button
            type="button"
            className="record-btn"
            style={{
              backgroundColor:
                showForm && !editingIncident ? 'var(--color-text-muted)' : '#DC2626',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={() => {
              setEditingIncident(null);
              setShowForm((v) => !v);
            }}
          >
            {showForm ? (
              <>
                <IconClose size={16} /> Close Form
              </>
            ) : (
              <>
                <IconPlus size={16} /> Record Incident
              </>
            )}
          </button>
        )}
      </div>

      {/* Form area */}
      {showForm && selectedCycle && (
        <div id="incident-form-container" className="form-wrapper">
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

      {/* KPI Row */}
      <div className="kpi-row">
        <MetricCard
          label="Total Incidents"
          value={String(totalIncidents)}
          subtext={`Cycle: ${selectedCycle?.name || (cycles.length === 0 ? 'No cycles' : 'None')}`}
          icon={<IconAlertTriangle size={20} color="#DC2626" />}
          iconBg="#FEF2F2"
        />
        <MetricCard
          label="Disease Reports"
          value={String(diseaseCount)}
          subtext="Fungal / bacterial / viral"
          icon={<IconShieldAlert size={20} color="#7C3AED" />}
          iconBg="#FFFBEB"
        />
        <MetricCard
          label="Pest Infestations"
          value={String(pestCount)}
          subtext="Insects / mites / nematodes"
          icon={<IconBug size={20} color="#D97706" />}
          iconBg="#FEF3C7"
        />
        <MetricCard
          label="High Severity"
          value={String(highSeverity)}
          subtext="Level 4 (Severe) or 5 (Critical)"
          icon={<IconAlertCircle size={20} color="#DC2626" />}
          iconBg="#FEE2E2"
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

        {cycles.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            backgroundColor: '#FAF8F5',
            borderRadius: '12px',
            border: '1px dashed #ECE7DC'
          }}>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              No crop cycles registered
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Create a crop cycle in the Crop Production module before logging incidents.
            </p>
          </div>
        ) : (
          <IncidentList
            incidents={incidents}
            isLoading={isLoading}
            onEdit={handleEditTrigger}
            onDelete={handleDeleteIncident}
          />
        )}
      </div>
    </div>
  );
}

export default CycleIncidentsPage;
