import React from 'react';
import { IconCheck, IconAlertCircle } from '../../../shared/components/Icons';
import { POPULAR_COUNTRIES, POPULAR_REGIONS } from './farmStepConstants';

/**
 * Step 2: Location & Territory — country, region, district. OBLIGATORY.
 */
export function StepLocation({ formData, errors, onChange }) {
  const regionSuggestions = POPULAR_REGIONS[formData.country] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      <div className="step-header-banner">
        <div className="step-tag-row">
          <span className="step-nature-tag obligatory">
            <IconCheck size={13} /> Step 2 of 4: Obligatory
          </span>
        </div>
        <h2 className="step-heading">Farm Location &amp; Territory</h2>
        <p className="step-guidance">
          Entering your farm location ensures correct regional seasonal tracking,
          cooperative grouping, and localised reporting.
        </p>
      </div>

      {/* Country */}
      <div className="form-field-group">
        <label className="form-label" htmlFor="farm-country-input">
          Country <span style={{ color: '#DC2626' }}>*</span>
        </label>
        <div className="suggestion-chips-row">
          {POPULAR_COUNTRIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`suggestion-chip ${formData.country === c ? 'active' : ''}`}
              onClick={() => onChange('country', c)}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          id="farm-country-input"
          type="text"
          className={`form-input ${errors.country ? 'has-error' : ''}`}
          style={{ marginTop: '6px' }}
          placeholder="Or type country name..."
          value={formData.country}
          onChange={(e) => onChange('country', e.target.value)}
        />
        {errors.country && (
          <div className="field-error-msg"><IconAlertCircle size={15} /> {errors.country}</div>
        )}
      </div>

      {/* Region / Province */}
      <div className="form-field-group">
        <label className="form-label" htmlFor="farm-region-input">
          Region / State / Province <span style={{ color: '#DC2626' }}>*</span>
        </label>
        {regionSuggestions.length > 0 && (
          <div className="suggestion-chips-row">
            {regionSuggestions.map((r) => (
              <button
                key={r}
                type="button"
                className={`suggestion-chip ${formData.region === r ? 'active' : ''}`}
                onClick={() => onChange('region', r)}
              >
                {r}
              </button>
            ))}
          </div>
        )}
        <input
          id="farm-region-input"
          type="text"
          className={`form-input ${errors.region ? 'has-error' : ''}`}
          style={{ marginTop: '6px' }}
          placeholder="e.g. Ouest (Bafoussam), Littoral (Bassa), Centre (Beti)"
          value={formData.region}
          onChange={(e) => onChange('region', e.target.value)}
        />
        {errors.region && (
          <div className="field-error-msg"><IconAlertCircle size={15} /> {errors.region}</div>
        )}
      </div>

      {/* District */}
      <div className="form-field-group">
        <label className="form-label" htmlFor="farm-district-input">
          District / County / Locality <span style={{ color: '#DC2626' }}>*</span>
        </label>
        <p className="form-helper">Your sub-division, district, county, or nearest town/village.</p>
        <input
          id="farm-district-input"
          type="text"
          className={`form-input ${errors.district ? 'has-error' : ''}`}
          placeholder="e.g. Bandjoun, Bafoussam, Foumbot, Dschang, Lékié, Bassa"
          value={formData.district}
          onChange={(e) => onChange('district', e.target.value)}
        />
        {errors.district && (
          <div className="field-error-msg"><IconAlertCircle size={15} /> {errors.district}</div>
        )}
      </div>
    </div>
  );
}

