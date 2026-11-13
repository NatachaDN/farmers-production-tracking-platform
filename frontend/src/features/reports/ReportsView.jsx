import React, { useState } from 'react';
import { apiClient } from '../../shared/services/apiClient';
import { IconReports } from '../../shared/components/Icons';

const formatNumber = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
const units = { KG: 'kg', TONS: 't', BAGS: 'bags' };
const label = value => value?.toLowerCase().replaceAll('_', ' ');

function ReportSection({ title, headings, rows }) {
  return (
    <section className="report-section">
      <h3>{title}</h3>
      {rows.length ? (
        <div className="workspace-table-scroll" tabIndex={0} role="region" aria-label={title}>
          <table className="workspace-table">
            <thead><tr>{headings.map(heading => <th key={heading} scope="col">{heading}</th>)}</tr></thead>
            <tbody>{rows.map(([id, ...cells]) => (
              <tr key={id}>{cells.map((cell, index) => index === 0
                ? <th key={headings[index]} scope="row">{cell}</th>
                : <td key={headings[index]}>{cell}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="workspace-muted">No {title.toLowerCase()} in this period.</p>}
    </section>
  );
}

export function ReportsView({ farmerId }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const invalidRange = from && to && from > to;
  const hasData = report && (report.cycles.length > 0 || report.activities.length > 0 || report.harvests.length > 0);

  async function generate(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const start = values.get('from');
    const end = values.get('to');
    if (pending || !start || !end || start > end) return;
    setPending(true);
    setReport(null);
    setError('');
    try {
      const period = new URLSearchParams({ from: start, to: end });
      setReport(await apiClient.get(`/farmers/${farmerId}/summary/production-report?${period}`));
    } catch (failure) {
      setError(failure.message || 'Could not generate the report.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="workspace-screen reports-workspace">
      <section className="workspace-panel reports-controls" aria-labelledby="report-period">
        <header className="workspace-section-heading">
          <span className="workspace-icon" aria-hidden="true"><IconReports size={21} /></span>
          <div><h2 id="report-period">Crop production report</h2><p>Choose a period to review crop cycles, field activities and harvest yields.</p></div>
        </header>
        <form className="workspace-form-grid" onSubmit={generate}>
          <label>From<input type="date" name="from" required onChange={event => setFrom(event.target.value)} disabled={pending} /></label>
          <label>Through<input type="date" name="to" required onChange={event => setTo(event.target.value)} disabled={pending} /></label>
          <button className="workspace-button primary" disabled={pending || invalidRange} type="submit">{pending ? 'Generating…' : 'Generate report'}</button>
        </form>
        {invalidRange && <p role="alert" className="workspace-error">The end date must be on or after the start date.</p>}
        {error && <p role="alert" className="workspace-error">{error}</p>}
        {pending && <p role="status">Loading production records…</p>}
      </section>
      {report && (
        <article className="workspace-panel report-document">
          <header className="workspace-toolbar">
            <div><h2>Crop production report</h2><p>{report.from} to {report.to}</p></div>
            {hasData && <button className="workspace-button report-print" type="button" onClick={() => window.print()}>Print or save as PDF</button>}
          </header>
          {hasData ? (
            <>
              <ReportSection title="Crop cycles" headings={['Cycle', 'Planted', 'Status']}
                rows={report.cycles.map(row => [row.id, row.name, row.plantingDate || '—', label(row.status)])} />
              <ReportSection title="Activities" headings={['Cycle', 'Date', 'Activity', 'Notes']}
                rows={report.activities.map(row => [row.id, row.cycleName, row.date, label(row.type), row.notes || '—'])} />
              <ReportSection title="Harvests" headings={['Cycle', 'Date', 'Quantity', 'Yield per hectare']}
                rows={report.harvests.map(row => [row.id, row.cycleName, row.date, `${formatNumber.format(row.quantity)} ${units[row.unit]}`,
                  row.yieldPerHectare == null ? '—' : `${formatNumber.format(row.yieldPerHectare)} ${units[row.unit]}/ha`])} />
            </>
          ) : <p className="workspace-empty" role="status">No crop production records were found for this period.</p>}
        </article>
      )}
    </div>
  );
}
