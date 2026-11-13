import React, { useState } from 'react';
import { fmtDate, fmtNumber } from '../adminFormat';

export function ConsolidatedHarvestReport({ farmers, harvests }) {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  function generate(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const from = form.get('from');
    const to = form.get('to');
    const people = new Set(form.getAll('farmer').map(Number));
    setReport(null);
    if (from > to || !people.size) {
      setError(from > to ? 'End date must be on or after the start date.' : 'Select at least one farmer.');
      return;
    }
    setError('');
    const results = farmers.filter(farmer => people.has(farmer.id)).map(farmer => ({
      farmer,
      rows: harvests.filter(row => row.farmerId === farmer.id && row.harvestDate >= from && row.harvestDate <= to),
    }));
    setReport({ from, to, results });
  }
  return (
    <>
      <section className="workspace-panel reports-controls">
        <h2>Consolidated harvest report</h2>
        <form onSubmit={generate}>
          <div className="workspace-form-grid">
            <label>From<input type="date" name="from" required /></label>
            <label>Through<input type="date" name="to" required /></label>
            <button className="workspace-button primary" type="submit">Generate report</button>
          </div>
          <fieldset className="workspace-farmer-checklist">
            <legend>Farmers to include</legend>
            {farmers.map(farmer => <label key={farmer.id}>
              <input type="checkbox" name="farmer" value={farmer.id} /> {farmer.fullName} · {farmer.emailOrPhone}
            </label>)}
          </fieldset>
        </form>
        {error && <p role="alert" className="workspace-error">{error}</p>}
      </section>
      {report && <article className="workspace-panel report-document">
        <header className="workspace-toolbar">
          <div><h2>Consolidated harvest report</h2><p>{fmtDate(report.from)} to {fmtDate(report.to)}</p></div>
          <button className="workspace-button report-print" type="button" onClick={() => window.print()}>Print or save as PDF</button>
        </header>
        {report.results.map(({ farmer, rows }) => <section className="report-section" key={farmer.id}>
          <h3>{farmer.fullName}</h3>
          {rows.length ? <div className="workspace-table-scroll" role="region" tabIndex={0} aria-label={`Harvests for ${farmer.fullName}`}>
            <table className="workspace-table">
              <thead><tr><th scope="col">Date</th><th scope="col">Cycle</th><th scope="col">Quantity</th><th scope="col">Yield per hectare</th></tr></thead>
              <tbody>{rows.map(row => <tr key={row.id}>
                <td>{fmtDate(row.harvestDate)}</td><th scope="row">{row.cycleName}</th>
                <td>{fmtNumber(row.quantity)} {row.unit?.toLowerCase()}</td>
                <td>{row.yield == null || !row.unit ? '—' : `${fmtNumber(row.yield)} ${row.unit.toLowerCase()}/ha`}</td>
              </tr>)}</tbody>
            </table>
          </div> : <p className="workspace-empty">No harvests in this period.</p>}
        </section>)}
      </article>}
    </>
  );
}
