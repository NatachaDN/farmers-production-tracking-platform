import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { farmService } from '../farms/services/farmService';
import { cropCycleService } from '../crops/services/cropCycleService';
import { harvestService } from '../crop/services/harvestService';
import { cycleActivityService } from '../crop/services/cycleActivityService';
import { cycleIncidentService } from '../crop/services/cycleIncidentService';
import { animalGroupService } from '../livestock/services/animalGroupService';
import { inputService } from '../inputs/services/inputService';
import { MetricCard } from '../../shared/components/MetricCard';
import { Skeleton, SkeletonCard, SkeletonText } from '../../shared/components/Skeleton';
import {
  IconProduction,
  IconCrop,
  IconLivestock,
  IconReports,
  IconRefresh,
  IconCheck,
  IconWarning
} from '../../shared/components/Icons';
import { buildFarmAnalytics, formatCurrency, formatMass } from './utils/analyticsBuilder';
import {
  ExpectedVsActualChart,
  MonthlyTrendChart,
  InputSpendChart,
  LivestockHerdChart,
  IncidentRiskChart
} from './components/AnalyticsCharts';

const FOCUS_OPTIONS = [
  { id: 'ALL', label: 'All Operations' },
  { id: 'CROP', label: 'Crop Production' },
  { id: 'LIVESTOCK', label: 'Livestock' }
];

const TIMEFRAME_OPTIONS = [
  { id: 'ALL', label: 'All Time' },
  { id: '180D', label: 'Last 6 Months' },
  { id: '90D', label: 'Last 90 Days' }
];

export function ReportsAnalyticsView({ farmerId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [focus, setFocus] = useState('ALL');
  const [timeframe, setTimeframe] = useState('ALL');
  const [rawData, setRawData] = useState({
    farms: [],
    cycles: [],
    harvestsByCycle: {},
    cropActivities: [],
    cropIncidents: [],
    animalGroups: [],
    animalProductions: [],
    animalActivities: [],
    animalIncidents: [],
    inputs: []
  });

  const loadAnalyticsData = useCallback(async () => {
    if (!farmerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [farmsRes, cyclesRes, groupsRes, inputsRes] = await Promise.allSettled([
        farmService.getFarms(),
        cropCycleService.getCycles(farmerId),
        animalGroupService.getGroups(),
        inputService.getInputs(farmerId)
      ]);

      const farms = farmsRes.status === 'fulfilled' && Array.isArray(farmsRes.value) ? farmsRes.value : [];
      const cycles = cyclesRes.status === 'fulfilled' && Array.isArray(cyclesRes.value) ? cyclesRes.value : [];
      const animalGroups = groupsRes.status === 'fulfilled' && Array.isArray(groupsRes.value) ? groupsRes.value : [];
      const inputs = inputsRes.status === 'fulfilled' && Array.isArray(inputsRes.value) ? inputsRes.value : [];

      const harvestsByCycle = {};
      const cropActivities = [];
      const cropIncidents = [];

      await Promise.allSettled(
        cycles.map(async (cycle) => {
          const [hRes, aRes, iRes] = await Promise.allSettled([
            String(cycle.status || '').toUpperCase() === 'COMPLETED'
              ? harvestService.getHarvest(farmerId, cycle.id)
              : Promise.resolve(null),
            cycleActivityService.getActivities(farmerId, cycle.id),
            cycleIncidentService.getIncidents(farmerId, cycle.id)
          ]);
          if (hRes.status === 'fulfilled' && hRes.value) {
            harvestsByCycle[cycle.id] = hRes.value;
          }
          if (aRes.status === 'fulfilled' && Array.isArray(aRes.value)) {
            cropActivities.push(...aRes.value);
          }
          if (iRes.status === 'fulfilled' && Array.isArray(iRes.value)) {
            cropIncidents.push(...iRes.value);
          }
        })
      );

      const animalProductions = [];
      const animalActivities = [];
      const animalIncidents = [];

      await Promise.allSettled(
        animalGroups.map(async (group) => {
          const [pRes, aRes, iRes] = await Promise.allSettled([
            animalGroupService.getProductions(group.id),
            animalGroupService.getActivities(group.id),
            animalGroupService.getIncidents(group.id)
          ]);
          if (pRes.status === 'fulfilled' && Array.isArray(pRes.value)) {
            animalProductions.push(...pRes.value);
          }
          if (aRes.status === 'fulfilled' && Array.isArray(aRes.value)) {
            animalActivities.push(...aRes.value);
          }
          if (iRes.status === 'fulfilled' && Array.isArray(iRes.value)) {
            animalIncidents.push(...iRes.value);
          }
        })
      );

      setRawData({
        farms,
        cycles,
        harvestsByCycle,
        cropActivities,
        cropIncidents,
        animalGroups,
        animalProductions,
        animalActivities,
        animalIncidents,
        inputs
      });
    } catch (err) {
      setError(err?.message || 'Unable to load farm analytics right now.');
    } finally {
      setLoading(false);
    }
  }, [farmerId]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const analytics = useMemo(
    () => buildFarmAnalytics({ ...rawData, timeframe }),
    [rawData, timeframe]
  );

  const handleExportCsv = () => {
    const rows = [
      ['Category', 'Name', 'Status', 'Expected / Initial', 'Actual / Current', 'Achievement / Retention']
    ];
    analytics.cycleComparisons.forEach((c) => {
      rows.push([
        'Crop Cycle',
        c.name,
        c.status,
        `${Math.round(c.expectedKg)} kg`,
        c.hasHarvest ? `${Math.round(c.actualKg)} kg` : 'Pending',
        c.achievementPct !== null ? `${c.achievementPct}%` : '—'
      ]);
    });
    analytics.animalGroups.forEach((g) => {
      const init = Number(g.initialPopulation) || 0;
      const curr = Number(g.currentPopulation) || 0;
      const rate = init > 0 ? `${Math.round((curr / init) * 100)}%` : '—';
      rows.push(['Livestock', g.name, g.status || 'ACTIVE', `${init} head`, `${curr} head`, rate]);
    });

    const csv = rows.map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `acrea-farm-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #ECE7DC', padding: '24px' }}>
          <Skeleton width="220px" height="20px" />
          <div style={{ marginTop: '12px' }}><SkeletonText lines={3} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #ECE7DC', padding: '22px' }}>
              <Skeleton width="180px" height="18px" />
              <div style={{ marginTop: '16px' }}><Skeleton width="100%" height="240px" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Filter & Action Toolbar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        border: '1px solid #ECE7DC',
        padding: '16px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          {FOCUS_OPTIONS.map((opt) => {
            const active = focus === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFocus(opt.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '999px',
                  border: active ? '1px solid #164230' : '1px solid #DFD8CA',
                  backgroundColor: active ? '#164230' : '#FFFFFF',
                  color: active ? '#FFFFFF' : '#4B5752',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            aria-label="Select timeframe"
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid #DFD8CA',
              backgroundColor: '#F9F6F0',
              color: '#19201C',
              fontSize: '0.84rem',
              fontWeight: 600
            }}
          >
            {TIMEFRAME_OPTIONS.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={loadAnalyticsData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid #DFD8CA',
              backgroundColor: '#FFFFFF',
              color: '#19201C',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <IconRefresh size={15} /> Refresh
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#3E7B52',
              color: '#FFFFFF',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Export CSV Report
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '14px',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#991B1B',
          fontSize: '0.88rem'
        }}>
          {error}
        </div>
      )}

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <MetricCard
          title="Total Harvested Output"
          value={formatMass(analytics.kpis.totalHarvestKg)}
          subtitle={analytics.kpis.overallYieldPct !== null
            ? `${analytics.kpis.overallYieldPct}% of expected yield`
            : `${analytics.kpis.activeCyclesCount} active crop cycle${analytics.kpis.activeCyclesCount === 1 ? '' : 's'}`}
          icon={<IconProduction size={20} />}
          iconBg="#EAF4ED"
          iconColor="#3E7B52"
        />
        <MetricCard
          title="Livestock Headcount"
          value={analytics.kpis.totalCurrentHeadcount.toLocaleString()}
          subtitle={analytics.kpis.survivalRatePct !== null
            ? `${analytics.kpis.survivalRatePct}% retention across ${analytics.kpis.animalGroupsCount} groups`
            : 'No animal groups yet'}
          icon={<IconLivestock size={20} />}
          iconBg="#FEF3C7"
          iconColor="#D97706"
        />
        <MetricCard
          title="Total Input Spend"
          value={formatCurrency(analytics.kpis.totalInputSpend)}
          subtitle="Seeds, fertilizer, pesticides & supplies"
          icon={<IconCrop size={20} />}
          iconBg="#E6F6F4"
          iconColor="#0D9488"
        />
        <MetricCard
          title="Operations & Risks"
          value={`${analytics.kpis.totalActivities} / ${analytics.kpis.totalIncidents}`}
          subtitle="Logged activities vs reported incidents"
          icon={<IconReports size={20} />}
          iconBg="#E8F5E9"
          iconColor="#164230"
        />
      </div>

      {/* Farmer-Friendly Plain-Language Summary */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        border: '1px solid #ECE7DC',
        padding: '22px'
      }}>
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#19201C' }}>
            Your Farm at a Glance — Key Takeaways
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#788680' }}>
            Plain-language summary of what your production, spending, and risk numbers mean right now
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {analytics.insights.map((ins, idx) => {
            const isPos = ins.tone === 'positive';
            const isWarn = ins.tone === 'warning';
            const bg = isPos ? '#EAF4ED' : isWarn ? '#FEF3C7' : '#F9F6F0';
            const border = isPos ? '#C8E2D0' : isWarn ? '#FDE68A' : '#ECE7DC';
            const iconColor = isPos ? '#2E7D32' : isWarn ? '#D97706' : '#3E7B52';

            return (
              <div key={idx} style={{
                backgroundColor: bg,
                border: `1px solid ${border}`,
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start'
              }}>
                <span style={{ color: iconColor, marginTop: '2px', flexShrink: 0 }}>
                  {isWarn ? <IconWarning size={18} /> : <IconCheck size={18} />}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#19201C', marginBottom: '4px' }}>
                    {ins.title}
                  </div>
                  <div style={{ fontSize: '0.83rem', color: '#4B5752', lineHeight: 1.45 }}>
                    {ins.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart.js Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {focus !== 'LIVESTOCK' && (
          <ExpectedVsActualChart cycleComparisons={analytics.cycleComparisons} />
        )}
        <MonthlyTrendChart monthly={analytics.monthly} />
        {focus !== 'LIVESTOCK' && (
          <InputSpendChart
            inputSpendByType={analytics.inputSpendByType}
            totalInputSpend={analytics.kpis.totalInputSpend}
          />
        )}
        {focus !== 'CROP' && (
          <LivestockHerdChart animalGroups={analytics.animalGroups} />
        )}
        <IncidentRiskChart incidents={analytics.incidents} />
      </div>

      {/* Detailed Performance Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        border: '1px solid #ECE7DC',
        padding: '22px',
        overflowX: 'auto'
      }}>
        <div style={{ marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#19201C' }}>
            Production & Herd Scoreboard
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#788680' }}>
            Exact numbers behind the charts above for every crop cycle and animal group
          </p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F4EFE6', textAlign: 'left', color: '#4B5752' }}>
              <th style={{ padding: '10px 12px', borderRadius: '8px 0 0 8px' }}>Type</th>
              <th style={{ padding: '10px 12px' }}>Name</th>
              <th style={{ padding: '10px 12px' }}>Status</th>
              <th style={{ padding: '10px 12px' }}>Target / Initial</th>
              <th style={{ padding: '10px 12px' }}>Actual / Current</th>
              <th style={{ padding: '10px 12px', borderRadius: '0 8px 8px 0' }}>Performance</th>
            </tr>
          </thead>
          <tbody>
            {focus !== 'LIVESTOCK' && analytics.cycleComparisons.map((c) => (
              <tr key={`crop-${c.id}`} style={{ borderBottom: '1px solid #ECE7DC' }}>
                <td style={{ padding: '11px 12px', fontWeight: 600, color: '#3E7B52' }}>Crop</td>
                <td style={{ padding: '11px 12px', fontWeight: 600, color: '#19201C' }}>{c.name}</td>
                <td style={{ padding: '11px 12px', color: '#4B5752' }}>{c.status}</td>
                <td style={{ padding: '11px 12px', color: '#4B5752' }}>
                  {c.expectedKg > 0 ? formatMass(c.expectedKg) : '—'}
                </td>
                <td style={{ padding: '11px 12px', fontWeight: 600, color: '#19201C' }}>
                  {c.hasHarvest ? formatMass(c.actualKg) : 'Awaiting harvest'}
                </td>
                <td style={{ padding: '11px 12px', fontWeight: 700, color: c.achievementPct >= 95 ? '#2E7D32' : '#D97706' }}>
                  {c.achievementPct !== null ? `${c.achievementPct}% of target` : 'In progress'}
                </td>
              </tr>
            ))}

            {focus !== 'CROP' && analytics.animalGroups.map((g) => {
              const init = Number(g.initialPopulation) || 0;
              const curr = Number(g.currentPopulation) || 0;
              const rate = init > 0 ? Math.round((curr / init) * 100) : null;
              return (
                <tr key={`animal-${g.id}`} style={{ borderBottom: '1px solid #ECE7DC' }}>
                  <td style={{ padding: '11px 12px', fontWeight: 600, color: '#D97706' }}>Livestock</td>
                  <td style={{ padding: '11px 12px', fontWeight: 600, color: '#19201C' }}>{g.name}</td>
                  <td style={{ padding: '11px 12px', color: '#4B5752' }}>{g.status || 'ACTIVE'}</td>
                  <td style={{ padding: '11px 12px', color: '#4B5752' }}>{init.toLocaleString()} head</td>
                  <td style={{ padding: '11px 12px', fontWeight: 600, color: '#19201C' }}>{curr.toLocaleString()} head</td>
                  <td style={{ padding: '11px 12px', fontWeight: 700, color: rate >= 92 ? '#2E7D32' : '#D97706' }}>
                    {rate !== null ? `${rate}% retained` : '—'}
                  </td>
                </tr>
              );
            })}

            {analytics.cycleComparisons.length === 0 && analytics.animalGroups.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#788680' }}>
                  No crop cycles or animal groups recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
