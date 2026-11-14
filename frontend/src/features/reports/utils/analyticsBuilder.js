/**
 * Pure analytics aggregation and Chart.js dataset builders for Acrea Reports & Analytics.
 * Translates raw crop, livestock, input, activity, and incident records into
 * farmer-friendly insights and Chart.js datasets.
 */

export function toKg(quantity, unit) {
  const val = Number(quantity) || 0;
  const u = String(unit || 'KG').toUpperCase();
  if (u === 'TONS' || u === 'TON' || u === 'T') return val * 1000;
  if (u === 'BAGS' || u === 'BAG') return val * 50;
  return val;
}

export function formatMass(kg) {
  const val = Number(kg) || 0;
  if (val >= 1000) {
    return `${(val / 1000).toFixed(2)} t`;
  }
  return `${Math.round(val).toLocaleString('en-US')} kg`;
}

export function formatCurrency(amount) {
  return `${Math.round(Number(amount) || 0).toLocaleString('en-US')} XAF`;
}

export function filterByDateRange(items, dateField, rangeKey) {
  if (!Array.isArray(items) || rangeKey === 'ALL') return items || [];
  const days = rangeKey === '90D' ? 90 : rangeKey === '180D' ? 180 : 365;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return items.filter((item) => {
    const raw = item?.[dateField];
    if (!raw) return true;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) || d >= cutoff;
  });
}

function monthKey(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(ym) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export function buildFarmAnalytics({
  farms = [],
  cycles = [],
  harvestsByCycle = {},
  cropActivities = [],
  cropIncidents = [],
  animalGroups = [],
  animalProductions = [],
  animalActivities = [],
  animalIncidents = [],
  inputs = [],
  timeframe = 'ALL'
}) {
  const filteredInputs = filterByDateRange(inputs, 'purchaseDate', timeframe);
  const filteredCropActivities = filterByDateRange(cropActivities, 'activityDate', timeframe);
  const filteredCropIncidents = filterByDateRange(cropIncidents, 'incidentDate', timeframe);
  const filteredAnimalProductions = filterByDateRange(animalProductions, 'recordDate', timeframe);
  const filteredAnimalActivities = filterByDateRange(animalActivities, 'activityDate', timeframe);
  const filteredAnimalIncidents = filterByDateRange(animalIncidents, 'incidentDate', timeframe);

  // 1. Crop Yield & Expected vs Actual
  const cycleComparisons = cycles.map((cycle) => {
    const harvest = harvestsByCycle[cycle.id] || null;
    const expectedKg = toKg(cycle.expectedQuantity ?? cycle.expectedYield ?? 0, cycle.expectedQuantityUnit || 'KG');
    const actualKg = harvest
      ? toKg(harvest.quantity ?? harvest.actualQuantity ?? 0, harvest.unit || 'KG')
      : 0;
    const achievementPct = expectedKg > 0 && harvest ? Math.round((actualKg / expectedKg) * 100) : null;
    return {
      id: cycle.id,
      name: cycle.name || cycle.cropName || `Cycle #${cycle.id}`,
      cropName: cycle.cropName || 'Crop',
      status: String(cycle.status || 'ACTIVE').toUpperCase(),
      plantingDate: cycle.plantingDate,
      harvestDate: harvest?.harvestDate || null,
      expectedKg,
      actualKg,
      hasHarvest: Boolean(harvest),
      achievementPct,
      acreage: Number(cycle.acreage) || 0
    };
  });

  const harvestedCycles = cycleComparisons.filter((c) => c.hasHarvest);
  const totalHarvestKg = harvestedCycles.reduce((sum, c) => sum + c.actualKg, 0);
  const totalExpectedOnHarvestedKg = harvestedCycles.reduce((sum, c) => sum + c.expectedKg, 0);
  const overallYieldPct = totalExpectedOnHarvestedKg > 0
    ? Math.round((totalHarvestKg / totalExpectedOnHarvestedKg) * 100)
    : null;

  // 2. Livestock Headcount & Production
  const totalInitialHeadcount = animalGroups.reduce((sum, g) => sum + (Number(g.initialPopulation) || 0), 0);
  const totalCurrentHeadcount = animalGroups.reduce((sum, g) => sum + (Number(g.currentPopulation) || 0), 0);
  const survivalRatePct = totalInitialHeadcount > 0
    ? Math.round((totalCurrentHeadcount / totalInitialHeadcount) * 100)
    : null;

  const animalProductionByType = {};
  filteredAnimalProductions.forEach((rec) => {
    const type = rec.productType || rec.productionType || 'Other';
    const qty = Number(rec.quantity) || 0;
    animalProductionByType[type] = (animalProductionByType[type] || 0) + qty;
  });

  // 3. Input Spend Breakdown
  const inputSpendByType = { SEEDS: 0, FERTILIZER: 0, PESTICIDE: 0, OTHER: 0 };
  filteredInputs.forEach((inp) => {
    const type = String(inp.type || inp.inputType || 'OTHER').toUpperCase();
    const bucket = Object.prototype.hasOwnProperty.call(inputSpendByType, type) ? type : 'OTHER';
    const cost = Number(inp.totalCost ?? inp.purchasePrice ?? 0);
    inputSpendByType[bucket] += cost;
  });
  const totalInputSpend = Object.values(inputSpendByType).reduce((s, v) => s + v, 0);

  // 4. Monthly Timeline (Harvest kg, Animal output units, Activities count)
  const monthlyMap = {};
  const ensureMonth = (ym) => {
    if (!ym) return null;
    if (!monthlyMap[ym]) {
      monthlyMap[ym] = { harvestKg: 0, animalQty: 0, activities: 0, incidents: 0 };
    }
    return monthlyMap[ym];
  };

  harvestedCycles.forEach((c) => {
    const ym = monthKey(c.harvestDate);
    if (ym && (timeframe === 'ALL' || filterByDateRange([{ d: c.harvestDate }], 'd', timeframe).length > 0)) {
      ensureMonth(ym).harvestKg += c.actualKg;
    }
  });
  filteredAnimalProductions.forEach((p) => {
    const ym = monthKey(p.recordDate);
    if (ym) ensureMonth(ym).animalQty += Number(p.quantity) || 0;
  });
  [...filteredCropActivities, ...filteredAnimalActivities].forEach((a) => {
    const ym = monthKey(a.activityDate);
    if (ym) ensureMonth(ym).activities += 1;
  });
  [...filteredCropIncidents, ...filteredAnimalIncidents].forEach((inc) => {
    const ym = monthKey(inc.incidentDate);
    if (ym) ensureMonth(ym).incidents += 1;
  });

  const sortedMonths = Object.keys(monthlyMap).sort();
  const monthlyLabels = sortedMonths.map(formatMonthLabel);

  // 5. Incidents by Type & Severity
  const allIncidents = [
    ...filteredCropIncidents.map((i) => ({ ...i, source: 'Crop' })),
    ...filteredAnimalIncidents.map((i) => ({ ...i, source: 'Livestock' }))
  ];
  const incidentTypeCounts = {};
  const severityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  allIncidents.forEach((inc) => {
    const t = String(inc.incidentType || 'OTHER').toUpperCase();
    incidentTypeCounts[t] = (incidentTypeCounts[t] || 0) + 1;
    const sev = String(inc.severityLevel || inc.severity || 'MEDIUM').toUpperCase();
    if (Object.prototype.hasOwnProperty.call(severityCounts, sev)) {
      severityCounts[sev] += 1;
    } else {
      severityCounts.MEDIUM += 1;
    }
  });

  // 6. Plain-Language Farmer Insights
  const insights = [];
  if (harvestedCycles.length > 0 && overallYieldPct !== null) {
    const best = [...harvestedCycles].sort((a, b) => (b.achievementPct || 0) - (a.achievementPct || 0))[0];
    insights.push({
      tone: overallYieldPct >= 95 ? 'positive' : 'warning',
      title: overallYieldPct >= 95 ? 'Strong harvest performance' : 'Harvest below target',
      detail: `Your harvested cycles reached ${overallYieldPct}% of expected yield (${formatMass(totalHarvestKg)} total).${best ? ` Top performer: ${best.name} (${best.achievementPct ?? 100}% of target).` : ''}`
    });
  } else if (cycles.length > 0) {
    insights.push({
      tone: 'neutral',
      title: `${cycles.length} crop cycle${cycles.length > 1 ? 's' : ''} in progress`,
      detail: 'No harvests recorded yet for these cycles. Once you log a harvest, Acrea will compare expected vs actual yield automatically.'
    });
  }

  if (totalInputSpend > 0) {
    const topCategory = Object.entries(inputSpendByType).sort((a, b) => b[1] - a[1])[0];
    const pct = Math.round((topCategory[1] / totalInputSpend) * 100);
    insights.push({
      tone: 'neutral',
      title: `${topCategory[0].charAt(0) + topCategory[0].slice(1).toLowerCase()} is your biggest input cost`,
      detail: `You invested ${formatCurrency(totalInputSpend)} in farm inputs, with ${pct}% (${formatCurrency(topCategory[1])}) going toward ${topCategory[0].toLowerCase()}.`
    });
  }

  if (animalGroups.length > 0 && survivalRatePct !== null) {
    insights.push({
      tone: survivalRatePct >= 92 ? 'positive' : 'warning',
      title: `Livestock retention at ${survivalRatePct}%`,
      detail: `Across ${animalGroups.length} animal group${animalGroups.length > 1 ? 's' : ''}, ${totalCurrentHeadcount.toLocaleString()} of ${totalInitialHeadcount.toLocaleString()} animals are active, with ${filteredAnimalProductions.length} production log${filteredAnimalProductions.length === 1 ? '' : 's'}.`
    });
  }

  if (allIncidents.length > 0) {
    const highRisk = severityCounts.HIGH + severityCounts.CRITICAL;
    const topType = Object.entries(incidentTypeCounts).sort((a, b) => b[1] - a[1])[0];
    insights.push({
      tone: highRisk > 0 ? 'warning' : 'neutral',
      title: `${allIncidents.length} field & herd incident${allIncidents.length > 1 ? 's' : ''} logged`,
      detail: `Most frequent issue: ${topType[0].toLowerCase()} (${topType[1]} report${topType[1] > 1 ? 's' : ''}). ${highRisk > 0 ? `${highRisk} marked high or critical — review mitigation actions.` : 'All reported incidents are low or medium severity.'}`
    });
  }

  if (insights.length === 0) {
    insights.push({
      tone: 'neutral',
      title: 'Start logging farm records to unlock trend insights',
      detail: 'Add crop cycles, livestock groups, inputs, or daily activities to see yield comparisons, spending breakdowns, and seasonal trends here.'
    });
  }

  return {
    kpis: {
      farmsCount: farms.length,
      cyclesCount: cycles.length,
      activeCyclesCount: cycles.filter((c) => String(c.status || '').toUpperCase() === 'ACTIVE').length,
      completedCyclesCount: cycles.filter((c) => String(c.status || '').toUpperCase() === 'COMPLETED').length,
      totalHarvestKg,
      overallYieldPct,
      animalGroupsCount: animalGroups.length,
      totalCurrentHeadcount,
      survivalRatePct,
      totalInputSpend,
      totalActivities: filteredCropActivities.length + filteredAnimalActivities.length,
      totalIncidents: allIncidents.length
    },
    cycleComparisons,
    animalGroups,
    animalProductionByType,
    inputSpendByType,
    monthly: {
      labels: monthlyLabels,
      harvestKg: sortedMonths.map((m) => Math.round(monthlyMap[m].harvestKg)),
      animalQty: sortedMonths.map((m) => Math.round(monthlyMap[m].animalQty)),
      activities: sortedMonths.map((m) => monthlyMap[m].activities),
      incidents: sortedMonths.map((m) => monthlyMap[m].incidents)
    },
    incidents: {
      byType: incidentTypeCounts,
      bySeverity: severityCounts
    },
    insights
  };
}

