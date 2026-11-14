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
  const cycles = useAdminData(() => adminService.cycles(''), []);
  const active = tab === 'field' ? field : events;
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    const firstCycleId = cycles.data?.[0]?.id ? String(cycles.data[0].id) : '';
    setModal({
      mode: 'create',
      data: {
        cycleId: firstCycleId,
        activityType: 'WATERING',
        activityDate: new Date().toISOString().slice(0, 10),
        notes: '',
      },
    });
  };

  const openEdit = (a) => {
    setModal({
      mode: 'edit',
      id: a.id,
      data: {
        cycleId: String(a.cycleId || ''),
        activityType: a.type || 'WATERING',
        activityDate: a.activityDate || new Date().toISOString().slice(0, 10),
        notes: a.notes || '',
      },
    });
  };

  const saveActivity = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        cycleId: Number(modal.data.cycleId),
        activityType: modal.data.activityType,
        activityDate: modal.data.activityDate,
        notes: modal.data.notes,
      };
      if (modal.mode === 'create') {
        await adminService.createActivity(payload);
      } else {
        await adminService.updateActivity(modal.id, payload);
      }
      setModal(null);
      field.reload();
    } catch (err) {
      alert(err.message || 'Could not save activity.');
    } finally {
      setSaving(false);
    }
  };

  const deleteActivity = async (a) => {
    if (!window.confirm('Delete this field activity?')) return;
    try {
      await adminService.deleteActivity(a.id);
      field.reload();
    } catch (err) {
      alert(err.message || 'Could not delete activity.');
    }
  };

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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {tab === 'field' && (
            <button
              type="button"
              onClick={openCreate}
              style={{
                padding: '8px 14px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: '#164230',
                color: '#FFFFFF',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Log Activity
            </button>
          )}
          <RefreshButton onClick={active.reload} loading={active.loading} />
        </div>
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
            <input className="adm-input" type="search" placeholder="Rechercher producteur (Bandjoun, Bafoussam), culture ou parcelle" aria-label="Search field activities"
              value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <DataGate state={field}>{() => (
            <Card flush title={`${fieldRows.length} ${fieldRows.length === 1 ? 'activity' : 'activities'}`} subtitle="Newest first, up to 300 shown">
              {fieldRows.length === 0 ? <EmptyState>No field activity matches these filters.</EmptyState> : (
                <div className="adm-table-wrap"><table className="adm-table">
                  <thead><tr><th>Date</th><th>Activity</th><th>Crop</th><th>Plot</th><th>Farmer</th><th>Notes</th><th>Recorded</th><th>Actions</th></tr></thead>
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
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button type="button" className="adm-chip" onClick={() => openEdit(a)}>Edit</button>
                            <button type="button" className="adm-chip" style={{ color: '#B91C1C' }} onClick={() => deleteActivity(a)}>Delete</button>
                          </div>
                        </td>
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

      {modal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(22,66,48,0.4)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <form onSubmit={saveActivity} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', width: 'min(96vw, 440px)', boxShadow: '0 12px 32px rgba(0,0,0,0.16)' }}>
            <h3 style={{ margin: '0 0 14px', color: '#164230' }}>{modal.mode === 'create' ? 'Log Field Activity' : 'Edit Field Activity'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Production Cycle</label>
                <select required className="adm-input" style={{ width: '100%' }} value={modal.data.cycleId} onChange={(e) => setModal({ ...modal, data: { ...modal.data, cycleId: e.target.value } })}>
                  <option value="">Select cycle…</option>
                  {(cycles.data || []).map((c) => (
                    <option key={c.id} value={c.id}>{c.cropName || c.name} — {c.farmerName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Activity Type</label>
                <select className="adm-input" style={{ width: '100%' }} value={modal.data.activityType} onChange={(e) => setModal({ ...modal, data: { ...modal.data, activityType: e.target.value } })}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  <option value="PLANTING">PLANTING</option>
                  <option value="HARVESTING">HARVESTING</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Date</label>
                <input type="date" required className="adm-input" style={{ width: '100%' }} value={modal.data.activityDate} onChange={(e) => setModal({ ...modal, data: { ...modal.data, activityDate: e.target.value } })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Notes</label>
                <textarea rows={3} className="adm-input" style={{ width: '100%' }} value={modal.data.notes} onChange={(e) => setModal({ ...modal, data: { ...modal.data, notes: e.target.value } })} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button type="button" className="adm-chip" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="adm-chip" style={{ backgroundColor: '#164230', color: '#FFFFFF' }} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
