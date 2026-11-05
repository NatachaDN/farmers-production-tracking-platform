import React from 'react';
import { MetricCard } from '../../shared/components/MetricCard';
import './summary.css';

const number = value => Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
const count = (value, noun) => `${value} ${noun}${value === 1 ? '' : 's'}`;
export function SummaryStatus({ loading, error, refresh }) {
  if (loading) return <p role="status">Loading saved farm records…</p>;
  if (error) return <div role="alert" className="summary-card"><p>{error}</p><button type="button" onClick={refresh}>Try again</button></div>;
  return null;
}

export function SummaryPanels({ data, onNavigate, farm = false }) {
  const maxKg = Math.max(1, ...data.monthlyHarvests.map(row => row.kg));
  return <div className="summary-panels">
    <div className="summary-metrics">
      <MetricCard label="Active crop cycles" value={data.activeCycles} subtext={count(data.activeCrops, 'distinct crop')} />
      <MetricCard label="Registered plots" value={data.plotCount} subtext={`${number(data.plotAreaHa)} ha in plots`} />
      <MetricCard label="Recorded harvest" value={`${number(data.harvestedKg)} kg · ${number(data.harvestedBags)} bags`} subtext={`${count(data.harvestCount, 'harvest record')} · all time`} />
      <MetricCard label="Consumed input cost" value={data.costVerified ? `XAF ${number(data.totalInputCost)}` : 'Needs review'} subtext={data.costVerified ? 'Recorded cycle consumption · all time' : `${data.unverifiedInputCount} historical applications need confirmation`} />
    </div>
    <div className="summary-columns">
      <section className="summary-card">
        <h3>Production overview</h3><p>Recorded crop harvests · last 12 calendar months · kg only</p>
        {data.monthlyHarvests.some(row => row.kg > 0) ? <div className="summary-chart" aria-hidden="true">{data.monthlyHarvests.map(row => <div className="summary-chart-column" key={row.month} title={`${row.month}: ${number(row.kg)} kg`}>
          <span style={{ height: `${row.kg / maxKg * 120}px` }} /><small>{row.month.slice(5)}</small>
        </div>)}</div> : <p className="summary-empty">No harvest measured in kg or tons in this period.</p>}
        <details><summary>View monthly quantities</summary><table className="summary-table"><thead><tr><th>Month</th><th>kg</th><th>Bags</th></tr></thead><tbody>{data.monthlyHarvests.map(row => <tr key={row.month}><td>{row.month}</td><td>{number(row.kg)}</td><td>{number(row.bags)}</td></tr>)}</tbody></table></details>
        <p>Bags are counted separately; their weight is not assumed.</p>
      </section>
      <section className="summary-card">
        <h3>Planned harvests</h3><p>Dates from active cycles, including overdue plans.</p>
        {data.upcomingHarvests.length ? <ul className="summary-list">{data.upcomingHarvests.map(row => <li key={row.cycleId}><strong>{row.cycleName}</strong><span>{row.date}</span></li>)}</ul> : <p className="summary-empty">No active cycles with a planned harvest date.</p>}
        <button type="button" onClick={() => onNavigate?.('crops')}>View crop cycles →</button>
      </section>
      <section className="summary-card">
        <h3>Recent recorded activities</h3>
        {data.recentActivities.length ? <ul className="summary-list">{data.recentActivities.map(row => <li key={row.id}><strong style={{ textTransform: 'capitalize' }}>{row.type.replaceAll('_', ' ').toLowerCase()} · {row.cycleName}</strong><span>{row.date}</span>{row.notes && <span>{row.notes}</span>}</li>)}</ul> : <p className="summary-empty">No activities recorded yet.</p>}
        <button type="button" onClick={() => onNavigate?.('activities')}>View activities →</button>
      </section>
      <section className="summary-card">
        <h3>{farm ? 'Crop area in registered plots' : 'Your farm records'}</h3>
        {farm ? data.cropAreas.length ? <ul className="summary-list">{data.cropAreas.map(row => <li key={row.crop}><strong>{row.crop}</strong><span>{number(row.areaHa)} ha</span></li>)}</ul> : <p className="summary-empty">Register a plot to see its crop area here.</p> : <><p>{count(data.farmCount, 'farm')} · {count(data.plotCount, 'plot')}</p><button type="button" onClick={() => onNavigate?.('farms')}>View farms & plots →</button></>}
        <p>Livestock summaries, revenue estimates and scheduled tasks are not available yet.</p>
      </section>
    </div>
  </div>;
}
