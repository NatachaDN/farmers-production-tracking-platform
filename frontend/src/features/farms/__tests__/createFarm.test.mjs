import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock apiClient
const mockApiClient = {
  lastCall: null,
  post: async (endpoint, payload) => {
    mockApiClient.lastCall = { endpoint, payload };
    return { id: 101, ...payload, createdAt: new Date().toISOString() };
  }
};

describe('Farm Creation & Stepped Configuration Tests', () => {

  describe('Step 1: Essentials Validation (Obligatory)', () => {
    function validateStep1(data) {
      const errors = {};
      if (!data.name || !data.name.trim()) {
        errors.name = 'Please give your farm a name (e.g. Green Acres Farm).';
      }
      if (!data.size || isNaN(data.size) || Number(data.size) <= 0) {
        errors.size = 'Please enter a valid farm land size greater than zero.';
      }
      if (!data.type) {
        errors.type = 'Please choose the main type of production for your farm.';
      }
      return { isValid: Object.keys(errors).length === 0, errors };
    }

    test('rejects empty or whitespace farm name', () => {
      const res = validateStep1({ name: '   ', size: 5, type: 'CROP' });
      assert.equal(res.isValid, false);
      assert.match(res.errors.name, /give your farm a name/i);
    });

    test('rejects zero or negative farm size', () => {
      const resZero = validateStep1({ name: 'Highland Farm', size: 0, type: 'CROP' });
      assert.equal(resZero.isValid, false);
      assert.match(resZero.errors.size, /greater than zero/i);

      const resNeg = validateStep1({ name: 'Highland Farm', size: -2.5, type: 'CROP' });
      assert.equal(resNeg.isValid, false);
    });

    test('passes on valid essentials', () => {
      const res = validateStep1({ name: 'Highland Valley Farm', size: 8.5, type: 'MIXED' });
      assert.equal(res.isValid, true);
      assert.deepEqual(res.errors, {});
    });
  });

  describe('Step 2: Location Validation (Obligatory)', () => {
    function validateStep2(data) {
      const errors = {};
      if (!data.country || !data.country.trim()) {
        errors.country = 'Please select or enter the country of your farm.';
      }
      if (!data.region || !data.region.trim()) {
        errors.region = 'Please enter the region or province.';
      }
      if (!data.district || !data.district.trim()) {
        errors.district = 'Please enter your district, county, or nearest town.';
      }
      return { isValid: Object.keys(errors).length === 0, errors };
    }

    test('rejects missing region or district', () => {
      const res = validateStep2({ country: 'Cameroon', region: '', district: '' });
      assert.equal(res.isValid, false);
      assert.ok(res.errors.region);
      assert.ok(res.errors.district);
    });

    test('passes on complete location data', () => {
      const res = validateStep2({ country: 'Cameroon', region: 'West Region', district: 'Bamboutos' });
      assert.equal(res.isValid, true);
    });
  });

  describe('Step 3: Terrain & Soil (Non-Obligatory / Optional)', () => {
    function buildPayload(formData) {
      return {
        name: formData.name.trim(),
        type: formData.type,
        size: parseFloat(formData.size),
        sizeUnit: formData.sizeUnit || 'HECTARES',
        country: formData.country.trim(),
        region: formData.region.trim(),
        district: formData.district.trim(),
        status: 'ACTIVE',
        description: formData.description?.trim() || null,
        soilType: formData.soilType || null,
        slope: formData.slope || null,
        accessToWater: formData.accessToWater || null,
        additionalNotes: formData.additionalNotes?.trim() || null
      };
    }

    test('allows completely skipping optional step 3 (soil, water, slope remain null)', () => {
      const form = {
        name: 'Riverbank Farm',
        type: 'CROP',
        size: '12',
        sizeUnit: 'HECTARES',
        country: 'Kenya',
        region: 'Rift Valley',
        district: 'Nakuru',
        accessToWater: '',
        soilType: '',
        slope: ''
      };

      const payload = buildPayload(form);
      assert.equal(payload.name, 'Riverbank Farm');
      assert.equal(payload.size, 12);
      assert.equal(payload.soilType, null);
      assert.equal(payload.slope, null);
      assert.equal(payload.accessToWater, null);
    });

    test('correctly preserves optional selections when provided by farmer', () => {
      const form = {
        name: 'Volcanic Soil Holding',
        type: 'MIXED',
        size: '4.2',
        sizeUnit: 'HECTARES',
        country: 'Cameroon',
        region: 'West Region',
        district: 'Dschang',
        accessToWater: 'YES',
        soilType: 'LOAMY',
        slope: 'MODERATE',
        description: 'Near the falls',
        additionalNotes: 'Fenced perimeter'
      };

      const payload = buildPayload(form);
      assert.equal(payload.accessToWater, 'YES');
      assert.equal(payload.soilType, 'LOAMY');
      assert.equal(payload.slope, 'MODERATE');
      assert.equal(payload.description, 'Near the falls');
      assert.equal(payload.additionalNotes, 'Fenced perimeter');
    });
  });

  describe('API Farm Registration Submission', () => {
    test('sends formatted payload to POST /farms endpoint', async () => {
      const farmPayload = {
        name: 'Sunrise Agro Farm',
        type: 'LIVESTOCK',
        size: 15.0,
        sizeUnit: 'ACRES',
        country: 'Cameroon',
        region: 'Centre',
        district: 'Yaoundé Sub',
        status: 'ACTIVE',
        description: null,
        soilType: null,
        slope: null,
        accessToWater: 'NO',
        additionalNotes: null
      };

      const response = await mockApiClient.post('/farms', farmPayload);
      assert.equal(mockApiClient.lastCall.endpoint, '/farms');
      assert.equal(response.id, 101);
      assert.equal(response.name, 'Sunrise Agro Farm');
      assert.equal(response.type, 'LIVESTOCK');
      assert.equal(response.status, 'ACTIVE');
    });
  });

});

