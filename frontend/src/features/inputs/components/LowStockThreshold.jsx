import React, { useState } from 'react';

export function LowStockThreshold({ input, onSave }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function save(event) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('threshold');
    setPending(true);
    setError('');
    try {
      await onSave(input.id, value === '' ? null : Number(value));
    } catch (failure) {
      setError(failure.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <details>
      <summary>Low stock alert{input.lowStockThreshold == null ? '' : ` below ${input.lowStockThreshold} ${input.unit}`}</summary>
      <form className="workspace-form-grid" onSubmit={save}>
        <label>Threshold ({input.unit})<input name="threshold" type="number" min="0" step="any"
          defaultValue={input.lowStockThreshold ?? ''} disabled={pending} /></label>
        <button type="submit" className="workspace-button" disabled={pending}>{pending ? 'Saving…' : 'Save threshold'}</button>
        <small>Leave blank to turn off the alert.</small>
      </form>
      {error && <p className="workspace-error" role="alert">{error}</p>}
    </details>
  );
}
