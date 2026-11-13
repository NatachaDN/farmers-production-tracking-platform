import React from 'react';
import { IconCamera, IconClose, IconDroplets, IconLeaf } from '../../../shared/components/Icons';
import { SOIL_OPTIONS, SLOPE_OPTIONS } from './farmStepConstants';

/**
 * Step 3: Soil, Terrain & Water — all OPTIONAL.
 * Includes farm photo upload.
 */
export function StepTerrain({ formData, uploadingPhoto, onChange, onPhotoUpload, onSkip }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      <div className="step-header-banner">
        <div className="step-tag-row">
          <span className="step-nature-tag optional">Step 3 of 4: Non-Obligatory (Optional)</span>
        </div>
        <h2 className="step-heading">Soil, Terrain &amp; Water Access</h2>
        <p className="step-guidance">
          These optional details help optimise agricultural insights and recommendations.
          You can configure them now or skip to the end.
        </p>
      </div>

      {/* Skip banner */}
      <div className="optional-banner">
        <span className="optional-banner-text">
          Not sure about soil or terrain right now? You can skip this step.
        </span>
        <button type="button" className="skip-step-btn" onClick={onSkip}>
          Skip this step →
        </button>
      </div>

      {/* Water Access */}
      <div className="form-field-group">
        <label className="form-label">Reliable Water Source Available?</label>
        <div className="water-options-grid">
          <div
            className={`choice-chip-card ${formData.accessToWater === 'YES' ? 'selected' : ''}`}
            onClick={() => onChange('accessToWater', formData.accessToWater === 'YES' ? '' : 'YES')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconDroplets size={20} color="#0284C7" />
              <div className="choice-chip-title">Yes, Water Source Nearby</div>
            </div>
            <div className="choice-chip-desc">
              Stream, river, borehole, well, or piped irrigation available year-round.
            </div>
          </div>
          <div
            className={`choice-chip-card ${formData.accessToWater === 'NO' ? 'selected' : ''}`}
            onClick={() => onChange('accessToWater', formData.accessToWater === 'NO' ? '' : 'NO')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconLeaf size={20} color="#D97706" />
              <div className="choice-chip-title">Rain-fed Only</div>
            </div>
            <div className="choice-chip-desc">Field relies on seasonal rain patterns only.</div>
          </div>
        </div>
      </div>

      {/* Soil Type */}
      <div className="form-field-group">
        <label className="form-label">Predominant Soil Type (Optional)</label>
        <div className="soil-options-grid">
          {SOIL_OPTIONS.map((s) => (
            <div
              key={s.id}
              className={`choice-chip-card ${formData.soilType === s.id ? 'selected' : ''}`}
              onClick={() => onChange('soilType', formData.soilType === s.id ? '' : s.id)}
            >
              <div className="choice-chip-title">{s.title}</div>
              <div className="choice-chip-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Slope */}
      <div className="form-field-group">
        <label className="form-label">Field Slope &amp; Topography (Optional)</label>
        <div className="slope-options-grid">
          {SLOPE_OPTIONS.map((sl) => (
            <div
              key={sl.id}
              className={`choice-chip-card ${formData.slope === sl.id ? 'selected' : ''}`}
              onClick={() => onChange('slope', formData.slope === sl.id ? '' : sl.id)}
            >
              <div className="choice-chip-title">{sl.title}</div>
              <div className="choice-chip-desc">{sl.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Upload */}
      <div className="form-field-group">
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconCamera size={18} color="var(--color-brand-primary)" />
          Farm Photo or Picture (Optional)
        </label>
        <p className="form-helper">
          Take a photo of your farm or pick a picture from your phone.
          It will appear on your farm card so you recognise it right away.
        </p>

        {formData.mapImageUrl ? (
          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '2px solid #164230', maxHeight: '260px' }}>
            <img src={formData.mapImageUrl} alt="Farm Preview" style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: '12px', right: '12px', display: 'flex', gap: '8px' }}>
              <label style={{ backgroundColor: 'rgba(22,66,48,0.95)', color: '#FFFFFF', padding: '8px 16px', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconCamera size={14} /> Change Photo
                <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploadingPhoto} onChange={onPhotoUpload} />
              </label>
              <button
                type="button"
                onClick={() => onChange('mapImageUrl', '')}
                style={{ backgroundColor: 'rgba(220,38,38,0.95)', color: '#FFFFFF', padding: '8px 16px', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <IconClose size={14} /> Remove
              </button>
            </div>
          </div>
        ) : (
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px 20px', border: '2px dashed #CBD5E1', borderRadius: '16px', backgroundColor: '#FAF9F6', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#EAF4ED', color: '#164230', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <IconCamera size={28} />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {uploadingPhoto ? 'Uploading photo...' : 'Click to Take Photo or Choose Picture'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#5C6F64', marginTop: '4px' }}>
              Supports camera photos (JPEG, PNG, WebP)
            </div>
            <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploadingPhoto} onChange={onPhotoUpload} />
          </label>
        )}
      </div>
    </div>
  );
}

