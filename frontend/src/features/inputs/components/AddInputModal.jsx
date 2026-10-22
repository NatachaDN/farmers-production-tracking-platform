import React, { useState } from 'react';
import {
  IconClose,
  IconSprout,
  IconFlask,
  IconShieldAlert,
  IconPackage
} from '../../../shared/components/Icons';

const INPUT_TYPES = ['SEEDS', 'FERTILIZER', 'PESTICIDE', 'OTHER'];
const UNITS = ['kg', 'g', 'L', 'mL', 'bag', 'ton', 'unit'];

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

export function AddInputModal({ isOpen, onClose, onAddInput }) {
  const [form, setForm] = useState({
    name: '',
    type: 'SEEDS',
    quantity: '',
    unit: 'kg',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Input name is required.';
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0)
      errs.quantity = 'Quantity must be a positive number.';
    if (!form.purchasePrice || isNaN(Number(form.purchasePrice)) || Number(form.purchasePrice) < 0)
      errs.purchasePrice = 'Price must be a non-negative number.';
    if (!form.purchaseDate) errs.purchaseDate = 'Purchase date is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    setErrors({});
    try {
      await onAddInput({
        name: form.name.trim(),
        type: form.type,
        quantity: parseFloat(form.quantity),
        unit: form.unit,
        purchaseDate: form.purchaseDate,
        purchasePrice: parseFloat(form.purchasePrice)
      });
      setForm({
        name: '',
        type: 'SEEDS',
        quantity: '',
        unit: 'kg',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: ''
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const typeConfig = {
    SEEDS: { bg: '#EAF4ED', text: '#2A6740', icon: IconSprout },
    FERTILIZER: { bg: '#FEF3C7', text: '#92400E', icon: IconFlask },
    PESTICIDE: { bg: '#FEE2E2', text: '#991B1B', icon: IconShieldAlert },
    OTHER: { bg: '#F1F5F9', text: '#475569', icon: IconPackage }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(22, 66, 48, 0.35)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-labelledby="add-input-modal-title"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '32px',
          width: '520px',
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 1001,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.18)',
          border: '1px solid #ECE7DC'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h2 id="add-input-modal-title" style={{
              fontSize: '1.25rem', fontWeight: 700,
              color: '#19201C', marginBottom: '4px', letterSpacing: '-0.01em'
            }}>
              Register Farm Input
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#788680' }}>
              Add seeds, fertilizer, or pesticide to your inventory
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

          {/* Input Type selector */}
          <FieldGroup label="Input Type">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {INPUT_TYPES.map((t) => {
                const conf = typeConfig[t];
                const IconComponent = conf.icon;
                const isSelected = form.type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isSelected ? `1.5px solid ${conf.text}` : '1.5px solid #DFD8CA',
                      backgroundColor: isSelected ? conf.bg : '#FFFFFF',
                      color: isSelected ? conf.text : '#4B5752',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 150ms ease'
                    }}
                  >
                    <IconComponent size={14} color={isSelected ? conf.text : '#4B5752'} />
                    <span>{t}</span>
                  </button>
                );
              })}
            </div>
          </FieldGroup>

          {/* Name */}
          <FieldGroup label="Input Name *" error={errors.name}>
            <StyledInput
              id="input-name"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Hybrid Maize Seed 614D"
            />
          </FieldGroup>

          {/* Quantity & Unit */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <FieldGroup label="Quantity *" error={errors.quantity}>
              <StyledInput
                id="input-quantity"
                type="number"
                min="0.01"
                step="any"
                value={form.quantity}
                onChange={set('quantity')}
                placeholder="e.g. 50"
              />
            </FieldGroup>
            <FieldGroup label="Unit">
              <StyledSelect id="input-unit" value={form.unit} onChange={set('unit')}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </StyledSelect>
            </FieldGroup>
          </div>

          {/* Price & Purchase Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FieldGroup label="Total Cost (XAF) *" error={errors.purchasePrice}>
              <StyledInput
                id="input-price"
                type="number"
                min="0"
                step="any"
                value={form.purchasePrice}
                onChange={set('purchasePrice')}
                placeholder="e.g. 25000"
              />
            </FieldGroup>
            <FieldGroup label="Purchase Date *" error={errors.purchaseDate}>
              <StyledInput
                id="input-date"
                type="date"
                value={form.purchaseDate}
                onChange={set('purchaseDate')}
              />
            </FieldGroup>
          </div>

          {/* Actions */}
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
              id="submit-add-input"
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
              {submitting ? 'Saving…' : 'Save Input'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}
