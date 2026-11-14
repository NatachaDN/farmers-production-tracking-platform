import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { formatCurrency, formatMass } from '../utils/analyticsBuilder';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BASE_FONT = {
  family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  size: 12
};

function ChartCard({ title, subtitle, takeaway, isEmpty, emptyText, badge, children }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '18px',
      border: '1px solid #ECE7DC',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '14px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#19201C' }}>{title}</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#788680' }}>{subtitle}</p>
        </div>
        {badge && (
          <span style={{
            padding: '4px 10px',
            borderRadius: '999px',
            backgroundColor: '#EAF4ED',
            color: '#164230',
            fontSize: '0.75rem',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}>
            {badge}
          </span>
        )}
      </div>

      <div style={{ height: '260px', position: 'relative' }}>
        {isEmpty ? (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            backgroundColor: '#F9F6F0',
            borderRadius: '12px',
            border: '1px dashed #DFD8CA',
            padding: '20px',
            color: '#788680',
            fontSize: '0.88rem'
          }}>
            {emptyText}
          </div>
        ) : children}
      </div>

      {takeaway && (
        <div style={{
          backgroundColor: '#F9F6F0',
          borderLeft: '3px solid #3E7B52',
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '0.83rem',
          color: '#4B5752',
          lineHeight: 1.45
        }}>
          <strong style={{ color: '#164230' }}>What this means: </strong>
          {takeaway}
        </div>
      )}
    </div>
  );
}

export function ExpectedVsActualChart({ cycleComparisons }) {
  const withTargets = cycleComparisons.filter((c) => c.expectedKg > 0 || c.actualKg > 0).slice(0, 8);
  const harvestedCount = withTargets.filter((c) => c.hasHarvest).length;

  const data = {
    labels: withTargets.map((c) => c.name.length > 18 ? `${c.name.slice(0, 16)}…` : c.name),
    datasets: [
      {
        label: 'Expected Yield (kg)',
        data: withTargets.map((c) => Math.round(c.expectedKg)),
        backgroundColor: 'rgba(217, 119, 6, 0.28)',
        borderColor: '#D97706',
        borderWidth: 1.5,
        borderRadius: 6
      },
      {
        label: 'Actual Harvest (kg)',
        data: withTargets.map((c) => Math.round(c.actualKg)),
        backgroundColor: '#3E7B52',
        borderColor: '#164230',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: BASE_FONT, color: '#4B5752', usePointStyle: true } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString()} kg`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: BASE_FONT, color: '#4B5752' } },
      y: { beginAtZero: true, grid: { color: '#F0ECE1' }, ticks: { font: BASE_FONT, color: '#788680' } }
    }
  };

  let takeaway = 'Add expected quantities on your crop cycles and log harvests to compare target vs actual output.';
  if (harvestedCount > 0) {
    const best = [...withTargets].filter((c) => c.achievementPct !== null).sort((a, b) => b.achievementPct - a.achievementPct)[0];
    takeaway = best
      ? `${harvestedCount} cycle${harvestedCount > 1 ? 's' : ''} harvested. "${best.name}" reached ${best.achievementPct}% of its target (${formatMass(best.actualKg)}).`
      : `${harvestedCount} cycle${harvestedCount > 1 ? 's' : ''} harvested so far.`;
  } else if (withTargets.length > 0) {
    takeaway = `You have ${withTargets.length} crop cycle${withTargets.length > 1 ? 's' : ''} with expected targets. Green bars will fill in as you record harvests.`;
  }

  return (
    <ChartCard
      title="Crop Target vs Actual Harvest"
      subtitle="Compares what you planned to harvest against what you actually harvested (in kg)"
      badge={`${withTargets.length} Cycles`}
      isEmpty={withTargets.length === 0}
      emptyText="No crop cycles with yield targets yet. Create a crop cycle to see yield comparisons."
      takeaway={takeaway}
    >
      <Bar data={data} options={options} />
    </ChartCard>
  );
}

export function MonthlyTrendChart({ monthly }) {
  const hasData = monthly.labels.length > 0;
  const data = {
    labels: monthly.labels,
    datasets: [
      {
        label: 'Crop Harvest (kg)',
        data: monthly.harvestKg,
        borderColor: '#3E7B52',
        backgroundColor: 'rgba(62, 123, 82, 0.14)',
        tension: 0.35,
        fill: true,
        yAxisID: 'y'
      },
      {
        label: 'Field & Herd Activities',
        data: monthly.activities,
        borderColor: '#0D9488',
        backgroundColor: 'rgba(13, 148, 136, 0.12)',
        tension: 0.35,
        fill: false,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { font: BASE_FONT, color: '#4B5752', usePointStyle: true } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: BASE_FONT, color: '#4B5752' } },
      y: {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        grid: { color: '#F0ECE1' },
        title: { display: true, text: 'Harvest (kg)', font: BASE_FONT, color: '#3E7B52' }
      },
      y1: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Activities', font: BASE_FONT, color: '#0D9488' }
      }
    }
  };

  const totalActs = monthly.activities.reduce((s, v) => s + v, 0);
  const totalKg = monthly.harvestKg.reduce((s, v) => s + v, 0);
  const takeaway = hasData
    ? `Across ${monthly.labels.length} active month${monthly.labels.length > 1 ? 's' : ''}, you logged ${totalActs} operation${totalActs === 1 ? '' : 's'} and harvested ${formatMass(totalKg)}.`
    : 'Log daily activities or harvests to track your farm momentum month by month.';

  return (
    <ChartCard
      title="Seasonal Production & Work Trend"
      subtitle="Monthly view of harvested output (kg) alongside completed farm activities"
      badge="Timeline"
      isEmpty={!hasData}
      emptyText="No dated activities or harvests in this timeframe yet."
      takeaway={takeaway}
    >
      <Line data={data} options={options} />
    </ChartCard>
  );
}

export function InputSpendChart({ inputSpendByType, totalInputSpend }) {
  const entries = [
    { key: 'SEEDS', label: 'Seeds', color: '#3E7B52' },
    { key: 'FERTILIZER', label: 'Fertilizer', color: '#D97706' },
    { key: 'PESTICIDE', label: 'Pesticides', color: '#0D9488' },
    { key: 'OTHER', label: 'Other Inputs', color: '#788680' }
  ].filter((e) => (inputSpendByType[e.key] || 0) > 0);

  const data = {
    labels: entries.map((e) => e.label),
    datasets: [
      {
        data: entries.map((e) => inputSpendByType[e.key]),
        backgroundColor: entries.map((e) => e.color),
        borderColor: '#FFFFFF',
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: { position: 'right', labels: { font: BASE_FONT, color: '#4B5752', usePointStyle: true, padding: 14 } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = Number(ctx.raw) || 0;
            const pct = totalInputSpend > 0 ? Math.round((val / totalInputSpend) * 100) : 0;
            return `${ctx.label}: ${formatCurrency(val)} (${pct}%)`;
          }
        }
      }
    }
  };

  const top = [...entries].sort((a, b) => inputSpendByType[b.key] - inputSpendByType[a.key])[0];
  const takeaway = top && totalInputSpend > 0
    ? `${top.label} is your largest expense at ${formatCurrency(inputSpendByType[top.key])} (${Math.round((inputSpendByType[top.key] / totalInputSpend) * 100)}% of total input spend).`
    : 'Register seeds, fertilizers, or pesticides with purchase prices to see where your budget goes.';

  return (
    <ChartCard
      title="Input Budget Breakdown"
      subtitle="Share of spending across seeds, fertilizers, pesticides, and other supplies"
      badge={formatCurrency(totalInputSpend)}
      isEmpty={entries.length === 0 || totalInputSpend <= 0}
      emptyText="No input purchase costs recorded yet."
      takeaway={takeaway}
    >
      <Doughnut data={data} options={options} />
    </ChartCard>
  );
}

export function LivestockHerdChart({ animalGroups }) {
  const groups = animalGroups.slice(0, 8);
  const data = {
    labels: groups.map((g) => (g.name || 'Group').length > 16 ? `${g.name.slice(0, 14)}…` : g.name),
    datasets: [
      {
        label: 'Starting Headcount',
        data: groups.map((g) => Number(g.initialPopulation) || 0),
        backgroundColor: 'rgba(120, 134, 128, 0.25)',
        borderColor: '#788680',
        borderWidth: 1,
        borderRadius: 6
      },
      {
        label: 'Current Headcount',
        data: groups.map((g) => Number(g.currentPopulation) || 0),
        backgroundColor: '#D97706',
        borderColor: '#B45309',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: BASE_FONT, color: '#4B5752', usePointStyle: true } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: BASE_FONT, color: '#4B5752' } },
      y: { beginAtZero: true, grid: { color: '#F0ECE1' }, ticks: { font: BASE_FONT, color: '#788680' } }
    }
  };

  const totalInit = groups.reduce((s, g) => s + (Number(g.initialPopulation) || 0), 0);
  const totalCurr = groups.reduce((s, g) => s + (Number(g.currentPopulation) || 0), 0);
  const rate = totalInit > 0 ? Math.round((totalCurr / totalInit) * 100) : 0;

  return (
    <ChartCard
      title="Livestock Headcount & Retention"
      subtitle="Compares initial stock against current live animals in each herd or flock"
      badge={`${totalCurr.toLocaleString()} Active`}
      isEmpty={groups.length === 0}
      emptyText="No animal groups registered yet. Add a herd or flock in Livestock to track retention."
      takeaway={groups.length > 0 ? `Overall herd survival/retention is ${rate}% (${totalCurr.toLocaleString()} of ${totalInit.toLocaleString()} animals).` : ''}
    >
      <Bar data={data} options={options} />
    </ChartCard>
  );
}

export function IncidentRiskChart({ incidents }) {
  const typeEntries = Object.entries(incidents.byType || {}).sort((a, b) => b[1] - a[1]);
  const total = typeEntries.reduce((s, [, count]) => s + count, 0);

  const data = {
    labels: typeEntries.map(([t]) => t.charAt(0) + t.slice(1).toLowerCase()),
    datasets: [
      {
        label: 'Reported Incidents',
        data: typeEntries.map(([, count]) => count),
        backgroundColor: ['#DC2626', '#D97706', '#0D9488', '#3E7B52', '#788680'],
        borderRadius: 6
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { beginAtZero: true, ticks: { stepSize: 1, font: BASE_FONT, color: '#788680' }, grid: { color: '#F0ECE1' } },
      y: { grid: { display: false }, ticks: { font: BASE_FONT, color: '#19201C' } }
    }
  };

  const highCount = (incidents.bySeverity?.HIGH || 0) + (incidents.bySeverity?.CRITICAL || 0);
  const takeaway = total > 0
    ? `${typeEntries[0][0].toLowerCase()} is your #1 incident category (${typeEntries[0][1]} case${typeEntries[0][1] > 1 ? 's' : ''}). ${highCount > 0 ? `${highCount} marked High/Critical need follow-up.` : 'No high-severity alerts active.'}`
    : 'Zero incidents reported — your crops and livestock have no logged pest, disease, or weather damage.';

  return (
    <ChartCard
      title="Field & Herd Risk Profile"
      subtitle="Frequency of pests, diseases, weather damage, or livestock health events"
      badge={`${total} Total`}
      isEmpty={total === 0}
      emptyText="No incidents recorded. That means healthy fields and herds!"
      takeaway={takeaway}
    >
      <Bar data={data} options={options} />
    </ChartCard>
  );
}

