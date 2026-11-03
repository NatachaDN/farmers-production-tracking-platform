import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconClose } from '../../../shared/components/Icons';
import { adminService } from '../services/adminService';
import { Avatar, EmptyState, ErrorBanner, LoadingBlocks, Pill, Progress, Tabs, useAdminData } from './AdminUi';
import { fmtDate, fmtDateTime, fmtKg, fmtNumber, fmtXaf, label, timeAgo } from '../adminFormat';

export function FarmerDetailDrawer({ farmerId, onClose }) {
  const state = useAdminData(() => adminService.farmer(farmerId), [farmerId]);
  const [tab, setTab] = useState('cycles');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const d = state.data;
  const f = d?.farmer;

  // Portal: a parent's entrance animation would otherwise become the containing block of this fixed panel.
  return createPortal(
    <>
      <div className="adm-scrim" onClick={onClose} />
      <aside className="adm-drawer" role="dialog" aria-modal="true" aria-label="Farmer details">
        <div className="adm-drawer-head">
          {f ? (
            <div className="adm-person">
              <Avatar name={f.fullName} url={f.avatarUrl} />
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{f.fullName}</h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{f.emailOrPhone}</p>
              </div>
            </div>
          ) : <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Farmer details</h2>}
          <button className="adm-close" onClick={onClose} aria-label="Close"><IconClose size={16} /></button>
        </div>

        <div className="adm-drawer-body">
          {state.error && !d && <ErrorBanner error={state.error} onRetry={state.reload} />}
          {!d && !state.error && <LoadingBlocks rows={2} />}
          {d && (
            <>
              <div className="adm-mini-stats">
                <div className="adm-mini"><b>{f.activeCycles}/{f.cycles}</b><span>Active / all cycles</span></div>
                <div className="adm-mini"><b>{fmtNumber(f.activities)}</b><span>Field activities</span></div>
                <div className="adm-mini"><b>{fmtKg(f.harvestedKg)}</b><span>Harvested</span></div>
                <div className="adm-mini"><b>{f.inputSpend > 0 ? fmtXaf(f.inputSpend) : '—'}</b><span>Input spending</span></div>
              </div>

              <dl className="adm-kv">
                <dt>Role</dt><dd><Pill value={f.role} /></dd>
                <dt>Sign-in method</dt><dd><Pill value={f.authProvider} /></dd>
                <dt>Farm type</dt><dd>{label(f.farmType)}</dd>
                <dt>Location</dt><dd>{f.location || '—'}</dd>
                <dt>Joined</dt><dd>{fmtDate(f.createdAt)}</dd>
                <dt>Last seen</dt><dd>{timeAgo(f.lastLoginAt)}</dd>
                <dt>Farms and plots</dt><dd>{f.farms} farms · {f.plots} plots</dd>
              </dl>

              <Tabs label="Farmer data" value={tab} onChange={setTab} tabs={[
                { id: 'cycles', label: 'Cycles', count: d.cycles.length },
                { id: 'land', label: 'Land', count: d.plots.length },
                { id: 'activity', label: 'Activity', count: d.activities.length },
                { id: 'harvests', label: 'Harvests', count: d.harvests.length },
                { id: 'inputs', label: 'Inputs', count: d.inputs.length },
                { id: 'events', label: 'Sign-ins', count: d.auditEvents.length },
              ]} />

              {tab === 'cycles' && (d.cycles.length === 0 ? <EmptyState>No production cycles yet.</EmptyState> : (
                <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Cycle</th><th>Status</th><th>Progress</th><th>Started</th></tr></thead><tbody>
                  {d.cycles.map((c) => (
                    <tr key={c.id}>
                      <td><div className="strong">{c.cropName || c.name}</div><div className="muted">{c.plotName || c.name}</div></td>
                      <td><Pill value={c.status} />{c.health && c.health !== 'on-track' && <> <Pill value={c.health} /></>}</td>
                      <td><Progress value={c.progress} /></td>
                      <td>{fmtDate(c.startDate)}</td>
                    </tr>
                  ))}
                </tbody></table></div>
              ))}

              {tab === 'land' && (d.plots.length === 0 && d.farms.length === 0 ? <EmptyState>No farms or plots registered.</EmptyState> : (
                <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Plot</th><th>Farm</th><th>Crop</th><th className="num">Area</th></tr></thead><tbody>
                  {d.plots.map((p) => (
                    <tr key={p.id}><td className="strong">{p.name}</td><td>{p.farmName || '—'}</td><td>{p.cropType || '—'}{p.stage && <div className="muted">{p.stage}</div>}</td><td className="num">{fmtNumber(p.area)} ha</td></tr>
                  ))}
                </tbody></table></div>
              ))}

              {tab === 'activity' && (d.activities.length === 0 ? <EmptyState>No field activity recorded.</EmptyState> : (
                <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Date</th><th>Activity</th><th>Crop</th><th>Notes</th></tr></thead><tbody>
                  {d.activities.map((a) => (
                    <tr key={a.id}><td>{fmtDate(a.activityDate)}</td><td><Pill value={a.type} /></td><td>{a.cropName}</td><td className="notes" title={a.notes || ''}>{a.notes || '—'}</td></tr>
                  ))}
                </tbody></table></div>
              ))}

              {tab === 'harvests' && (d.harvests.length === 0 ? <EmptyState>No harvest recorded.</EmptyState> : (
                <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Crop</th><th>Date</th><th className="num">Quantity</th></tr></thead><tbody>
                  {d.harvests.map((h) => (
                    <tr key={h.id}><td className="strong">{h.cropName}</td><td>{fmtDate(h.harvestDate)}</td><td className="num">{fmtNumber(h.quantity)} {label(h.unit)}</td></tr>
                  ))}
                </tbody></table></div>
              ))}

              {tab === 'inputs' && (d.inputs.length === 0 ? <EmptyState>No inputs purchased.</EmptyState> : (
                <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Input</th><th>Type</th><th className="num">Stock</th><th className="num">Spent</th></tr></thead><tbody>
                  {d.inputs.map((i) => (
                    <tr key={i.id}><td className="strong">{i.name}</td><td><Pill value={i.type} /></td><td className="num">{fmtNumber(i.quantity)} {i.unit}</td><td className="num">{fmtXaf(i.cumulativeCost)}</td></tr>
                  ))}
                </tbody></table></div>
              ))}

              {tab === 'events' && (d.auditEvents.length === 0 ? <EmptyState>No sign-in events recorded for this account.</EmptyState> : (
                <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>When</th><th>Event</th><th>IP address</th></tr></thead><tbody>
                  {d.auditEvents.map((e) => (
                    <tr key={e.id}><td>{fmtDateTime(e.createdAt)}</td><td><Pill value={e.type} /></td><td className="muted">{e.ipAddress || '—'}</td></tr>
                  ))}
                </tbody></table></div>
              ))}
            </>
          )}
        </div>
      </aside>
    </>,
    document.body
  );
}
