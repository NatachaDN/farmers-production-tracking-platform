import React, { useState } from 'react';
import { IconPlus, IconCheck } from '../../../shared/components/Icons';

export function AddPlotModal({ isOpen, onClose, onAddPlot }) {
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [location, setLocation] = useState('');
  const [cropType, setCropType] = useState('Maize');
  const [stage, setStage] = useState('Planting');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // --- Validation Rules ---
    const trimmedName = name.trim();
    const trimmedLocation = location.trim();
    const numericArea = parseFloat(area);

    if (!trimmedName) {
      setValidationError('Please enter a valid plot name.');
      return;
    }

    if (area.trim() === '' || isNaN(numericArea) || numericArea <= 0) {
      setValidationError('Validation Error: Area must be a positive numeric value greater than 0 (e.g., 2.5).');
      return;
    }

    if (!trimmedLocation) {
      setValidationError('Please enter the plot location or sector.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddPlot({
        name: trimmedName,
        area: numericArea,
        location: trimmedLocation,
        cropType,
        stage
      });
      // Reset form
      setName('');
      setArea('');
      setLocation('');
      setCropType('Maize');
      setStage('Planting');
      onClose();
    } catch (err) {
      setValidationError(err.message || 'Failed to register plot. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(19, 32, 28, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="fade-in"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl, 16px)',
          border: '1px solid var(--color-card-border, #ECE7DC)',
          boxShadow: '0 20px 40px rgba(22, 66, 48, 0.15)',
          width: '100%',
          maxWidth: '520px',
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary, #19201C)', marginBottom: '4px' }}>
              Register a New Plot
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted, #788680)' }}>
              Add a production zone with its name, area, and location to track cycles separately.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              color: 'var(--color-text-muted, #788680)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#991B1B',
              fontSize: '0.8125rem',
              fontWeight: 500,
              lineHeight: 1.4
            }}
          >
            ⚠️ {validationError}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Plot Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary, #19201C)' }}>
              Plot Name <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Plot E — Wheat or North Field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md, 10px)',
                border: '1px solid var(--color-border-input, #DFD8CA)',
                fontSize: '0.875rem',
                color: 'var(--color-text-primary, #19201C)',
                outline: 'none',
                width: '100%'
              }}
            />
          </div>

          {/* Area & Location side-by-side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary, #19201C)' }}>
                Area (ha) <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., 2.5"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md, 10px)',
                  border: validationError && validationError.includes('Area')
                    ? '1.5px solid #DC2626'
                    : '1px solid var(--color-border-input, #DFD8CA)',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-primary, #19201C)',
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>

            {/* Location */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary, #19201C)' }}>
                Location <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., North Sector"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md, 10px)',
                  border: '1px solid var(--color-border-input, #DFD8CA)',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-primary, #19201C)',
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {/* Crop Type & Stage */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Crop Type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary, #19201C)' }}>
                Crop Type
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md, 10px)',
                  border: '1px solid var(--color-border-input, #DFD8CA)',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-primary, #19201C)',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  width: '100%'
                }}
              >
                <option value="Maize">Maize</option>
                <option value="Tomatoes">Tomatoes</option>
                <option value="Beans">Beans</option>
                <option value="Cassava">Cassava</option>
                <option value="Wheat">Wheat</option>
                <option value="Potatoes">Potatoes</option>
              </select>
            </div>

            {/* Stage */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary, #19201C)' }}>
                Current Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md, 10px)',
                  border: '1px solid var(--color-border-input, #DFD8CA)',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-primary, #19201C)',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  width: '100%'
                }}
              >
                <option value="Planting">Planting</option>
                <option value="Vegetative growth">Vegetative growth</option>
                <option value="Flowering">Flowering</option>
                <option value="Maturing">Maturing</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border-input, #DFD8CA)',
                borderRadius: 'var(--radius-md, 10px)',
                padding: '10px 18px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary, #4B5752)',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-brand-primary, #3E7B52)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-md, 10px)',
                padding: '10px 20px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: 'var(--shadow-subtle, 0 1px 2px rgba(0,0,0,0.05))'
              }}
            >
              <IconPlus size={16} />
              <span>{isSubmitting ? 'Registering...' : 'Register Plot'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
