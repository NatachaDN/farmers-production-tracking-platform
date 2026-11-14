import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFarmAnalytics, toKg, formatMass, formatCurrency } from '../utils/analyticsBuilder.js';

test('toKg converts TONS, BAGS, and KG accurately', () => {
  assert.equal(toKg(2, 'TONS'), 2000);
  assert.equal(toKg(10, 'BAGS'), 500);
  assert.equal(toKg(150, 'KG'), 150);
  assert.equal(formatMass(2500), '2.50 t');
  assert.equal(formatMass(450), '450 kg');
  assert.equal(formatCurrency(125000), '125,000 XAF');
});

test('buildFarmAnalytics aggregates crop, livestock, input, and incident insights', () => {
  const result = buildFarmAnalytics({
    farms: [{ id: 1, name: 'Green Acres' }],
    cycles: [
      { id: 10, name: 'Maize A', cropName: 'Maize', status: 'COMPLETED', expectedQuantity: 1000, expectedQuantityUnit: 'KG' },
      { id: 11, name: 'Cassava B', cropName: 'Cassava', status: 'ACTIVE', expectedQuantity: 2, expectedQuantityUnit: 'TONS' }
    ],
    harvestsByCycle: {
      10: { quantity: 1.2, unit: 'TONS', harvestDate: '2026-10-15' }
    },
    cropActivities: [{ id: 1, activityDate: '2026-10-05' }],
    cropIncidents: [{ id: 1, incidentType: 'PEST', severityLevel: 'HIGH', incidentDate: '2026-10-08' }],
    animalGroups: [
      { id: 20, name: 'Broilers', initialPopulation: 200, currentPopulation: 190, status: 'ACTIVE' }
    ],
    animalProductions: [{ id: 1, productType: 'MEAT', quantity: 350, recordDate: '2026-10-20' }],
    animalActivities: [{ id: 2, activityDate: '2026-10-11' }],
    animalIncidents: [],
    inputs: [
      { id: 1, type: 'FERTILIZER', totalCost: 80000, purchaseDate: '2026-10-01' },
      { id: 2, type: 'SEEDS', totalCost: 20000, purchaseDate: '2026-10-01' }
    ]
  });

  assert.equal(result.kpis.totalHarvestKg, 1200);
  assert.equal(result.kpis.overallYieldPct, 120);
  assert.equal(result.kpis.totalCurrentHeadcount, 190);
  assert.equal(result.kpis.survivalRatePct, 95);
  assert.equal(result.kpis.totalInputSpend, 100000);
  assert.equal(result.kpis.totalActivities, 2);
  assert.equal(result.kpis.totalIncidents, 1);
  assert.equal(result.inputSpendByType.FERTILIZER, 80000);
  assert.equal(result.incidents.byType.PEST, 1);
  assert.ok(result.insights.length >= 3);
});

