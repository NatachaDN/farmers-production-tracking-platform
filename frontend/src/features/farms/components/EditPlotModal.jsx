import React, { useState, useEffect } from 'react';
import { IconCheck, IconClose, IconWarning, IconPencil } from '../../../shared/components/Icons';

export function EditPlotModal({ isOpen, onClose, plot, farms = [], onPlotUpdated }) {
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [location, setLocation] = useState('');
  const [cropType, setCropType] = useState('Maize');
  const [stage, setStage] = useState('Planting');
  const [farmId, setFarmId] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (plot) {
      setName(plot.title || plot.name || '');
      const rawArea = plot.areaVal !== undefined ? plot.areaVal : (typeof plot.area === 'number' ? plot.area : parseFloat(plot.area));
      setArea(rawArea !== undefined && !isNaN(rawArea) ? String(rawArea) : '');
      setLocation(plot.location || '');
      setCropType(plot.crop || plot.cropType || 'Maize');
      setStage(plot.stage || 'Planting');
      setFarmId(plot.farmId ? String(plot.farmId) : (farms[0]?.id ? String(farms[0].id) : ''));
      setValidationError('');
    }
  }, [plot, farms]);

  if (!isOpen || !plot) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const trimmedName = name.trim();
    const trimmedLocation = location.trim();
    const numericArea = parseFloat(area);

    if (!trimmedName) {
      setValidationError('Please enter a valid plot name.');
      return;
    }

    if (area === '' || isNaN(numericArea) || numericArea <= 0) {
      setValidationError('Validation Error: Area must be a positive numeric value greater than 0 (e.g., 2.5 ha).');
      return;
    }

    if (!trimmedLocation) {
      setValidationError('Please enter the plot location or sector.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onPlotUpdated({
        id: plot.id,
        name: trimmedName,
        area: numericArea,
        location: trimmedLocation,
        cropType,
        stage,
        farmId: farmId ? Number(farmId) : undefined
      });
      onClose();
    } catch (err) {
      setValidationError(err.message || 'Failed to update plot. Please verify your inputs.');
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary, #19201C)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconPencil size={20} color="var(--color-brand-primary, #164230)" />
              Edit Land Plot
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted, #7B8A82)', margin: 0 }}>
              Update plot specifications, boundaries, and active crop stage.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted, #7B8A82)',
              padding: '4px',
              borderRadius: 'var(--radius-md, 8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.8125rem',
              color: '#991B1B'
            }}
          >
            <IconWarning size={18} color="#DC2626" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary, #19201C)', marginBottom: '6px' }}>
              Plot Name <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Plot A — Maize"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--color-border-subtle, #DCD6CD)',
                fontSize: '0.875rem',
                color: 'var(--color-text-primary, #19201C)',
                backgroundColor: 'var(--color-canvas, #F9F6F0)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary, #19201C)', marginBottom: '6px' }}>
                Cultivated Area (ha) <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. 2.5"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--color-border-subtle, #DCD6CD)',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-primary, #19201C)',
                  backgroundColor: 'var(--color-canvas, #F9F6F0)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary, #19201C)', marginBottom: '6px' }}>
                Primary Crop Type
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--color-border-subtle, #DCD6CD)',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-primary, #19201C)',
                  backgroundColor: 'var(--color-canvas, #F9F6F0)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Maize">Maize (Corn)</option>
                <option value="Tomatoes">Tomatoes</option>
                <option value="Beans">Beans</option>
                <option value="Cassava">Cassava</option>
                <option value="Potatoes">Potatoes</option>
                <option value="Coffee">Coffee</option>
                <option value="Tea">Tea</option>
                <option value="Other">Other / Multicrop</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary, #19201C)', marginBottom: '6px' }}>
              Location / Sector <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. North Field, Section 1"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--color-border-subtle, #DCD6CD)',
                fontSize: '0.875rem',
                color: 'var(--color-text-primary, #19201C)',
                backgroundColor: 'var(--color-canvas, #F9F6F0)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: farms.length > 0 ? '1fr 1fr' : '1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary, #19201C)', marginBottom: '6px' }}>
                Growth Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--color-border-subtle, #DCD6CD)',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-primary, #19201C)',
                  backgroundColor: 'var(--color-canvas, #F9F6F0)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Planting">Planting</option>
                <option value="Vegetative growth">Vegetative growth</option>
                <option value="Flowering">Flowering</option>
                <option value="Maturing">Maturing</option>
                <option value="Harvested">Harvested</option>
                <option value="Fallow">Fallow / Resting</option>
              </select>
            </div>

            {farms.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary, #19201C)', marginBottom: '6px' }}>
                  Assigned Farm
                </label>
                <select
                  value={farmId}
                  onChange={(e) => setFarmId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: '1px solid var(--color-border-subtle, #DCD6CD)',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-primary, #19201C)',
                    backgroundColor: 'var(--color-canvas, #F9F6F0)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name} {farm.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border-subtle, #DCD6CD)',
                color: 'var(--color-text-secondary, #43534B)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'var(--color-brand-primary, #164230)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-btn-primary, 0 4px 12px rgba(22, 66, 48, 0.25))'
              }}
            >
              <IconCheck size={16} />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Plot Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
