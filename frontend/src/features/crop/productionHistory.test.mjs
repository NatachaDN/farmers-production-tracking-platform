import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareHarvest, filterProductionCycles } from './productionHistory.js';

test('compares harvest and target in the target unit', () => {
  assert.deepEqual(compareHarvest({ expectedQuantity: 800 }, { quantity: 0.9, unit: 'TONS' }), {
    expected: 800, actual: 900, unit: 'kg', difference: 100, percent: 12.5,
  });
  assert.deepEqual(compareHarvest({ expectedQuantity: 10, expectedQuantityUnit: 'bags' }, { quantity: 8, unit: 'BAGS' }), {
    expected: 10, actual: 8, unit: 'bags', difference: -2, percent: -20,
  });
  assert.equal(compareHarvest({ expectedQuantity: 0.3, expectedQuantityUnit: 'tons' }, { quantity: 300, unit: 'KG' }).difference, 0);
});

test('omits the gap when a target is missing or the units have no conversion', () => {
  assert.equal(compareHarvest({}, { quantity: 900, unit: 'KG' }), null);
  assert.deepEqual(compareHarvest({ expectedQuantity: 10, expectedQuantityUnit: 'crates' }, { quantity: 900, unit: 'KG' }), {
    expected: 10, unit: 'crates',
  });
});

test('sorts newest cycles first and combines crop, status and inclusive date filters', () => {
  const cycles = [
    { id: 1, cropName: 'Maize', status: 'COMPLETED', plantingDate: '2026-05-01' },
    { id: 2, cropName: 'Maize', status: 'COMPLETED', plantingDate: '2026-05-31' },
    { id: 3, cropName: 'Maize', status: 'ACTIVE', plantingDate: '2026-05-10' },
    { id: 4, cropName: 'Beans', status: 'COMPLETED', plantingDate: '2026-05-12' },
    { id: 5, cropName: 'Maize', status: 'COMPLETED', plantingDate: '2026-06-01' },
  ];
  assert.deepEqual(filterProductionCycles(cycles, {}).map(cycle => cycle.id), [5, 2, 4, 3, 1]);
  assert.deepEqual(filterProductionCycles(cycles, {
    crop: 'Maize', status: 'COMPLETED', from: '2026-05-01', to: '2026-05-31',
  }).map(cycle => cycle.id), [2, 1]);
  assert.deepEqual(filterProductionCycles(cycles, { from: '2026-06-01', to: '2026-05-31' }), []);
  assert.deepEqual(cycles.map(cycle => cycle.id), [1, 2, 3, 4, 5]);
});
