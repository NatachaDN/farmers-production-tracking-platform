import React, { useState } from 'react';
import { farmService } from './services/farmService';
import {
  IconCheck,
  IconAlertCircle,
  IconArrowLeft
} from '../../shared/components/Icons';
import { StepBasicInfo } from './CreateFarmSteps/StepBasicInfo';
import { StepLocation }  from './CreateFarmSteps/StepLocation';
import { StepTerrain }   from './CreateFarmSteps/StepTerrain';
import { StepReview }    from './CreateFarmSteps/StepReview';
import './CreateFarmPage.css';

const TOTAL_STEPS = 4;

const INITIAL_FORM = (farmer) => ({
  name: '',
  type: 'CROP',
  size: '',
  sizeUnit: 'HECTARES',
  country:  farmer?.location?.split(',')?.[1]?.trim() || 'Cameroon',
  region:   farmer?.location?.split(',')?.[0]?.trim() || '',
  district: '',
  accessToWater: '',
  soilType: '',
  slope: '',
  mapImageUrl: '',
  description: '',
  additionalNotes: ''
});

function checkStep1(f) {
  return Boolean(f.name?.trim()) && Boolean(f.size && !isNaN(f.size) && Number(f.size) > 0) && Boolean(f.type);
}
function checkStep2(f) {
  return Boolean(f.country?.trim()) && Boolean(f.region?.trim()) && Boolean(f.district?.trim());
}

export function CreateFarmPage({ onNavigate, onFarmCreated, initialFarmer }) {
  const [step, setStep]           = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [formData, setFormData]   = useState(() => INITIAL_FORM(initialFarmer));
  const [errors, setErrors]       = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const isStep1Valid = checkStep1(formData);
  const isStep2Valid = checkStep2(formData);

  // ── Field updater ──────────────────────────────────────────────────────────
  const onChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    setGlobalError('');
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!formData.name?.trim()) e.name = 'Please give your farm a name (e.g. Ferme Agro-Pastorale de Bandjoun).';
      if (!formData.size || isNaN(formData.size) || Number(formData.size) <= 0) e.size = 'Please enter a valid land size greater than zero.';
      if (!formData.type) e.type = 'Please choose the main type of production for your farm.';
    }
    if (s === 2) {
      if (!formData.country?.trim()) e.country = 'Please select or enter the country.';
      if (!formData.region?.trim())  e.region  = 'Please enter the region or province (e.g. Ouest, Littoral, Centre).';
      if (!formData.district?.trim()) e.district = 'Please enter your district or nearest town.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goNext = () => {
    if (validate(step)) {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const skipTerrain = () => {
    setStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Photo upload ───────────────────────────────────────────────────────────
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    onChange('mapImageUrl', localUrl);
    setUploadingPhoto(true);
    try {
      const res = await farmService.uploadFarmPhoto(file);
      if (res?.url) onChange('mapImageUrl', res.url);
    } catch {
      const reader = new FileReader();
      reader.onload = () => onChange('mapImageUrl', reader.result);
      reader.readAsDataURL(file);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── Submission ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate(1) || !validate(2)) {
      setGlobalError('Please complete required steps 1 and 2 before submitting.');
      return;
    }
    setSubmitting(true);
    setGlobalError('');
    try {
      const payload = {
        name:            formData.name.trim(),
        type:            formData.type,
        size:            parseFloat(formData.size),
        sizeUnit:        formData.sizeUnit,
        country:         formData.country.trim(),
        region:          formData.region.trim(),
        district:        formData.district.trim(),
        status:          'ACTIVE',
        description:     formData.description?.trim() || null,
        soilType:        formData.soilType || null,
        slope:           formData.slope || null,
        accessToWater:   formData.accessToWater || null,
        mapImageUrl:     formData.mapImageUrl?.trim() || null,
        additionalNotes: formData.additionalNotes?.trim() || null
      };
      const result = await farmService.createFarm(payload);
      if (onFarmCreated) onFarmCreated(result);
      if (onNavigate)    onNavigate('farms');
    } catch (err) {
      setGlobalError(err.message || 'Unable to create farm. Please verify your entries.');
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercent = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="create-farm-page">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="create-farm-header">
        <button type="button" className="create-farm-back-btn"
          onClick={() => onNavigate && onNavigate('farms')}>
          <IconArrowLeft size={18} />
          <span>Back to Farms &amp; Plots</span>
        </button>
        <div className="create-farm-title-row">
          <h1 className="create-farm-title">Register New Farm</h1>
          <p className="create-farm-subtitle">
            Configure your farm in simple guided steps. Required steps are marked; terrain details can be skipped.
          </p>
        </div>
      </div>

      {/* ── Step progress bar ───────────────────────────────────────────────── */}
      <div className="stepper-container">
        <div className="stepper-progress-track">
          <div className="stepper-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="stepper-nav-grid">
          {[
            { n: 1, label: '1. Essentials', badge: 'Required',  badge_cls: 'required',  canJumpTo: true },
            { n: 2, label: '2. Location',   badge: 'Required',  badge_cls: 'required',  canJumpTo: isStep1Valid },
            { n: 3, label: '3. Terrain',    badge: 'Optional',  badge_cls: 'optional',  canJumpTo: isStep1Valid && isStep2Valid },
            { n: 4, label: '4. Review',     badge: 'Confirm',   badge_cls: 'optional',  canJumpTo: isStep1Valid && isStep2Valid },
          ].map(({ n, label, badge, badge_cls, canJumpTo }) => (
            <button
              key={n}
              type="button"
              className={`step-indicator-pill ${step === n ? 'active' : step > n ? 'completed' : ''}`}
              onClick={() => { if (canJumpTo) { if (validate(step)) setStep(n); } }}
              disabled={!canJumpTo && step < n}
            >
              <div className="step-circle">{step > n ? <IconCheck size={14} /> : n}</div>
              <span className="step-pill-label">{label}</span>
              <span className={`step-pill-badge ${badge_cls}`}>{badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Global error banner ─────────────────────────────────────────────── */}
      {globalError && (
        <div style={{
          backgroundColor: '#FEF2F2', border: '1.5px solid #FECACA',
          borderRadius: '16px', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: '12px',
          color: '#B91C1C', fontSize: '0.9375rem', fontWeight: 500
        }}>
          <IconAlertCircle size={22} color="#DC2626" />
          <span>{globalError}</span>
        </div>
      )}

      {/* ── Step canvas ─────────────────────────────────────────────────────── */}
      <div className="create-farm-card">
        {step === 1 && <StepBasicInfo formData={formData} errors={errors} onChange={onChange} />}
        {step === 2 && <StepLocation  formData={formData} errors={errors} onChange={onChange} />}
        {step === 3 && (
          <StepTerrain
            formData={formData}
            uploadingPhoto={uploadingPhoto}
            onChange={onChange}
            onPhotoUpload={handlePhotoUpload}
            onSkip={skipTerrain}
          />
        )}
        {step === 4 && <StepReview formData={formData} onChange={onChange} />}

        {/* ── Action navigation bar ───────────────────────────────────────── */}
        <div className="stepper-actions-bar">
          {step > 1 ? (
            <button type="button" className="stepper-btn stepper-btn-secondary" onClick={goBack} disabled={submitting}>
              ← Back
            </button>
          ) : (
            <button type="button" className="stepper-btn stepper-btn-secondary"
              onClick={() => onNavigate && onNavigate('farms')} disabled={submitting}>
              Cancel
            </button>
          )}

          {step === 3 && (
            <button type="button" className="stepper-btn-skip" onClick={skipTerrain} disabled={submitting}>
              Skip to Review →
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button type="button" className="stepper-btn stepper-btn-primary" onClick={goNext}>
              Continue to Step {step + 1} →
            </button>
          ) : (
            <button
              type="button"
              className="stepper-btn stepper-btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
              style={{ backgroundColor: '#2E7D32' }}
            >
              <IconCheck size={18} />
              <span>{submitting ? 'Creating Farm...' : 'Save & Register Farm'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
