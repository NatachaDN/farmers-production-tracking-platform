import React, { useState, useEffect } from 'react';
import { cropCycleService } from '../../crops/services/cropCycleService';
import { cycleIncidentService } from '../services/cycleIncidentService';
import {
  IconArrowLeft,
  IconShieldAlert,
  IconBug,
  IconZap,
  IconCloudRain,
  IconClipboard,
  IconCheck,
  IconCalendar,
  IconWarning
} from '../../../shared/components/Icons';

const INCIDENT_CATEGORIES = [
  {
    value: 'DISEASE',
    label: 'Disease',
    description: 'Fungal, bacterial, or viral plant infection',
    icon: IconShieldAlert,
    bg: '#EDE9FE',
    text: '#5B21B6',
    border: '#DDD6FE'
  },
  {
    value: 'PEST',
    label: 'Pest',
    description: 'Insects, mites, caterpillars, or rodents',
    icon: IconBug,
    bg: '#FEE2E2',
    text: '#991B1B',
    border: '#FECACA'
  },
  {
    value: 'DAMAGE',
    label: 'Physical Damage',
    description: 'Mechanical, livestock intrusion, or tool damage',
    icon: IconZap,
    bg: '#FEF3C7',
    text: '#92400E',
    border: '#FDE68A'
  },
  {
    value: 'WEATHER',
    label: 'Weather Event',
    description: 'Drought, heavy rain, flood, hail, or wind',
    icon: IconCloudRain,
    bg: '#DBEAFE',
    text: '#1E40AF',
    border: '#BFDBFE'
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Nutrient deficiency or other field issue',
    icon: IconClipboard,
    bg: '#F4EFE6',
    text: '#4B5752',
    border: '#DFD8CA'
  }
];

const SEVERITY_OPTIONS = [
  { level: 1, label: '1 — Low', bg: '#EAF4ED', text: '#2A6740', border: '#C8E2D0' },
  { level: 2, label: '2 — Minor', bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  { level: 3, label: '3 — Moderate', bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  { level: 4, label: '4 — Serious', bg: '#FFEDD5', text: '#C2410C', border: '#FED7AA' },
  { level: 5, label: '5 — Critical', bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' }
];

const labelStyle = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: '#19201C',
  marginBottom: '6px'
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1px solid #DFD8CA',
  fontSize: '0.875rem',
  color: '#19201C',
  backgroundColor: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box'
};

const cardStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #ECE7DC',
  borderRadius: '20px',
  padding: 'clamp(18px, 3vw, 28px)',
  boxShadow: '0 2px 8px rgba(22, 66, 48, 0.04)'
};

export function CreateIncidentPage({ farmerId, initialCycleId = null, initialIncident = null, onBack, onSaved }) {
  const isEditing = Boolean(initialIncident?.id);
  const today = new Date().toISOString().split('T')[0];

  const [cycles, setCycles] = useState([]);
  const [cyclesLoading, setCyclesLoading] = useState(true);
  const [selectedCycleId, setSelectedCycleId] = useState(initialCycleId || '');
  const [incidentType, setIncidentType] = useState(initialIncident?.incidentType || 'DISEASE');
  const [incidentDate, setIncidentDate] = useState(initialIncident?.incidentDate || today);
  const [severityLevel, setSeverityLevel] = useState(initialIncident?.severityLevel || 3);
  const [description, setDescription] = useState(initialIncident?.description || '');
  const [actionTaken, setActionTaken] = useState(initialIncident?.actionTaken || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCycles() {
      if (!farmerId) return;
      setCyclesLoading(true);
      try {
        const data = await cropCycleService.getCycles(farmerId);
        const list = Array.isArray(data) ? data : [];
        setCycles(list);
        if (!initialCycleId && list.length > 0) {
          const active = list.find((c) => (c.status || '').toUpperCase() === 'ACTIVE') || list[0];
          setSelectedCycleId(String(active.id));
        } else if (initialCycleId) {
          setSelectedCycleId(String(initialCycleId));
        }
      } catch (err) {
        console.error('Failed to load crop cycles:', err);
        setCycles([]);
      } finally {
        setCyclesLoading(false);
      }
    }
    loadCycles();
  }, [farmerId, initialCycleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedCycleId) {
      setError('Please select a crop cycle.');
      return;
    }
    if (!incidentDate) {
      setError('Please select the date the incident occurred.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe what happened so it can be tracked.');
      return;
    }

    const payload = {
      incidentType,
      incidentDate,
      severityLevel: Number(severityLevel) || null,
      description: description.trim(),
      actionTaken: actionTaken.trim() || null
    };

    setSubmitting(true);
    try {
      let saved;
      if (isEditing) {
        saved = await cycleIncidentService.updateIncident(
          farmerId,
          Number(selectedCycleId),
          initialIncident.id,
          payload
        );
      } else {
        saved = await cycleIncidentService.createIncident(
          farmerId,
          Number(selectedCycleId),
          payload
        );
      }
      if (onSaved) {
        onSaved(Number(selectedCycleId), saved);
      } else if (onBack) {
        onBack(Number(selectedCycleId));
      }
    } catch (err) {
      console.error('Failed to save incident:', err);
      setError(err?.message || 'Unable to save incident report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          type="button"
          onClick={() => onBack?.(selectedCycleId ? Number(selectedCycleId) : null)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            alignSelf: 'flex-start',
            backgroundColor: '#FFFFFF',
            border: '1px solid #DFD8CA',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#164230',
            cursor: 'pointer'
          }}
        >
          <IconArrowLeft size={16} color="#164230" />
          <span>Back to Incidents</span>
        </button>

        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.875rem)', fontWeight: 700, color: '#19201C', letterSpacing: '-0.02em', margin: 0 }}>
            {isEditing ? 'Edit Incident Report' : 'Report Crop Incident'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#788680', marginTop: '4px', marginBottom: 0 }}>
            Log pests, diseases, weather impacts, or field damage on a crop production cycle.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: '14px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#991B1B',
          fontSize: '0.875rem',
          fontWeight: 500
        }}>
          <IconWarning size={18} color="#DC2626" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Section 1: Target Crop Cycle */}
        <section style={cardStyle}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#19201C', margin: '0 0 4px 0' }}>
            1. Affected Crop Cycle
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#788680', margin: '0 0 16px 0' }}>
            Select the production cycle where the incident occurred.
          </p>

          <label htmlFor="incident-cycle-select" style={labelStyle}>Crop Cycle *</label>
          <select
            id="incident-cycle-select"
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
            disabled={cyclesLoading || isEditing}
            required
            style={inputStyle}
          >
            {cyclesLoading ? (
              <option value="">Loading crop cycles...</option>
            ) : cycles.length === 0 ? (
              <option value="">No crop cycles available</option>
            ) : (
              cycles.map((c) => {
                const label = c.name || `${c.cropName || 'Crop'}${c.plotName ? ` (${c.plotName})` : ''}`;
                return (
                  <option key={c.id} value={String(c.id)}>
                    {label} — [{(c.status || 'ACTIVE').toUpperCase()}]
                  </option>
                );
              })
            )}
          </select>
        </section>

        {/* Section 2: Incident Category */}
        <section style={cardStyle}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#19201C', margin: '0 0 4px 0' }}>
            2. Incident Type
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#788680', margin: '0 0 16px 0' }}>
            Choose the category that best describes what affected the crop.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))',
            gap: '12px'
          }}>
            {INCIDENT_CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = incidentType === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setIncidentType(cat.value)}
                  style={{
                    textAlign: 'left',
                    padding: '14px',
                    borderRadius: '14px',
                    border: isSelected ? `2px solid ${cat.text}` : '1px solid #ECE7DC',
                    backgroundColor: isSelected ? cat.bg : '#FAF8F4',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? '#FFFFFF' : cat.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconComp size={18} color={cat.text} />
                    </div>
                    {isSelected && (
                      <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: cat.text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <IconCheck size={12} color="#FFFFFF" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#19201C' }}>{cat.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#4B5752', lineHeight: 1.35, marginTop: '2px' }}>{cat.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 3: Date & Severity */}
        <section style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconCalendar size={18} color="#DC2626" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#19201C', margin: 0 }}>
                3. Date & Severity Level
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#788680', margin: '2px 0 0 0' }}>
                When was it observed and how severe is the impact?
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div>
              <label htmlFor="incident-date" style={labelStyle}>Incident Date *</label>
              <input
                id="incident-date"
                type="date"
                required
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Severity Rating</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SEVERITY_OPTIONS.map((opt) => {
                const active = Number(severityLevel) === opt.level;
                return (
                  <button
                    key={opt.level}
                    type="button"
                    onClick={() => setSeverityLevel(opt.level)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.8125rem',
                      fontWeight: active ? 700 : 500,
                      border: active ? `2px solid ${opt.text}` : `1px solid ${opt.border}`,
                      backgroundColor: active ? opt.bg : '#FFFFFF',
                      color: active ? opt.text : '#4B5752',
                      cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 4: Description & Action Taken */}
        <section style={cardStyle}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#19201C', margin: '0 0 4px 0' }}>
            4. Observations & Remedial Action
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#788680', margin: '0 0 16px 0' }}>
            Provide clear field details and any immediate treatment or containment steps taken.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="incident-description" style={labelStyle}>Incident Description *</label>
              <textarea
                id="incident-description"
                rows={4}
                required
                placeholder="e.g. Yellow rust spots observed on lower leaves across ~20% of Plot A after heavy rainfall."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
              />
            </div>

            <div>
              <label htmlFor="incident-action" style={labelStyle}>Remedial Action Taken (optional)</label>
              <textarea
                id="incident-action"
                rows={3}
                placeholder="e.g. Removed infected leaves and applied copper-based fungicide at recommended dosage."
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onBack?.(selectedCycleId ? Number(selectedCycleId) : null)}
            disabled={submitting}
            style={{
              padding: '11px 20px',
              borderRadius: '10px',
              border: '1px solid #DFD8CA',
              backgroundColor: '#FFFFFF',
              color: '#4B5752',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            id="submit-create-incident"
            type="submit"
            disabled={submitting || cycles.length === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 24px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: submitting || cycles.length === 0 ? '#788680' : '#DC2626',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: submitting || cycles.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)'
            }}
          >
            <IconCheck size={16} color="#FFFFFF" />
            <span>{submitting ? 'Saving...' : isEditing ? 'Update Incident' : 'Save Incident Report'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

