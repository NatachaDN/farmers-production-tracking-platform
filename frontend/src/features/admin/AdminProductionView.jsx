import React, { useState } from 'react';
import { adminService } from './services/adminService';
import { Card, DataGate, EmptyState, Pill, Progress, RefreshButton, Tabs, useAdminData } from './components/AdminUi';
import { fmtDate, fmtKg, fmtNumber, fmtXaf, label } from './adminFormat';

const STATUSES = ['', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

export function AdminProductionView() {
  const [tab, setTab] = useState('cycles');
  const [status, setStatus] = useState('');

  const cycles = useAdminData(() => adminService.cycles(status), [status]);
  const harvests = useAdminData(() => adminService.harvests(), []);
  const inputs = useAdminData(() => adminService.inputs(), []);
  const active = { cycles, harvests, inputs }[tab];

  return (
    <div className="adm-stack fade-in">
      <div className="adm-toolbar">
        <Tabs label="Production data" value={tab} onChange={setTab} tabs={[
          { id: 'cycles', label: 'Cycles' }, { id: 'harvests', label: 'Harvests' }, { id: 'inputs', label: 'Inputs' },
        ]} />
        <RefreshButton onClick={active.reload} loading={active.loading} />
      </div>

      {tab === 'cycles' && (
        <>
          <div className="adm-toolbar-group">
            {STATUSES.map((s) => (
              <button key={s || 'all'} className="adm-chip" aria-pressed={status === s} onClick={() => setStatus(s)}>{s ? label(s) : 'All cycles'}</button>
            ))}
          </div>
          <DataGate state={cycles}>{(rows) => (
            <Card flush title={`${rows.length} production ${rows.length === 1 ? 'cycle' : 'cycles'}`}
              subtitle="Cycles with a past harvest date, or no field work in 14 days, are flagged">
              {rows.length === 0 ? <EmptyState>No production cycle matches this filter.</EmptyState> : (
                <div className="adm-table-wrap"><table className="adm-table">
                  <thead><tr><th>Crop</th><th>Farmer</th><th>Status</th><th>Stage</th><th>Progress</th><th>Started</th><th>Harvest due</th><th className="num">Activities</th><th className="num">Yield</th></tr></thead>
                  <tbody>
                    {rows.map((c) => (
                      <tr key={c.id}>
                        <td><div className="strong">{c.cropName || c.name}</div><div className="muted">{c.plotName || (c.cropName ? c.name : '—')}</div></td>
                        <td>{c.farmerName}</td>
                        <td><Pill value={c.status} />{c.health && c.health !== 'on-track' && <> <Pill value={c.health} /></>}</td>
                        <td>{c.stage || '—'}</td>
                        <td><Progress value={c.progress} /></td>
                        <td>{fmtDate(c.startDate)}</td>
                        <td>{fmtDate(c.endDate)}</td>
                        <td className="num">{c.activityCount}</td>
                        <td className="num">{c.harvest ? `${fmtNumber(c.harvest.quantity)} ${label(c.harvest.unit)}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              )}
            </Card>
          )}</DataGate>
        </>
      )}

      {tab === 'harvests' && (
        <DataGate state={harvests}>{(rows) => {
          const kg = rows.reduce((s, h) => s + (h.unit === 'KG' ? h.quantity : h.unit === 'TONS' ? h.quantity * 1000 : 0), 0);
          const bags = rows.reduce((s, h) => s + (h.unit === 'BAGS' ? h.quantity : 0), 0);
          return (
            <Card flush title={`${rows.length} ${rows.length === 1 ? 'harvest' : 'harvests'}`}
              subtitle={`${fmtKg(kg)} by weight${bags ? ` and ${fmtNumber(bags)} bags` : ''}`}>
              {rows.length === 0 ? <EmptyState>No harvest has been recorded yet.</EmptyState> : (
                <div className="adm-table-wrap"><table className="adm-table">
                  <thead><tr><th>Crop</th><th>Farmer</th><th>Harvested on</th><th className="num">Quantity</th><th className="num">Yield</th><th>Notes</th></tr></thead>
                  <tbody>
                    {rows.map((h) => (
                      <tr key={h.id}>
                        <td className="strong">{h.cropName}</td><td>{h.farmerName}</td><td>{fmtDate(h.harvestDate)}</td>
                        <td className="num">{fmtNumber(h.quantity)} {label(h.unit)}</td>
                        <td className="num">{h.yield != null ? fmtNumber(h.yield) : '—'}</td>
                        <td className="notes" title={h.notes || ''}>{h.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              )}
            </Card>
          );
        }}</DataGate>
      )}

      {tab === 'inputs' && (
        <DataGate state={inputs}>{(rows) => (
          <Card flush title={`${rows.length} input ${rows.length === 1 ? 'item' : 'items'}`}
            subtitle={`${fmtXaf(rows.reduce((s, i) => s + (i.cumulativeCost || 0), 0))} spent in total`}>
            {rows.length === 0 ? <EmptyState>No input has been purchased yet.</EmptyState> : (
              <div className="adm-table-wrap"><table className="adm-table">
                <thead><tr><th>Input</th><th>Type</th><th>Farmer</th><th>Last purchase</th><th className="num">Stock</th><th className="num">Last price</th><th className="num">Total spent</th></tr></thead>
                <tbody>
                  {rows.map((i) => (
                    <tr key={i.id}>
                      <td className="strong">{i.name}</td><td><Pill value={i.type} /></td><td>{i.farmerName}</td><td>{fmtDate(i.purchaseDate)}</td>
                      <td className="num">{fmtNumber(i.quantity)} {i.unit}</td>
                      <td className="num">{fmtXaf(i.purchasePrice)}</td><td className="num">{fmtXaf(i.cumulativeCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </Card>
        )}</DataGate>
      )}
    </div>
  );
}
