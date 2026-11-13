import React from 'react';
import { IconCheck, IconAlertCircle, IconCrop, IconLivestock, IconSprout } from '../../../shared/components/Icons';
import { FARM_TYPES } from './farmStepConstants';

const ICONS = { CROP: IconCrop, LIVESTOCK: IconLivestock, MIXED: IconSprout };

/**
 * Step 1: Basic farm information — name, type, size. OBLIGATORY.
 */
export function StepBasicInfo({ formData, errors, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      <div className="step-header-banner">
        <div className="step-tag-row">
          <span className="step-nature-tag obligatory">
            <IconCheck size={13} /> Step 1 of 4: Obligatory
          </span>
        </div>
        <h2 className="step-heading">Basic Farm Information</h2>
        <p className="step-guidance">
          Start by giving your farm a recognisable name, its main production focus,
          and the total land area you operate.
        </p>
      </div>

      {/* Farm Name */}
      <div className="form-field-group">
        <label className="form-label" htmlFor="farm-name-input">
          Farm Name <span style={{ color: '#DC2626' }}>*</span>
        </label>
        <p className="form-helper">Choose a clear name that you and your workers call this land.</p>
        <input
          id="farm-name-input"
          type="text"
          className={`form-input ${errors.name ? 'has-error' : ''}`}
          placeholder="e.g. Ferme Agro-Pastorale de Bandjoun, Plantation Bassa de Foumbot, Domaine Beti"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          autoFocus
        />
        {errors.name && (
          <div className="field-error-msg"><IconAlertCircle size={15} /> {errors.name}</div>
        )}
      </div>

      {/* Farm Type Selector */}
      <div className="form-field-group">
        <label className="form-label">
          Primary Farming Activity <span style={{ color: '#DC2626' }}>*</span>
        </label>
        <p className="form-helper">What does this farm primarily produce? This tailors your tracking modules.</p>
        <div className="type-card-grid">
          {FARM_TYPES.map((t) => {
            const Icon = ICONS[t.id] || IconCrop;
            const isSelected = formData.type === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className={`type-select-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onChange('type', t.id)}
              >
                {isSelected && <div className="type-check-badge"><IconCheck size={13} /></div>}
                <div className="type-card-icon-wrap"><Icon size={24} /></div>
                <div className="type-card-title">{t.title}</div>
                <div className="type-card-desc">{t.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Total Land Size */}
      <div className="form-field-group">
        <label className="form-label">
          Total Land Size <span style={{ color: '#DC2626' }}>*</span>
        </label>
        <p className="form-helper">How large is the entire farm? You can partition it into smaller plots later.</p>
        <div className="size-unit-row">
          <div>
            <input
              type="number"
              step="0.1"
              min="0.1"
              className={`form-input ${errors.size ? 'has-error' : ''}`}
              placeholder="e.g. 5.5"
              value={formData.size}
              onChange={(e) => onChange('size', e.target.value)}
            />
            {errors.size && (
              <div className="field-error-msg" style={{ marginTop: '6px' }}>
                <IconAlertCircle size={15} /> {errors.size}
              </div>
            )}
          </div>
          <div className="unit-toggle-container">
            <button
              type="button"
              className={`unit-toggle-btn ${formData.sizeUnit === 'HECTARES' ? 'active' : ''}`}
              onClick={() => onChange('sizeUnit', 'HECTARES')}
            >
              Hectares (ha)
            </button>
            <button
              type="button"
              className={`unit-toggle-btn ${formData.sizeUnit === 'ACRES' ? 'active' : ''}`}
              onClick={() => onChange('sizeUnit', 'ACRES')}
            >
              Acres
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

