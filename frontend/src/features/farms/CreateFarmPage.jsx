import React, { useState } from 'react';
import { farmService } from './services/farmService';
import {
  IconFarms,
  IconCrop,
  IconLivestock,
  IconSprout,
  IconCheck,
  IconClose,
  IconMapPin,
  IconDroplets,
  IconLeaf,
  IconArrowLeft,
  IconAlertCircle
} from '../../shared/components/Icons';
import './CreateFarmPage.css';

const FARM_TYPES = [
  {
    id: 'CROP',
    title: 'Crops & Fields',
    desc: 'Cereals, vegetables, tubers, legumes, and field plantations',
    icon: IconCrop
  },
  {
    id: 'LIVESTOCK',
    title: 'Livestock & Animals',
    desc: 'Cattle, poultry, goats, sheep, pigs, and animal herds',
    icon: IconLivestock
  },
  {
    id: 'MIXED',
    title: 'Mixed Agriculture',
    desc: 'Both crops and livestock raised together on the same land',
    icon: IconSprout
  }
];

const SOIL_OPTIONS = [
  { id: 'LOAMY', title: 'Loamy Soil', desc: 'Balanced, dark & highly fertile' },
  { id: 'CLAY', title: 'Clay Soil', desc: 'Heavy soil, retains moisture well' },
  { id: 'SANDY', title: 'Sandy Soil', desc: 'Light & drains water very quickly' },
  { id: 'SILTY', title: 'Silty Soil', desc: 'Fine particles, fertile river land' },
  { id: 'PEATY', title: 'Peaty Soil', desc: 'High organic matter & damp' },
  { id: 'CHALKY', title: 'Chalky Soil', desc: 'Stony, alkaline lime-rich soil' },
  { id: 'ROCKY', title: 'Rocky / Mountain', desc: 'Stony ground with shallow topsoil' }
];

const SLOPE_OPTIONS = [
  { id: 'FLAT', title: 'Flat Land', desc: 'Level fields, easy mechanization' },
  { id: 'MODERATE', title: 'Gentle Slope', desc: 'Slight incline, natural drainage' },
  { id: 'STEEP', title: 'Steep Hillside', desc: 'High gradient or terraced slopes' }
];

const POPULAR_COUNTRIES = ['Cameroon', 'Nigeria', 'Chad', 'Gabon', 'Congo'];
const POPULAR_REGIONS = {
  Cameroon: ['Ouest (Bafoussam/Bandjoun)', 'Littoral (Douala/Bassa)', 'Centre (Yaoundé/Beti)', 'Nord-Ouest (Bamenda)', 'Sud-Ouest (Buea)', 'Adamaoua (Ngaoundéré)'],
  Nigeria: ['Oyo', 'Ogun', 'Kaduna', 'Kano', 'Plateau', 'Benue']
};

export function CreateFarmPage({ onNavigate, onFarmCreated, initialFarmer }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Essentials (Obligatory)
    name: '',
    type: 'CROP',
    size: '',
    sizeUnit: 'HECTARES',

    // Step 2: Location (Obligatory)
    country: initialFarmer?.location?.split(',')?.[1]?.trim() || 'Cameroon',
    region: initialFarmer?.location?.split(',')?.[0]?.trim() || '',
    district: '',

    // Step 3: Soil, Water, Terrain (Optional)
    accessToWater: '',
    soilType: '',
    slope: '',

    // Step 4: Notes (Optional)
    description: '',
    additionalNotes: ''
  });

  const [errors, setErrors] = useState({});

  // ─── Field Updaters ──────────────────────────────────────────
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
    setGlobalError('');
  };

  // ─── Step Validation ─────────────────────────────────────────
  const checkStepValidity = (step) => {
    if (step === 1) {
      const hasName = Boolean(formData.name && formData.name.trim());
      const hasSize = Boolean(formData.size && !isNaN(formData.size) && Number(formData.size) > 0);
      const hasType = Boolean(formData.type);
      return hasName && hasSize && hasType;
    }
    if (step === 2) {
      const hasCountry = Boolean(formData.country && formData.country.trim());
      const hasRegion = Boolean(formData.region && formData.region.trim());
      const hasDistrict = Boolean(formData.district && formData.district.trim());
      return hasCountry && hasRegion && hasDistrict;
    }
    return true;
  };

  const validateAndSetErrors = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name || !formData.name.trim()) {
        newErrors.name = 'Please give your farm a name (e.g. Ferme Agro-Pastorale de Bandjoun).';
      }
      if (!formData.size || isNaN(formData.size) || Number(formData.size) <= 0) {
        newErrors.size = 'Please enter a valid farm land size greater than zero.';
      }
      if (!formData.type) {
        newErrors.type = 'Please choose the main type of production for your farm.';
      }
    }

    if (step === 2) {
      if (!formData.country || !formData.country.trim()) {
        newErrors.country = 'Please select or enter the country of your farm.';
      }
      if (!formData.region || !formData.region.trim()) {
        newErrors.region = 'Please enter the region or province (e.g. Ouest, Littoral, Centre).';
      }
      if (!formData.district || !formData.district.trim()) {
        newErrors.district = 'Please enter your district, county, or nearest town.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStep1Valid = checkStepValidity(1);
  const isStep2Valid = checkStepValidity(2);

  const handleNext = () => {
    if (validateAndSetErrors(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSkipStep3 = () => {
    // Clear step 3 fields if user wants to skip
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Final Submission ────────────────────────────────────────
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateAndSetErrors(1) || !validateAndSetErrors(2)) {
      setGlobalError('Please review required steps 1 and 2 before submitting.');
      return;
    }

    setSubmitting(true);
    setGlobalError('');

    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        size: parseFloat(formData.size),
        sizeUnit: formData.sizeUnit,
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

      const result = await farmService.createFarm(payload);

      if (onFarmCreated) {
        onFarmCreated(result);
      }

      if (onNavigate) {
        onNavigate('farms');
      }
    } catch (err) {
      console.error('Failed to register farm:', err);
      setGlobalError(err.message || 'Unable to create farm. Please verify your entries.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate progress percentage
  const progressPercent = ((currentStep - 1) / 3) * 100;

  return (
    <div className="create-farm-page">
      {/* Top Header Row */}
      <div className="create-farm-header">
        <button
          type="button"
          className="create-farm-back-btn"
          onClick={() => onNavigate && onNavigate('farms')}
        >
          <IconArrowLeft size={18} />
          <span>Back to Farms & Plots</span>
        </button>

        <div className="create-farm-title-row">
          <h1 className="create-farm-title">Register New Farm</h1>
          <p className="create-farm-subtitle">
            Configure your farm structure in simple, guided steps. Essential steps are marked as required; terrain details can be added or skipped.
          </p>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="stepper-container">
        <div className="stepper-progress-track">
          <div
            className="stepper-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="stepper-nav-grid">
          {/* Step 1 Pill */}
          <button
            type="button"
            className={`step-indicator-pill ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}
            onClick={() => setCurrentStep(1)}
          >
            <div className="step-circle">
              {currentStep > 1 ? <IconCheck size={14} /> : '1'}
            </div>
            <span className="step-pill-label">1. Essentials</span>
            <span className="step-pill-badge required">Required</span>
          </button>

          {/* Step 2 Pill */}
          <button
            type="button"
            className={`step-indicator-pill ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}
            onClick={() => {
              if (validateAndSetErrors(1)) setCurrentStep(2);
            }}
            disabled={currentStep < 2 && !isStep1Valid}
          >
            <div className="step-circle">
              {currentStep > 2 ? <IconCheck size={14} /> : '2'}
            </div>
            <span className="step-pill-label">2. Location</span>
            <span className="step-pill-badge required">Required</span>
          </button>

          {/* Step 3 Pill */}
          <button
            type="button"
            className={`step-indicator-pill ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}
            onClick={() => {
              if (validateAndSetErrors(1) && validateAndSetErrors(2)) setCurrentStep(3);
            }}
            disabled={currentStep < 3 && (!isStep1Valid || !isStep2Valid)}
          >
            <div className="step-circle">
              {currentStep > 3 ? <IconCheck size={14} /> : '3'}
            </div>
            <span className="step-pill-label">3. Terrain</span>
            <span className="step-pill-badge optional">Optional</span>
          </button>

          {/* Step 4 Pill */}
          <button
            type="button"
            className={`step-indicator-pill ${currentStep === 4 ? 'active' : ''}`}
            onClick={() => {
              if (validateAndSetErrors(1) && validateAndSetErrors(2)) setCurrentStep(4);
            }}
            disabled={!isStep1Valid || !isStep2Valid}
          >
            <div className="step-circle">4</div>
            <span className="step-pill-label">4. Review</span>
            <span className="step-pill-badge optional">Confirm</span>
          </button>
        </div>
      </div>

      {/* Global Server Error Banner */}
      {globalError && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1.5px solid #FECACA',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#B91C1C',
          fontSize: '0.9375rem',
          fontWeight: 500
        }}>
          <IconAlertCircle size={22} color="#DC2626" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Main Step Canvas Card */}
      <div className="create-farm-card">
        {/* ========================================================= */}
        {/* STEP 1: ESSENTIALS (OBLIGATORY)                           */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
            <div className="step-header-banner">
              <div className="step-tag-row">
                <span className="step-nature-tag obligatory">
                  <IconCheck size={13} /> Step 1 of 4: Obligatory
                </span>
              </div>
              <h2 className="step-heading">Basic Farm Information</h2>
              <p className="step-guidance">
                Start by giving your farm a recognizable name, its main production focus, and the total land area you operate.
              </p>
            </div>

            {/* Farm Name */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="farm-name-input">
                Farm Name <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <p className="form-helper">
                Choose a clear name that you and your workers call this land.
              </p>
              <input
                id="farm-name-input"
                type="text"
                className={`form-input ${errors.name ? 'has-error' : ''}`}
                placeholder="e.g. Ferme Agro-Pastorale de Bandjoun, Plantation Bassa de Foumbot, Domaine Beti"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                autoFocus
              />
              {errors.name && (
                <div className="field-error-msg">
                  <IconAlertCircle size={15} /> {errors.name}
                </div>
              )}
            </div>

            {/* Primary Farm Type Selector */}
            <div className="form-field-group">
              <label className="form-label">
                Primary Farming Activity <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <p className="form-helper">
                What does this farm primarily produce? This tailors your tracking modules.
              </p>

              <div className="type-card-grid">
                {FARM_TYPES.map((t) => {
                  const Icon = t.icon;
                  const isSelected = formData.type === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`type-select-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => updateField('type', t.id)}
                    >
                      {isSelected && (
                        <div className="type-check-badge">
                          <IconCheck size={13} />
                        </div>
                      )}
                      <div className="type-card-icon-wrap">
                        <Icon size={24} />
                      </div>
                      <div className="type-card-title">{t.title}</div>
                      <div className="type-card-desc">{t.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Total Farm Size & Unit */}
            <div className="form-field-group">
              <label className="form-label">
                Total Land Size <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <p className="form-helper">
                How large is the entire farm boundary? You can partition it into smaller plots later.
              </p>

              <div className="size-unit-row">
                <div>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className={`form-input ${errors.size ? 'has-error' : ''}`}
                    placeholder="e.g. 5.5"
                    value={formData.size}
                    onChange={(e) => updateField('size', e.target.value)}
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
                    onClick={() => updateField('sizeUnit', 'HECTARES')}
                  >
                    Hectares (ha)
                  </button>
                  <button
                    type="button"
                    className={`unit-toggle-btn ${formData.sizeUnit === 'ACRES' ? 'active' : ''}`}
                    onClick={() => updateField('sizeUnit', 'ACRES')}
                  >
                    Acres
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: LOCATION & REGION (OBLIGATORY)                    */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
            <div className="step-header-banner">
              <div className="step-tag-row">
                <span className="step-nature-tag obligatory">
                  <IconCheck size={13} /> Step 2 of 4: Obligatory
                </span>
              </div>
              <h2 className="step-heading">Farm Location & Territory</h2>
              <p className="step-guidance">
                Entering your farm's location ensures correct regional seasonal tracking, cooperative grouping, and localized reporting.
              </p>
            </div>

            {/* Country Selector */}
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
                    onClick={() => updateField('country', c)}
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
                onChange={(e) => updateField('country', e.target.value)}
              />
              {errors.country && (
                <div className="field-error-msg">
                  <IconAlertCircle size={15} /> {errors.country}
                </div>
              )}
            </div>

            {/* Region / Province */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="farm-region-input">
                Region / State / Province <span style={{ color: '#DC2626' }}>*</span>
              </label>
              {POPULAR_REGIONS[formData.country] && (
                <div className="suggestion-chips-row">
                  {POPULAR_REGIONS[formData.country].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`suggestion-chip ${formData.region === r ? 'active' : ''}`}
                      onClick={() => updateField('region', r)}
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
                onChange={(e) => updateField('region', e.target.value)}
              />
              {errors.region && (
                <div className="field-error-msg">
                  <IconAlertCircle size={15} /> {errors.region}
                </div>
              )}
            </div>

            {/* District / County / Locality */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="farm-district-input">
                District / County / Locality <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <p className="form-helper">
                Your sub-division, district, county, or nearest town/village.
              </p>
              <input
                id="farm-district-input"
                type="text"
                className={`form-input ${errors.district ? 'has-error' : ''}`}
                placeholder="e.g. Bandjoun, Bafoussam, Foumbot, Dschang, Lékié, Bassa"
                value={formData.district}
                onChange={(e) => updateField('district', e.target.value)}
              />
              {errors.district && (
                <div className="field-error-msg">
                  <IconAlertCircle size={15} /> {errors.district}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: SOIL, TERRAIN & WATER (NON-OBLIGATORY / OPTIONAL) */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
            <div className="step-header-banner">
              <div className="step-tag-row">
                <span className="step-nature-tag optional">
                  Step 3 of 4: Non-Obligatory (Optional)
                </span>
              </div>
              <h2 className="step-heading">Soil, Terrain & Water Access</h2>
              <p className="step-guidance">
                These optional environmental details help optimize agricultural insights and agronomic recommendations. You can configure them now or skip straight to the end.
              </p>
            </div>

            {/* Skip notification banner */}
            <div className="optional-banner">
              <span className="optional-banner-text">
                Not sure about soil or terrain right now? You can skip this step with no penalty.
              </span>
              <button
                type="button"
                className="skip-step-btn"
                onClick={handleSkipStep3}
              >
                Skip this step →
              </button>
            </div>

            {/* Water Access */}
            <div className="form-field-group">
              <label className="form-label">
                Reliable Water Source Available?
              </label>
              <div className="water-options-grid">
                <div
                  className={`choice-chip-card ${formData.accessToWater === 'YES' ? 'selected' : ''}`}
                  onClick={() => updateField('accessToWater', formData.accessToWater === 'YES' ? '' : 'YES')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: '#0284C7' }}><IconDroplets size={20} /></div>
                    <div className="choice-chip-title">Yes, Water Source Nearby</div>
                  </div>
                  <div className="choice-chip-desc">
                    Stream, river, borehole, well, or piped irrigation system available year-round.
                  </div>
                </div>

                <div
                  className={`choice-chip-card ${formData.accessToWater === 'NO' ? 'selected' : ''}`}
                  onClick={() => updateField('accessToWater', formData.accessToWater === 'NO' ? '' : 'NO')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: '#D97706' }}><IconLeaf size={20} /></div>
                    <div className="choice-chip-title">Rain-fed Only</div>
                  </div>
                  <div className="choice-chip-desc">
                    Field relies solely on seasonal rain patterns and natural precipitation.
                  </div>
                </div>
              </div>
            </div>

            {/* Soil Type */}
            <div className="form-field-group">
              <label className="form-label">
                Predominant Soil Type (Optional)
              </label>
              <div className="soil-options-grid">
                {SOIL_OPTIONS.map((s) => (
                  <div
                    key={s.id}
                    className={`choice-chip-card ${formData.soilType === s.id ? 'selected' : ''}`}
                    onClick={() => updateField('soilType', formData.soilType === s.id ? '' : s.id)}
                  >
                    <div className="choice-chip-title">{s.title}</div>
                    <div className="choice-chip-desc">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terrain Slope */}
            <div className="form-field-group">
              <label className="form-label">
                Field Slope & Topography (Optional)
              </label>
              <div className="slope-options-grid">
                {SLOPE_OPTIONS.map((sl) => (
                  <div
                    key={sl.id}
                    className={`choice-chip-card ${formData.slope === sl.id ? 'selected' : ''}`}
                    onClick={() => updateField('slope', formData.slope === sl.id ? '' : sl.id)}
                  >
                    <div className="choice-chip-title">{sl.title}</div>
                    <div className="choice-chip-desc">{sl.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 4: NOTES & REVIEW (FINAL CONFIRMATION)               */}
        {/* ========================================================= */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
            <div className="step-header-banner">
              <div className="step-tag-row">
                <span className="step-nature-tag obligatory">
                  <IconCheck size={13} /> Step 4 of 4: Final Confirmation
                </span>
              </div>
              <h2 className="step-heading">Review & Confirm Your Farm</h2>
              <p className="step-guidance">
                Check over your registered details. You can add extra directions or notes before confirming.
              </p>
            </div>

            {/* Optional Description / Directions */}
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
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            {/* Optional Notes */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="farm-notes-input">
                Additional Operating Notes (Optional)
              </label>
              <textarea
                id="farm-notes-input"
                rows={2}
                className="form-input"
                style={{ minHeight: '80px', resize: 'vertical' }}
                placeholder="e.g. Hangar de séchage pour maïs, clôture en bambou de Bandjoun, point d'eau aménagé..."
                value={formData.additionalNotes}
                onChange={(e) => updateField('additionalNotes', e.target.value)}
              />
            </div>

            {/* Visual Review Summary Badge */}
            <div className="review-card-summary">
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary, #19201C)', margin: 0 }}>
                Farm Registration Summary
              </h3>

              <div className="review-summary-row">
                <span className="review-label">Farm Name</span>
                <span className="review-val" style={{ color: '#2A6740', fontSize: '1.0625rem' }}>
                  {formData.name || '—'}
                </span>
              </div>

              <div className="review-summary-row">
                <span className="review-label">Primary Activity</span>
                <span className="review-val">
                  {FARM_TYPES.find((t) => t.id === formData.type)?.title || formData.type}
                </span>
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
                  {formData.district}, {formData.region}, {formData.country}
                </span>
              </div>

              {(formData.accessToWater || formData.soilType || formData.slope) && (
                <div className="review-summary-row">
                  <span className="review-label">Terrain & Water</span>
                  <span className="review-val" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {[
                      formData.accessToWater === 'YES' ? 'Water Access' : formData.accessToWater === 'NO' ? 'Rain-fed' : null,
                      formData.soilType ? `${formData.soilType.toLowerCase()} soil` : null,
                      formData.slope ? `${formData.slope.toLowerCase()} slope` : null
                    ].filter(Boolean).join(' · ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEPPER ACTIONS NAV BAR                                    */}
        {/* ========================================================= */}
        <div className="stepper-actions-bar">
          {currentStep > 1 ? (
            <button
              type="button"
              className="stepper-btn stepper-btn-secondary"
              onClick={handleBack}
              disabled={submitting}
            >
              ← Back
            </button>
          ) : (
            <button
              type="button"
              className="stepper-btn stepper-btn-secondary"
              onClick={() => onNavigate && onNavigate('farms')}
              disabled={submitting}
            >
              Cancel
            </button>
          )}

          {currentStep === 3 && (
            <button
              type="button"
              className="stepper-btn-skip"
              onClick={handleSkipStep3}
              disabled={submitting}
            >
              Skip to Review →
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              className="stepper-btn stepper-btn-primary"
              onClick={handleNext}
            >
              Continue to Step {currentStep + 1} →
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

