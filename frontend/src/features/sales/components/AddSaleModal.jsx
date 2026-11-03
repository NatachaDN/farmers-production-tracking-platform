import React, { useState } from 'react';
import {
  IconClose,
  IconShoppingBag,
  IconWheat,
  IconTruck,
  IconPackage
} from '../../../shared/components/Icons';

const SALE_TYPES = [
  { value: 'INPUT_PURCHASE', label: 'Input Purchase', icon: IconShoppingBag, color: '#2A6740', bg: '#EAF4ED' },
  { value: 'LABOR', label: 'Labor', icon: IconWheat, color: '#92400E', bg: '#FEF3C7' },
  { value: 'TRANSPORT', label: 'Transport', icon: IconTruck, color: '#3A86C8', bg: '#EBF3FA' },
  { value: 'OTHER', label: 'Other', icon: IconPackage, color: '#475569', bg: '#F1F5F9' }
];

function FieldGroup({ label, children, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: '#4B5752',
        letterSpacing: '0.01em'
      }}>
        {label}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '2px' }}>
          {error}
        </span>
      )}
    </div>
  );
}

function StyledInput({ id, type = 'text', value, onChange, placeholder, min, step }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      step={step}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%',
        padding: '10px 14px',
        border: focused ? '1.5px solid #3E7B52' : '1px solid #DFD8CA',
        borderRadius: '10px',
        fontSize: '0.9375rem',
        color: '#19201C',
        backgroundColor: '#FFFFFF',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        boxShadow: focused ? '0 0 0 3px rgba(62, 123, 82, 0.15)' : 'none'
      }}
    />
  );
}

function StyledSelect({ id, value, onChange, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%',
        padding: '10px 14px',
        border: focused ? '1.5px solid #3E7B52' : '1px solid #DFD8CA',
        borderRadius: '10px',
        fontSize: '0.9375rem',
        color: '#19201C',
        backgroundColor: '#FFFFFF',
        outline: 'none',
        boxSizing: 'border-box',
        appearance: 'none',
        cursor: 'pointer',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        boxShadow: focused ? '0 0 0 3px rgba(62, 123, 82, 0.15)' : 'none'
      }}
    >
      {children}
    </select>
  );
}

export function AddSaleModal({ isOpen, onClose, onAddSale, cycles = [], selectedCycleId = null }) {
  const [form, setForm] = useState({
    cycleId: selectedCycleId || '',
    harvestId: '',
    quantitySold: '',
    unit: 'kg',
    pricePerUnit: '',
    buyer: '',
    saleDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.cycleId) errs.cycleId = 'Please select a production cycle.';
    const qty = Number(form.quantitySold);
    if (!form.quantitySold || isNaN(qty) || qty <= 0)
      errs.quantitySold = 'Quantity sold must be a positive number.';
    if (!form.unit) errs.unit = 'Unit is required.';
    const price = Number(form.pricePerUnit);
    if (!form.pricePerUnit || isNaN(price) || price <= 0)
      errs.pricePerUnit = 'Price per unit must be a positive number.';
    if (!form.buyer.trim()) errs.buyer = 'Buyer is required.';
    if (!form.saleDate) errs.saleDate = 'Sale date is required.';
    if (form.notes && form.notes.length > 1000)
      errs.notes = 'Notes must not exceed 1000 characters.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    setErrors({});
    try {
      await onAddSale({
        cycleId: parseInt(form.cycleId, 10),
        harvestId: form.harvestId ? parseInt(form.harvestId, 10) : null,
        quantitySold: parseFloat(form.quantitySold),
        unit: form.unit,
        pricePerUnit: parseFloat(form.pricePerUnit),
        buyer: form.buyer.trim(),
        saleDate: form.saleDate,
        notes: form.notes.trim() || null
      });
      setForm({
        cycleId: selectedCycleId || '',
        harvestId: '',
        quantitySold: '',
        unit: 'kg',
        pricePerUnit: '',
        buyer: '',
        saleDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(22, 66, 48, 0.35)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000
        }}
      />

      <div
        role="dialog"
        aria-labelledby="add-sale-modal-title"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '32px',
          width: '560px',
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 1001,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.18)',
          border: '1px solid #ECE7DC'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h2 id="add-sale-modal-title" style={{
              fontSize: '1.25rem', fontWeight: 700,
              color: '#19201C', marginBottom: '4px', letterSpacing: '-0.01em'
            }}>
              Record Sale
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#788680' }}>
              Record a harvest sale to track revenue and cycle margin
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              border: '1px solid #ECE7DC', backgroundColor: '#FFFFFF',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#788680',
              transition: 'background-color 150ms ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4EFE6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            <IconClose size={16} color="#788680" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <FieldGroup label="Production Cycle *" error={errors.cycleId}>
            <StyledSelect id="sale-cycle" value={form.cycleId} onChange={set('cycleId')}>
              <option value="">Select a cycle</option>
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.cropName || 'Crop'} · {c.plotName || 'Plot'} ({c.status || 'Active'})
                </option>
              ))}
            </StyledSelect>
          </FieldGroup>

          <FieldGroup label="Harvest ID (optional)">
            <StyledInput
              id="sale-harvest-id"
              type="number"
              value={form.harvestId}
              onChange={set('harvestId')}
              placeholder="e.g. 1"
            />
          </FieldGroup>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FieldGroup label="Quantity Sold *" error={errors.quantitySold}>
              <StyledInput
                id="sale-quantity"
                type="number"
                min="0.01"
                step="any"
                value={form.quantitySold}
                onChange={set('quantitySold')}
                placeholder="e.g. 1200"
              />
            </FieldGroup>
            <FieldGroup label="Unit *" error={errors.unit}>
              <StyledSelect id="sale-unit" value={form.unit} onChange={set('unit')}>
                <option value="kg">kg</option>
                <option value="tons">tons</option>
                <option value="bags">bags</option>
                <option value="unit">unit</option>
                <option value="L">L</option>
              </StyledSelect>
            </FieldGroup>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FieldGroup label="Price per Unit (XAF) *" error={errors.pricePerUnit}>
              <StyledInput
                id="sale-price"
                type="number"
                min="0.01"
                step="any"
                value={form.pricePerUnit}
                onChange={set('pricePerUnit')}
                placeholder="e.g. 450"
              />
            </FieldGroup>
            <FieldGroup label="Buyer *" error={errors.buyer}>
              <StyledInput
                id="sale-buyer"
                value={form.buyer}
                onChange={set('buyer')}
                placeholder="e.g. Local Cooperative"
              />
            </FieldGroup>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FieldGroup label="Sale Date *" error={errors.saleDate}>
              <StyledInput
                id="sale-date"
                type="date"
                value={form.saleDate}
                onChange={set('saleDate')}
              />
            </FieldGroup>
            <FieldGroup label="Revenue (auto)">
              <div style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                backgroundColor: '#F4EFE6', border: '1px solid #DFD8CA',
                fontSize: '0.9375rem', color: '#19201C', fontWeight: 600
              }}>
                {form.quantitySold && form.pricePerUnit && !isNaN(Number(form.quantitySold)) && !isNaN(Number(form.pricePerUnit))
                  ? (Number(form.quantitySold) * Number(form.pricePerUnit)).toLocaleString('fr-CM') + ' XAF'
                  : '—'}
              </div>
            </FieldGroup>
          </div>

          <FieldGroup label="Notes (optional)">
            <StyledInput
              id="sale-notes"
              value={form.notes}
              onChange={set('notes')}
              placeholder="Additional details about this sale"
            />
          </FieldGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px', borderRadius: '10px',
                border: '1px solid #DFD8CA', backgroundColor: '#FFFFFF',
                color: '#4B5752', fontSize: '0.875rem', fontWeight: 600,
                cursor: 'pointer', transition: 'background-color 150ms ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4EFE6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-add-sale"
              disabled={submitting}
              style={{
                padding: '10px 24px', borderRadius: '10px',
                border: 'none', backgroundColor: '#3E7B52',
                color: '#FFFFFF', fontSize: '0.875rem', fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                boxShadow: '0 2px 6px rgba(62,123,82,0.3)',
                transition: 'background-color 150ms ease'
              }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#336844'; }}
              onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#3E7B52'; }}
            >
              {submitting ? 'Saving…' : 'Save Sale'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}
