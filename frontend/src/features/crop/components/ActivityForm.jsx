import React, { useState, useEffect } from 'react';
import './ActivityForm.css';
import {
  IconDroplets,
  IconShieldAlert,
  IconSprout,
  IconWheat
} from '../../../shared/components/Icons';

const ACTIVITY_TYPES = [
  { value: 'WATERING', label: 'Watering', icon: IconDroplets, color: '#3A86C8' },
  { value: 'TREATMENT', label: 'Treatment', icon: IconShieldAlert, color: '#E06D53' },
  { value: 'FERTILIZING', label: 'Fertilizing', icon: IconSprout, color: '#4F8A64' },
  { value: 'WEEDING', label: 'Weeding', icon: IconWheat, color: '#D6A23C' },
];

export function ActivityForm({ onSubmit, isSubmitting, initialData = null, onCancel }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    activityType: initialData?.activityType || 'WATERING',
    activityDate: initialData?.activityDate || todayStr,
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState({});

  // Synchronize form fields whenever initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        activityType: initialData.activityType || 'WATERING',
        activityDate: initialData.activityDate || todayStr,
        notes: initialData.notes || '',
      });
      setErrors({});
    } else {
      setFormData({
        activityType: 'WATERING',
        activityDate: todayStr,
        notes: '',
      });
      setErrors({});
    }
  }, [initialData, todayStr]);

  const validate = () => {
    const errs = {};
    if (!formData.activityType) {
      errs.activityType = 'Please select an activity type.';
    }
    if (!formData.activityDate) {
      errs.activityDate = 'Please select an intervention date.';
    } else if (formData.activityDate > todayStr) {
      errs.activityDate = 'Activity date cannot be in the future.';
    }
    if (formData.notes && formData.notes.length > 1000) {
      errs.notes = 'Notes must not exceed 1000 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, activityType: type }));
    if (errors.activityType) {
      setErrors((prev) => ({ ...prev, activityType: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form className="activity-form" onSubmit={handleSubmit} id="activity-form-container">
      <div className="form-header">
        <div className="form-header-title-row">
          <h3>{initialData ? 'Edit Activity Intervention' : 'Record New Activity'}</h3>
          {initialData && (
            <span className="editing-badge">
              Editing Record #{initialData.id}
            </span>
          )}
        </div>
        <p className="form-subtitle">
          {initialData
            ? 'Update the intervention details below and click Update Activity.'
            : 'Log an intervention carried out on this crop cycle.'}
        </p>
      </div>

      {/* Activity Type Selection Pills */}
      <div className="form-group">
        <label className="form-label">
          Activity Type <span className="required">*</span>
        </label>
        <div className="activity-type-grid">
          {ACTIVITY_TYPES.map((type) => {
            const isSelected = formData.activityType === type.value;
            const IconComp = type.icon;
            return (
              <button
                type="button"
                key={type.value}
                className={`type-pill ${isSelected ? 'selected' : ''}`}
                onClick={() => handleTypeSelect(type.value)}
              >
                <span className="type-pill-icon">
                  <IconComp size={16} color="currentColor" />
                </span>
                <span className="type-pill-label">{type.label}</span>
              </button>
            );
          })}
        </div>
        {errors.activityType && <span className="field-error">{errors.activityType}</span>}
      </div>

      {/* Intervention Date */}
      <div className="form-group">
        <label htmlFor="activityDate" className="form-label">
          Intervention Date <span className="required">*</span>
        </label>
        <input
          type="date"
          id="activityDate"
          name="activityDate"
          className={`form-input ${errors.activityDate ? 'input-error' : ''}`}
          max={todayStr}
          value={formData.activityDate}
          onChange={handleChange}
        />
        {errors.activityDate && <span className="field-error">{errors.activityDate}</span>}
      </div>

      {/* Observation Notes */}
      <div className="form-group">
        <div className="label-with-count">
          <label htmlFor="notes" className="form-label">
            Intervention Notes & Observations
          </label>
          <span className="char-count">
            {formData.notes.length}/1000
          </span>
        </div>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className={`form-textarea ${errors.notes ? 'input-error' : ''}`}
          placeholder="e.g. Applied 20L bio-fertilizer per row, observed uniform moisture..."
          value={formData.notes}
          onChange={handleChange}
        />
        {errors.notes && <span className="field-error">{errors.notes}</span>}
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
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="btn-loading">Saving intervention...</span>
          ) : (
            <span>{initialData ? 'Update Activity' : 'Record Activity'}</span>
          )}
        </button>
      </div>
    </form>
  );
}
