import React, { useState } from 'react';

const numbers = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

export function YieldComparison({ harvests }) {
  const [plotId, setPlotId] = useState('');
  const [crop, setCrop] = useState('');
  const plots = [...new Map(harvests.filter(row => row.plotId != null).map(row => [String(row.plotId), row.plot]))];
  if (plots.length === 0) return null;
  const plot = plotId || plots[0][0];
  const rows = harvests.filter(row => String(row.plotId) === plot && row.yieldPerHectare != null);
  const crops = [...new Set(rows.map(row => row.crop).filter(Boolean))].sort();
  const selected = rows.filter(row => !crop || row.crop === crop);
  const series = [
    ['kg/ha', selected.filter(row => row.unit === 'KG' || row.unit === 'TONS').map(row =>
      ({ ...row, yield: row.yieldPerHectare * (row.unit === 'TONS' ? 1000 : 1) }))],
    ['bags/ha', selected.filter(row => row.unit === 'BAGS').map(row => ({ ...row, yield: row.yieldPerHectare }))],
  ];

  return (
    <section className="workspace-panel report-analysis" aria-labelledby="yield-comparison-title">
      <div><h2 id="yield-comparison-title">Compare cycle yields</h2><p className="workspace-muted">Harvests in the selected report period, ordered by harvest date.</p></div>
      <div className="workspace-form-grid">
        <label>Plot<select value={plot} onChange={event => { setPlotId(event.target.value); setCrop(''); }}>
          {plots.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select></label>
        <label>Crop<select value={crop} onChange={event => setCrop(event.target.value)}>
          <option value="">All crops</option>{crops.map(name => <option key={name}>{name}</option>)}
        </select></label>
      </div>
      {selected.length < 2 && <p className="workspace-empty">At least two harvests with recorded yields are needed for a comparison.</p>}
      {series.filter(([, values]) => values.length > 0).map(([unit, values]) => {
        const highest = Math.max(1, ...values.map(row => row.yield));
        return <section className="report-section" key={unit}>
          <h3>Yield in {unit}</h3>
          <ul className="yield-series">
            {values.map(row => <li key={row.id}>
              <span>{row.cycleName} · <time dateTime={row.date}>{row.date}</time></span>
              <strong>{numbers.format(row.yield)} {unit}</strong>
              <span className="yield-series-track" aria-hidden="true">
                <span style={{ width: `${row.yield * 100 / highest}%` }} />
              </span>
            </li>)}
          </ul>
        </section>;
      })}
    </section>
  );
}
