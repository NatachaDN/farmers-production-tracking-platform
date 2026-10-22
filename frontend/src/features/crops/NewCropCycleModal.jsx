import React, { useState, useEffect } from 'react';
import { cropCycleService } from './services/cropCycleService';
import { plotService } from '../farms/services/plotService';
import {
  IconClose,
  IconSprout,
  IconTomato,
  IconBean,
  IconLeaf,
  IconWarning,
  IconWheat
} from '../../shared/components/Icons';

const COMMON_CROPS = [
  { name: 'Maize', icon: IconSprout },
  { name: 'Tomatoes', icon: IconTomato },
  { name: 'Beans', icon: IconBean },
  { name: 'Cassava', icon: IconLeaf },
  { name: 'Potatoes', icon: IconSprout },
  { name: 'Rice', icon: IconWheat },
  { name: 'Coffee', icon: IconLeaf },
  { name: 'Other', icon: IconSprout }
];

export function NewCropCycleModal({ isOpen, onClose, onCycleCreated, farmerId = 1 }) {
  const [plots, setPlots] = useState([]);
  const [loadingPlots, setLoadingPlots] = useState(false);

  const [selectedPlotId, setSelectedPlotId] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('Maize');
  const [customCropName, setCustomCropName] = useState('');
  const [cycleName, setCycleName] = useState('');
  const [plantingDate, setPlantingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [plannedHarvestDate, setPlannedHarvestDate] = useState('');
  const [expectedQuantity, setExpectedQuantity] = useState('');
  const [expectedQuantityUnit, setExpectedQuantityUnit] = useState('kg');
  const [acreage, setAcreage] = useState('');

  // Conflict warning state
  const [conflictWarning, setConflictWarning] = useState(null);
  const [allowConflict, setAllowConflict] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Load farmer plots when modal opens
  useEffect(() => {
    if (isOpen && farmerId) {
      loadPlots();
    }
  }, [isOpen, farmerId]);

  const loadPlots = async () => {
    setLoadingPlots(true);
    try {
      const data = await plotService.getPlots(farmerId);
      setPlots(data || []);
      if (data && data.length > 0 && !selectedPlotId) {
        handlePlotChange(data[0].id, data);
      }
    } catch (err) {
      console.error('Failed to load plots for cycle creation:', err);
    } finally {
      setLoadingPlots(false);
    }
  };

  const handlePlotChange = async (plotId, plotsList = plots) => {
    const numId = Number(plotId);
    setSelectedPlotId(numId);
    setConflictWarning(null);
    setAllowConflict(false);

    const foundPlot = plotsList.find(p => p.id === numId);
    if (foundPlot && foundPlot.area) {
      setAcreage(foundPlot.area);
    }

    // Check plot conflict in real-time
    if (numId) {
      try {
        const check = await cropCycleService.checkPlotAvailability(farmerId, numId);
        if (check && check.hasConflict) {
          setConflictWarning(check);
        } else {
          setConflictWarning(null);
        }
      } catch (err) {
        console.warn('Could not check plot availability:', err);
      }
    }
  };

  const effectiveCropName = selectedCrop === 'Other' ? customCropName : selectedCrop;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedPlotId) {
      setErrorMsg('Please select a plot for this production cycle.');
      return;
    }
    if (!effectiveCropName || effectiveCropName.trim() === '') {
      setErrorMsg('Please enter or select a crop name.');
      return;
    }
    if (!plantingDate) {
      setErrorMsg('Please enter a planting date.');
      return;
    }

    if (conflictWarning && conflictWarning.hasConflict && !allowConflict) {
      setErrorMsg('Please acknowledge the plot occupancy conflict or choose another plot.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        plotId: Number(selectedPlotId),
        cropName: effectiveCropName.trim(),
        name: cycleName.trim() || undefined,
        plantingDate,
        plannedHarvestDate: plannedHarvestDate || undefined,
        expectedQuantity: expectedQuantity ? parseFloat(expectedQuantity) : undefined,
        expectedQuantityUnit,
        acreage: acreage ? parseFloat(acreage) : undefined,
        allowConflict
      };

      const created = await cropCycleService.createCycle(farmerId, payload);
      if (onCycleCreated) {
        onCycleCreated(created);
      }
      onClose();
    } catch (err) {
      console.error('Error creating crop cycle:', err);
      if (err.status === 409 || (err.message && err.message.toLowerCase().includes('conflict'))) {
        setConflictWarning({
          hasConflict: true,
          message: err.message || 'This plot already has an active cycle.'
        });
        setErrorMsg(err.message || 'Plot is already occupied by an active cycle.');
      } else {
        setErrorMsg(err.message || 'Failed to create production cycle. Please check your inputs.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(19, 32, 28, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 20px 40px rgba(22, 66, 48, 0.15)',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid var(--color-card-border)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: 0
            }}>
              New Crop Production Cycle
            </h2>
            <p style={{
              fontSize: '0.8125rem',
              color: 'var(--color-text-muted)',
              marginTop: '4px',
              margin: 0
            }}>
              Plan and follow your upcoming crop cycle from planting to harvest.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-muted)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer'
            }}
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {errorMsg && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-md)',
              color: '#991B1B',
              fontSize: '0.875rem'
            }}>
              {errorMsg}
            </div>
          )}

          {/* Plot Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Select Plot *
            </label>
            {loadingPlots ? (
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Loading plots...</div>
            ) : plots.length === 0 ? (
              <div style={{
                padding: '12px',
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                color: '#92400E'
              }}>
                No plots found. Please register a plot in Farms & Plots first.
              </div>
            ) : (
              <select
                value={selectedPlotId}
                onChange={(e) => handlePlotChange(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-input)',
                  fontSize: '0.9375rem',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-primary)'
                }}
              >
                {plots.map((plot) => (
                  <option key={plot.id} value={plot.id}>
                    {plot.name} ({plot.area} ha) — {plot.location || 'Main Farm'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Conflict Warning Banner */}
          {conflictWarning && conflictWarning.hasConflict && (
            <div style={{
              padding: '14px 16px',
              backgroundColor: 'var(--color-accent-amber-bg)',
              border: '1px solid #FCD34D',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                  <IconWarning size={18} color="#D97706" />
                </span>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#92400E' }}>
                    Plot Occupancy Conflict Warning
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#78350F', marginTop: '2px' }}>
                    {conflictWarning.message}
                  </div>
                </div>
              </div>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '4px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#92400E',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={allowConflict}
                  onChange={(e) => setAllowConflict(e.target.checked)}
                  style={{ accentColor: '#D97706' }}
                />
                <span>I understand and want to create this cycle on this plot anyway</span>
              </label>
            </div>
          )}

          {/* Crop Selector Chips */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Select Crop *
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              marginBottom: selectedCrop === 'Other' ? '12px' : '0'
            }}>
              {COMMON_CROPS.map((crop) => {
                const isSelected = selectedCrop === crop.name;
                const CropIcon = crop.icon;
                return (
                  <button
                    key={crop.name}
                    type="button"
                    onClick={() => setSelectedCrop(crop.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      fontWeight: isSelected ? 700 : 500,
                      backgroundColor: isSelected ? 'var(--color-brand-tint)' : '#F9F6F0',
                      color: isSelected ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                      border: isSelected ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--color-border-subtle)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <CropIcon size={16} color="currentColor" />
                    <span>{crop.name}</span>
                  </button>
                );
              })}
            </div>

            {selectedCrop === 'Other' && (
              <input
                type="text"
                placeholder="Enter custom crop name (e.g. Sorghum, Carrots)"
                value={customCropName}
                onChange={(e) => setCustomCropName(e.target.value)}
                required={selectedCrop === 'Other'}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-input)',
                  fontSize: '0.9375rem',
                  boxSizing: 'border-box'
                }}
              />
            )}
          </div>

          {/* Planting Date & Planned Harvest Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                Planting Date *
              </label>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-input)',
                  fontSize: '0.9375rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                Planned Harvest Date
              </label>
              <input
                type="date"
                value={plannedHarvestDate}
                onChange={(e) => setPlannedHarvestDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-input)',
                  fontSize: '0.9375rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Expected Quantity & Unit (for later harvest comparison) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Expected Target Production (Stored for Harvest Comparison)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g. 5000"
                value={expectedQuantity}
                onChange={(e) => setExpectedQuantity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-input)',
                  fontSize: '0.9375rem',
                  boxSizing: 'border-box'
                }}
              />
              <select
                value={expectedQuantityUnit}
                onChange={(e) => setExpectedQuantityUnit(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-input)',
                  fontSize: '0.9375rem',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value="kg">kg</option>
                <option value="tons">tons (t)</option>
                <option value="bags">bags</option>
                <option value="crates">crates</option>
              </select>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
              This target will be stored to compare against actual harvest results at season end.
            </span>
          </div>

          {/* Acreage & Optional Custom Cycle Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                Area (ha)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g. 2.5"
                value={acreage}
                onChange={(e) => setAcreage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-input)',
                  fontSize: '0.9375rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                Cycle Name (Optional)
              </label>
              <input
                type="text"
                placeholder={`${effectiveCropName || 'Crop'} — Plot`}
                value={cycleName}
                onChange={(e) => setCycleName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-input)',
                  fontSize: '0.9375rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div style={{
            marginTop: '12px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid var(--color-border-subtle)',
            paddingTop: '20px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || plots.length === 0}
              style={{
                padding: '10px 22px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-brand-primary)',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: submitting || plots.length === 0 ? 'not-allowed' : 'pointer',
                opacity: submitting || plots.length === 0 ? 0.7 : 1,
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              {submitting ? 'Creating Cycle...' : 'Create Production Cycle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
