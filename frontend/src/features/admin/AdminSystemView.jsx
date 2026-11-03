import React, { useState } from 'react';
import { MetricCard } from '../../shared/components/MetricCard';
import { IconServer, IconPulse, IconActivities, IconWarning } from '../../shared/components/Icons';
import { adminService } from './services/adminService';
import { Card, DataGate, EmptyState, Pill, RefreshButton, useAdminData } from './components/AdminUi';
import { Bars, BarAxis, CHART_COLORS } from './components/charts';
import { fmtBytes, fmtDateTime, fmtNumber, fmtTime, fmtUptime } from './adminFormat';

const statusTone = (s) => (s >= 500 ? 'red' : s >= 400 ? 'amber' : 'green');

export function AdminSystemView() {
  const [auto, setAuto] = useState(true);
  const state = useAdminData(() => adminService.telemetry(), [], { pollMs: auto ? 10000 : 0 });

  return (
    <div className="adm-stack fade-in">
      <div className="adm-toolbar">
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          {state.data ? `Checked at ${fmtTime(state.data.generatedAt)}` : 'Checking the server'}
        </p>
        <div className="adm-toolbar-group">
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Refresh every 10 seconds
          </label>
          <RefreshButton onClick={state.reload} loading={state.loading} />
        </div>
      </div>
      <DataGate state={state}>{(d) => <System d={d} />}</DataGate>
    </div>
  );
}

function System({ d }) {
  const { system: s, traffic: t } = d;
  const db = s.database;
  const heapPct = s.heapMaxBytes > 0 ? Math.round((s.heapUsedBytes / s.heapMaxBytes) * 100) : 0;
  const minutes = t.requestsPerMinute.map((m) => ({
    key: m.minute, value: m.requests,
    label: new Date(m.minute).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    title: `${fmtTime(m.minute)}: ${m.requests} requests`,
  }));

  return (
    <>
      <div className="adm-grid cols-4">
        <MetricCard label="API server" value="Running" subtext={`Up for ${fmtUptime(s.uptimeSeconds)}`}
          icon={<IconServer size={20} color="#2D7A52" />} iconBg="#EAF4ED" />
        <MetricCard label="Database" value={db.up ? `${db.latencyMs} ms` : 'Down'}
          subtext={db.up ? `${db.product} ${String(db.version).split(' ')[0]}${db.poolTotal != null ? ` · ${db.poolActive}/${db.poolTotal} connections busy` : ''}` : db.error}
          icon={<IconPulse size={20} color={db.up ? '#0D9488' : '#DC2626'} />} iconBg={db.up ? '#E6F6F4' : '#FEF2F2'} />
        <MetricCard label="Memory in use" value={`${heapPct}%`} subtext={`${fmtBytes(s.heapUsedBytes)} of ${fmtBytes(s.heapMaxBytes)} heap`}
          icon={<IconActivities size={20} color="#D97706" />} iconBg="#FEF3C7" />
        <MetricCard label="API error rate" value={`${(t.errorRate * 100).toFixed(1)}%`}
          subtext={`${t.clientErrors} client · ${t.serverErrors} server errors`}
          icon={<IconWarning size={20} color={t.serverErrors > 0 ? '#DC2626' : '#2D7A52'} />} iconBg={t.serverErrors > 0 ? '#FEF2F2' : '#E8F5E9'} />
      </div>

      <div className="adm-grid wide-left">
        <Card title="Requests per minute, last 30 minutes"
          subtitle={`${fmtNumber(t.totalRequests)} requests since ${fmtDateTime(t.countingSince)} · average ${Math.round(t.avgLatencyMs)} ms · 95% under ${t.p95LatencyMs} ms`}>
          <Bars items={minutes} height={140} color={CHART_COLORS.teal} ariaLabel="API requests per minute over the last 30 minutes" />
          <BarAxis items={minutes} />
          <p style={{ marginTop: 14, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Counters reset when the server restarts. Calls made by this admin console are not counted.
          </p>
        </Card>
        <Card title="Runtime" subtitle={s.applicationName}>
          <dl className="adm-kv" style={{ gridTemplateColumns: '120px 1fr' }}>
            <dt>Started</dt><dd>{fmtDateTime(s.startedAt)}</dd>
            <dt>Profile</dt><dd>{s.profiles.length ? s.profiles.join(', ') : 'default'}</dd>
            <dt>Java</dt><dd>{s.javaVersion}</dd>
            <dt>System</dt><dd>{s.operatingSystem}</dd>
            <dt>CPU</dt><dd>{s.processors} {s.processors === 1 ? 'core' : 'cores'}{s.processCpuLoad != null ? ` · ${Math.round(s.processCpuLoad * 100)}% used by the server` : ''}</dd>
            <dt>Threads</dt><dd>{s.threadCount} now · {s.peakThreadCount} peak</dd>
            <dt>Garbage collection</dt><dd>{fmtNumber(s.gcCollections)} runs · {fmtNumber(s.gcTimeMs)} ms</dd>
          </dl>
        </Card>
      </div>

      <Card flush title="Busiest endpoints" subtitle="Grouped by route, not by individual URL">
        {t.endpoints.length === 0 ? <EmptyState>No API calls have been recorded since the server started.</EmptyState> : (
          <div className="adm-table-wrap"><table className="adm-table">
            <thead><tr><th>Route</th><th className="num">Requests</th><th className="num">Errors</th><th className="num">Average</th><th className="num">Slowest</th><th>Last call</th></tr></thead>
            <tbody>
              {t.endpoints.map((e) => (
                <tr key={`${e.method} ${e.path}`}>
                  <td><span className="strong">{e.method}</span> <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8125rem' }}>{e.path}</span></td>
                  <td className="num">{fmtNumber(e.requests)}</td>
                  <td className="num">{e.errors > 0 ? <Pill tone="red">{e.errors}</Pill> : 0}</td>
                  <td className="num">{Math.round(e.avgMs)} ms</td><td className="num">{e.maxMs} ms</td>
                  <td className="muted">{fmtTime(e.lastAt)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </Card>

      <Card flush title="Latest requests">
        {t.recentRequests.length === 0 ? <EmptyState>Nothing yet.</EmptyState> : (
          <div className="adm-table-wrap"><table className="adm-table">
            <thead><tr><th>Time</th><th>Route</th><th>Status</th><th className="num">Duration</th></tr></thead>
            <tbody>
              {t.recentRequests.map((r, i) => (
                <tr key={`${r.at}-${i}`}>
                  <td className="muted">{fmtTime(r.at)}</td>
                  <td><span className="strong">{r.method}</span> <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8125rem' }}>{r.path}</span></td>
                  <td><Pill tone={statusTone(r.status)}>{r.status}</Pill></td>
                  <td className="num">{r.durationMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </Card>
    </>
  );
}
