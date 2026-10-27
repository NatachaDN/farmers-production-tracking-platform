import React, { useState, useEffect } from 'react';
import './CycleInputUsageForm.css';
import {
  IconInputs,
  IconShieldAlert,
  IconWarning,
  IconCheck,
  IconSprout,
  IconClose
} from '../../../shared/components/Icons';

/**
 * CycleInputUsageForm allows a farmer to record inputs and quantity used on an active cycle.
 * Enforces Acceptance Criteria:
 * 1. Given an active cycle, when an input and a used quantity are added, Then consumption is linked
 *    and deducted from available stock.
 * 2. Given a used quantity greater than available stock, when submitted or entered,
 *    Then the system warns of insufficient stock.
 */
export function CycleInputUsageForm({
  cycle,
  availableInputs = [],
  onSubmit,
  isSubmitting = false,
  serverError = null,
  onCancel = null
}) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedInputId, setSelectedInputId] = useState('');
  const [quantityUsed, setQuantityUsed] = useState('');
  const [usageDate, setUsageDate] = useState(todayStr);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  // Reset or initialize when inputs list changes
  useEffect(() => {
    if (availableInputs.length > 0 && !selectedInputId) {
      setSelectedInputId(String(availableInputs[0].id));
    }
  }, [availableInputs, selectedInputId]);

  const selectedInput = availableInputs.find(
    (item) => String(item.id) === String(selectedInputId)
  );

  const availableStock = selectedInput ? Number(selectedInput.quantity || 0) : 0;
  const unitPrice = selectedInput ? Number(selectedInput.purchasePrice || 0) : 0;
  const unit = selectedInput ? selectedInput.unit || 'units' : '';

  const parsedQty = parseFloat(quantityUsed) || 0;
  const isInsufficientStock = selectedInput && parsedQty > availableStock;
  const isZeroOrNegative = quantityUsed !== '' && parsedQty <= 0;
  const calculatedCost = Math.round(parsedQty * unitPrice * 100) / 100;
  const remainingStockPreview = Math.round((availableStock - parsedQty) * 100) / 100;

  const isCycleActive = (cycle?.status || '').toUpperCase() === 'ACTIVE';

  const validate = () => {
    const errs = {};

    if (!isCycleActive) {
      errs.cycle = 'Input consumption can only be recorded on an ACTIVE cycle.';
    }

    if (!selectedInputId) {
      errs.inputId = 'Please select an input from inventory.';
    }

    if (!quantityUsed || quantityUsed === '') {
      errs.quantityUsed = 'Quantity used is required.';
    } else if (isNaN(parsedQty) || parsedQty <= 0) {
      errs.quantityUsed = 'Quantity used must be greater than zero.';
    } else if (isInsufficientStock) {
      errs.quantityUsed = `Insufficient stock! Available stock is ${availableStock.toFixed(2)} ${unit}, but ${parsedQty.toFixed(2)} ${unit} was entered.`;
    }

    if (!usageDate) {
      errs.usageDate = 'Application date is required.';
    } else if (usageDate > todayStr) {
      errs.usageDate = 'Application date cannot be in the future.';
    }

    if (notes && notes.length > 500) {
      errs.notes = 'Notes cannot exceed 500 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      inputId: Number(selectedInputId),
      quantityUsed: parsedQty,
      usageDate,
      notes: notes.trim() || null
    });
  };

  return (
    <form className="cycle-input-form" onSubmit={handleSubmit} id="cycle-input-usage-form">
      {/* Header */}
      <div className="form-header">
        <div className="form-header-title-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#EAF4ED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconInputs size={20} color="var(--color-brand-primary, #3E7B52)" />
            </div>
            <div>
              <h3>Record Input Consumption</h3>
              <p className="form-subtitle">
                Link used inventory to <strong>{cycle?.name || 'this cycle'}</strong> and calculate real costs.
              </p>
            </div>
          </div>

          <div>
            {isCycleActive ? (
              <span className="cycle-active-badge">
                <IconCheck size={12} /> Active Cycle
              </span>
            ) : (
              <span className="cycle-inactive-badge">
                <IconShieldAlert size={12} /> Cycle {cycle?.status || 'Inactive'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cycle Inactive Warning */}
      {!isCycleActive && (
        <div className="stock-warning-alert severe">
          <div className="stock-warning-icon">
            <IconShieldAlert size={20} />
          </div>
          <div className="stock-warning-content">
            <strong>Cycle is not ACTIVE</strong>
            Inputs and stock deductions can only be logged for actively growing production cycles.
          </div>
        </div>
      )}

      {/* Server Error Warning (Acceptance Criterion 2: Server warning on insufficient stock) */}
      {serverError && (
        <div className="stock-warning-alert severe" id="insufficient-stock-server-warning">
          <div className="stock-warning-icon">
            <IconWarning size={20} color="#DC2626" />
          </div>
          <div className="stock-warning-content">
            <strong>Stock Deduction Notice</strong>
            {serverError}
          </div>
        </div>
      )}

      {/* Client-side Insufficient Stock Warning */}
      {isInsufficientStock && (
        <div className="stock-warning-alert" id="insufficient-stock-live-warning">
          <div className="stock-warning-icon">
            <IconWarning size={20} color="#D97706" />
          </div>
          <div className="stock-warning-content">
            <strong>Insufficient Stock Warning</strong>
            Available stock for <strong>{selectedInput?.name}</strong> is <strong>{availableStock.toFixed(2)} {unit}</strong>, but you requested <strong>{parsedQty.toFixed(2)} {unit}</strong>. Please adjust the quantity or replenish inventory.
          </div>
        </div>
      )}

      {/* Farm Input Selector */}
      <div className="form-group">
        <label htmlFor="farm-input-select" className="form-label">
          <span>Select Input from Inventory <span className="required">*</span></span>
          {selectedInput && (
            <span className={`label-stock-hint ${availableStock <= 0 ? 'out-of-stock' : ''}`}>
              Stock available: {availableStock.toFixed(2)} {unit}
            </span>
          )}
        </label>

        {availableInputs.length === 0 ? (
          <div style={{
            padding: '16px',
            backgroundColor: '#FEF3C7',
            borderRadius: '10px',
            fontSize: '0.875rem',
            color: '#92400E'
          }}>
            No farm inputs found in your inventory. Please register items in Farm Inputs first.
          </div>
        ) : (
          <select
            id="farm-input-select"
            className={`form-select ${errors.inputId ? 'has-error' : ''}`}
            value={selectedInputId}
            onChange={(e) => {
              setSelectedInputId(e.target.value);
              if (errors.inputId) setErrors((prev) => ({ ...prev, inputId: null }));
            }}
            disabled={!isCycleActive || isSubmitting}
          >
            {availableInputs.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.type}) — Stock: {Number(item.quantity || 0).toFixed(2)} {item.unit} · KES {Number(item.purchasePrice || 0).toFixed(2)}/{item.unit}
              </option>
            ))}
          </select>
        )}
        {errors.inputId && <p className="error-text">{errors.inputId}</p>}
      </div>

      {/* Selected Input Preview Card */}
      {selectedInput && (
        <div className="selected-input-card">
          <div className="selected-input-info">
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border-subtle, #ECE7DC)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconSprout size={16} color="var(--color-brand-primary, #3E7B52)" />
            </div>
            <div>
              <div className="selected-input-name">{selectedInput.name}</div>
              <div className="selected-input-meta">Category: {selectedInput.type}</div>
            </div>
          </div>

          <div className="stock-pills">
            <span className="pill-stock available">
              Available: {availableStock.toFixed(2)} {unit}
            </span>
            <span className="pill-price">
              Price: KES {unitPrice.toFixed(2)} / {unit}
            </span>
          </div>
        </div>
      )}

      {/* Quantity Used Field */}
      <div className="form-group">
        <label htmlFor="quantity-used-input" className="form-label">
          <span>Quantity Used on this Cycle <span className="required">*</span></span>
        </label>

        <div className="input-with-addon">
          <input
            id="quantity-used-input"
            type="number"
            step="0.01"
            min="0.01"
            max={availableStock > 0 ? availableStock * 2 : 100000}
            className={`form-input ${errors.quantityUsed || isInsufficientStock ? 'has-error' : ''}`}
            placeholder={`e.g. 50`}
            value={quantityUsed}
            onChange={(e) => {
              setQuantityUsed(e.target.value);
              if (errors.quantityUsed) setErrors((prev) => ({ ...prev, quantityUsed: null }));
            }}
            disabled={!isCycleActive || isSubmitting || availableInputs.length === 0}
          />
          <div className="input-addon">{unit || 'kg'}</div>
        </div>
        {errors.quantityUsed && <p className="error-text">{errors.quantityUsed}</p>}
        {isZeroOrNegative && (
          <p className="error-text">Quantity must be greater than 0.</p>
        )}
      </div>

      {/* Real Financial Cost & Remaining Stock Calculation Preview */}
      {selectedInput && parsedQty > 0 && (
        <div className="calculation-preview-card" id="cycle-input-calculation-preview">
          <div>
            <div className="calc-stat-label">Calculated Real Cost</div>
            <div className="calc-stat-value">
              KES {calculatedCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="calc-stat-subtext">
              {parsedQty} {unit} × KES {unitPrice.toFixed(2)} / {unit}
            </div>
          </div>

          <div>
            <div className="calc-stat-label">Stock After Deduction</div>
            <div
              className="calc-stat-value"
              style={{ color: remainingStockPreview < 0 ? '#DC2626' : '#2A6740' }}
            >
              {remainingStockPreview.toFixed(2)} {unit}
            </div>
            <div className={`calc-stat-subtext ${remainingStockPreview < 0 ? 'warning' : ''}`}>
              {remainingStockPreview < 0
                ? '⚠️ Deficit of ' + Math.abs(remainingStockPreview).toFixed(2) + ' ' + unit
                : 'Will remain in available inventory'}
            </div>
          </div>
        </div>
      )}

      {/* Application Date & Notes (2 Columns on Desktop) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="form-group">
          <label htmlFor="usage-date-input" className="form-label">
            Application Date <span className="required">*</span>
          </label>
          <input
            id="usage-date-input"
            type="date"
            max={todayStr}
            className={`form-input ${errors.usageDate ? 'has-error' : ''}`}
            value={usageDate}
            onChange={(e) => {
              setUsageDate(e.target.value);
              if (errors.usageDate) setErrors((prev) => ({ ...prev, usageDate: null }));
            }}
            disabled={!isCycleActive || isSubmitting}
          />
          {errors.usageDate && <p className="error-text">{errors.usageDate}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="usage-notes-input" className="form-label">
            Notes / Application Method (Optional)
          </label>
          <input
            id="usage-notes-input"
            type="text"
            maxLength="500"
            className="form-input"
            placeholder="e.g. Applied at root zone during morning irrigation"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={!isCycleActive || isSubmitting}
          />
          {errors.notes && <p className="error-text">{errors.notes}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          className="btn-primary-record"
          id="btn-submit-cycle-input"
          disabled={!isCycleActive || isSubmitting || availableInputs.length === 0 || isInsufficientStock || isZeroOrNegative}
        >
          {isSubmitting ? (
            <>Processing Deduction...</>
          ) : (
            <>
              <IconCheck size={16} />
              <span>Record & Deduct Stock</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
