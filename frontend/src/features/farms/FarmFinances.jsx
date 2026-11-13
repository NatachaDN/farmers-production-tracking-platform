import React, { useEffect, useState } from 'react';
import { apiClient } from '../../shared/services/apiClient';
import { useFarmerCycles, cycleLabel } from '../crop/hooks/useFarmerCycles';

const amounts = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

export function FarmFinances({ farmerId }) {
  const [kind, setKind] = useState('EXPENSE');
  const [ledger, setLedger] = useState(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { cycles } = useFarmerCycles(farmerId);
  const endpoint = `/farmers/${farmerId}/finances`;
  const sale = kind === 'SALE';

  useEffect(() => {
    let current = true;
    apiClient.get(endpoint)
      .then(data => { if (current) setLedger(data); })
      .catch(failure => { if (current) setError(failure.message); });
    return () => { current = false; };
  }, [endpoint, attempt]);

  async function save(event) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    setPending(true);
    setError('');
    try {
      await apiClient.post(endpoint, { ...fields, kind, cycleId: fields.cycleId ? Number(fields.cycleId) : null });
      form.reset();
      setLedger(null);
      setAttempt(value => value + 1);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="workspace-screen">
      <section className="workspace-panel">
        <h2>Record income or expenses</h2>
        <div className="workspace-form-actions" role="group" aria-label="Transaction type">
          {[['EXPENSE', 'Expense'], ['SALE', 'Sale']].map(([value, label]) => (
            <button key={value} className={`workspace-button ${kind === value ? 'primary' : ''}`}
              type="button" aria-pressed={kind === value} disabled={pending} onClick={() => setKind(value)}>{label}</button>
          ))}
        </div>
        {sale && ledger && !ledger.saleCycles.length && <p className="workspace-empty">Record a harvest before adding a sale.</p>}
        <form key={kind} onSubmit={save}>
          <fieldset className="workspace-form-grid" disabled={!ledger || pending || (sale && !ledger.saleCycles.length)} aria-label={sale ? 'Record sale' : 'Record expense'}>
            <label>{sale ? 'Sale description' : 'Expense category'}<input name="category" required maxLength={120} /></label>
            <label>Amount (XAF)<input name="amount" type="number" required min="0.01" max="99999999999999.99" step="0.01" /></label>
            <label>Date<input name="date" type="date" required /></label>
            <label>Crop cycle<select name="cycleId" required={sale} defaultValue="">
              <option value="" disabled={sale}>{sale ? 'Select a completed cycle' : 'Farm expense'}</option>
              {sale ? ledger?.saleCycles.map(cycle => <option key={cycle.id} value={cycle.id}>{cycle.name}</option>)
                : cycles.map(cycle => <option key={cycle.id} value={cycle.id}>{cycleLabel(cycle)}</option>)}
            </select></label>
            <button className="workspace-button primary" type="submit">{pending ? 'Saving…' : sale ? 'Save sale' : 'Save expense'}</button>
          </fieldset>
        </form>
        {error && <p className="workspace-error" role="alert">{error}{' '}
          {!ledger && <button className="workspace-button" type="button" onClick={() => { setError(''); setAttempt(value => value + 1); }}>Try again</button>}
        </p>}
      </section>
      <section className="workspace-panel">
        <h2>Cycle margins</h2>
        <p className="workspace-muted">Cycle margins subtract linked expenses and consumed inventory costs from sales. Use farm expenses for spending that applies across cycles.</p>
        {ledger?.margins.length ? <ul className="workspace-card-grid">{ledger.margins.map(row => (
          <li className="workspace-list-card" key={row.cycleId}>
            <h3>{row.cycleName}</h3>
            <p>{row.margin == null ? 'Margin unavailable until historical input costs are verified.' : `Margin: XAF ${amounts.format(row.margin)}`}</p>
            <p className="workspace-muted">Sales {amounts.format(row.sales)} · expenses {amounts.format(row.expenses)}
              {row.inputCosts != null && ` · input costs ${amounts.format(row.inputCosts)}`}</p>
          </li>
        ))}</ul> : <p className="workspace-empty">{ledger ? 'No sales recorded yet.' : 'Loading margins…'}</p>}
      </section>
      <section className="workspace-panel">
        <h2>Transaction history</h2>
        {ledger?.entries.length ? <div className="workspace-table-scroll" role="region" aria-label="Transaction history" tabIndex={0}>
          <table className="workspace-table">
            <thead><tr>{['Date', 'Description', 'Type', 'Amount (XAF)'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
            <tbody>{ledger.entries.map(row => <tr key={row.id}>
              <td>{row.date}</td><th scope="row">{row.category}</th><td>{row.kind === 'SALE' ? 'Sale' : 'Expense'}</td>
              <td>{amounts.format(row.amount)}</td>
            </tr>)}</tbody>
          </table>
        </div> : <p className="workspace-empty">{ledger ? 'No transactions recorded yet.' : 'Loading transactions…'}</p>}
      </section>
    </div>
  );
}
