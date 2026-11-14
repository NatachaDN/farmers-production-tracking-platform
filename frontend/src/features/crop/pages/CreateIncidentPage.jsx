import React, { useState, useEffect } from 'react';
import { cropCycleService } from '../../crops/services/cropCycleService';
import { cycleIncidentService } from '../services/cycleIncidentService';
import { animalGroupService } from '../../livestock/services/animalGroupService';
import {
  IconArrowLeft,
  IconShieldAlert,
  IconBug,
  IconZap,
  IconCloudRain,
  IconClipboard,
  IconCheck,
  IconCalendar,
  IconWarning,
  IconCrop,
  IconLivestock
} from '../../../shared/components/Icons';

const CROP_INCIDENT_CATEGORIES = [
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

const ANIMAL_INCIDENT_CATEGORIES = [
  {
    value: 'DISEASE',
    label: 'Disease / Illness',
    description: 'Infectious, respiratory, or digestive illness',
    icon: IconShieldAlert,
    bg: '#EDE9FE',
    text: '#5B21B6',
    border: '#DDD6FE'
  },
  {
    value: 'INJURY',
    label: 'Injury / Trauma',
    description: 'Lameness, wounds, or housing accidents',
    icon: IconWarning,
    bg: '#FFEDD5',
    text: '#C2410C',
    border: '#FED7AA'
  },
  {
    value: 'MORTALITY',
    label: 'Mortality / Loss',
    description: 'Unexpected animal death or loss',
    icon: IconWarning,
    bg: '#FEE2E2',
    text: '#991B1B',
    border: '#FECACA'
  },
  {
    value: 'PARASITE',
    label: 'Parasites',
    description: 'Ticks, worms, mites, or external parasites',
    icon: IconBug,
    bg: '#FEF3C7',
    text: '#92400E',
    border: '#FDE68A'
  },
  {
    value: 'PREDATOR',
    label: 'Predator Attack',
    description: 'Wildlife, stray dog, or theft intrusion',
    icon: IconZap,
    bg: '#FEE2E2',
    text: '#991B1B',
    border: '#FECACA'
  },
  {
    value: 'HEAT_STRESS',
    label: 'Heat / Weather Stress',
    description: 'Extreme heat, cold snap, or ventilation issue',
    icon: IconCloudRain,
    bg: '#DBEAFE',
    text: '#1E40AF',
    border: '#BFDBFE'
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Feed contamination or other herd event',
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

export function CreateIncidentPage({
  farmerId,
  initialMode = 'crop',
  initialCycleId = null,
  initialIncident = null,
  onBack,
  onSaved
}) {
  const isEditing = Boolean(initialIncident?.id);
  const today = new Date().toISOString().split('T')[0];

  const [mode, setMode] = useState(initialMode || 'crop');
  const [cycles, setCycles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [targetsLoading, setTargetsLoading] = useState(true);
  const [selectedTargetId, setSelectedTargetId] = useState(initialCycleId ? String(initialCycleId) : '');
  const [incidentType, setIncidentType] = useState(initialIncident?.incidentType || 'DISEASE');
  const [incidentDate, setIncidentDate] = useState(initialIncident?.incidentDate || today);
  const [affectedCount, setAffectedCount] = useState(initialIncident?.affectedCount ?? '');
  const [severityLevel, setSeverityLevel] = useState(initialIncident?.severityLevel || 3);
  const [description, setDescription] = useState(initialIncident?.description || '');
  const [actionTaken, setActionTaken] = useState(initialIncident?.actionTaken || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTargets() {
      if (!farmerId) return;
      setTargetsLoading(true);
      try {
        const [cycleRes, groupRes] = await Promise.allSettled([
          cropCycleService.getCycles(farmerId),
          animalGroupService.getGroups()
        ]);
        const cycleList = cycleRes.status === 'fulfilled' && Array.isArray(cycleRes.value) ? cycleRes.value : [];
        const groupList = groupRes.status === 'fulfilled' && Array.isArray(groupRes.value) ? groupRes.value : [];
        setCycles(cycleList);
        setGroups(groupList);

        if (initialCycleId) {
          setSelectedTargetId(String(initialCycleId));
        } else if ((initialMode || 'crop') === 'animal' && groupList.length > 0) {
          setSelectedTargetId(String(groupList[0].id));
        } else if (cycleList.length > 0) {
          const active = cycleList.find((c) => (c.status || '').toUpperCase() === 'ACTIVE') || cycleList[0];
          setSelectedTargetId(String(active.id));
        }
      } finally {
        setTargetsLoading(false);
      }
    }
    loadTargets();
  }, [farmerId, initialCycleId, initialMode]);

  const handleModeSwitch = (nextMode) => {
    if (isEditing) return;
    setMode(nextMode);
    setError(null);
    setIncidentType('DISEASE');
    if (nextMode === 'animal') {
      setSelectedTargetId(groups.length > 0 ? String(groups[0].id) : '');
    } else {
      const active = cycles.find((c) => (c.status || '').toUpperCase() === 'ACTIVE') || cycles[0];
      setSelectedTargetId(active ? String(active.id) : '');
    }
  };

  const categories = mode === 'animal' ? ANIMAL_INCIDENT_CATEGORIES : CROP_INCIDENT_CATEGORIES;
  const targetList = mode === 'animal' ? groups : cycles;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedTargetId) {
      setError(`Please select ${mode === 'animal' ? 'an animal group' : 'a crop cycle'}.`);
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
      actionTaken: actionTaken.trim() || null,
      ...(mode === 'animal' && affectedCount !== '' ? { affectedCount: Number(affectedCount) } : {})
    };

    setSubmitting(true);
    try {
      const targetId = Number(selectedTargetId);
      let saved;
      if (mode === 'animal') {
        saved = isEditing
          ? await animalGroupService.updateIncident(targetId, initialIncident.id, payload)
          : await animalGroupService.createIncident(targetId, payload);
      } else {
        saved = isEditing
          ? await cycleIncidentService.updateIncident(farmerId, targetId, initialIncident.id, payload)
          : await cycleIncidentService.createIncident(farmerId, targetId, payload);
      }
      if (onSaved) {
        onSaved(mode, targetId, saved);
      } else if (onBack) {
        onBack(mode, targetId);
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
          onClick={() => onBack?.(mode, selectedTargetId ? Number(selectedTargetId) : null)}
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.875rem)', fontWeight: 700, color: '#19201C', letterSpacing: '-0.02em', margin: 0 }}>
              {isEditing ? 'Edit Incident Report' : mode === 'animal' ? 'Report Livestock Incident' : 'Report Crop Incident'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#788680', marginTop: '4px', marginBottom: 0 }}>
              {mode === 'animal'
                ? 'Log diseases, injuries, mortalities, parasites, or predator events for an animal group.'
                : 'Log pests, diseases, weather impacts, or field damage on a crop production cycle.'}
            </p>
          </div>

          {!isEditing && (
            <div style={{ display: 'inline-flex', backgroundColor: '#FFFFFF', border: '1px solid #DFD8CA', borderRadius: '12px', padding: '4px', gap: '4px' }}>
              <button
                type="button"
                onClick={() => handleModeSwitch('crop')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '0.8125rem', fontWeight: 600,
                  backgroundColor: mode === 'crop' ? '#164230' : 'transparent',
                  color: mode === 'crop' ? '#FFFFFF' : '#4B5752'
                }}
              >
                <IconCrop size={15} color={mode === 'crop' ? '#FFFFFF' : '#4B5752'} />
                <span>Crop Cycle</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('animal')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '0.8125rem', fontWeight: 600,
                  backgroundColor: mode === 'animal' ? '#164230' : 'transparent',
                  color: mode === 'animal' ? '#FFFFFF' : '#4B5752'
                }}
              >
                <IconLivestock size={15} color={mode === 'animal' ? '#FFFFFF' : '#4B5752'} />
                <span>Animal Group</span>
              </button>
            </div>
          )}
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
        {/* Section 1: Target */}
        <section style={cardStyle}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#19201C', margin: '0 0 4px 0' }}>
            {mode === 'animal' ? '1. Affected Animal Group' : '1. Affected Crop Cycle'}
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#788680', margin: '0 0 16px 0' }}>
            {mode === 'animal'
              ? 'Select the herd, flock, or pen where the incident occurred.'
              : 'Select the crop production cycle where the incident occurred.'}
          </p>

          <label htmlFor="incident-cycle-select" style={labelStyle}>
            {mode === 'animal' ? 'Animal Group *' : 'Crop Cycle *'}
          </label>
          <select
            id="incident-cycle-select"
            value={selectedTargetId}
            onChange={(e) => setSelectedTargetId(e.target.value)}
            disabled={targetsLoading || isEditing}
            required
            style={inputStyle}
          >
            {targetsLoading ? (
              <option value="">Loading...</option>
            ) : targetList.length === 0 ? (
              <option value="">
                {mode === 'animal' ? 'No animal groups available' : 'No crop cycles available'}
              </option>
            ) : (
              targetList.map((item) => {
                const label = mode === 'animal'
                  ? `${item.name} — ${item.animalType} (${item.currentPopulation ?? item.initialPopulation ?? 0} head)`
                  : item.name || `${item.cropName || 'Crop'}${item.plotName ? ` (${item.plotName})` : ''}`;
                return (
                  <option key={item.id} value={String(item.id)}>
                    {label} — [{(item.status || 'ACTIVE').toUpperCase()}]
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
            Choose the category that best describes what happened.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))',
            gap: '12px'
          }}>
            {categories.map((cat) => {
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

        {/* Section 3: Date, Affected Count & Severity */}
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
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

            {mode === 'animal' && (
              <div>
                <label htmlFor="incident-affected" style={labelStyle}>Affected Animals (headcount)</label>
                <input
                  id="incident-affected"
                  type="number"
                  min="1"
                  placeholder="e.g. 5"
                  value={affectedCount}
                  onChange={(e) => setAffectedCount(e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}
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
            Provide clear details and any immediate treatment or containment steps taken.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="incident-description" style={labelStyle}>Incident Description *</label>
              <textarea
                id="incident-description"
                rows={4}
                required
                placeholder={
                  mode === 'animal'
                    ? 'e.g. 4 birds showing respiratory symptoms and reduced feed intake in Pen B.'
                    : 'e.g. Yellow rust spots observed on lower leaves across ~20% of Plot A after heavy rainfall.'
                }
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
                placeholder={
                  mode === 'animal'
                    ? 'e.g. Isolated affected animals and contacted veterinarian for antibiotic treatment.'
                    : 'e.g. Removed infected leaves and applied copper-based fungicide at recommended dosage.'
                }
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
            onClick={() => onBack?.(mode, selectedTargetId ? Number(selectedTargetId) : null)}
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
            disabled={submitting || targetList.length === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 24px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: submitting || targetList.length === 0 ? '#788680' : '#DC2626',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: submitting || targetList.length === 0 ? 'not-allowed' : 'pointer',
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
