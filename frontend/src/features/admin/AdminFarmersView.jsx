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
};
const FILTERS = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'admin', label: 'Administrators', test: (f) => f.role === 'ROLE_ADMIN' },
  { id: 'google', label: 'Google sign-in', test: (f) => f.authProvider === 'GOOGLE' },
  { id: 'password', label: 'Password sign-in', test: (f) => f.authProvider !== 'GOOGLE' },
];

export function AdminFarmersView() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sort, setSort] = useState('newest');
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  const state = useAdminData(() => adminService.farmers(debounced), [debounced]);

  const rows = useMemo(() => {
    if (!state.data) return [];
    const test = FILTERS.find((f) => f.id === filter).test;
    return state.data.filter(test).sort(SORTS[sort].fn);
  }, [state.data, filter, sort]);

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
        {FILTERS.map((f) => (
          <button key={f.id} className="adm-chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>

      <DataGate state={state}>{() => (
        <Card flush title={`${rows.length} ${rows.length === 1 ? 'farmer' : 'farmers'}`} subtitle="Select a farmer to see their farms, cycles, activity and sign-ins">
          {rows.length === 0 ? <EmptyState>No farmer matches these filters.</EmptyState> : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Farmer</th><th>Farm type</th><th>Sign-in</th>
                    <th className="num">Cycles</th><th className="num">Activities</th><th className="num">Harvested</th><th className="num">Inputs</th>
                    <th>Last seen</th><th>Joined</th>
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
                          {f.role === 'ROLE_ADMIN' && <Pill value="ROLE_ADMIN" />}
                        </div>
                      </td>
                      <td>{label(f.farmType)}</td>
                      <td><Pill value={f.authProvider} /></td>
                      <td className="num">{f.activeCycles}<span className="muted"> / {f.cycles}</span></td>
                      <td className="num">{fmtNumber(f.activities)}</td>
                      <td className="num">{fmtKg(f.harvestedKg)}</td>
                      <td className="num">{f.inputSpend > 0 ? fmtXaf(f.inputSpend) : '—'}</td>
                      <td>{timeAgo(f.lastLoginAt)}</td>
                      <td>{fmtDate(f.createdAt)}</td>
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
