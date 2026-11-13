const units = {
  kg: { label: 'kg', group: 'weight', scale: 1 },
  t: { label: 't', group: 'weight', scale: 1000 },
  ton: { label: 't', group: 'weight', scale: 1000 },
  tons: { label: 't', group: 'weight', scale: 1000 },
  tonne: { label: 't', group: 'weight', scale: 1000 },
  tonnes: { label: 't', group: 'weight', scale: 1000 },
  bag: { label: 'bags', group: 'bag', scale: 1 },
  bags: { label: 'bags', group: 'bag', scale: 1 },
  crates: { label: 'crates', group: 'crate', scale: 1 },
};

export function compareHarvest(cycle, harvest) {
  const expected = cycle?.expectedQuantity;
  if (!Number.isFinite(expected) || expected <= 0) return null;

  const expectedUnit = cycle.expectedQuantityUnit?.trim().toLowerCase() || 'kg';
  const actualUnit = harvest.unit?.trim().toLowerCase();
  const target = Object.hasOwn(units, expectedUnit) ? units[expectedUnit] : null;
  const recorded = Object.hasOwn(units, actualUnit) ? units[actualUnit] : null;
  const comparison = { expected, unit: target?.label ?? expectedUnit };
  if (!target || !recorded || target.group !== recorded.group || !Number.isFinite(harvest.quantity) || harvest.quantity <= 0) {
    return comparison;
  }

  const actual = harvest.quantity * (recorded.scale / target.scale);
  const delta = actual - expected;
  const difference = Math.abs(delta) <= Number.EPSILON * Math.max(actual, expected) * 4 ? 0 : delta;
  const percent = (difference / expected) * 100;
  if (!Number.isFinite(actual) || !Number.isFinite(percent)) return comparison;
  return { ...comparison, actual, difference, percent };
}

export function filterProductionCycles(cycles, { crop, status, from, to }) {
  return cycles.filter(cycle => {
    const date = cycle.plantingDate;
    return (!crop || cycle.cropName === crop)
      && (!status || cycle.status === status)
      && (!from || (date && date >= from))
      && (!to || (date && date <= to));
  }).sort((left, right) => (right.plantingDate || '').localeCompare(left.plantingDate || '') || right.id - left.id);
}
