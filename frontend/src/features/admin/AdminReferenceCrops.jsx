import React, { useState } from 'react';
import { apiClient } from '../../shared/services/apiClient';
import { DataGate, useAdminData } from './components/AdminUi';

const endpoint = '/admin/reference-crops';

export function AdminReferenceCrops() {
  const state = useAdminData(() => apiClient.get(endpoint), []);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function save(event) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const entry = { name: fields.get('name'), enabled: fields.has('enabled') };
    setPending(true);
    setError('');
    try {
      if (editing) await apiClient.put(`${endpoint}/${editing.id}`, entry);
      else await apiClient.post(endpoint, entry);
      form.reset();
      setEditing(null);
      state.reload();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setPending(false);
    }
  }

  return <div className="workspace-screen">
    <section className="workspace-panel">
      <h2>{editing ? 'Edit reference crop' : 'Add a reference crop'}</h2>
      <form key={editing?.id ?? 'new'} onSubmit={save}>
        <fieldset className="workspace-form-grid" disabled={pending} aria-label="Reference crop">
          <label>Crop name<input name="name" required maxLength={120} defaultValue={editing?.name} /></label>
          <label className="workspace-check"><input name="enabled" type="checkbox" defaultChecked={editing?.enabled ?? true} /> Available to farmers</label>
          <div className="workspace-form-actions">
            <button type="submit" className="workspace-button primary">{pending ? 'Saving…' : 'Save crop'}</button>
            {editing && <button className="workspace-button" type="button" onClick={() => { setEditing(null); setError(''); }}>Cancel</button>}
          </div>
        </fieldset>
      </form>
      {error && <p className="workspace-error" role="alert">{error}</p>}
    </section>
    <section className="workspace-panel">
      <h2>Reference crop catalog</h2>
      <DataGate state={state}>{crops => crops.length ? (
        <ul className="workspace-card-grid">{crops.map(crop => <li key={crop.id} className="workspace-list-card">
          <h3>{crop.name}</h3><span>{crop.enabled ? 'Available' : 'Disabled'}</span>
          <button className="workspace-button" type="button" disabled={pending}
            onClick={() => { setEditing(crop); setError(''); }} aria-label={`Edit ${crop.name}`}>Edit</button>
        </li>)}</ul>
      ) : <p className="workspace-empty">No reference crops have been added.</p>}</DataGate>
    </section>
  </div>;
}
