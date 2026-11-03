import React, { useState } from 'react';
import {
  IconClose,
  IconSprout,
  IconWheat,
  IconShoppingBag,
  IconTruck,
  IconPackage
} from '../../../shared/components/Icons';

const EXPENSE_TYPES = [
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

export function AddExpenseModal({ isOpen, onClose, onAddExpense }) {
  const [form, setForm] = useState({
    description: '',
    type: 'INPUT_PURCHASE',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.description.trim()) errs.description = 'Description is required.';
    const amt = Number(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0)
      errs.amount = 'Amount must be a positive number.';
    if (!form.expenseDate) errs.expenseDate = 'Expense date is required.';
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
      await onAddExpense({
        description: form.description.trim(),
        type: form.type,
        amount: parseFloat(form.amount),
        expenseDate: form.expenseDate,
        notes: form.notes.trim() || null
      });
      setForm({
        description: '',
        type: 'INPUT_PURCHASE',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
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
        aria-labelledby="add-expense-modal-title"
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h2 id="add-expense-modal-title" style={{
              fontSize: '1.25rem', fontWeight: 700,
              color: '#19201C', marginBottom: '4px', letterSpacing: '-0.01em'
            }}>
              Record Expense
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#788680' }}>
              Track a production-related expense (input purchase, labor, transport)
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

          <FieldGroup label="Expense Type">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {EXPENSE_TYPES.map((t) => {
                const isSelected = form.type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                    style={{
                      padding: '6px 14px',
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

          <FieldGroup label="Description *" error={errors.description}>
            <StyledInput
              id="expense-description"
              value={form.description}
              onChange={set('description')}
              placeholder="e.g. Hired seasonal workers for weeding"
            />
          </FieldGroup>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FieldGroup label="Amount (XAF) *" error={errors.amount}>
              <StyledInput
                id="expense-amount"
                type="number"
                min="0.01"
                step="any"
                value={form.amount}
                onChange={set('amount')}
                placeholder="e.g. 25000"
              />
            </FieldGroup>
            <FieldGroup label="Expense Date *" error={errors.expenseDate}>
              <StyledInput
                id="expense-date"
                type="date"
                value={form.expenseDate}
                onChange={set('expenseDate')}
              />
            </FieldGroup>
          </div>

          <FieldGroup label="Notes (optional)">
            <StyledInput
              id="expense-notes"
              value={form.notes}
              onChange={set('notes')}
              placeholder="Additional details about this expense"
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
              id="submit-add-expense"
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
              {submitting ? 'Saving…' : 'Save Expense'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}
