import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { managerService } from '../services/managerService.js';
import { authService } from '../../auth/services/authService.js';
import { apiClient } from '../../../shared/services/apiClient.js';

describe('Manager Supervision & Operations - Frontend Tests', () => {
  let originalGet, originalPost, originalPut, originalDelete;
  let recordedCalls = [];

  beforeEach(() => {
    recordedCalls = [];
    originalGet = apiClient.get;
    originalPost = apiClient.post;
    originalPut = apiClient.put;
    originalDelete = apiClient.delete;

    apiClient.get = async (endpoint, options) => {
      recordedCalls.push({ method: 'GET', endpoint, options });
      if (endpoint === '/manager/dashboard') {
        return {
          totalFarmers: 12,
          pendingFarmers: 3,
          approvedFarmers: 9,
          totalHarvestTons: 45.8,
          activeCyclesCount: 15,
          activeAlertsCount: 2,
        };
      }
      if (endpoint === '/manager/farmers/1') {
        return {
          farmer: { id: 1, fullName: 'Joyce Muthoni', status: 'APPROVED' },
          farms: [{ id: 10, name: 'Green Valley' }],
          plots: [{ id: 20, name: 'North Plot', area: 5.0 }],
          cycles: [{ id: 30, name: 'Maize 2026', status: 'ACTIVE' }],
          harvests: [{ id: 40, quantityKg: 4500 }],
        };
      }
      if (endpoint.startsWith('/manager/farmers')) {
        return [
          { id: 1, fullName: 'Joyce Muthoni', status: 'APPROVED', plotsCount: 3, activeCycles: 2, harvestedKg: 4500 },
          { id: 2, fullName: 'Kofi Mensah', status: 'PENDING', plotsCount: 1, activeCycles: 1, harvestedKg: 0 }
        ];
      }
      throw new Error('Not found: ' + endpoint);
    };

    apiClient.put = async (endpoint, body) => {
      recordedCalls.push({ method: 'PUT', endpoint, body });
      if (endpoint === '/manager/farmers/2/status') {
        return { id: 2, fullName: 'Kofi Mensah', status: body.status, rejectionReason: body.rejectionReason };
      }
      return body;
    };

    apiClient.post = async (endpoint, body) => {
      recordedCalls.push({ method: 'POST', endpoint, body });
      if (endpoint === '/manager/reports/consolidated') {
        return {
          reportId: 'REP-2026-TEST',
          totalFarmersCount: 2,
          totalYieldTons: 15.0,
          totalYieldKg: 15000.0,
          cropBreakdown: [{ cropName: 'Maize', yieldKg: 15000, sharePercent: 100 }],
          farmerBreakdown: [{ farmerName: 'Joyce Muthoni', harvestedKg: 15000 }]
        };
      }
      return body;
    };
  });

  // ---------------------------------------------------------------------------
  // 1. Role-based Access Checks
  // ---------------------------------------------------------------------------
  describe('authService.isManager role detection', () => {
    test('isManager returns true for ROLE_MANAGER', () => {
      assert.equal(authService.isManager({ role: 'ROLE_MANAGER' }), true);
    });

    test('isManager returns true for ROLE_ADMIN', () => {
      assert.equal(authService.isManager({ role: 'ROLE_ADMIN' }), true);
    });

    test('isManager returns false for regular ROLE_FARMER', () => {
      assert.equal(authService.isManager({ role: 'ROLE_FARMER' }), false);
      assert.equal(authService.isManager(null), false);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. US-33: Aggregated Dashboard Service
  // ---------------------------------------------------------------------------
  describe('US-33: managerService.getDashboard', () => {
    test('fetches aggregated dashboard indicators', async () => {
      const summary = await managerService.getDashboard();
      assert.equal(summary.totalFarmers, 12);
      assert.equal(summary.pendingFarmers, 3);
      assert.equal(summary.totalHarvestTons, 45.8);
      assert.equal(recordedCalls[0].method, 'GET');
      assert.equal(recordedCalls[0].endpoint, '/manager/dashboard');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. US-31 & US-32: Farmer Directory, Search, and Filtering
  // ---------------------------------------------------------------------------
  describe('US-31 & US-32: managerService.getFarmers', () => {
    test('fetches all farmers when no filters applied', async () => {
      const list = await managerService.getFarmers();
      assert.equal(list.length, 2);
      assert.equal(recordedCalls[0].endpoint, '/manager/farmers?sort=name');
    });

    test('encodes query parameters for search, region, crop, status, and sort', async () => {
      await managerService.getFarmers({
        search: 'Joyce',
        region: 'Rift Valley',
        crop: 'Maize',
        status: 'APPROVED',
        sort: 'cycles'
      });
      const ep = recordedCalls[0].endpoint;
      assert.ok(ep.includes('search=Joyce'));
      assert.ok(ep.includes('region=Rift+Valley'));
      assert.ok(ep.includes('crop=Maize'));
      assert.ok(ep.includes('status=APPROVED'));
      assert.ok(ep.includes('sort=cycles'));
    });
  });

  // ---------------------------------------------------------------------------
  // 4. US-33: Drilldown Detail
  // ---------------------------------------------------------------------------
  describe('US-33: managerService.getFarmerDetail', () => {
    test('retrieves detailed drilldown with farms, plots, and cycles', async () => {
      const detail = await managerService.getFarmerDetail(1);
      assert.equal(detail.farmer.fullName, 'Joyce Muthoni');
      assert.equal(detail.farms.length, 1);
      assert.equal(detail.plots.length, 1);
      assert.equal(detail.cycles.length, 1);
      assert.equal(recordedCalls[0].endpoint, '/manager/farmers/1');
    });
  });

  // ---------------------------------------------------------------------------
  // 5. US-34: Approve / Reject Registration Status
  // ---------------------------------------------------------------------------
  describe('US-34: managerService.updateFarmerStatus', () => {
    test('approves a pending farmer registration', async () => {
      const updated = await managerService.updateFarmerStatus(2, 'APPROVED', null);
      assert.equal(updated.status, 'APPROVED');
      assert.equal(recordedCalls[0].method, 'PUT');
      assert.equal(recordedCalls[0].endpoint, '/manager/farmers/2/status');
      assert.deepEqual(recordedCalls[0].body, { status: 'APPROVED', rejectionReason: null });
    });

    test('rejects a farmer registration with reason', async () => {
      const updated = await managerService.updateFarmerStatus(2, 'REJECTED', 'Documents unverified');
      assert.equal(updated.status, 'REJECTED');
      assert.equal(updated.rejectionReason, 'Documents unverified');
      assert.deepEqual(recordedCalls[0].body, { status: 'REJECTED', rejectionReason: 'Documents unverified' });
    });
  });

  // ---------------------------------------------------------------------------
  // 6. US-35: Consolidated Production Report
  // ---------------------------------------------------------------------------
  describe('US-35: managerService.generateConsolidatedReport', () => {
    test('submits filter payload and receives consolidated report', async () => {
      const rep = await managerService.generateConsolidatedReport({
        startDate: '2026-01-01',
        endDate: '2026-06-30',
        farmerIds: [1, 2],
        region: 'Rift Valley',
        crop: 'Maize'
      });
      assert.equal(rep.reportId, 'REP-2026-TEST');
      assert.equal(rep.totalFarmersCount, 2);
      assert.equal(rep.totalYieldTons, 15.0);
      assert.equal(recordedCalls[0].method, 'POST');
      assert.equal(recordedCalls[0].endpoint, '/manager/reports/consolidated');
      assert.deepEqual(recordedCalls[0].body, {
        startDate: '2026-01-01',
        endDate: '2026-06-30',
        farmerIds: [1, 2],
        region: 'Rift Valley',
        crop: 'Maize'
      });
    });
  });
});
