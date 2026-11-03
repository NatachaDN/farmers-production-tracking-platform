import React, { useState, useEffect, useMemo } from 'react';
import {
  IconClose,
  IconInputs,
  IconPlus,
  IconWarning,
  IconCheck,
  IconPackage,
  IconScale,
  IconCalendar,
  IconTrash
} from '../../../shared/components/Icons';
import { inputService } from '../../inputs/services/inputService';
import { cycleInputService } from '../services/cycleInputService';

const INPUT_TYPE_LABELS = {
  SEEDS: 'Seeds',
  FERTILIZER: 'Fertilizer',
  PESTICIDE: 'Pesticide',
  OTHER: 'Other'
};

const INPUT_TYPE_COLORS = {
  SEEDS: { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534' },
  FERTILIZER: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
  PESTICIDE: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
  OTHER: { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569' }
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

function formatCurrency(val) {
  if (val == null || isNaN(val)) return '—';
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
}

export function RecordCycleInputModal({ isOpen, onClose, farmerId, cycleId, cycleName, onInputRecorded }) {
  // --- State ---
  const [availableInputs, setAvailableInputs] = useState([]);
  const [usages, setUsages] = useState([]);
  const [costSummary, setCostSummary] = useState(null);
  const [loadingInputs, setLoadingInputs] = useState(false);
  const [loadingUsages, setLoadingUsages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form fields
  const [selectedInputId, setSelectedInputId] = useState('');
  const [quantityUsed, setQuantityUsed] = useState('');
  const [usageDate, setUsageDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // --- Load data on open ---
  useEffect(() => {
    if (isOpen && farmerId) {
      loadAvailableInputs();
      loadUsages();
    }
  }, [isOpen, farmerId, cycleId]);

  const loadAvailableInputs = async () => {
    setLoadingInputs(true);
    try {
      const data = await inputService.getInputs(farmerId);
      setAvailableInputs(data || []);
    } catch (err) {
      console.warn('Failed to load available inputs:', err);
      setAvailableInputs([]);
    } finally {
      setLoadingInputs(false);
    }
  };

  const loadUsages = async () => {
    setLoadingUsages(true);
    try {
      const [usageData, summaryData] = await Promise.all([
        cycleInputService.getInputsByCycle(farmerId, cycleId),
        cycleInputService.getCostSummary(farmerId, cycleId)
      ]);
      setUsages(usageData || []);
      setCostSummary(summaryData || null);
    } catch (err) {
      console.warn('Failed to load cycle inputs:', err);
      setUsages([]);
      setCostSummary(null);
    } finally {
      setLoadingUsages(false);
    }
  };

  // --- Derived: selected input object ---
  const selectedInput = useMemo(() => {
    if (!selectedInputId) return null;
    return availableInputs.find(i => String(i.id) === String(selectedInputId)) || null;
  }, [selectedInputId, availableInputs]);

  // --- Derived: stock warning ---
  const qty = parseFloat(quantityUsed) || 0;
  const stockAvailable = selectedInput ? (selectedInput.quantity || 0) : 0;
  const isOverStock = qty > 0 && selectedInput && qty > stockAvailable;
  const estimatedCost = selectedInput ? qty * (selectedInput.purchasePrice || 0) : 0;

  // --- Handlers ---
  const resetForm = () => {
    setSelectedInputId('');
    setQuantityUsed('');
    setUsageDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!selectedInputId || qty <= 0) {
      setError('Please select an input and enter a valid quantity.');
      return;
    }

    if (isOverStock) {
      setError(`Insufficient stock! Only ${stockAvailable.toFixed(2)} ${selectedInput.unit || 'units'} available for "${selectedInput.name}".`);
      return;
    }

    setSubmitting(true);
    try {
      await cycleInputService.recordInputUsage(farmerId, cycleId, {
        inputId: Number(selectedInputId),
        quantityUsed: qty,
        usageDate: usageDate || null,
        notes: notes.trim() || null
      });
      setSuccessMsg(`${qty} ${selectedInput?.unit || 'units'} of "${selectedInput?.name}" recorded successfully.`);
      resetForm();
      // Reload both lists to reflect stock changes
      await Promise.all([loadAvailableInputs(), loadUsages()]);
      if (onInputRecorded) onInputRecorded();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err.message || 'Failed to record input usage. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUsage = async (usageId) => {
    setDeletingId(usageId);
    try {
      await cycleInputService.deleteInputUsage(farmerId, cycleId, usageId);
      await Promise.all([loadAvailableInputs(), loadUsages()]);
      if (onInputRecorded) onInputRecorded();
    } catch (err) {
      setError(err.message || 'Failed to remove input record.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(19, 32, 28, 0.48)',
      backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1200, padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 24px 48px rgba(22, 66, 48, 0.18)',
        width: '100%', maxWidth: '720px', maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid #ECE7DC',
        display: 'flex', flexDirection: 'column'
      }}>

        {/* ─── Modal Header ─── */}
        <div style={{
          padding: '22px 28px',
          backgroundColor: '#164230', color: '#FFFFFF',
          borderTopLeftRadius: '16px', borderTopRightRadius: '16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <IconInputs size={24} color="#3E7B52" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                Record Input Usage
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#D1E5D9', marginTop: '4px', margin: 0 }}>
                {cycleName || 'Production Cycle'} · Track inputs consumed & real costs
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            padding: '6px', borderRadius: '8px', color: '#D1E5D9',
            border: 'none', backgroundColor: 'rgba(255,255,255,0.1)', cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
          >
            <IconClose size={20} color="#FFFFFF" />
          </button>
        </div>

        {/* ─── Modal Body ─── */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

          {/* ━━ Error Banner ━━ */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px', borderRadius: '10px',
              backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
              fontSize: '0.8125rem', color: '#991B1B',
              animation: 'fadeIn 0.2s ease'
            }}>
              <IconWarning size={18} color="#DC2626" />
              <span>{error}</span>
              <button onClick={() => setError(null)} style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                cursor: 'pointer', padding: '2px'
              }}>
                <IconClose size={14} color="#991B1B" />
              </button>
            </div>
          )}

          {/* ━━ Success Banner ━━ */}
          {successMsg && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px', borderRadius: '10px',
              backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0',
              fontSize: '0.8125rem', color: '#166534',
              animation: 'fadeIn 0.2s ease'
            }}>
              <IconCheck size={18} color="#16A34A" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ━━━━━━━━ RECORD INPUT FORM ━━━━━━━━ */}
          <form onSubmit={handleSubmit} style={{
            backgroundColor: '#F9F6F0', border: '1px solid #ECE7DC',
            borderRadius: '12px', padding: '20px',
            display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <h4 style={{
              fontSize: '0.9375rem', fontWeight: 600,
              color: 'var(--color-text-primary)', margin: 0,
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <IconPlus size={16} color="var(--color-brand-primary)" />
              <span>Add Input Consumption</span>
            </h4>

            {/* Row 1: Input Selector + Quantity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* Input Selector */}
              <div>
                <label style={labelStyle}>Select Input from Inventory</label>
                <select
                  id="cycle-input-select"
                  value={selectedInputId}
                  onChange={(e) => { setSelectedInputId(e.target.value); setError(null); }}
                  style={selectStyle}
                  disabled={loadingInputs}
                >
                  <option value="">— Choose an input —</option>
                  {availableInputs.map(inp => (
                    <option key={inp.id} value={inp.id}>
                      {inp.name} ({INPUT_TYPE_LABELS[inp.type] || inp.type}) — {inp.quantity?.toFixed(1)} {inp.unit} in stock
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Used */}
              <div>
                <label style={labelStyle}>Quantity Used {selectedInput ? `(${selectedInput.unit || 'units'})` : ''}</label>
                <input
                  id="cycle-input-quantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={quantityUsed}
                  onChange={(e) => { setQuantityUsed(e.target.value); setError(null); }}
                  placeholder={selectedInput ? `Max: ${stockAvailable.toFixed(2)}` : '0.00'}
                  style={{
                    ...inputStyle,
                    borderColor: isOverStock ? '#DC2626' : '#DFD8CA'
                  }}
                />
              </div>
            </div>

            {/* ━━ Stock Warning ━━ */}
            {isOverStock && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 14px', borderRadius: '8px',
                backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
                fontSize: '0.8125rem', color: '#991B1B',
                animation: 'fadeIn 0.2s ease'
              }}>
                <IconWarning size={16} color="#DC2626" />
                <span>
                  <strong>Insufficient stock!</strong> Only <strong>{stockAvailable.toFixed(2)} {selectedInput?.unit || ''}</strong> available.
                  You requested <strong>{qty.toFixed(2)}</strong>.
                </span>
              </div>
            )}

            {/* ━━ Live Cost Preview ━━ */}
            {selectedInput && qty > 0 && !isOverStock && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: '8px',
                backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0',
                fontSize: '0.8125rem', color: '#166534'
              }}>
                <IconScale size={16} color="#16A34A" />
                <span>
                  Estimated cost: <strong>{formatCurrency(estimatedCost)}</strong>
                  {' '}({qty.toFixed(2)} × {formatCurrency(selectedInput.purchasePrice || 0)} per {selectedInput.unit || 'unit'})
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#788680' }}>
                  Remaining stock: {(stockAvailable - qty).toFixed(2)} {selectedInput.unit || ''}
                </span>
              </div>
            )}

            {/* Row 2: Usage Date + Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Application Date</label>
                <input
                  id="cycle-input-date"
                  type="date"
                  value={usageDate}
                  onChange={(e) => setUsageDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Notes (optional)</label>
                <input
                  id="cycle-input-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Top-dressing at vegetative stage"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="cycle-input-submit"
              disabled={submitting || !selectedInputId || qty <= 0 || isOverStock}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '11px 22px', borderRadius: '10px',
                backgroundColor: (submitting || !selectedInputId || qty <= 0 || isOverStock)
                  ? '#A8C4B5' : 'var(--color-brand-primary, #164230)',
                color: '#FFFFFF', fontWeight: 600, fontSize: '0.875rem',
                border: 'none',
                cursor: (submitting || !selectedInputId || qty <= 0 || isOverStock) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease', alignSelf: 'flex-start'
              }}
            >
              {submitting ? (
                <>
                  <span style={{
                    width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#FFFFFF', borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite'
                  }} />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <IconPlus size={16} />
                  <span>Record Input Usage</span>
                </>
              )}
            </button>
          </form>

          {/* ━━━━━━━━ COST SUMMARY STRIP ━━━━━━━━ */}
          {costSummary && costSummary.totalInputCost > 0 && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '14px'
            }}>
              <SummaryCard
                label="Total Input Cost"
                value={formatCurrency(costSummary.totalInputCost)}
                accent="#164230"
              />
              <SummaryCard
                label="Input Applications"
                value={String(costSummary.inputCount || 0)}
                accent="var(--color-brand-primary)"
              />
              {costSummary.costByType && Object.entries(costSummary.costByType).map(([type, cost]) => (
                <SummaryCard
                  key={type}
                  label={INPUT_TYPE_LABELS[type] || type}
                  value={formatCurrency(cost)}
                  accent={INPUT_TYPE_COLORS[type]?.text || '#475569'}
                />
              ))}
            </div>
          )}

          {/* ━━━━━━━━ RECORDED INPUTS TABLE ━━━━━━━━ */}
          <div>
            <h4 style={{
              fontSize: '0.9375rem', fontWeight: 600,
              color: 'var(--color-text-primary)', marginBottom: '12px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <IconPackage size={16} color="var(--color-brand-primary)" />
              <span>Inputs Consumed on This Cycle</span>
              {usages.length > 0 && (
                <span style={{
                  fontSize: '0.75rem', fontWeight: 500, backgroundColor: '#EAF4ED',
                  color: '#164230', padding: '2px 8px', borderRadius: '9999px'
                }}>
                  {usages.length}
                </span>
              )}
            </h4>

            {loadingUsages ? (
              <div style={{
                padding: '24px', textAlign: 'center', fontSize: '0.875rem',
                color: 'var(--color-text-muted)'
              }}>
                Loading consumption records...
              </div>
            ) : usages.length === 0 ? (
              <div style={{
                padding: '28px 20px', textAlign: 'center',
                backgroundColor: '#F9F6F0', border: '1px solid #ECE7DC',
                borderRadius: '12px'
              }}>
                <IconInputs size={28} color="#A8C4B5" />
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '8px', marginBottom: 0 }}>
                  No inputs recorded yet. Use the form above to track your first input consumption.
                </p>
              </div>
            ) : (
              <div style={{
                border: '1px solid #ECE7DC', borderRadius: '12px',
                overflow: 'hidden'
              }}>
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.8fr 0.9fr 0.9fr 1fr 0.9fr 44px',
                  gap: '0',
                  padding: '10px 16px',
                  backgroundColor: '#F4EFE6',
                  fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--color-text-muted)'
                }}>
                  <span>Input</span>
                  <span>Qty Used</span>
                  <span>Unit Price</span>
                  <span>Total Cost</span>
                  <span>Date</span>
                  <span></span>
                </div>

                {/* Table Rows */}
                {usages.map((u, i) => {
                  const typeColors = INPUT_TYPE_COLORS[u.inputType] || INPUT_TYPE_COLORS.OTHER;
                  return (
                    <div
                      key={u.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.8fr 0.9fr 0.9fr 1fr 0.9fr 44px',
                        gap: '0',
                        padding: '12px 16px',
                        backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FDFBF7',
                        borderTop: '1px solid #F4EFE6',
                        alignItems: 'center',
                        fontSize: '0.8125rem',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9F6F0'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#FFFFFF' : '#FDFBF7'}
                    >
                      {/* Input name + type badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {u.inputName}
                        </span>
                        <span style={{
                          fontSize: '0.625rem', fontWeight: 600,
                          padding: '2px 6px', borderRadius: '4px',
                          backgroundColor: typeColors.bg,
                          color: typeColors.text,
                          border: `1px solid ${typeColors.border}`,
                          textTransform: 'uppercase', letterSpacing: '0.03em'
                        }}>
                          {INPUT_TYPE_LABELS[u.inputType] || u.inputType}
                        </span>
                      </div>

                      {/* Qty */}
                      <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                        {u.quantityUsed?.toFixed(2)} {u.unit || ''}
                      </span>

                      {/* Unit Price */}
                      <span style={{ color: 'var(--color-text-muted)' }}>
                        {formatCurrency(u.unitPrice)}
                      </span>

                      {/* Total Cost */}
                      <span style={{ fontWeight: 600, color: '#164230' }}>
                        {formatCurrency(u.totalCost)}
                      </span>

                      {/* Date */}
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                        {formatDate(u.usageDate)}
                      </span>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteUsage(u.id)}
                        disabled={deletingId === u.id}
                        title="Remove and restore stock"
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: '1px solid #F4EFE6',
                          backgroundColor: deletingId === u.id ? '#FEE2E2' : 'transparent',
                          cursor: deletingId === u.id ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => { if (deletingId !== u.id) { e.currentTarget.style.backgroundColor = '#FEE2E2'; e.currentTarget.style.borderColor = '#FECACA'; } }}
                        onMouseLeave={(e) => { if (deletingId !== u.id) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#F4EFE6'; } }}
                      >
                        {deletingId === u.id ? (
                          <span style={{
                            width: '14px', height: '14px', border: '2px solid #DC2626',
                            borderTopColor: 'transparent', borderRadius: '50%',
                            animation: 'spin 0.6s linear infinite'
                          }} />
                        ) : (
                          <IconTrash size={14} color="#DC2626" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ━━ Modal Footer ━━ */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end',
            paddingTop: '16px', borderTop: '1px solid #F4EFE6'
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 22px', borderRadius: '10px',
                backgroundColor: 'var(--color-brand-primary)',
                color: '#FFFFFF', border: 'none',
                fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe for spinner */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

/* ──────── Reusable sub-components & style constants ──────── */

function SummaryCard({ label, value, accent }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #ECE7DC',
      borderRadius: '10px',
      padding: '14px 16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}>
      <div style={{
        fontSize: '0.7rem', color: 'var(--color-text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px'
      }}>
        {label}
      </div>
      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: accent }}>
        {value}
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  marginBottom: '6px'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #DFD8CA',
  fontSize: '0.875rem',
  color: 'var(--color-text-primary)',
  backgroundColor: '#FFFFFF',
  transition: 'border-color 0.2s ease',
  outline: 'none',
  boxSizing: 'border-box'
};

const selectStyle = {
  ...inputStyle,
  appearance: 'auto',
  cursor: 'pointer'
};
