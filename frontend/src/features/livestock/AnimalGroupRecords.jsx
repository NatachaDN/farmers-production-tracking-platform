import React, { useEffect, useState } from 'react';
import { apiClient } from '../../shared/services/apiClient';

const kinds = { FEEDING: 'Feeding', PRODUCTION: 'Production' };
const populationKinds = { ADDITION: 'Addition', DEATH: 'Death', SALE: 'Sale', REMOVAL: 'Removal', BIRTH: 'Birth' };

export function AnimalGroupRecords({ group, onClose, onPopulationChange, onProductionRecorded }) {
  const [records, setRecords] = useState(null);
  const [kind, setKind] = useState('PRODUCTION');
  const [attempt, setAttempt] = useState(0);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const endpoint = `/animals/groups/${group.id}/records`;

  useEffect(() => {
    let current = true;
    apiClient.get(endpoint)
      .then(rows => { if (current) setRecords(rows); })
      .catch(error => { if (current) setLoadError(error.message); });
    return () => { current = false; };
  }, [endpoint, attempt]);

  async function save(event) {
    event.preventDefault();
    if (saving) return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    setSaving(true);
    setSaveError('');
    try {
      const recordKind = fields.changeType || kind;
      const quantity = Number(fields.quantity);
      const record = await apiClient.post(endpoint, {
        name: fields.name || populationKinds[recordKind],
        kind: recordKind,
        quantity,
        unit: fields.unit || 'animals',
        date: fields.date,
      });
      setRecords(previous => [record, ...previous].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id));
      if (kind === 'POPULATION') onPopulationChange(record.currentPopulation);
      if (kind === 'PRODUCTION') onProductionRecorded();
      form.reset();
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  }

  const population = kind === 'POPULATION';
  const sectionLabel = population ? 'Population' : kinds[kind];
  const rows = records?.filter(record => population ? Object.hasOwn(populationKinds, record.kind) : record.kind === kind);
  return (
    <section className="workspace-panel" aria-labelledby="animal-history-title">
      <header className="workspace-toolbar">
        <div><h2 id="animal-history-title">{group.name}</h2><p>{group.currentPopulation} animals</p></div>
        <button type="button" className="workspace-button" onClick={onClose} disabled={saving}>Close records</button>
      </header>
      <div className="workspace-form-actions" role="group" aria-label="Record type">
        {Object.entries({ ...kinds, POPULATION: 'Population' }).map(([value, label]) => (
          <button key={value} type="button" className={`workspace-button ${kind === value ? 'primary' : ''}`}
            aria-pressed={kind === value} disabled={saving} onClick={() => { setKind(value); setSaveError(''); }}>{label}</button>
        ))}
      </div>
      {loadError ? (
        <div className="workspace-error" role="alert">{loadError}{' '}
          <button type="button" className="workspace-button" onClick={() => { setLoadError(''); setAttempt(value => value + 1); }}>Try again</button>
        </div>
      ) : !rows ? <p role="status">Loading records…</p> : (
        <>
          <form key={kind} onSubmit={save}>
            <fieldset className="workspace-form-grid" disabled={saving} aria-label={`Record ${sectionLabel.toLowerCase()}`}>
              {population ? (
                <label>Change type<select name="changeType" required>
                  {Object.entries(populationKinds).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select></label>
              ) : <label>{kind === 'FEEDING' ? 'Feed type' : 'Output type'}<input name="name" required maxLength={80} /></label>}
              <label>{population ? 'Number of animals' : 'Quantity'}<input name="quantity" type="number" required
                min={population ? 1 : 0.001} max={population ? 2147483647 : 9999999999999.999} step={population ? 1 : 0.001} /></label>
              {!population && <label>Unit<input name="unit" required maxLength={24} placeholder={kind === 'FEEDING' ? 'kg' : 'litres, eggs, kg'} /></label>}
              <label>Date<input name="date" type="date" required min={group.startDate || undefined} /></label>
              <button type="submit" className="workspace-button primary">{saving ? 'Saving…' : 'Save record'}</button>
            </fieldset>
            {saveError && <p className="workspace-error" role="alert">{saveError}</p>}
          </form>
          {rows.length ? (
            <div className="workspace-table-scroll" tabIndex={0} role="region" aria-label={`${sectionLabel} history`}>
              <table className="workspace-table">
                <thead><tr><th scope="col">Date</th><th scope="col">Type</th><th scope="col">Quantity</th></tr></thead>
                <tbody>{rows.map(row => <tr key={row.id}>
                  <td><time dateTime={row.date}>{row.date}</time></td>
                  <th scope="row">{row.name}</th>
                  <td>{row.quantity.toLocaleString(undefined, { maximumFractionDigits: 3 })} {row.unit}</td>
                </tr>)}</tbody>
              </table>
            </div>
          ) : <p className="workspace-empty">No {sectionLabel.toLowerCase()} records yet.</p>}
        </>
      )}
    </section>
  );
}
