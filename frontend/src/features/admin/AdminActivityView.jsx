import React, { useMemo, useState } from 'react';
import { adminService } from './services/adminService';
import { Card, DataGate, EmptyState, Pill, RefreshButton, Tabs, useAdminData } from './components/AdminUi';
import { fmtDate, fmtDateTime, label, timeAgo } from './adminFormat';

const TYPES = ['WATERING', 'TREATMENT', 'FERTILIZING', 'WEEDING'];

export function AdminActivityView() {
  const [tab, setTab] = useState('field');
  const [type, setType] = useState('');
  const [query, setQuery] = useState('');

  const field = useAdminData(() => adminService.activities({ type, limit: 300 }), [type]);
  const events = useAdminData(() => adminService.audit(200), []);
  const active = tab === 'field' ? field : events;

  const fieldRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (field.data || []).filter((a) => !q
      || [a.farmerName, a.cropName, a.plotName, a.notes].some((v) => v && v.toLowerCase().includes(q)));
  }, [field.data, query]);

  return (
    <div className="adm-stack fade-in">
      <div className="adm-toolbar">
        <Tabs label="Activity feeds" value={tab} onChange={setTab} tabs={[
          { id: 'field', label: 'Field activities' },
          { id: 'events', label: 'Account events' },
        ]} />
        <RefreshButton onClick={active.reload} loading={active.loading} />
      </div>

      {tab === 'field' && (
        <>
          <div className="adm-toolbar">
            <div className="adm-toolbar-group">
              <button className="adm-chip" aria-pressed={type === ''} onClick={() => setType('')}>All types</button>
              {TYPES.map((t) => (
                <button key={t} className="adm-chip" aria-pressed={type === t} onClick={() => setType(t)}>{label(t)}</button>
              ))}
            </div>
            <input className="adm-input" type="search" placeholder="Search farmer, crop, plot or notes" aria-label="Search field activities"
              value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <DataGate state={field}>{() => (
            <Card flush title={`${fieldRows.length} ${fieldRows.length === 1 ? 'activity' : 'activities'}`} subtitle="Newest first, up to 300 shown">
              {fieldRows.length === 0 ? <EmptyState>No field activity matches these filters.</EmptyState> : (
                <div className="adm-table-wrap"><table className="adm-table">
                  <thead><tr><th>Date</th><th>Activity</th><th>Crop</th><th>Plot</th><th>Farmer</th><th>Notes</th><th>Recorded</th></tr></thead>
                  <tbody>
                    {fieldRows.map((a) => (
                      <tr key={a.id}>
                        <td>{fmtDate(a.activityDate)}</td>
                        <td><Pill value={a.type} /></td>
                        <td className="strong">{a.cropName}</td>
                        <td>{a.plotName || '—'}</td>
                        <td>{a.farmerName}</td>
                        <td className="notes" title={a.notes || ''}>{a.notes || '—'}</td>
                        <td className="muted">{timeAgo(a.recordedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              )}
            </Card>
          )}</DataGate>
        </>
      )}

      {tab === 'events' && (
        <DataGate state={events}>{(rows) => (
          <Card flush title="Sign-ups and sign-ins" subtitle="The latest 200 events, including failed attempts">
            {rows.length === 0 ? <EmptyState>No account events recorded yet.</EmptyState> : (
              <div className="adm-table-wrap"><table className="adm-table">
                <thead><tr><th>When</th><th>Event</th><th>Account</th><th>Detail</th><th>IP address</th></tr></thead>
                <tbody>
                  {rows.map((e) => (
                    <tr key={e.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(e.createdAt)}</td>
                      <td><Pill value={e.type} /></td>
                      <td className="strong">{e.actorLabel || 'Unknown'}</td>
                      <td>{e.detail || '—'}</td>
                      <td className="muted">{e.ipAddress || '—'}</td>
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
