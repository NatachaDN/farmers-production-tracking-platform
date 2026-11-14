import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { animalGroupService } from '../services/animalGroupService.js';
import { apiClient } from '../../../shared/services/apiClient.js';

describe('Animal Group Management - Frontend Tests', () => {

  // ---------------------------------------------------------------------------
  // 1. Service & API Client Integration Tests
  // ---------------------------------------------------------------------------
  describe('animalGroupService CRUD operations', () => {
    let originalGet, originalPost, originalPut, originalDelete;
    let recordedCalls = [];

    beforeEach(() => {
      recordedCalls = [];
      originalGet = apiClient.get;
      originalPost = apiClient.post;
      originalPut = apiClient.put;
      originalDelete = apiClient.delete;

      apiClient.get = async (endpoint) => {
        recordedCalls.push({ method: 'GET', endpoint });
        if (endpoint === '/animals/groups') {
          return [
            { id: 1, name: 'Dairy Herd A', animalType: 'CATTLE', initialPopulation: 30, currentPopulation: 30 },
            { id: 2, name: 'Layer Flock 1', animalType: 'POULTRY', initialPopulation: 200, currentPopulation: 195 }
          ];
        }
        if (endpoint === '/animals/groups/1') {
          return { id: 1, name: 'Dairy Herd A', animalType: 'CATTLE', initialPopulation: 30, currentPopulation: 30 };
        }
        throw new Error('Not found');
      };

      apiClient.post = async (endpoint, body) => {
        recordedCalls.push({ method: 'POST', endpoint, body });
        return { id: 3, ...body, status: 'ACTIVE' };
      };

      apiClient.put = async (endpoint, body) => {
        recordedCalls.push({ method: 'PUT', endpoint, body });
        return { id: 1, ...body };
      };

      apiClient.delete = async (endpoint) => {
        recordedCalls.push({ method: 'DELETE', endpoint });
        return null;
      };
    });

    test('getGroups: calls GET /animals/groups and returns list of groups', async () => {
      const groups = await animalGroupService.getGroups();
      assert.equal(groups.length, 2);
      assert.equal(groups[0].name, 'Dairy Herd A');
      assert.equal(recordedCalls[0].method, 'GET');
      assert.equal(recordedCalls[0].endpoint, '/animals/groups');
    });

    test('getGroupById: calls GET /animals/groups/{id} with correct ID', async () => {
      const group = await animalGroupService.getGroupById(1);
      assert.equal(group.id, 1);
      assert.equal(group.animalType, 'CATTLE');
      assert.equal(recordedCalls[0].endpoint, '/animals/groups/1');
    });

    test('createGroup: sends POST /animals/groups with form payload', async () => {
      const newGroup = {
        name: 'Boer Goats',
        animalType: 'GOATS',
        initialPopulation: 15,
        currentPopulation: 15,
        location: 'Pasture C'
      };
      const created = await animalGroupService.createGroup(newGroup);
      assert.equal(created.id, 3);
      assert.equal(created.name, 'Boer Goats');
      assert.equal(recordedCalls[0].method, 'POST');
      assert.equal(recordedCalls[0].endpoint, '/animals/groups');
      assert.equal(recordedCalls[0].body.animalType, 'GOATS');
    });

    test('updateGroup: sends PUT /animals/groups/{id} with updated fields', async () => {
      const updates = {
        name: 'Dairy Herd A — Milking',
        animalType: 'CATTLE',
        currentPopulation: 28
      };
      const result = await animalGroupService.updateGroup(1, updates);
      assert.equal(result.name, 'Dairy Herd A — Milking');
      assert.equal(recordedCalls[0].method, 'PUT');
      assert.equal(recordedCalls[0].endpoint, '/animals/groups/1');
    });

    test('deleteGroup: sends DELETE /animals/groups/{id}', async () => {
      await animalGroupService.deleteGroup(1);
      assert.equal(recordedCalls[0].method, 'DELETE');
      assert.equal(recordedCalls[0].endpoint, '/animals/groups/1');
    });

    test('api error handling: propagates backend validation or conflict messages', async () => {
      apiClient.delete = async () => {
        const err = new Error('Cannot delete animal group because protected historical records exist.');
        err.status = 409;
        throw err;
      };

      await assert.rejects(
        async () => {
          await animalGroupService.deleteGroup(1);
        },
        (err) => {
          assert.equal(err.status, 409);
          assert.match(err.message, /protected historical records/);
          return true;
        }
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Creation Form Validation Tests (AC-02)
  // ---------------------------------------------------------------------------
  describe('Creation form validation rules', () => {
    function validateCreateGroupForm({ name, initialPopulation, currentPopulation }) {
      const errors = [];
      const trimmedName = (name || '').trim();
      const initPopNum = parseInt(initialPopulation, 10);
      const currPopNum = currentPopulation !== '' && currentPopulation !== undefined
        ? parseInt(currentPopulation, 10)
        : initPopNum;

      if (!trimmedName) {
        errors.push('Please enter a group name or herd identifier.');
      }
      if (isNaN(initPopNum) || initPopNum <= 0) {
        errors.push('Initial population must be a positive number greater than 0.');
      }
      if (isNaN(currPopNum) || currPopNum < 0) {
        errors.push('Current population cannot be negative.');
      }
      return { isValid: errors.length === 0, errors };
    }

    test('validates required group name', () => {
      const res = validateCreateGroupForm({ name: '', initialPopulation: 20 });
      assert.equal(res.isValid, false);
      assert.ok(res.errors.some((e) => e.includes('group name')));
    });

    test('validates positive initial population', () => {
      const resZero = validateCreateGroupForm({ name: 'Flock', initialPopulation: 0 });
      assert.equal(resZero.isValid, false);
      assert.ok(resZero.errors.some((e) => e.includes('Initial population must be a positive number')));

      const resNegative = validateCreateGroupForm({ name: 'Flock', initialPopulation: -5 });
      assert.equal(resNegative.isValid, false);
    });

    test('validates non-negative current population', () => {
      const res = validateCreateGroupForm({ name: 'Flock', initialPopulation: 20, currentPopulation: -1 });
      assert.equal(res.isValid, false);
      assert.ok(res.errors.some((e) => e.includes('Current population cannot be negative')));
    });

    test('passes on valid input values', () => {
      const res = validateCreateGroupForm({ name: 'Dairy Herd A', initialPopulation: 30, currentPopulation: 30 });
      assert.equal(res.isValid, true);
      assert.equal(res.errors.length, 0);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Filtering and Search Logic Tests (AC-03, AC-04)
  // ---------------------------------------------------------------------------
  describe('Group listing and filtering logic', () => {
    const sampleGroups = [
      { id: 1, name: 'Dairy Herd A', animalType: 'CATTLE', breed: 'Holstein', location: 'Barn 1', status: 'ACTIVE', currentPopulation: 30 },
      { id: 2, name: 'Layer Flock 1', animalType: 'POULTRY', breed: 'Kuroiler', location: 'Coop A', status: 'ACTIVE', currentPopulation: 150 },
      { id: 3, name: 'Boer Goats', animalType: 'GOATS', breed: 'Boer', location: 'Pasture C', status: 'SOLD', currentPopulation: 0 },
      { id: 4, name: 'Archived Herd', animalType: 'CATTLE', breed: 'Jersey', location: 'Barn 2', status: 'ARCHIVED', currentPopulation: 10 }
    ];

    function filterGroups(groups, { search = '', type = 'ALL', status = 'ALL' }) {
      return groups.filter((g) => {
        const matchesSearch =
          !search.trim() ||
          (g.name && g.name.toLowerCase().includes(search.toLowerCase())) ||
          (g.breed && g.breed.toLowerCase().includes(search.toLowerCase())) ||
          (g.location && g.location.toLowerCase().includes(search.toLowerCase()));

        const matchesType = type === 'ALL' || g.animalType === type;
        const matchesStatus = status === 'ALL' || g.status === status;

        return matchesSearch && matchesType && matchesStatus;
      });
    }

    test('filters groups by search keyword', () => {
      const results = filterGroups(sampleGroups, { search: 'Kuroiler' });
      assert.equal(results.length, 1);
      assert.equal(results[0].name, 'Layer Flock 1');
    });

    test('filters groups by animal type', () => {
      const results = filterGroups(sampleGroups, { type: 'CATTLE' });
      assert.equal(results.length, 2);
      assert.ok(results.every((g) => g.animalType === 'CATTLE'));
    });

    test('filters groups by status', () => {
      const results = filterGroups(sampleGroups, { status: 'ACTIVE' });
      assert.equal(results.length, 2);
      assert.ok(results.every((g) => g.status === 'ACTIVE'));
    });

    test('computes correct summary metrics from groups list', () => {
      const totalGroups = sampleGroups.length;
      const totalHeadcount = sampleGroups.reduce((acc, g) => acc + g.currentPopulation, 0);
      const activeCount = sampleGroups.filter((g) => g.status === 'ACTIVE').length;
      const distinctSpecies = new Set(sampleGroups.map((g) => g.animalType)).size;

      assert.equal(totalGroups, 4);
      assert.equal(totalHeadcount, 190);
      assert.equal(activeCount, 2);
      assert.equal(distinctSpecies, 3);
    });

    test('empty state detection when no groups exist (AC-04)', () => {
      const emptyGroups = [];
      const results = filterGroups(emptyGroups, {});
      assert.equal(results.length, 0);
      const isEmpty = results.length === 0;
      assert.equal(isEmpty, true);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Deletion Protection Policy (AC-08, AC-09)
  // ---------------------------------------------------------------------------
  describe('Deletion confirmation and protection logic', () => {
    function canSafelyDelete(group) {
      if (group.status === 'ARCHIVED' && group.hasProtectedHistory) {
        return { allowed: false, reason: 'Group has protected historical production records.' };
      }
      return { allowed: true };
    }

    test('allows deleting an unencumbered group (AC-08)', () => {
      const unencumberedGroup = { id: 1, name: 'Temporary Pen', status: 'ACTIVE', hasProtectedHistory: false };
      const check = canSafelyDelete(unencumberedGroup);
      assert.equal(check.allowed, true);
    });

    test('blocks deletion of group with protected records (AC-09)', () => {
      const protectedGroup = { id: 2, name: 'Historic Herd', status: 'ARCHIVED', hasProtectedHistory: true };
      const check = canSafelyDelete(protectedGroup);
      assert.equal(check.allowed, false);
      assert.match(check.reason, /protected historical/);
    });
  });
});

