import React, { useState, useEffect } from 'react';
import './IncidentForm.css';

const INCIDENT_TYPES = [
  { value: 'DISEASE',  label: 'Disease',  emoji: '🦠', color: '#7C3AED' },
  { value: 'PEST',     label: 'Pest',     emoji: '🐛', color: '#DC2626' },
  { value: 'DAMAGE',   label: 'Damage',   emoji: '⚡', color: '#D97706' },
  { value: 'WEATHER',  label: 'Weather',  emoji: '🌧️', color: '#3A86C8' },
  { value: 'OTHER',    label: 'Other',    emoji: '📋', color: '#4F8A64' },
];

const SEVERITY_LABELS = ['', 'Low', 'Minor', 'Moderate', 'Serious', 'Critical'];

export function IncidentForm({ onSubmit, isSubmitting, initialData = null, onCancel }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    incidentType:  initialData?.incidentType  || 'DISEASE',
    incidentDate:  initialData?.incidentDate  || todayStr,
    description:   initialData?.description   || '',
    severityLevel: initialData?.severityLevel || null,
    actionTaken:   initialData?.actionTaken   || '',
  });

  const [errors, setErrors] = useState({});

  // Sync whenever initialData changes (edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        incidentType:  initialData.incidentType  || 'DISEASE',
        incidentDate:  initialData.incidentDate  || todayStr,
        description:   initialData.description   || '',
        severityLevel: initialData.severityLevel || null,
        actionTaken:   initialData.actionTaken   || '',
      });
      setErrors({});
    } else {
      setFormData({
        incidentType:  'DISEASE',
        incidentDate:  todayStr,
        description:   '',
        severityLevel: null,
        actionTaken:   '',
      });
      setErrors({});
    }
  }, [initialData, todayStr]);

  const validate = () => {
    const errs = {};
    if (!formData.incidentType) {
      errs.incidentType = 'Please select an incident type.';
    }
    if (!formData.incidentDate) {
      errs.incidentDate = 'Please select an incident date.';
    } else if (formData.incidentDate > todayStr) {
      errs.incidentDate = 'Incident date cannot be in the future.';
    }
    if (!formData.description || formData.description.trim() === '') {
      errs.description = 'Description is required.';
    } else if (formData.description.length > 2000) {
      errs.description = 'Description must not exceed 2000 characters.';
    }
    if (formData.actionTaken && formData.actionTaken.length > 2000) {
      errs.actionTaken = 'Action taken must not exceed 2000 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, incidentType: type }));
    if (errors.incidentType) setErrors((prev) => ({ ...prev, incidentType: null }));
  };

  const handleSeverity = (level) => {
    setFormData((prev) => ({
      ...prev,
      severityLevel: prev.severityLevel === level ? null : level,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Send null if no severity chosen
    onSubmit({
      ...formData,
      severityLevel: formData.severityLevel || null,
      actionTaken:   formData.actionTaken.trim() || null,
    });
  };

  return (
    <form className="incident-form" onSubmit={handleSubmit} id="incident-form-container">
      {/* Header */}
      <div className="form-header">
        <div className="form-header-title-row">
          <h3>{initialData ? 'Edit Incident Record' : 'Record New Incident'}</h3>
          {initialData && (
            <span className="editing-badge">Editing Record #{initialData.id}</span>
          )}
        </div>
        <p className="form-subtitle">
          {initialData
            ? 'Update the incident details below and click Update Incident.'
            : 'Log a disease, pest attack, or other problem observed on this cycle.'}
        </p>
      </div>

      {/* Incident Type Pills */}
      <div className="form-group">
        <label className="form-label">
          Incident Type <span className="required">*</span>
        </label>
        <div className="incident-type-grid">
          {INCIDENT_TYPES.map((type) => {
            const isSelected = formData.incidentType === type.value;
            return (
              <button
                type="button"
                key={type.value}
                className={`type-pill ${isSelected ? 'selected' : ''}`}
                onClick={() => handleTypeSelect(type.value)}
              >
                <span className="type-pill-icon" style={{ fontSize: '1.25rem' }}>
                  {type.emoji}
                </span>
                <span className="type-pill-label">{type.label}</span>
              </button>
            );
          })}
        </div>
        {errors.incidentType && <span className="field-error">{errors.incidentType}</span>}
      </div>

      {/* Incident Date */}
      <div className="form-group">
        <label htmlFor="incidentDate" className="form-label">
          Incident Date <span className="required">*</span>
        </label>
        <input
          type="date"
          id="incidentDate"
          name="incidentDate"
          className={`form-input ${errors.incidentDate ? 'input-error' : ''}`}
          max={todayStr}
          value={formData.incidentDate}
          onChange={handleChange}
        />
        {errors.incidentDate && <span className="field-error">{errors.incidentDate}</span>}
      </div>

      {/* Description */}
      <div className="form-group">
        <div className="label-with-count">
          <label htmlFor="description" className="form-label">
            Description <span className="required">*</span>
          </label>
          <span className="char-count">{formData.description.length}/2000</span>
        </div>
        <textarea
          id="description"
          name="description"
          rows={4}
          className={`form-textarea ${errors.description ? 'input-error' : ''}`}
          placeholder="e.g. Early blight spotted on lower leaves of 30% of plants in row 3–7. Yellowing margins observed..."
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </div>

      {/* Severity Level (optional) */}
      <div className="form-group">
        <label className="form-label">Severity Level (optional)</label>
        <div className="severity-row">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              type="button"
              key={level}
              className={`severity-btn ${formData.severityLevel === level ? 'active' : ''}`}
              onClick={() => handleSeverity(level)}
              title={SEVERITY_LABELS[level]}
            >
              {level}
            </button>
          ))}
          {formData.severityLevel && (
            <span className="severity-hint">
              — {SEVERITY_LABELS[formData.severityLevel]}
            </span>
          )}
        </div>
      </div>

      {/* Action Taken (optional) */}
      <div className="form-group">
        <div className="label-with-count">
          <label htmlFor="actionTaken" className="form-label">
            Action Taken (optional)
          </label>
          <span className="char-count">{(formData.actionTaken || '').length}/2000</span>
        </div>
        <textarea
          id="actionTaken"
          name="actionTaken"
          rows={3}
          className={`form-textarea ${errors.actionTaken ? 'input-error' : ''}`}
          placeholder="e.g. Applied copper-based fungicide across all affected rows at 8am..."
          value={formData.actionTaken || ''}
          onChange={handleChange}
        />
        {errors.actionTaken && <span className="field-error">{errors.actionTaken}</span>}
      </div>

      {/* Actions */}
      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="btn-loading">Saving...</span>
          ) : (
            <span>{initialData ? 'Update Incident' : 'Record Incident'}</span>
          )}
        </button>
      </div>
    </form>
  );
}
