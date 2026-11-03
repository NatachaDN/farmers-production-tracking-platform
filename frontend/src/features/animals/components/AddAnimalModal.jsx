import React, { useState } from 'react';
import {
  IconClose,
  IconLivestock
} from '../../../shared/components/Icons';

const ANIMAL_TYPES = [
  { value: 'CATTLE',   label: 'Cattle',   icon: IconLivestock, color: '#2A6740', bg: '#EAF4ED' },
  { value: 'SHEEP',    label: 'Sheep',    icon: IconLivestock, color: '#92400E', bg: '#FEF3C7' },
  { value: 'GOATS',    label: 'Goats',    icon: IconLivestock, color: '#B45309', bg: '#FDF2E8' },
  { value: 'POULTRY',  label: 'Poultry',  icon: IconLivestock, color: '#D97706', bg: '#FFFBEB' },
  { value: 'PIGS',     label: 'Pigs',     icon: IconLivestock, color: '#7C3AED', bg: '#F3E8FF' },
  { value: 'RABBITS',  label: 'Rabbits',  icon: IconLivestock, color: '#4F8A64', bg: '#ECFDF5' },
  { value: 'BEES',     label: 'Bees',     icon: IconLivestock, color: '#D97706', bg: '#FFFBEB' },
  { value: 'OTHER',    label: 'Other',    icon: IconLivestock, color: '#475569', bg: '#F1F5F9' }
];

const PRODUCTION_PURPOSES = [
  { value: 'MEAT', label: 'Meat' },
  { value: 'MILK', label: 'Milk' },
  { value: 'EGGS', label: 'Eggs' },
  { value: 'WOOL', label: 'Wool' },
  { value: 'BREEDING', label: 'Breeding' },
  { value: 'DUAL_PURPOSE', label: 'Dual Purpose' },
  { value: 'OTHER', label: 'Other' }
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

export function AddAnimalModal({ isOpen, onClose, onAddAnimal }) {
  const [form, setForm] = useState({
    type: 'CATTLE',
    purpose: 'MEAT',
    numberOfAnimals: '',
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.type) errs.type = 'Animal type is required.';
    if (!form.purpose) errs.purpose = 'Production purpose is required.';
    const count = Number(form.numberOfAnimals);
    if (!form.numberOfAnimals || isNaN(count) || count <= 0 || !Number.isInteger(count))
      errs.numberOfAnimals = 'Number of animals must be a positive whole number.';
    if (!form.startDate) errs.startDate = 'Start date is required.';
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
      await onAddAnimal({
        type: form.type,
        purpose: form.purpose,
        numberOfAnimals: parseInt(form.numberOfAnimals, 10),
        startDate: form.startDate,
        notes: form.notes.trim() || null
      });
      setForm({
        type: 'CATTLE',
        purpose: 'MEAT',
        numberOfAnimals: '',
        startDate: new Date().toISOString().split('T')[0],
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
        aria-labelledby="add-animal-modal-title"
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
            <h2 id="add-animal-modal-title" style={{
              fontSize: '1.25rem', fontWeight: 700,
              color: '#19201C', marginBottom: '4px', letterSpacing: '-0.01em'
            }}>
              Register Animal Group
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#788680' }}>
              Specify animal type, purpose, headcount, and start date
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FieldGroup label="Animal Type *" error={errors.type}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {ANIMAL_TYPES.map((t) => {
                  const isSelected = form.type === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '9999px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: isSelected ? `1.5px solid ${t.color}` : '1.5px solid #DFD8CA',
                        backgroundColor: isSelected ? t.bg : '#FFFFFF',
                        color: isSelected ? t.color : '#4B5752',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 150ms ease'
                      }}
                    >
                      <t.icon size={14} color={isSelected ? t.color : '#4B5752'} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </FieldGroup>

            <FieldGroup label="Production Purpose *" error={errors.purpose}>
              <StyledSelect id="animal-purpose" value={form.purpose} onChange={set('purpose')}>
                {PRODUCTION_PURPOSES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </StyledSelect>
            </FieldGroup>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FieldGroup label="Number of Animals *" error={errors.numberOfAnimals}>
              <StyledInput
                id="animal-count"
                type="number"
                min="1"
                step="1"
                value={form.numberOfAnimals}
                onChange={set('numberOfAnimals')}
                placeholder="e.g. 25"
              />
            </FieldGroup>
            <FieldGroup label="Start Date *" error={errors.startDate}>
              <StyledInput
                id="animal-start-date"
                type="date"
                value={form.startDate}
                onChange={set('startDate')}
              />
            </FieldGroup>
          </div>

          <FieldGroup label="Notes (optional)">
            <StyledInput
              id="animal-notes"
              value={form.notes}
              onChange={set('notes')}
              placeholder="Additional details about this animal group"
            />
            {errors.notes && (
              <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '2px' }}>
                {errors.notes}
              </span>
            )}
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
              id="submit-add-animal"
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
              {submitting ? 'Saving…' : 'Register Group'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}
