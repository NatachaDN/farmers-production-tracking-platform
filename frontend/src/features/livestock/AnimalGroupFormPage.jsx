import React, { useState, useEffect } from 'react';
import {
  IconArrowLeft,
  IconCamera,
  IconClose,
  IconLivestock,
  IconWarning
} from '../../shared/components/Icons';
import { farmService } from '../farms/services/farmService';
import { animalGroupService } from './services/animalGroupService';

const BACKEND_ORIGIN = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8080/api/v1'
).replace(/\/api\/v1\/?$/, '');

export function resolveAnimalImageUrl(url) {
  if (!url) return null;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  return `${BACKEND_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

const ANIMAL_TYPES = [
  { value: 'CATTLE', label: 'Cattle' },
  { value: 'POULTRY', label: 'Poultry' },
  { value: 'GOATS', label: 'Goats' },
  { value: 'SHEEP', label: 'Sheep' },
  { value: 'PIGS', label: 'Pigs' },
  { value: 'RABBITS', label: 'Rabbits' },
  { value: 'BEES', label: 'Bees' },
  { value: 'FISH', label: 'Fish' },
  { value: 'OTHER', label: 'Other' }
];

const COMMON_PURPOSES = [
  'Milk Production',
  'Meat Production',
  'Egg Production',
  'Breeding',
  'Wool / Fiber',
  'Honey & Pollination',
  'Dual Purpose',
  'Other'
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'ARCHIVED', label: 'Archived' },
  { value: 'INACTIVE', label: 'Inactive' }
];

const HEALTH_OPTIONS = [
  'Healthy',
  'Vaccinated',
  'Under Observation',
  'Recovering',
  'Quarantine'
];

export function AnimalGroupFormPage({ group = null, onBack, onSave }) {
  const isEdit = !!group;

  const [name, setName] = useState(group?.name || '');
  const [animalType, setAnimalType] = useState(group?.animalType || 'CATTLE');
  const [breed, setBreed] = useState(group?.breed || '');
  const [initialPopulation, setInitialPopulation] = useState(
    group?.initialPopulation != null ? String(group.initialPopulation) : ''
  );
  const [currentPopulation, setCurrentPopulation] = useState(
    group?.currentPopulation != null ? String(group.currentPopulation) : ''
  );
  const [location, setLocation] = useState(group?.location || '');
  const [farmId, setFarmId] = useState(group?.farmId ? String(group.farmId) : '');
  const [purpose, setPurpose] = useState(group?.purpose || 'Milk Production');
  const [status, setStatus] = useState(group?.status || 'ACTIVE');
  const [startDate, setStartDate] = useState(
    group?.startDate || new Date().toISOString().split('T')[0]
  );
  const [feedingRegime, setFeedingRegime] = useState(group?.feedingRegime || '');
  const [healthStatus, setHealthStatus] = useState(group?.healthStatus || '');
  const [averageWeightKg, setAverageWeightKg] = useState(
    group?.averageWeightKg != null ? String(group.averageWeightKg) : ''
  );
  const [description, setDescription] = useState(group?.description || '');
  const [notes, setNotes] = useState(group?.notes || '');
  const [imageUrls, setImageUrls] = useState(
    Array.isArray(group?.imageUrls) ? [...group.imageUrls] : []
  );
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [farms, setFarms] = useState([]);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    farmService
      .getFarms()
      .then((data) => {
        if (Array.isArray(data)) setFarms(data);
      })
      .catch(() => setFarms([]));
  }, []);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingPhoto(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        try {
          const res = await animalGroupService.uploadAnimalPhoto(file);
          if (res?.url) uploadedUrls.push(res.url);
        } catch {
          const dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
          if (dataUrl) uploadedUrls.push(dataUrl);
        }
      }
      if (uploadedUrls.length > 0) {
        setImageUrls((prev) => [...prev, ...uploadedUrls]);
      }
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    setImageUrls((prev) => [...prev, trimmed]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('Group name is required.');
      return;
    }

    const initPopNum = parseInt(initialPopulation, 10);
    if (isNaN(initPopNum) || initPopNum <= 0) {
      setValidationError('Initial population must be greater than zero.');
      return;
    }

    const currPopNum = currentPopulation !== '' ? parseInt(currentPopulation, 10) : initPopNum;
    if (isNaN(currPopNum) || currPopNum < 0) {
      setValidationError('Current population cannot be negative.');
      return;
    }

    const payload = {
      name: trimmedName,
      animalType,
      breed: breed.trim() || undefined,
      initialPopulation: initPopNum,
      currentPopulation: currPopNum,
      location: location.trim() || undefined,
      farmId: farmId ? Number(farmId) : undefined,
      purpose: purpose || undefined,
      status,
      startDate: startDate || undefined,
      feedingRegime: feedingRegime.trim() || undefined,
      healthStatus: healthStatus || undefined,
      averageWeightKg: averageWeightKg ? Number(averageWeightKg) : undefined,
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
      imageUrls
    };

    setIsSubmitting(true);
    try {
      await onSave(payload);
    } catch (err) {
      setValidationError(err.message || 'Failed to save animal group.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid var(--color-border-input)',
    backgroundColor: '#FFFFFF',
    fontSize: '0.9375rem',
    color: 'var(--color-text-primary)',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    marginBottom: '6px'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 14px',
            borderRadius: '10px',
            border: '1px solid var(--color-border-input)',
            backgroundColor: '#FFFFFF',
            color: 'var(--color-text-primary)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <IconArrowLeft size={16} />
          <span>{isEdit ? 'Back to Group Details' : 'Back to Livestock'}</span>
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid var(--color-card-border)',
          padding: 'clamp(18px, 3vw, 28px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <IconLivestock size={24} color="#D97706" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {isEdit ? `Edit ${group.name}` : 'Register Animal Group'}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Record full herd, flock, pen, or livestock batch details, pictures, and management notes.
            </p>
          </div>
        </div>

        {validationError && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#991B1B',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <IconWarning size={16} color="#DC2626" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Group Identity */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '16px'
        }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Group Name / Identifier *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Poulets Goliath de Bandjoun, Dairy Herd A"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Animal Type *</label>
            <select value={animalType} onChange={(e) => setAnimalType(e.target.value)} style={inputStyle}>
              {ANIMAL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Breed (optional)</label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="e.g. Cobb 500, Holstein, Goliath"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Population & Weight */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '16px'
        }}>
          <div>
            <label style={labelStyle}>Initial Population *</label>
            <input
              type="number"
              min="1"
              required
              value={initialPopulation}
              onChange={(e) => setInitialPopulation(e.target.value)}
              placeholder="e.g. 30"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Current Population</label>
            <input
              type="number"
              min="0"
              value={currentPopulation}
              onChange={(e) => setCurrentPopulation(e.target.value)}
              placeholder="Defaults to initial"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Average Weight (kg)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={averageWeightKg}
              onChange={(e) => setAverageWeightKg(e.target.value)}
              placeholder="e.g. 2.5"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Pictures Section */}
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: '#FCFAF7',
          border: '1px solid var(--color-card-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Livestock Group Pictures
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Upload photos of the herd, flock, pen, or housing. First photo is used as cover.
              </div>
            </div>

            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid var(--color-brand-primary)',
              backgroundColor: 'var(--color-brand-tint)',
              color: 'var(--color-brand-primary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: uploadingPhoto ? 'wait' : 'pointer'
            }}>
              <IconCamera size={15} color="var(--color-brand-primary)" />
              <span>{uploadingPhoto ? 'Uploading...' : 'Upload Photos'}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploadingPhoto}
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="url"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="Or paste an image URL (https://...)"
              style={{ ...inputStyle, flex: '1 1 220px' }}
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--color-border-input)',
                backgroundColor: '#FFFFFF',
                color: 'var(--color-text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Add URL
            </button>
          </div>

          {imageUrls.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {imageUrls.map((url, idx) => (
                <div key={idx} style={{
                  position: 'relative',
                  width: '104px',
                  height: '84px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border-input)',
                  backgroundColor: '#FFFFFF'
                }}>
                  <img
                    src={resolveAnimalImageUrl(url)}
                    alt={`Animal group preview ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {idx === 0 && (
                    <span style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '4px',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(22, 66, 48, 0.85)',
                      color: '#FFFFFF'
                    }}>
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    aria-label="Remove photo"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: 'rgba(25, 32, 28, 0.75)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <IconClose size={12} color="#FFFFFF" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Description & Notes */}
        <div>
          <label style={labelStyle}>Detailed Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe breed origin, vaccination schedule, housing setup, temperament, or production goals..."
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
          />
        </div>

        {/* Housing, Purpose, Feeding & Health */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '16px'
        }}>
          <div>
            <label style={labelStyle}>Housing / Pen / Pasture</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Poulailler N°1, East Meadow"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Primary Purpose</label>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)} style={inputStyle}>
              {COMMON_PURPOSES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Health Status</label>
            <select value={healthStatus} onChange={(e) => setHealthStatus(e.target.value)} style={inputStyle}>
              <option value="">Select health status...</option>
              {HEALTH_OPTIONS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Feeding Regime</label>
            <input
              type="text"
              value={feedingRegime}
              onChange={(e) => setFeedingRegime(e.target.value)}
              placeholder="e.g. Zero-grazing + Silage + Concentrates"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Associated Farm (optional)</label>
            <select value={farmId} onChange={(e) => setFarmId(e.target.value)} style={inputStyle}>
              <option value="">Not linked to a specific farm</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Acquisition / Establishment Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Short Operational Notes (optional)</label>
          <input
            type="text"
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Quick reminder or transfer note..."
            style={inputStyle}
          />
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          gap: '10px',
          paddingTop: '12px',
          borderTop: '1px solid var(--color-card-border)'
        }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid var(--color-border-input)',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-text-primary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'var(--color-brand-primary)',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'wait' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Register Animal Group'}
          </button>
        </div>
      </form>
    </div>
  );
}

