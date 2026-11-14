import React, { useEffect, useState } from 'react';
import { farmService } from './services/farmService';
import {
  IconFarms,
  IconCheck,
  IconSprout,
  IconWater,
  IconMapPin
} from '../../shared/components/Icons';

export function CreateFarmView({ onNavigate, onFarmCreated }) {
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [mapFile, setMapFile] = useState(null);
  const [mapPreview, setMapPreview] = useState('');
  const [mapError, setMapError] = useState('');

  useEffect(() => {
    if (!mapFile) {
      setMapPreview('');
      return;
    }
    const url = URL.createObjectURL(mapFile);
    setMapPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [mapFile]);

  function selectMap(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) {
      setMapError('Choose a PNG or JPEG image up to 5 MB.');
      event.target.value = '';
      return;
    }
    setMapError('');
    setMapFile(file);
  }

  const [formData, setFormData] = useState({
    name: '',
    type: 'CROP',
    size: '',
    sizeUnit: 'HECTARES',
    description: '',
    status: 'ACTIVE',
    country: '',
    region: '',
    district: '',
    mapImageUrl: '',
    soilType: 'LOAMY',
    slope: 'MODERATE',
    accessToWater: 'YES',
    additionalNotes: ''
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!formData.name.trim()) errors.name = 'Farm name is required';
      if (!formData.type) errors.type = 'Farm type is required';
      if (!Number.isFinite(Number(formData.size)) || Number(formData.size) <= 0) errors.size = 'Enter a positive farm size.';
      if (!formData.sizeUnit) errors.sizeUnit = 'Size unit is required';
    } else if (step === 2) {
      if (!formData.country.trim()) errors.country = 'Country is required';
      if (!formData.region.trim()) errors.region = 'Region is required';
      if (!formData.district.trim()) errors.district = 'District is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const invalidStep = [1, 2].find(step => !validateStep(step));
    if (invalidStep) {
      setActiveStep(invalidStep);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        size: Number(formData.size),
        sizeUnit: formData.sizeUnit,
        description: formData.description ? formData.description.trim() : null,
        status: formData.status,
        country: formData.country.trim(),
        region: formData.region.trim(),
        district: formData.district.trim(),
        mapImageUrl: formData.mapImageUrl ? formData.mapImageUrl.trim() : null,
        soilType: formData.type === 'CROP' ? formData.soilType : null,
        slope: formData.type === 'CROP' ? formData.slope : null,
        accessToWater: formData.accessToWater || null,
        additionalNotes: formData.additionalNotes ? formData.additionalNotes.trim() : null
      };

      const createdFarm = await farmService.createFarm(payload, mapFile);
      if (onFarmCreated) {
        onFarmCreated(createdFarm);
      } else if (onNavigate) {
        onNavigate('farms');
      }
    } catch (error) {
      console.error('Error creating farm:', error);
      if (error.data?.validationErrors) {
        setValidationErrors(error.data.validationErrors);
      }
      setErrorMessage(error.message || 'Failed to create farm record. Please verify server validation requirements.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic information', desc: 'Name, type, size & status' },
    { number: 2, title: 'Location & boundaries', desc: 'Country, region & map boundary' },
    { number: 3, title: 'Farm details', desc: formData.type === 'CROP' ? 'Soil, slope & water access' : 'Facilities & water access' },
    { number: 4, title: 'Review & create', desc: 'Verify and submit farm details' }
  ];

  return (
    <div className="workspace-screen fade-in farm-editor-workspace">
      {/* Top Header & Breadcrumb */}
      <div>
        <button
          onClick={() => onNavigate && onNavigate('farms')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: 'var(--color-brand-primary)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '8px'
          }}
        >
          ← Back to farms
        </button>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Create a new farm
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)' }}>
          Add the details of your farm to start managing your land, crops and resources.
        </p>
      </div>

      {/* Main Grid: Stepper Sidebar (Left) + Form Canvas (Right) */}
      <div className="acrea-responsive-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '28px' }}>
        {/* Left Side Stepper */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 20px',
          boxShadow: 'var(--shadow-card)',
          alignSelf: 'start'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {steps.map((s) => {
              const isActive = activeStep === s.number;
              const isCompleted = activeStep > s.number;

              return (
                <div
                  key={s.number}
                  onClick={() => s.number < activeStep && setActiveStep(s.number)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive ? 'var(--color-brand-tint)' : 'transparent',
                    cursor: s.number < activeStep ? 'pointer' : 'default',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? 'var(--color-brand-primary)' : isActive ? 'var(--color-brand-primary)' : '#ECE7DC',
                    color: isCompleted || isActive ? '#FFFFFF' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {isCompleted ? <IconCheck size={16} color="#FFFFFF" /> : s.number}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-primary)'
                    }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {s.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side Form Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {errorMessage && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              fontSize: '0.875rem'
            }}>
              <strong>Error: </strong> {errorMessage}
            </div>
          )}

          {/* STEP 1: BASIC INFORMATION */}
          <div hidden={activeStep !== 1} style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-card-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-brand-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 700
              }}>1</div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Basic information
              </h2>
            </div>

            <div className="acrea-responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Farm Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Farm name *
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${validationErrors.name ? '#DC2626' : 'var(--color-card-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px'
                }}>
                  <IconFarms size={18} color="var(--color-text-muted)" />
                  <input
                    aria-label="Farm name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g. Dschang Highlands Farm"
                    style={{
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.875rem',
                      color: 'var(--color-text-primary)',
                      width: '100%'
                    }}
                  />
                </div>
                {validationErrors.name && (
                  <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px', display: 'block' }}>
                    {validationErrors.name}
                  </span>
                )}
              </div>

              {/* Farm Type */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Farm type *
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${validationErrors.type ? '#DC2626' : 'var(--color-card-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px'
                }}>
                  <IconSprout size={18} color="var(--color-text-muted)" />
                  <select
                    aria-label="Farm type"
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.875rem',
                      color: 'var(--color-text-primary)',
                      width: '100%',
                      backgroundColor: 'transparent'
                    }}
                  >
                    <option value="CROP">Crop farm</option>
                    <option value="LIVESTOCK">Livestock farm</option>
                  </select>
                </div>
              </div>

              {/* Farm Size & Unit */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Farm size *
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    aria-label="Farm size"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.size}
                    onChange={(e) => handleChange('size', e.target.value)}
                    placeholder="25"
                    style={{
                      flex: 1,
                      backgroundColor: '#FFFFFF',
                      border: `1px solid ${validationErrors.size ? '#DC2626' : 'var(--color-card-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      fontSize: '0.875rem',
                      color: 'var(--color-text-primary)',
                      outline: 'none'
                    }}
                  />
                  <select
                    value={formData.sizeUnit}
                    onChange={(e) => handleChange('sizeUnit', e.target.value)}
                    style={{
                      width: '130px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--color-card-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      fontSize: '0.875rem',
                      color: 'var(--color-text-primary)',
                      outline: 'none'
                    }}
                  >
                    <option value="HECTARES">hectares</option>
                    <option value="ACRES">acres</option>
                  </select>
                </div>
                {validationErrors.size && (
                  <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px', display: 'block' }}>
                    {validationErrors.size}
                  </span>
                )}
              </div>

              {/* Status Toggle */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Farm status
                </label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleChange('status', 'ACTIVE')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 18px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      backgroundColor: formData.status === 'ACTIVE' ? 'var(--color-brand-primary)' : '#FFFFFF',
                      color: formData.status === 'ACTIVE' ? '#FFFFFF' : 'var(--color-text-secondary)',
                      border: `1px solid ${formData.status === 'ACTIVE' ? 'var(--color-brand-primary)' : 'var(--color-card-border)'}`,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: formData.status === 'ACTIVE' ? '#FFFFFF' : '#22C55E' }}></span>
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('status', 'INACTIVE')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 18px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      backgroundColor: formData.status === 'INACTIVE' ? '#64748B' : '#FFFFFF',
                      color: formData.status === 'INACTIVE' ? '#FFFFFF' : 'var(--color-text-secondary)',
                      border: `1px solid ${formData.status === 'INACTIVE' ? '#64748B' : 'var(--color-card-border)'}`,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: formData.status === 'INACTIVE' ? '#FFFFFF' : '#94A3B8' }}></span>
                    Inactive
                  </button>
                </div>
              </div>

              {/* Description */}
              <div style={{ gridColumn: 'span 2' }}>
                <div className="acrea-responsive-toolbar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    Description
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {formData.description.length}/500
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Main farm details and summary..."
                  style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-card-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* STEP 2: LOCATION & BOUNDARIES */}
          <div hidden={activeStep !== 2} style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-card-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-brand-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 700
              }}>2</div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Location & boundaries
              </h2>
            </div>

            <div className="acrea-responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
              {/* Country */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Country *
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${validationErrors.country ? '#DC2626' : 'var(--color-card-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px'
                }}>
                  <IconMapPin size={18} color="var(--color-text-muted)" />
                  <input
                    aria-label="Country"
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="e.g. Cameroon"
                    style={{ border: 'none', outline: 'none', fontSize: '0.875rem', color: 'var(--color-text-primary)', width: '100%' }}
                  />
                </div>
                {validationErrors.country && <p className="workspace-error" role="alert">{validationErrors.country}</p>}
              </div>

              {/* Region */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Region *
                </label>
                <input
                  aria-label="Region"
                  type="text"
                  value={formData.region}
                  onChange={(e) => handleChange('region', e.target.value)}
                  placeholder="e.g. West Region"
                  style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${validationErrors.region ? '#DC2626' : 'var(--color-card-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-primary)',
                    outline: 'none'
                  }}
                />
                {validationErrors.region && <p className="workspace-error" role="alert">{validationErrors.region}</p>}
              </div>

              {/* District */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  District *
                </label>
                <input
                  aria-label="District"
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  placeholder="e.g. Mifi"
                  style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${validationErrors.district ? '#DC2626' : 'var(--color-card-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-primary)',
                    outline: 'none'
                  }}
                />
                {validationErrors.district && <p className="workspace-error" role="alert">{validationErrors.district}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="farm-map">Farm map image (optional)</label>
              <p className="workspace-muted">PNG or JPEG, up to 5 MB. The image is uploaded when you create the farm.</p>
              <input id="farm-map" type="file" accept="image/png,image/jpeg" onChange={selectMap} />
              {mapError && <p className="workspace-error" role="alert">{mapError}</p>}
              {mapPreview && <>
                <img src={mapPreview} alt="Selected farm map" style={{ display: 'block', maxWidth: '100%', maxHeight: 200, marginTop: 12 }} />
                <p role="status">{mapFile.name} selected.</p>
                <button className="workspace-button" type="button" onClick={() => {
                  setMapFile(null);
                  setMapError('');
                  document.getElementById('farm-map').value = '';
                }}>Remove image</button>
              </>}
            </div>
          </div>
          {/* STEP 3: LAND DETAILS */}
          <div hidden={activeStep !== 3} style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-card-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-brand-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 700
              }}>3</div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {formData.type === 'CROP' ? 'Land details' : 'Livestock facilities'}
              </h2>
            </div>

            <div className="acrea-responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
              {/* Soil Type */}
              <div hidden={formData.type !== 'CROP'}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Soil type
                </label>
                <select
                  value={formData.soilType}
                  onChange={(e) => handleChange('soilType', e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-card-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-primary)',
                    outline: 'none'
                  }}
                >
                  <option value="LOAMY">Loamy</option>
                  <option value="CLAY">Clay</option>
                  <option value="SANDY">Sandy</option>
                  <option value="SILTY">Silty</option>
                  <option value="PEATY">Peaty</option>
                  <option value="CHALKY">Chalky</option>
                  <option value="ROCKY">Rocky</option>
                </select>
              </div>

              {/* Slope */}
              <div hidden={formData.type !== 'CROP'}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Slope
                </label>
                <select
                  value={formData.slope}
                  onChange={(e) => handleChange('slope', e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-card-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-primary)',
                    outline: 'none'
                  }}
                >
                  <option value="FLAT">Flat</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="STEEP">Steep</option>
                </select>
              </div>

              {/* Access to Water */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Access to water
                </label>
                <select
                  value={formData.accessToWater}
                  onChange={(e) => handleChange('accessToWater', e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-card-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-primary)',
                    outline: 'none'
                  }}
                >
                  <option value="YES">Yes</option>
                  <option value="NO">No</option>
                </select>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <div className="acrea-responsive-toolbar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Additional notes (optional)
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {formData.additionalNotes.length}/500
                </span>
              </div>
              <textarea
                rows={2}
                maxLength={500}
                value={formData.additionalNotes}
                onChange={(e) => handleChange('additionalNotes', e.target.value)}
                placeholder={formData.type === 'CROP' ? 'Near a small river. Good for irrigation.' : 'e.g. Covered poultry house with a water tank'}
                style={{
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-card-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {activeStep === 4 && <section className="workspace-panel">
            <h2>Review farm details</h2>
            <dl className="workspace-facts">
              <div><dt>Farm name</dt><dd>{formData.name}</dd></div>
              <div><dt>Farm type</dt><dd>{formData.type === 'CROP' ? 'Crop' : 'Livestock'}</dd></div>
              <div><dt>Size</dt><dd>{formData.size} {formData.sizeUnit.toLowerCase()}</dd></div>
              <div><dt>Status</dt><dd>{formData.status.toLowerCase()}</dd></div>
              <div><dt>Location</dt><dd>{formData.district}, {formData.region}, {formData.country}</dd></div>
              <div><dt>Map</dt><dd>{mapFile?.name || 'No image selected'}</dd></div>
              {formData.type === 'CROP' && <>
                <div><dt>Soil</dt><dd>{formData.soilType.toLowerCase()}</dd></div>
                <div><dt>Slope</dt><dd>{formData.slope.toLowerCase()}</dd></div>
              </>}
              <div><dt>Water access</dt><dd>{formData.accessToWater.toLowerCase()}</dd></div>
              {formData.description && <div><dt>Description</dt><dd>{formData.description}</dd></div>}
              {formData.additionalNotes && <div><dt>Notes</dt><dd>{formData.additionalNotes}</dd></div>}
            </dl>
          </section>}

          {/* ACTION BUTTONS FOOTER */}
          <div style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-card-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '16px 24px'
          }}>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('farms')}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-card-border)',
                color: 'var(--color-text-primary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#F4EFE6',
                    border: 'none',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Previous
                </button>
              )}

              {activeStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-brand-primary)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Next</span>
                  <span>→</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 28px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSubmitting ? 'var(--color-brand-hover)' : 'var(--color-brand-primary)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-subtle)'
                  }}
                >
                  {isSubmitting ? 'Creating Farm...' : 'Submit & Create Farm'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
