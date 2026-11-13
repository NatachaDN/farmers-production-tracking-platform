import React from 'react';
import { IconActivities, IconArrowRight, IconCalendar, IconCrop, IconFarms, IconInputs, IconProduction } from '../../shared/components/Icons';
import './summary.css';

const number = value => Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
const count = (value, noun) => `${value} ${noun}${value === 1 ? '' : 's'}`;
const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'short', timeZone: 'UTC' });
const dateLabel = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', timeZone: 'UTC' });
const displayDate = date => dateLabel.format(new Date(`${date}T00:00:00Z`));

export function SummaryStatus({ loading, error, refresh }) {
  if (loading) return (
    <div className="summary-loading">
      <p role="status">Loading farm records…</p>
      <div className="summary-metrics" aria-hidden="true">
        {[1, 2, 3, 4].map(key => <span key={key} />)}
      </div>
    </div>
  );
  if (error) return (
    <div role="alert" className="summary-card">
      <p>{error}</p>
      <button type="button" className="summary-action" onClick={refresh}>Try again</button>
    </div>
  );
  return null;
}

function SummaryMetric({ label, value, detail, icon: Icon, tone }) {
  return (
    <div className="summary-metric">
      <dt>{label}<span className="summary-icon" data-tone={tone} aria-hidden="true"><Icon size={19} /></span></dt>
      <dd className="summary-value">{value}</dd>
      <dd className="summary-detail">{detail}</dd>
    </div>
  );
}

function SummaryAction({ children, onClick }) {
  return <button type="button" className="summary-action" onClick={onClick}>{children}<IconArrowRight size={16} /></button>;
}

export function SummaryPanels({ data, onNavigate, farm = false }) {
  const maxKg = Math.max(1, ...data.monthlyHarvests.map(row => row.kg));

  return (
    <div className="summary-panels">
      <dl className="summary-metrics" aria-label="Farm metrics">
        <SummaryMetric label="Active crop cycles" value={data.activeCycles} detail={count(data.activeCrops, 'distinct crop')} icon={IconCrop} />
        <SummaryMetric label="Registered plots" value={data.plotCount} detail={`${number(data.plotAreaHa)} ha in plots`} icon={IconFarms} />
        <SummaryMetric label="Recorded harvest"
          value={<>{number(data.harvestedKg)} <small>kg</small></>}
          detail={`${number(data.harvestedBags)} bags · ${count(data.harvestCount, 'harvest record')} all time`}
          icon={IconProduction} tone="gold" />
        <SummaryMetric label="Consumed input cost"
          value={data.costVerified ? <><small>XAF</small> {number(data.totalInputCost)}</> : 'Needs review'}
          detail={data.costVerified ? 'Recorded cycle consumption · all time' : `${data.unverifiedInputCount} historical applications need confirmation`}
          icon={IconInputs} tone="sand" />
      </dl>
      {!farm && data.farmCount === 0 && (
        <section className="summary-card">
          <h3>Start your farm records</h3>
          <p>Add a farm and register your first plot to start planning crop cycles.</p>
          <SummaryAction onClick={() => onNavigate?.('farms-create')}>Add your first farm</SummaryAction>
        </section>
      )}
      <div className="summary-columns">
        <section className="summary-card summary-overview">
          <div className="summary-panel-heading">
            <div><h3>Production overview</h3><p>Monthly crop harvest weight (kg)</p></div>
            <span className="summary-period">Last 12 months</span>
          </div>
          {data.monthlyHarvests.some(row => row.kg > 0) ? (
            <div className="summary-chart" aria-hidden="true">
              {data.monthlyHarvests.map(row => (
                <div className="summary-chart-column" key={row.month} title={`${row.month} · ${number(row.kg)} kg`}>
                  <div><span style={{ height: `${row.kg / maxKg * 100}%` }} /></div>
                  <small>{monthLabel.format(new Date(`${row.month}-01T00:00:00Z`))}</small>
                </div>
              ))}
            </div>
          ) : <p className="summary-empty">No harvests measured by weight in this period.</p>}
          <details className="summary-quantities">
            <summary>View monthly quantities</summary>
            <table className="summary-table">
              <thead><tr><th scope="col">Month</th><th scope="col">kg</th><th scope="col">Bags</th></tr></thead>
              <tbody>{data.monthlyHarvests.map(row => <tr key={row.month}><th scope="row">{row.month}</th><td>{number(row.kg)}</td><td>{number(row.bags)}</td></tr>)}</tbody>
            </table>
          </details>
          <p className="summary-unit-note">Bags are counted separately from harvest weight.</p>
        </section>
        <section className="summary-card">
          <div className="summary-panel-heading">
            <div><h3>Planned harvests</h3><p>Active cycles, including overdue plans</p></div>
            <span className="summary-icon" data-tone="gold" aria-hidden="true"><IconCalendar size={19} /></span>
          </div>
          {data.upcomingHarvests.length ? (
            <ul className="summary-list">{data.upcomingHarvests.map(row => (
              <li key={row.cycleId}><strong>{row.cycleName}</strong><time dateTime={row.date}>{displayDate(row.date)}</time></li>
            ))}</ul>
          ) : <p className="summary-empty">No planned harvest dates on active cycles.</p>}
          <SummaryAction onClick={() => onNavigate?.('crops')}>View crop cycles</SummaryAction>
        </section>
        <section className="summary-card">
          <div className="summary-panel-heading">
            <h3>Recent activities</h3><span className="summary-icon" aria-hidden="true"><IconActivities size={19} /></span>
          </div>
          {data.recentActivities.length ? (
            <ul className="summary-list">{data.recentActivities.map(row => (
              <li key={row.id}>
                <strong className="summary-activity">{row.type.replaceAll('_', ' ').toLowerCase()} · {row.cycleName}</strong>
                <time dateTime={row.date}>{displayDate(row.date)}</time>
                {row.notes && <span>{row.notes}</span>}
              </li>
            ))}</ul>
          ) : <p className="summary-empty">No activities recorded yet.</p>}
          <SummaryAction onClick={() => onNavigate?.('activities')}>View activities</SummaryAction>
        </section>
        <section className="summary-card">
          <div className="summary-panel-heading">
            <h3>{farm ? 'Crop area by plot' : 'Farms & plots'}</h3>
            <span className="summary-icon" data-tone="sand" aria-hidden="true"><IconFarms size={19} /></span>
          </div>
          {farm ? (
            data.cropAreas.length ? <ul className="summary-list">{data.cropAreas.map(row => (
              <li key={row.crop}><strong>{row.crop}</strong><span>{number(row.areaHa)} ha</span></li>
            ))}</ul> : <p className="summary-empty">Register a plot to see its crop area here.</p>
          ) : (
            <>
              <p className="summary-farm-count">{count(data.farmCount, 'farm')} · {count(data.plotCount, 'plot')}</p>
              <SummaryAction onClick={() => onNavigate?.('farms')}>View farms & plots</SummaryAction>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
