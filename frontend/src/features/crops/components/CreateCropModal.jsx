import React, { useState } from 'react';
import { cropService } from '../services/cropService';
import { IconClose, IconSprout } from '../../../shared/components/Icons';

const CROP_CATEGORIES = [
  'Cereals',
  'Legumes',
  'Vegetables',
  'Roots & Tubers',
  'Fruits',
  'Cash Crops',
  'Other',
];

const WATER_LEVELS = ['', 'Low', 'Moderate', 'High'];
const YIELD_UNITS = ['kg/ha', 't/ha', 'bags/ha'];

const labelStyle = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: '#19201C',
  marginBottom: '5px',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid #DFD8CA',
  backgroundColor: '#FFFFFF',
  color: '#19201C',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
};

export function CreateCropModal({ farmerId, isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [category, setCategory] = useState('Cereals');
  const [growthDurationDays, setGrowthDurationDays] = useState('');
  const [expectedYieldPerHectare, setExpectedYieldPerHectare] = useState('');
  const [yieldUnit, setYieldUnit] = useState('kg/ha');
  const [plantingSeason, setPlantingSeason] = useState('');
  const [waterRequirement, setWaterRequirement] = useState('Moderate');
  const [soilPreference, setSoilPreference] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setVariety('');
    setCategory('Cereals');
    setGrowthDurationDays('');
    setExpectedYieldPerHectare('');
    setYieldUnit('kg/ha');
    setPlantingSeason('');
    setWaterRequirement('Moderate');
    setSoilPreference('');
    setDescription('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');

    if (!farmerId) {
      setError('Farmer account is not loaded yet.');
      return;
    }
    if (!name.trim()) {
      setError('Crop name is required.');
      return;
    }

    const payload = {
      name: name.trim(),
      variety: variety.trim() || null,
      category: category || null,
      description: description.trim() || null,
      growthDurationDays: growthDurationDays ? parseInt(growthDurationDays, 10) : null,
      expectedYieldPerHectare: expectedYieldPerHectare ? parseFloat(expectedYieldPerHectare) : null,
      yieldUnit: yieldUnit || 'kg/ha',
      plantingSeason: plantingSeason.trim() || null,
      waterRequirement: waterRequirement || null,
      soilPreference: soilPreference.trim() || null,
    };

    setSubmitting(true);
    try {
      const created = await cropService.createCrop(farmerId, payload);
      resetForm();
      onCreated?.(created);
    } catch (err) {
      setError(err.message || 'Could not save crop. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        backgroundColor: 'rgba(19, 32, 28, 0.5)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90dvh',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          border: '1px solid #ECE7DC',
          borderRadius: '18px',
          boxShadow: '0 20px 50px rgba(22, 66, 48, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid #ECE7DC',
            backgroundColor: '#F9F6F0',
            borderTopLeftRadius: '18px',
            borderTopRightRadius: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#EAF4ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconSprout size={18} color="#3E7B52" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#164230', margin: 0 }}>
                Register New Crop
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#788680', margin: 0 }}>
                Saved to your personal crop catalog in the database for reuse across plots and cycles.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid #DFD8CA',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <IconClose size={16} color="#4B5752" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '10px',
                color: '#B91C1C',
                fontSize: '0.8125rem',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div>
              <label htmlFor="modal-crop-name" style={labelStyle}>
                Crop Name <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                id="modal-crop-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Maize, Avocado, Ginger"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="modal-crop-variety" style={labelStyle}>
                Variety / Cultivar
              </label>
              <input
                id="modal-crop-variety"
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="e.g., Hybrid 614, Hass"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
            <div>
              <label htmlFor="modal-crop-category" style={labelStyle}>Category</label>
              <select
                id="modal-crop-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={inputStyle}
              >
                {CROP_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="modal-crop-duration" style={labelStyle}>Growth Duration (days)</label>
              <input
                id="modal-crop-duration"
                type="number"
                min="1"
                value={growthDurationDays}
                onChange={(e) => setGrowthDurationDays(e.target.value)}
                placeholder="e.g., 120"
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="modal-crop-water" style={labelStyle}>Water Requirement</label>
              <select
                id="modal-crop-water"
                value={waterRequirement}
                onChange={(e) => setWaterRequirement(e.target.value)}
                style={inputStyle}
              >
                {WATER_LEVELS.map((w) => (
                  <option key={w || 'none'} value={w}>{w || 'Select level'}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
            <div>
              <label htmlFor="modal-crop-yield" style={labelStyle}>Expected Yield / ha</label>
              <input
                id="modal-crop-yield"
                type="number"
                step="0.01"
                min="0"
                value={expectedYieldPerHectare}
                onChange={(e) => setExpectedYieldPerHectare(e.target.value)}
                placeholder="e.g., 4500"
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="modal-crop-yield-unit" style={labelStyle}>Yield Unit</label>
              <select
                id="modal-crop-yield-unit"
                value={yieldUnit}
                onChange={(e) => setYieldUnit(e.target.value)}
                style={inputStyle}
              >
                {YIELD_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="modal-crop-season" style={labelStyle}>Planting Season</label>
              <input
                id="modal-crop-season"
                type="text"
                value={plantingSeason}
                onChange={(e) => setPlantingSeason(e.target.value)}
                placeholder="e.g., Long Rains"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label htmlFor="modal-crop-soil" style={labelStyle}>Soil Preference</label>
            <input
              id="modal-crop-soil"
              type="text"
              value={soilPreference}
              onChange={(e) => setSoilPreference(e.target.value)}
              placeholder="e.g., Well-drained fertile loamy soil, pH 6.0–7.0"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="modal-crop-desc" style={labelStyle}>Agronomic Notes / Description</label>
            <textarea
              id="modal-crop-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes on spacing, fertilizer, or resistance..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', paddingTop: '14px', borderTop: '1px solid #ECE7DC' }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                border: '1px solid #DFD8CA',
                backgroundColor: '#FFFFFF',
                color: '#4B5752',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '9px 20px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#3E7B52',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Saving Crop...' : 'Save Crop to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
