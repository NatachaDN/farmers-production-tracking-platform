import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export function UnitCostConfirmation({ name, quantity, unit, historical = false, onConfirm, onConfirmed }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const input = useRef(null);
  const trigger = useRef(null);
  const titleId = useId();
  const inputId = useId();
  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const escape = (e) => { if (e.key === 'Escape' && !saving) { setOpen(false); trigger.current?.focus(); } };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [open, saving]);
  const close = () => { if (!saving) { setOpen(false); trigger.current?.focus(); } };
  const submit = async (e) => {
    e.preventDefault();
    const price = Number(value);
    if (value.trim() === '' || !Number.isFinite(price) || price < 0) { setError('Enter a finite, non-negative unit cost.'); return; }
    setSaving(true); setError('');
    try { await onConfirm(price); await onConfirmed?.(); setOpen(false); trigger.current?.focus(); }
    catch (err) { setError(err.message || 'Could not confirm this cost.'); }
    finally { setSaving(false); }
  };
  const button = { padding: '8px 12px', borderRadius: '10px', border: '1px solid #C8E2D0', background: '#EAF4ED', color: '#164230', cursor: 'pointer' };
  return <>
    <button type="button" ref={trigger} style={button} onClick={() => { setValue(''); setError(''); setOpen(true); }}>Confirm unit cost</button>
    {open && createPortal(<div style={{ position: 'fixed', inset: 0, background: 'rgba(19,32,28,.48)', zIndex: 1500, display: 'grid', placeItems: 'center', padding: '20px' }}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} style={{ background: '#FFF', border: '1px solid #ECE7DC', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '440px' }}
        onKeyDown={(e) => {
          if (e.key !== 'Tab') return;
          const controls = [...e.currentTarget.querySelectorAll('input,button')].filter(el => !el.disabled);
          if (e.shiftKey && document.activeElement === controls[0]) { e.preventDefault(); controls.at(-1)?.focus(); }
          if (!e.shiftKey && document.activeElement === controls.at(-1)) { e.preventDefault(); controls[0]?.focus(); }
        }}>
        <h2 id={titleId} style={{ color: '#164230', marginBottom: '12px' }}>Confirm unit cost</h2>
        <p>{name} · {quantity} {unit} {historical ? 'used' : 'in stock'}</p>
        <p style={{ margin: '12px 0', color: '#4B5752' }}>The recorded cost needs review. Check your purchase records and enter the amount paid for one {unit || 'unit'} of {historical ? 'this application' : 'the remaining stock'}. This does not change stock quantities.</p>
        <form onSubmit={submit}>
          <label htmlFor={inputId}>Unit cost (XAF per {unit || 'unit'})</label>
          <input id={inputId} ref={input} type="number" min="0" step="any" required value={value} onChange={e => setValue(e.target.value)} style={{ width: '100%', margin: '8px 0', padding: '10px', border: '1px solid #DFD8CA', borderRadius: '10px' }} />
          <p>{value !== '' && Number.isFinite(Number(value)) ? `Confirmed value: ${(Number(value) * quantity).toLocaleString()} XAF` : 'Enter the price per unit, not the total purchase amount.'}</p>
          {error && <p role="alert" style={{ color: '#B42318', marginTop: '12px' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={close} disabled={saving} style={button}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...button, background: '#3E7B52', color: '#FFF' }}>{saving ? 'Saving…' : 'Confirm cost'}</button>
          </div>
        </form>
      </div>
    </div>, document.body)}
  </>;
}
