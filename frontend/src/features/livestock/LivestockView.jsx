import React, { useEffect, useState } from 'react';
import { apiClient } from '../../shared/services/apiClient';
import { IconLivestock, IconPlus } from '../../shared/components/Icons';
import { AnimalGroupRecords } from './AnimalGroupRecords';

const endpoint = '/animals/groups';
const types = ['CATTLE', 'POULTRY', 'GOATS', 'SHEEP', 'PIGS', 'RABBITS', 'BEES', 'FISH', 'OTHER'];
const statuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED', 'SOLD'];
const label = value => value ? value[0] + value.slice(1).toLowerCase() : '—';

export function LivestockView() {
  const [groups, setGroups] = useState(null);
  const [editing, setEditing] = useState(null);
  const [recordsGroup, setRecordsGroup] = useState(null);
  const [status, setStatus] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [recent, setRecent] = useState(null);
  const [productionRefresh, setProductionRefresh] = useState(0);

  useEffect(() => {
    let current = true;
    apiClient.get(endpoint)
      .then(data => { if (current) setGroups(data); })
      .catch(failure => { if (current) setError(failure.message || 'Could not load animal groups.'); });
    return () => { current = false; };
  }, [attempt]);

  useEffect(() => {
    let current = true;
    apiClient.get('/animals/recent-production')
      .then(rows => { if (current) setRecent(rows); })
      .catch(() => { if (current) setRecent(false); });
    return () => { current = false; };
  }, [productionRefresh]);

  const visible = groups?.filter(group => !status || group.status === status);
  const active = groups?.filter(group => group.status === 'ACTIVE') ?? [];
  const alerts = active.filter(group => group.currentPopulation === 0);

  function onSaved(saved) {
    setGroups(previous => previous.some(group => group.id === saved.id)
      ? previous.map(group => group.id === saved.id ? saved : group)
      : [saved, ...previous]);
    setNotice(editing.id ? 'Animal group updated.' : 'Animal group added.');
    if (status && saved.status !== status) setStatus('');
    setEditing(null);
  }

  return (
    <div className="workspace-screen">
      <section className="workspace-panel">
        <header className="workspace-toolbar">
          <div className="workspace-section-heading">
            <span className="workspace-icon" aria-hidden="true"><IconLivestock size={22} /></span>
            <div><h2>Animal groups</h2><p>{groups ? `${active.length} active · ${groups.length} total` : 'Manage herds, flocks and other groups.'}</p></div>
          </div>
          {groups && !editing && !recordsGroup && <button type="button" className="workspace-button primary" onClick={() => { setNotice(''); setEditing({}); }}>
            <IconPlus size={16} /> Add animal group
          </button>}
        </header>
        {error ? <div role="alert" className="workspace-error">{error} <button type="button" className="workspace-button"
          onClick={() => { setError(''); setAttempt(value => value + 1); }}>Try again</button></div>
          : !groups && <p role="status">Loading animal groups…</p>}
        {notice && <p role="status" className="workspace-success">{notice}</p>}
      </section>
      {editing && <AnimalGroupForm group={editing} onCancel={() => setEditing(null)} onSaved={onSaved} />}
      {recordsGroup && <AnimalGroupRecords key={recordsGroup.id} group={recordsGroup} onClose={() => setRecordsGroup(null)}
        onProductionRecorded={() => setProductionRefresh(value => value + 1)}
        onPopulationChange={currentPopulation => {
          setGroups(previous => previous.map(group => group.id === recordsGroup.id ? { ...group, currentPopulation } : group));
          setRecordsGroup({ ...recordsGroup, currentPopulation });
        }} />}
      {groups?.length > 0 && !recordsGroup && !editing && (
        <section className="workspace-panel">
          <h2>Livestock summary</h2>
          <dl className="workspace-facts">
            <div><dt>Active groups</dt><dd>{active.length} of {groups.length}</dd></div>
            <div><dt>Animals in active groups</dt><dd>{active.reduce((total, group) => total + group.currentPopulation, 0).toLocaleString()}</dd></div>
          </dl>
          <h3>Alerts</h3>
          {alerts.length
            ? <ul className="summary-list">{alerts.map(group => <li key={group.id}>{group.name} has no animals recorded.</li>)}</ul>
            : <p className="workspace-muted">No livestock alerts.</p>}
          <h3>Recent production</h3>
          {recent === false ? <p className="workspace-error" role="alert">Could not load recent production.</p>
            : recent === null ? <p role="status">Loading recent production…</p>
            : recent.length === 0 ? <p className="workspace-muted">No production recorded yet.</p>
            : <ul className="summary-list">{recent.map(({ groupName, record }) => (
              <li key={record.id}><strong>{record.name} · {groupName}</strong>
                <time dateTime={record.date}>{record.date}</time><span>{record.quantity} {record.unit}</span></li>
            ))}</ul>}
        </section>
      )}
      {groups && (
        <section className="workspace-panel">
          <header className="workspace-toolbar">
            <h2>Registered groups</h2>
            <label className="workspace-filter">Status<select value={status} onChange={event => setStatus(event.target.value)}>
              <option value="">All statuses</option>{statuses.map(value => <option key={value} value={value}>{label(value)}</option>)}
            </select></label>
          </header>
          {visible.length ? <ul className="workspace-card-grid">{visible.map(group => (
            <li className="workspace-list-card" key={group.id}>
              <div className="workspace-toolbar"><h3>{group.name}</h3><span className="workspace-status" data-active={group.status === 'ACTIVE'}>{label(group.status)}</span></div>
              <p>{label(group.animalType)}{group.purpose && ` · ${group.purpose}`}</p>
              <dl className="workspace-facts">
                <div><dt>Current population</dt><dd>{group.currentPopulation.toLocaleString()}</dd></div>
                <div><dt>Start date</dt><dd>{group.startDate || '—'}</dd></div>
              </dl>
              {group.location && <p className="workspace-muted">{group.location}</p>}
              {group.notes && <p className="workspace-muted">{group.notes}</p>}
              <div className="workspace-form-actions">
                <button type="button" className="workspace-button" disabled={!!editing || !!recordsGroup}
                  onClick={() => { setNotice(''); setEditing(group); }} aria-label={`Edit ${group.name}`}>Edit group</button>
                <button type="button" className="workspace-button" disabled={!!editing || !!recordsGroup}
                  onClick={() => setRecordsGroup(group)} aria-label={`View records for ${group.name}`}>View records</button>
              </div>
            </li>
          ))}</ul> : <p className="workspace-empty">{status ? 'No groups match this status.' : 'Add your first animal group to start keeping livestock records.'}</p>}
        </section>
      )}
    </div>
  );
}

function AnimalGroupForm({ group, onCancel, onSaved }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const formRef = React.useRef(null);
  useEffect(() => {
    formRef.current?.scrollIntoView({ block: 'nearest' });
    formRef.current?.querySelector('input')?.focus({ preventScroll: true });
  }, []);

  async function save(event) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const payload = {
      ...fields,
      name: fields.name.trim(),
      purpose: fields.purpose.trim(),
      initialPopulation: Number(fields.initialPopulation),
    };
    if (!payload.name || !payload.purpose) {
      setError('Enter a group name and production purpose.');
      return;
    }
    setPending(true);
    setError('');
    try {
      const saved = group.id
        ? await apiClient.put(`${endpoint}/${group.id}`, { ...payload, currentPopulation: Number(fields.currentPopulation) })
        : await apiClient.post(endpoint, payload);
      onSaved(saved);
    } catch (failure) {
      setError(failure.message || 'Could not save the animal group.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="workspace-panel" aria-labelledby="animal-group-form-title">
      <h2 id="animal-group-form-title">{group.id ? 'Edit animal group' : 'New animal group'}</h2>
      <form onSubmit={save} ref={formRef}>
        <fieldset className="workspace-form-grid" disabled={pending} aria-label="Animal group details">
          <label>Group name<input name="name" defaultValue={group.name} maxLength={120} required /></label>
          <label>Animal type<select name="animalType" defaultValue={group.animalType || ''} required>
            <option value="" disabled>Choose a type</option>{types.map(value => <option key={value} value={value}>{label(value)}</option>)}
          </select></label>
          <label>Production purpose<input name="purpose" defaultValue={group.purpose} maxLength={80} required /></label>
          <label>Start date<input name="startDate" type="date" defaultValue={group.startDate} required /></label>
          <label>Starting population<input name="initialPopulation" type="number" min="1" max="2147483647" defaultValue={group.initialPopulation} required /></label>
          {group.id && <label>Current population<input name="currentPopulation" type="number" min="0" max="2147483647" defaultValue={group.currentPopulation} required /></label>}
          <label>Breed<input name="breed" defaultValue={group.breed} maxLength={120} /></label>
          <label>Location<input name="location" defaultValue={group.location} maxLength={150} /></label>
          {group.id && <label>Status<select name="status" defaultValue={group.status}>
            {statuses.map(value => <option key={value} value={value}>{label(value)}</option>)}
          </select></label>}
          <label className="workspace-span">Notes<textarea name="notes" defaultValue={group.notes} maxLength={500} rows={3} /></label>
          <div className="workspace-form-actions workspace-span">
            <button className="workspace-button primary" type="submit">{pending ? 'Saving…' : 'Save animal group'}</button>
            <button className="workspace-button" type="button" onClick={onCancel}>Cancel</button>
          </div>
        </fieldset>
        {error && <p className="workspace-error" role="alert">{error}</p>}
      </form>
    </section>
  );
}
