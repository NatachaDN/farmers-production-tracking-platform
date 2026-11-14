import React from 'react';
import { IconCheck } from '../../../shared/components/Icons';
import { FARM_TYPES } from './farmStepConstants';

/**
 * Step 4: Notes & Review — optional description/notes + summary. Final confirmation.
 */
export function StepReview({ formData, onChange }) {
  const typeLabel = FARM_TYPES.find((t) => t.id === formData.type)?.title || formData.type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      <div className="step-header-banner">
        <div className="step-tag-row">
          <span className="step-nature-tag obligatory">
            <IconCheck size={13} /> Step 4 of 4: Final Confirmation
          </span>
        </div>
        <h2 className="step-heading">Review &amp; Confirm Your Farm</h2>
        <p className="step-guidance">
          Check over your registered details. You can add extra directions or notes before confirming.
        </p>
      </div>

      {/* Description */}
      <div className="form-field-group">
        <label className="form-label" htmlFor="farm-desc-input">
          Description or Directions (Optional)
        </label>
        <p className="form-helper">
          e.g. Near the main market, behind the primary school, or 2 km after the bridge.
        </p>
        <textarea
          id="farm-desc-input"
          rows={2}
          className="form-input"
          style={{ minHeight: '80px', resize: 'vertical' }}
          placeholder="e.g. À 500m du carrefour Bandjoun, près de la chefferie, route de Bafoussam..."
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>

      {/* Additional Notes */}
      <div className="form-field-group">
        <label className="form-label" htmlFor="farm-notes-input">
          Additional Operating Notes (Optional)
        </label>
        <textarea
          id="farm-notes-input"
          rows={2}
          className="form-input"
          style={{ minHeight: '80px', resize: 'vertical' }}
          placeholder="e.g. Hangar de séchage pour maïs, clôture en bambou, point d'eau aménagé..."
          value={formData.additionalNotes}
          onChange={(e) => onChange('additionalNotes', e.target.value)}
        />
      </div>

      {/* Review Summary */}
      <div className="review-card-summary">
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#19201C', margin: 0 }}>
          Farm Registration Summary
        </h3>

        {formData.mapImageUrl && (
          <div style={{ borderRadius: '12px', overflow: 'hidden', margin: '14px 0', height: '150px', border: '1px solid #ECE7DC' }}>
            <img src={formData.mapImageUrl} alt="Farm Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        )}

        <div className="review-summary-row">
          <span className="review-label">Farm Name</span>
          <span className="review-val" style={{ color: '#2A6740', fontSize: '1.0625rem' }}>
            {formData.name || '—'}
          </span>
        </div>
        <div className="review-summary-row">
          <span className="review-label">Primary Activity</span>
          <span className="review-val">{typeLabel}</span>
        </div>
        <div className="review-summary-row">
          <span className="review-label">Total Land Area</span>
          <span className="review-val">
            {formData.size} {formData.sizeUnit === 'HECTARES' ? 'hectares' : 'acres'}
          </span>
        </div>
        <div className="review-summary-row">
          <span className="review-label">Location</span>
          <span className="review-val">
            {[formData.district, formData.region, formData.country].filter(Boolean).join(', ')}
          </span>
        </div>
        {(formData.accessToWater || formData.soilType || formData.slope) && (
          <div className="review-summary-row">
            <span className="review-label">Terrain &amp; Water</span>
            <span className="review-val" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {[
                formData.accessToWater === 'YES' ? 'Water Access'
                  : formData.accessToWater === 'NO' ? 'Rain-fed' : null,
                formData.soilType ? `${formData.soilType.toLowerCase()} soil` : null,
                formData.slope ? `${formData.slope.toLowerCase()} slope` : null,
              ].filter(Boolean).join(' · ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

