import React, { useState } from 'react';
import './HarvestForm.css';
import {
  IconScale,
  IconShoppingBag,
  IconTruck,
  IconWarning,
  IconWheat
} from '../../../shared/components/Icons';

const UNIT_OPTIONS = [
  { value: 'KG',   label: 'Kilograms (kg)', icon: IconScale },
  { value: 'BAGS', label: 'Bags',            icon: IconShoppingBag },
  { value: 'TONS', label: 'Tons',            icon: IconTruck },
];

/**
 * Form for recording a harvest at the end of a crop cycle.
 * Validates: quantity > 0, unit required, harvest date required & not future.
 */
export function HarvestForm({ onSubmit, isSubmitting, initialData = null, onCancel, plantingDate }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    quantity: initialData?.quantity ?? '',
    unit: initialData?.unit || 'KG',
    harvestDate: initialData?.harvestDate || todayStr,
    notes: initialData?.notes || '',
    reason: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    const qty = parseFloat(formData.quantity);

    if (formData.quantity === '' || formData.quantity === null) {
      errs.quantity = 'Harvested quantity is required.';
    } else if (!Number.isFinite(qty) || qty <= 0) {
      errs.quantity = 'Harvested quantity must be greater than zero.';
    }

    if (!formData.unit) {
      errs.unit = 'Unit of measure is required.';
    }

    if (!formData.harvestDate) {
      errs.harvestDate = 'Harvest date is required.';
    } else if (formData.harvestDate > todayStr) {
      errs.harvestDate = 'Harvest date cannot be in the future.';
    } else if (plantingDate && formData.harvestDate < plantingDate) {
      errs.harvestDate = 'Harvest date cannot be before planting.';
    }

    if (formData.notes && formData.notes.length > 1000) {
      errs.notes = 'Notes must not exceed 1000 characters.';
    }
    if (initialData && !formData.reason.trim()) errs.reason = 'Explain why this harvest needs correcting.';

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

  const handleUnitSelect = (unit) => {
    setFormData((prev) => ({ ...prev, unit }));
    if (errors.unit) {
      setErrors((prev) => ({ ...prev, unit: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      harvestDate: formData.harvestDate,
      notes: formData.notes || null,
      ...(initialData ? { reason: formData.reason.trim(), expectedRevision: initialData.revision ?? 0 } : {}),
    });
  };

  return (
    <form className="harvest-form" onSubmit={handleSubmit} id="harvest-form-container">
      <fieldset disabled={isSubmitting} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
      <div className="form-header">
        <h3>{initialData ? 'Correct Harvest' : 'Record Harvest Yield'}</h3>
        <p className="form-subtitle">
          {initialData ? 'Review the quantity, unit and date. The previous values and your reason will be kept in the history.' : 'Enter the total quantity harvested, unit of measure, and date. This will complete the cycle.'}
        </p>
      </div>

      {/* Quantity */}
      <div className="form-group">
        <label htmlFor="quantity" className="form-label">
          Harvested Quantity <span className="required">*</span>
        </label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          min="0.01"
          step="0.01"
          className={`form-input ${errors.quantity ? 'input-error' : ''}`}
          placeholder="e.g. 500"
          value={formData.quantity}
          onChange={handleChange}
        />
        {errors.quantity && <span className="field-error">{errors.quantity}</span>}
      </div>

      {/* Unit of Measure */}
      <div className="form-group">
        <label className="form-label">
          Unit of Measure <span className="required">*</span>
        </label>
        <div className="unit-grid">
          {UNIT_OPTIONS.map((opt) => {
            const IconComp = opt.icon;
            const isSelected = formData.unit === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                className={`unit-pill ${isSelected ? 'selected' : ''}`}
                onClick={() => handleUnitSelect(opt.value)}
              >
                <span className="unit-pill-icon">
                  <IconComp size={16} color="currentColor" />
                </span>
                <span className="unit-pill-label">{opt.label}</span>
              </button>
            );
          })}
        </div>
        {errors.unit && <span className="field-error">{errors.unit}</span>}
      </div>

      {/* Harvest Date */}
      <div className="form-group">
        <label htmlFor="harvestDate" className="form-label">
          Harvest Date <span className="required">*</span>
        </label>
        <input
          type="date"
          id="harvestDate"
          name="harvestDate"
          className={`form-input ${errors.harvestDate ? 'input-error' : ''}`}
          max={todayStr}
          min={plantingDate || undefined}
          value={formData.harvestDate}
          onChange={handleChange}
        />
        {errors.harvestDate && <span className="field-error">{errors.harvestDate}</span>}
      </div>

      {/* Notes */}
      <div className="form-group">
        <div className="label-with-count">
          <label htmlFor="notes" className="form-label">
            Harvest Notes &amp; Observations
          </label>
          <span className="char-count">{formData.notes.length}/1000</span>
        </div>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className={`form-textarea ${errors.notes ? 'input-error' : ''}`}
          placeholder="e.g. Good grain quality, minimal pest damage, stored in silo B..."
          value={formData.notes}
          onChange={handleChange}
        />
        {errors.notes && <span className="field-error">{errors.notes}</span>}
      </div>

      {initialData && <div className="form-group">
        <label htmlFor="harvest-correction-reason" className="form-label">Reason for correction *</label>
        <textarea id="harvest-correction-reason" name="reason" maxLength={1000} required rows={3} value={formData.reason} onChange={handleChange} className="form-textarea" />
        {errors.reason && <span className="field-error">{errors.reason}</span>}
      </div>}
      {/* Warning banner */}
      <div className="harvest-warning">
        <span className="warning-icon">
          <IconWarning size={16} color="var(--color-warning, #D97706)" />
        </span>
        <span>{initialData ? 'The cycle stays completed. This correction updates harvest totals and preserves the original planned harvest date.' : 'Recording a harvest completes this cycle. Any later correction requires a reason and is saved in the history.'}</span>
      </div>

      {/* Submit */}
      <div className="form-actions">
        {onCancel && <button type="button" className="btn" onClick={onCancel} disabled={isSubmitting}>Cancel correction</button>}
        <button type="submit" className="btn btn-harvest" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="btn-loading">Saving harvest...</span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <IconWheat size={18} color="currentColor" />
              <span>{initialData ? 'Save correction' : 'Record Harvest & Complete Cycle'}</span>
            </span>
          )}
        </button>
      </div>
      </fieldset>
    </form>
  );
}
