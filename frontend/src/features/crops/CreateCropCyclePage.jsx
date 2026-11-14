import React, { useState, useEffect } from 'react';
import { cropCycleService } from './services/cropCycleService';
import { cropService } from './services/cropService';
import { plotService } from '../farms/services/plotService';
import { AddCropModal } from './components/AddCropModal';
import {
  IconArrowLeft,
  IconCheck,
  IconPlus,
  IconSprout,
  IconWarning
} from '../../shared/components/Icons';
import { Skeleton } from '../../shared/components/Skeleton';

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--color-text-primary, #19201C)',
  marginBottom: '8px',
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 'var(--radius-md, 10px)',
  border: '1px solid var(--color-border-input, #D6CFC0)',
  fontSize: '0.9375rem',
  backgroundColor: '#FFFFFF',
  color: 'var(--color-text-primary, #19201C)',
  boxSizing: 'border-box',
};

export function CreateCropCyclePage({ farmerId = 1, onBack, onNavigate, onCycleCreated }) {
  const [plots, setPlots] = useState([]);
  const [loadingPlots, setLoadingPlots] = useState(false);

  const [crops, setCrops] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(false);
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState(false);

  const [selectedPlotId, setSelectedPlotId] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [customCropName, setCustomCropName] = useState('');
  const [cycleName, setCycleName] = useState('');
  const [plantingDate, setPlantingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [plannedHarvestDate, setPlannedHarvestDate] = useState('');
  const [expectedQuantity, setExpectedQuantity] = useState('');
  const [expectedQuantityUnit, setExpectedQuantityUnit] = useState('kg');
  const [acreage, setAcreage] = useState('');

  const [conflictWarning, setConflictWarning] = useState(null);
  const [allowConflict, setAllowConflict] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (farmerId) {
      loadPlots();
      loadCrops();
    }
  }, [farmerId]);

  const loadCrops = async () => {
    setLoadingCrops(true);
    try {
      const data = await cropService.getCrops(farmerId);
      const list = Array.isArray(data) ? data : [];
      setCrops(list);
      if (list.length > 0 && !selectedCrop) {
        setSelectedCrop(list[0].displayName || list[0].name);
      }
    } catch (err) {
      console.warn('Could not load crops from API:', err);
      setCrops([]);
    } finally {
      setLoadingCrops(false);
    }
  };

  const handleCropAdded = (newCrop) => {
    setCrops((prev) => {
      const exists = prev.some((c) => c.id === newCrop.id);
      return exists ? prev : [newCrop, ...prev];
    });
    setSelectedCrop(newCrop.displayName || newCrop.name);
  };

  const loadPlots = async () => {
    setLoadingPlots(true);
    try {
      const data = await plotService.getPlots(farmerId);
      const list = Array.isArray(data) ? data : [];
      setPlots(list);
      if (list.length > 0 && !selectedPlotId) {
        handlePlotChange(list[0].id, list);
      }
    } catch (err) {
      console.error('Failed to load plots for cycle creation:', err);
      setPlots([]);
    } finally {
      setLoadingPlots(false);
    }
  };

  const handlePlotChange = async (plotId, plotsList = plots) => {
    const numId = Number(plotId);
    setSelectedPlotId(numId);
    setConflictWarning(null);
    setAllowConflict(false);

    const foundPlot = plotsList.find((p) => p.id === numId);
    if (foundPlot && foundPlot.area) {
      setAcreage(String(foundPlot.area));
    }

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

  const effectiveCropName = selectedCrop === '__CUSTOM__' ? customCropName : selectedCrop;
  const selectedPlotObj = plots.find((p) => String(p.id) === String(selectedPlotId));

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
        allowConflict,
      };

      const created = await cropCycleService.createCycle(farmerId, payload);
      if (onCycleCreated) {
        onCycleCreated(created);
      } else if (onBack) {
        onBack();
      }
    } catch (err) {
      console.error('Error creating crop cycle:', err);
      if (err.status === 409 || (err.message && err.message.toLowerCase().includes('conflict'))) {
        setConflictWarning({
          hasConflict: true,
          message: err.message || 'This plot already has an active cycle.',
        });
        setErrorMsg(err.message || 'Plot is already occupied by an active cycle.');
      } else {
        setErrorMsg(err.message || 'Failed to create production cycle. Please check your inputs.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Back navigation */}
      <div>
        <button
          type="button"
          onClick={() => (onBack ? onBack() : onNavigate && onNavigate('crops'))}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '9999px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #ECE7DC',
            color: '#164230',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <IconArrowLeft size={16} />
          <span>Back to Crop Production</span>
        </button>
      </div>

      {/* Main Form Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-card-border, #ECE7DC)',
        borderRadius: 'var(--radius-xl, 20px)',
        padding: 'clamp(18px, 3vw, 32px)',
        boxShadow: 'var(--shadow-card, 0 4px 16px rgba(0,0,0,0.05))',
      }}>
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #F4EFE6' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            backgroundColor: '#EAF4ED',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <IconSprout size={22} color="#164230" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#19201C', margin: 0 }}>
              New Crop Production Cycle
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#788680', margin: '4px 0 0' }}>
              Plan and follow your upcoming crop cycle from planting to harvest.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {errorMsg && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-accent-red-bg, #FEF2F2)',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-md, 10px)',
              color: 'var(--color-accent-red, #DC2626)',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}>
              {errorMsg}
            </div>
          )}

          {/* Plot Selection */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Select Plot <span style={{ color: '#DC2626' }}>*</span>
              </label>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('create-plot')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    color: '#164230',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '2px 6px',
                  }}
                >
                  <IconPlus size={14} />
                  <span>Register New Plot</span>
                </button>
              )}
            </div>

            {loadingPlots ? (
              <Skeleton width="100%" height="44px" borderRadius="var(--radius-md)" />
            ) : plots.length === 0 ? (
              <div style={{
                padding: '14px 16px',
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: 'var(--radius-md, 10px)',
                fontSize: '0.875rem',
                color: '#92400E',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
              }}>
                <span>No plots found. Please register a plot in Farms &amp; Plots first.</span>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('create-plot')}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '9999px',
                      backgroundColor: '#164230',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    + Create Plot
                  </button>
                )}
              </div>
            ) : (
              <select
                value={selectedPlotId}
                onChange={(e) => handlePlotChange(e.target.value)}
                required
                style={inputStyle}
              >
                {plots.map((plot) => (
                  <option key={plot.id} value={plot.id}>
                    {plot.name} ({plot.area} ha) — {plot.location || plot.farmName || 'Main Farm'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Conflict Warning Banner */}
          {conflictWarning && conflictWarning.hasConflict && (
            <div style={{
              padding: '14px 16px',
              backgroundColor: 'var(--color-accent-amber-bg, #FFFBEB)',
              border: '1px solid #FCD34D',
              borderRadius: 'var(--radius-lg, 14px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
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
                cursor: 'pointer',
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

          {/* Crop Selector */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <label htmlFor="crop-selection-dropdown" style={{ ...labelStyle, marginBottom: 0 }}>
                Select Crop <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsAddCropModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-brand-primary, #164230)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '6px',
                }}
              >
                <IconPlus size={14} />
                <span>Add New Crop</span>
              </button>
            </div>

            {loadingCrops ? (
              <Skeleton width="100%" height="44px" borderRadius="var(--radius-md)" />
            ) : (
              <select
                id="crop-selection-dropdown"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                required
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="" disabled>-- Choose a crop from your catalog --</option>
                {crops.length === 0 && (
                  <option value="" disabled>No registered crops found — Click &apos;Add New Crop&apos; above</option>
                )}
                {crops.map((crop) => {
                  const label = crop.displayName || crop.name;
                  return (
                    <option key={crop.id} value={label}>
                      {label}
                    </option>
                  );
                })}
                <option value="__CUSTOM__">+ Other / Enter custom crop...</option>
              </select>
            )}

            {selectedCrop === '__CUSTOM__' && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="text"
                  placeholder="Crop name (e.g. Macabo, Cassava, Maize)"
                  value={customCropName}
                  onChange={(e) => setCustomCropName(e.target.value)}
                  required={selectedCrop === '__CUSTOM__'}
                  style={inputStyle}
                />
              </div>
            )}
          </div>

          {/* Planting Date & Planned Harvest Date */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                Planting Date <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Planned Harvest Date</label>
              <input
                type="date"
                value={plannedHarvestDate}
                onChange={(e) => setPlannedHarvestDate(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Expected Quantity & Unit */}
          <div>
            <label style={labelStyle}>
              Expected Target Production (Stored for Harvest Comparison)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '12px' }}>
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g. 5000"
                value={expectedQuantity}
                onChange={(e) => setExpectedQuantity(e.target.value)}
                style={inputStyle}
              />
              <select
                value={expectedQuantityUnit}
                onChange={(e) => setExpectedQuantityUnit(e.target.value)}
                style={inputStyle}
              >
                <option value="kg">kg</option>
                <option value="tons">tons (t)</option>
                <option value="bags">bags</option>
                <option value="crates">crates</option>
              </select>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '6px' }}>
              This target will be stored to compare against actual harvest results at season end.
            </span>
          </div>

          {/* Area & Cycle Name */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Area (ha)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g. 2.5"
                value={acreage}
                onChange={(e) => setAcreage(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Cycle Name (Optional)</label>
              <input
                type="text"
                placeholder={
                  effectiveCropName && selectedPlotObj?.name
                    ? `${effectiveCropName} — ${selectedPlotObj.name}`
                    : 'e.g. Maize — North Parcel'
                }
                value={cycleName}
                onChange={(e) => setCycleName(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div style={{
            marginTop: '8px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid #F4EFE6',
            paddingTop: '20px',
            flexWrap: 'wrap',
          }}>
            <button
              type="button"
              onClick={() => (onBack ? onBack() : onNavigate && onNavigate('crops'))}
              style={{
                padding: '11px 20px',
                borderRadius: 'var(--radius-md, 10px)',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border-input, #D6CFC0)',
                color: 'var(--color-text-secondary, #4B5752)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || plots.length === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 24px',
                borderRadius: 'var(--radius-md, 10px)',
                backgroundColor: 'var(--color-brand-primary, #164230)',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: submitting || plots.length === 0 ? 'not-allowed' : 'pointer',
                opacity: submitting || plots.length === 0 ? 0.7 : 1,
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <IconCheck size={16} />
              <span>{submitting ? 'Creating Cycle...' : 'Create Production Cycle'}</span>
            </button>
          </div>
        </form>
      </div>

      {isAddCropModalOpen && (
        <AddCropModal
          isOpen={isAddCropModalOpen}
          onClose={() => setIsAddCropModalOpen(false)}
          onCropAdded={handleCropAdded}
          farmerId={farmerId}
        />
      )}
    </div>
  );
}

