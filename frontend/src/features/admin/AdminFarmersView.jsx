import React, { useEffect, useMemo, useState } from 'react';
import { adminService } from './services/adminService';
import { Avatar, Card, DataGate, EmptyState, Pill, RefreshButton, useAdminData } from './components/AdminUi';
import { FarmerDetailDrawer } from './components/FarmerDetailDrawer';
import { fmtDate, fmtKg, fmtNumber, fmtXaf, label, timeAgo } from './adminFormat';

const SORTS = {
  newest: { label: 'Newest first', fn: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0) },
  seen: { label: 'Last seen', fn: (a, b) => new Date(b.lastLoginAt || 0) - new Date(a.lastLoginAt || 0) },
  active: { label: 'Most activities', fn: (a, b) => b.activities - a.activities },
  harvest: { label: 'Most harvested', fn: (a, b) => b.harvestedKg - a.harvestedKg },
  name: { label: 'Name', fn: (a, b) => a.fullName.localeCompare(b.fullName) },
  region: { label: 'Region', fn: (a, b) => (a.regions?.[0] || '').localeCompare(b.regions?.[0] || '') },
  crop: { label: 'Crop', fn: (a, b) => (a.crops?.[0] || '').localeCompare(b.crops?.[0] || '') },
};
const FILTERS = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'admin', label: 'Administrators', test: (f) => f.role === 'ROLE_ADMIN' },
  { id: 'google', label: 'Google sign-in', test: (f) => f.authProvider === 'GOOGLE' },
  { id: 'password', label: 'Password sign-in', test: (f) => f.authProvider !== 'GOOGLE' },
];

export function AdminFarmersView({ user }) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sort, setSort] = useState('newest');
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [region, setRegion] = useState('');
  const [crop, setCrop] = useState('');
  const [access, setAccess] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const isAdmin = user?.role === 'ROLE_ADMIN';

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  const state = useAdminData(() => adminService.farmers(debounced), [debounced]);
  const managers = useAdminData(() => isAdmin ? adminService.farmers() : Promise.resolve([]), [isAdmin]);
  const regions = [...new Set(state.data?.flatMap(row => row.regions ?? []) ?? [])].sort();
  const crops = [...new Set(state.data?.flatMap(row => row.crops ?? []) ?? [])].sort();

  const rows = useMemo(() => {
    if (!state.data) return [];
    const test = FILTERS.find((f) => f.id === filter).test;
    return state.data.filter(row => test(row) && (!region || row.regions?.includes(region))
      && (!crop || row.crops?.includes(crop))).sort(SORTS[sort].fn);
  }, [state.data, filter, sort, region, crop]);

  async function saveAccess(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const change = { status: fields.get('status') };
    if (isAdmin) {
      change.role = fields.get('role');
      change.managerId = change.role === 'ROLE_FARMER' && fields.get('manager') ? Number(fields.get('manager')) : null;
    }
    setSaving(true);
    setSaveError('');
    try {
      await adminService.updateAccess(access.id, change);
      setAccess(null);
      state.reload();
      managers.reload();
    } catch (failure) {
      setSaveError(failure.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="adm-stack fade-in">
      <div className="adm-toolbar">
        <div className="adm-toolbar-group">
          <input className="adm-input" type="search" placeholder="Search name, email or location" aria-label="Search farmers"
            value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="adm-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort farmers">
            {Object.entries(SORTS).map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}
          </select>
        </div>
        <RefreshButton onClick={state.reload} loading={state.loading} />
      </div>

      <div className="adm-toolbar-group">
        <select className="adm-select" aria-label="Filter by region" value={region} onChange={event => setRegion(event.target.value)}>
          <option value="">All regions</option>{regions.map(value => <option key={value}>{value}</option>)}
        </select>
        <select className="adm-select" aria-label="Filter by crop" value={crop} onChange={event => setCrop(event.target.value)}>
          <option value="">All crops</option>{crops.map(value => <option key={value}>{value}</option>)}
        </select>
        {FILTERS.map((f) => (
          <button key={f.id} className="adm-chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>

      {access && <section className="workspace-panel">
        <h2>Account access for {access.fullName}</h2>
        <form key={access.id} onSubmit={saveAccess}>
          <fieldset className="workspace-form-grid" disabled={saving} aria-label="Account access">
            <label>Status<select name="status" defaultValue={isAdmin ? access.accessStatus : 'ACTIVE'}>
              <option value="ACTIVE">Active (approved)</option>
              <option value="REJECTED">Rejected</option>
              {isAdmin && <><option value="PENDING">Pending review</option><option value="DISABLED">Disabled</option></>}
            </select></label>
            {isAdmin && <>
              <label>Role<select name="role" defaultValue={access.role}>
                <option value="ROLE_FARMER">Farmer</option><option value="ROLE_MANAGER">Manager</option>
              </select></label>
              <label>Assigned manager<select name="manager" key={managers.loading ? 'loading' : 'ready'} defaultValue={access.managerId ?? ''} disabled={managers.loading}>
                <option value="">Unassigned</option>
                {access.managerId && !managers.data?.some(row => row.id === access.managerId && row.role === 'ROLE_MANAGER' && row.accessStatus === 'ACTIVE') &&
                  <option value={access.managerId}>Current assignment (inactive)</option>}
                {managers.data?.filter(row => row.role === 'ROLE_MANAGER' && row.accessStatus === 'ACTIVE')
                  .map(row => <option key={row.id} value={row.id}>{row.fullName} · {row.emailOrPhone}</option>)}
              </select></label>
            </>}
            <div className="workspace-form-actions">
              <button className="workspace-button primary" type="submit" disabled={isAdmin && (managers.loading || !!managers.error)}>{saving ? 'Saving…' : 'Save access'}</button>
              <button className="workspace-button" type="button" onClick={() => setAccess(null)}>Cancel</button>
            </div>
          </fieldset>
        </form>
        {isAdmin && managers.error && <p role="alert">{managers.error} <button type="button" className="workspace-button" onClick={managers.reload}>Retry</button></p>}
        {saveError && <p role="alert" className="workspace-error">{saveError}</p>}
      </section>}
      <DataGate state={state}>{() => (
        <Card flush title={`${rows.length} ${rows.length === 1 ? 'farmer' : 'farmers'}`} subtitle="Select a farmer to see their farms, cycles, activity and sign-ins">
          {rows.length === 0 ? <EmptyState>No farmer matches these filters.</EmptyState> : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Farmer</th><th>Farm type</th><th>Sign-in</th>
                    <th>Regions</th><th>Crops</th><th className="num">Plots</th>
                    <th className="num">Cycles</th><th className="num">Activities</th><th className="num">Harvested</th><th className="num">Inputs</th>
                    <th>Last seen</th><th>Joined</th><th>Access</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((f) => (
                    <tr key={f.id} className="clickable" onClick={() => setSelectedId(f.id)}>
                      <td>
                        <div className="adm-person">
                          <Avatar name={f.fullName} url={f.avatarUrl} />
                          <div style={{ minWidth: 0 }}>
                            <button className="adm-row-btn strong" onClick={(e) => { e.stopPropagation(); setSelectedId(f.id); }}>{f.fullName}</button>
                            <div className="muted">{f.emailOrPhone}</div>
                          </div>
                          {f.role !== 'ROLE_FARMER' && <Pill value={f.role} />}
                        </div>
                      </td>
                      <td>{label(f.farmType)}</td>
                      <td><Pill value={f.authProvider} /></td>
                      <td>{f.regions?.join(', ') || '—'}</td>
                      <td>{f.crops?.join(', ') || '—'}</td>
                      <td className="num">{fmtNumber(f.plots)}</td>
                      <td className="num">{f.activeCycles}<span className="muted"> / {f.cycles}</span></td>
                      <td className="num">{fmtNumber(f.activities)}</td>
                      <td className="num">{fmtKg(f.harvestedKg)}</td>
                      <td className="num">{f.inputSpend > 0 ? fmtXaf(f.inputSpend) : '—'}</td>
                      <td>{timeAgo(f.lastLoginAt)}</td>
                      <td>{fmtDate(f.createdAt)}</td>
                      <td onClick={event => event.stopPropagation()}>
                        <div>{label(f.accessStatus)}</div>
                        {f.id !== user?.id && f.role !== 'ROLE_ADMIN' && (isAdmin || f.accessStatus === 'PENDING') &&
                          <button className="adm-btn" type="button" onClick={() => { setSaveError(''); setAccess(f); }}>
                            {isAdmin ? 'Manage access' : 'Review'}
                          </button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}</DataGate>

      {selectedId && <FarmerDetailDrawer farmerId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
