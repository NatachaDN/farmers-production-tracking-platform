import React from 'react';
import { MetricCard } from '../../shared/components/MetricCard';
import { IconUsers, IconCrop, IconProduction, IconActivities, IconCheckCircle, IconWarning } from '../../shared/components/Icons';
import { adminService } from './services/adminService';
import { Card, DataGate, EmptyState, Pill, RefreshButton, useAdminData } from './components/AdminUi';
import { Bars, BarAxis, BreakdownBars, StackedBar, CHART_COLORS } from './components/charts';
import { fmtDate, fmtKg, fmtNumber, fmtXaf, fmtTime, label, timeAgo } from './adminFormat';

const STATUS_COLORS = { ACTIVE: CHART_COLORS.green, COMPLETED: CHART_COLORS.forest, CANCELLED: CHART_COLORS.sand };
const shortDay = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const shortMonth = (m) => new Date(`${m}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'short' });

export function AdminOverviewView({ onNavigate }) {
  const state = useAdminData(() => adminService.overview(), []);

  return (
    <div className="adm-stack fade-in">
      <div className="adm-toolbar">
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          {state.data ? `Figures as of ${fmtTime(state.data.generatedAt)}` : 'Loading platform figures'}
        </p>
        <RefreshButton onClick={state.reload} loading={state.loading} />
      </div>

      <DataGate state={state}>{(d) => <Overview d={d} onNavigate={onNavigate} />}</DataGate>
    </div>
  );
}

function Overview({ d, onNavigate }) {
  const { totals: t, highlights: h } = d;
  const delta = h.activities7d - h.activitiesPrev7d;
  const activityBars = d.activitiesPerDay.map((x) => ({ key: x.date, label: shortDay(x.date), value: x.count, title: `${fmtDate(x.date)}: ${x.count} activities` }));
  const total30 = d.activitiesPerDay.reduce((s, x) => s + x.count, 0);
  const harvestBars = d.harvestPerMonth.map((m) => ({ key: m.month, label: shortMonth(m.month), value: m.kg, title: `${shortMonth(m.month)}: ${fmtKg(m.kg)}` }));

  return (
    <>
      <div className="adm-grid cols-4">
        <MetricCard label="Farmers" value={fmtNumber(t.farmers)}
          subtext={`${h.newFarmers7d} joined this week · ${h.signedInFarmers7d} signed in`}
          icon={<IconUsers size={20} color="#2D7A52" />} iconBg="#EAF4ED" />
        <MetricCard label="Active crop cycles" value={fmtNumber(t.activeCycles)}
          subtext={`${t.completedCycles} completed · ${h.overdueCycles} overdue`}
          icon={<IconCrop size={20} color="#2D7A52" />} iconBg="#E8F5E9" />
        <MetricCard label="Total harvested" value={fmtKg(h.harvestedKg)}
          subtext={h.harvestedBags > 0 ? `plus ${fmtNumber(h.harvestedBags)} bags · ${t.harvests} ${t.harvests === 1 ? 'harvest' : 'harvests'}` : `${t.harvests} ${t.harvests === 1 ? 'harvest' : 'harvests'} recorded`}
          icon={<IconProduction size={20} color="#0D9488" />} iconBg="#E6F6F4" />
        <MetricCard label="Field activities this week" value={fmtNumber(h.activities7d)}
          subtext={delta === 0 ? 'Same as the previous week' : `${delta > 0 ? '+' : ''}${delta} vs the previous week`}
          icon={<IconActivities size={20} color="#D97706" />} iconBg="#FEF3C7" />
      </div>

      <div className="adm-grid wide-left">
        <Card title="Field activity, last 30 days" subtitle={`${fmtNumber(total30)} activities recorded by ${fmtNumber(t.farmers)} farmers`}>
          <Bars items={activityBars} height={170} ariaLabel="Field activities recorded per day over the last 30 days" />
          <BarAxis items={activityBars} />
        </Card>
        <div className="adm-stack">
          <Card title="Production cycles" subtitle={`${t.cycles} in total · average progress of active cycles ${h.avgCycleProgress}%`}>
            <StackedBar items={d.cyclesByStatus.map((c) => ({ label: label(c.label), value: c.count, color: STATUS_COLORS[c.label] }))} />
          </Card>
          <Card title="Farm types" subtitle="Chosen at sign-up">
            <BreakdownBars items={d.farmersByType.map((c) => ({ label: label(c.label), value: c.count }))} color={CHART_COLORS.teal} />
          </Card>
        </div>
      </div>

      <div className="adm-grid cols-3">
        <Card title="Harvest by crop" subtitle="Weight recorded in kg or tons">
          <BreakdownBars items={d.harvestByCrop.map((c) => ({ label: c.crop, value: c.kg, display: c.kg > 0 ? fmtKg(c.kg) : `${fmtNumber(c.bags)} bags` }))} empty="No harvest recorded yet." />
        </Card>
        <Card title="Activities by type" subtitle="All time">
          <BreakdownBars items={d.activitiesByType.map((c) => ({ label: label(c.label), value: c.count }))} color={CHART_COLORS.amber} empty="No activity recorded yet." />
        </Card>
        <Card title="Input spending" subtitle={`${fmtXaf(t.inputSpend)} across ${t.inputs} items`}>
          <BreakdownBars items={d.inputsByType.map((c) => ({ label: label(c.type), value: c.spent, display: fmtXaf(c.spent) }))} color={CHART_COLORS.forest} empty="No inputs purchased yet." />
        </Card>
      </div>

      <Card title="Harvest, last 12 months" subtitle="Kilograms harvested per month (bags are not converted)">
        <Bars items={harvestBars} height={130} color={CHART_COLORS.teal} ariaLabel="Kilograms harvested per month over the last 12 months" />
        <BarAxis items={harvestBars} every={1} />
      </Card>

      <div className="adm-grid even-2">
        <Card title="Latest field activity" flush action={<button className="adm-btn" onClick={() => onNavigate('admin-activity')}>View all</button>}>
          {d.recentActivities.length === 0 ? <EmptyState>No field activity has been recorded yet.</EmptyState> : (
            <ul className="adm-list">
              {d.recentActivities.map((a) => (
                <li key={a.id}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Pill value={a.type} />
                      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.875rem' }}>{a.cropName}</span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                      {a.farmerName}{a.plotName ? ` · ${a.plotName}` : ''} · {fmtDate(a.activityDate)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="adm-stack">
          <Card title="Needs attention" flush subtitle={undefined}>
            {d.attention.length === 0 ? (
              <EmptyState>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <IconCheckCircle size={22} color="#2E7D32" />
                  <p>Every active cycle is on track.</p>
                </div>
              </EmptyState>
            ) : (
              <ul className="adm-list">
                {d.attention.map((c) => (
                  <li key={c.id}>
                    <IconWarning size={18} color={c.health === 'overdue' ? '#B91C1C' : '#D97706'} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{c.cropName || c.name}</div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        {c.farmerName} · {c.health === 'overdue' ? `harvest was due ${fmtDate(c.endDate)}` : `last activity ${c.lastActivityDate ? fmtDate(c.lastActivityDate) : 'never'}`}
                      </p>
                    </div>
                    <Pill value={c.health} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Top farmers" subtitle="Ranked by harvested weight" flush>
            {d.topFarmers.length === 0 ? <EmptyState>Farmers appear here once they start a cycle.</EmptyState> : (
              <ul className="adm-list">
                {d.topFarmers.map((f) => (
                  <li key={f.id}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{f.name}</div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{f.cycles} cycles · {f.activities} activities</p>
                    </div>
                    <b style={{ fontSize: '0.875rem' }}>{fmtKg(f.harvestedKg)}</b>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Card title="Recent account events" flush action={<button className="adm-btn" onClick={() => onNavigate('admin-activity')}>View all</button>}>
        {d.recentAuditEvents.length === 0 ? <EmptyState>No sign-ins recorded yet.</EmptyState> : (
          <ul className="adm-list">
            {d.recentAuditEvents.map((e) => (
              <li key={e.id}>
                <Pill value={e.type} />
                <div style={{ flex: 1, minWidth: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  <b style={{ color: 'var(--color-text-primary)' }}>{e.actorLabel || 'Unknown'}</b> · {e.detail}
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{timeAgo(e.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
