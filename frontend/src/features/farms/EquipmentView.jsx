import React, { useEffect, useState } from 'react';
import { apiClient } from '../../shared/services/apiClient';

const statuses = { AVAILABLE: 'Available', BROKEN: 'Broken', MAINTENANCE: 'Under maintenance' };

export function EquipmentView({ farmerId }) {
  const [items, setItems] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const endpoint = `/farmers/${farmerId}/equipment`;
  const options = Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>);

  useEffect(() => {
    let current = true;
    apiClient.get(endpoint)
      .then(data => { if (current) setItems(data); })
      .catch(error => { if (current) setLoadError(error.message); });
    return () => { current = false; };
  }, [endpoint, attempt]);

  async function save(event, item) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setPending(true);
    setNotice('');
    setError('');
    try {
      const saved = item
        ? await apiClient.put(`${endpoint}/${item.id}/status`, values)
        : await apiClient.post(endpoint, values);
      setItems(previous => [...previous.filter(row => row.id !== saved.id), saved]
        .sort((a, b) => a.name.localeCompare(b.name) || a.id - b.id));
      if (!item) form.reset();
      setNotice(`${saved.name} ${item ? 'updated' : 'added'}.`);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="workspace-screen">
      <section className="workspace-panel">
        <h2>Add equipment</h2>
        <form onSubmit={event => save(event)}>
          <fieldset className="workspace-form-grid" disabled={!items || pending} aria-label="New equipment">
            <label>Name<input name="name" required maxLength={120} /></label>
            <label>Status<select name="status">{options}</select></label>
            <label>Notes<input name="notes" maxLength={300} /></label>
            <button className="workspace-button primary" type="submit">Add equipment</button>
          </fieldset>
        </form>
        {error && <p className="workspace-error" role="alert">{error}</p>}
        {notice && <p className="workspace-success" role="status">{notice}</p>}
      </section>
      <section className="workspace-panel">
        <h2>Equipment inventory</h2>
        {loadError ? <div className="workspace-error" role="alert">{loadError}{' '}
          <button className="workspace-button" type="button" onClick={() => { setLoadError(''); setAttempt(value => value + 1); }}>Try again</button>
        </div> : !items ? <p role="status">Loading equipment…</p> : items.length ? (
          <ul className="workspace-card-grid">{items.map(item => <li key={item.id} className="workspace-list-card">
            <h3>{item.name}</h3>
            {item.notes && <p>{item.notes}</p>}
            <form onSubmit={event => save(event, item)} key={item.status} className="workspace-form-actions">
              <label className="workspace-filter">Status<select name="status" defaultValue={item.status} disabled={pending}>{options}</select></label>
              <button className="workspace-button" type="submit" disabled={pending}>Update status</button>
            </form>
          </li>)}</ul>
        ) : <p className="workspace-empty">No equipment registered yet.</p>}
      </section>
    </div>
  );
}
