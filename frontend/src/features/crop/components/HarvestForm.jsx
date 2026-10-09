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
export function HarvestForm({ onSubmit, isSubmitting }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    quantity: '',
    unit: 'KG',
    harvestDate: todayStr,
    notes: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    const qty = parseFloat(formData.quantity);

    if (formData.quantity === '' || formData.quantity === null) {
      errs.quantity = 'Harvested quantity is required.';
    } else if (isNaN(qty) || qty <= 0) {
      errs.quantity = 'Harvested quantity must be greater than zero.';
    }

    if (!formData.unit) {
      errs.unit = 'Unit of measure is required.';
    }

    if (!formData.harvestDate) {
      errs.harvestDate = 'Harvest date is required.';
    } else if (formData.harvestDate > todayStr) {
      errs.harvestDate = 'Harvest date cannot be in the future.';
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
    });
  };

  return (
    <form className="harvest-form" onSubmit={handleSubmit} id="harvest-form-container">
      <div className="form-header">
        <h3>Record Harvest Yield</h3>
        <p className="form-subtitle">
          Enter the total quantity harvested, unit of measure, and date. This will complete the cycle.
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

      {/* Warning banner */}
      <div className="harvest-warning">
        <span className="warning-icon">
          <IconWarning size={16} color="var(--color-warning, #D97706)" />
        </span>
        <span>Recording a harvest will mark this cycle as <strong>Completed</strong> and cannot be undone.</span>
      </div>

      {/* Submit */}
      <div className="form-actions">
        <button type="submit" className="btn btn-harvest" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="btn-loading">Recording harvest...</span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <IconWheat size={18} color="currentColor" />
              <span>Record Harvest &amp; Complete Cycle</span>
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
