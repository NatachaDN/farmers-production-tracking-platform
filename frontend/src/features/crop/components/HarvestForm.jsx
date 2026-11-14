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

const QUALITY_GRADES = [
  'Grade A (Premium)',
  'Grade B (Standard)',
  'Grade C (Processing)'
];

const HARVEST_METHODS = [
  'Manual / Hand-picked',
  'Mechanical / Combine',
  'Mixed'
];

const MARKET_DESTINATIONS = [
  'Local Market',
  'Cooperative',
  'Direct Buyer',
  'Processing / Mill',
  'Home Consumption',
  'Seed Reserve'
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
    qualityGrade: '',
    harvestMethod: '',
    storageLocation: '',
    marketDestination: '',
    moistureContentPercent: '',
    postHarvestLossQuantity: '',
    estimatedRevenue: '',
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
      qualityGrade: formData.qualityGrade || null,
      harvestMethod: formData.harvestMethod || null,
      storageLocation: formData.storageLocation.trim() || null,
      marketDestination: formData.marketDestination || null,
      moistureContentPercent: formData.moistureContentPercent !== '' ? parseFloat(formData.moistureContentPercent) : null,
      postHarvestLossQuantity: formData.postHarvestLossQuantity !== '' ? parseFloat(formData.postHarvestLossQuantity) : null,
      estimatedRevenue: formData.estimatedRevenue !== '' ? parseFloat(formData.estimatedRevenue) : null,
      notes: formData.notes.trim() || null,
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

      {/* Detailed Harvest Information */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: '16px'
      }}>
        <div className="form-group">
          <label htmlFor="qualityGrade" className="form-label">Quality Grade</label>
          <select
            id="qualityGrade"
            name="qualityGrade"
            className="form-input"
            value={formData.qualityGrade}
            onChange={handleChange}
          >
            <option value="">Select quality grade...</option>
            {QUALITY_GRADES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="harvestMethod" className="form-label">Harvest Method</label>
          <select
            id="harvestMethod"
            name="harvestMethod"
            className="form-input"
            value={formData.harvestMethod}
            onChange={handleChange}
          >
            <option value="">Select harvest method...</option>
            {HARVEST_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="storageLocation" className="form-label">Storage Location</label>
          <input
            type="text"
            id="storageLocation"
            name="storageLocation"
            className="form-input"
            placeholder="e.g. Main Granary, Cold Store B"
            value={formData.storageLocation}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="marketDestination" className="form-label">Market / Destination</label>
          <select
            id="marketDestination"
            name="marketDestination"
            className="form-input"
            value={formData.marketDestination}
            onChange={handleChange}
          >
            <option value="">Select destination...</option>
            {MARKET_DESTINATIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="moistureContentPercent" className="form-label">Moisture Content (%)</label>
          <input
            type="number"
            id="moistureContentPercent"
            name="moistureContentPercent"
            min="0"
            max="100"
            step="0.1"
            className="form-input"
            placeholder="e.g. 13.5"
            value={formData.moistureContentPercent}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="postHarvestLossQuantity" className="form-label">Post-Harvest Loss ({formData.unit.toLowerCase()})</label>
          <input
            type="number"
            id="postHarvestLossQuantity"
            name="postHarvestLossQuantity"
            min="0"
            step="0.01"
            className="form-input"
            placeholder="e.g. 12"
            value={formData.postHarvestLossQuantity}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="estimatedRevenue" className="form-label">Estimated Revenue</label>
          <input
            type="number"
            id="estimatedRevenue"
            name="estimatedRevenue"
            min="0"
            step="0.01"
            className="form-input"
            placeholder="e.g. 45000"
            value={formData.estimatedRevenue}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="form-group">
        <div className="label-with-count">
          <label htmlFor="notes" className="form-label">
            Harvest Description &amp; Observations
          </label>
          <span className="char-count">{formData.notes.length}/1000</span>
        </div>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className={`form-textarea ${errors.notes ? 'input-error' : ''}`}
          placeholder="Describe harvest conditions, bagging count, grain quality, buyer notes, or weather observations..."
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
