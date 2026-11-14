import React, { useEffect, useRef, useState } from 'react';
import { farmService } from './services/farmService';
import { plotService } from './services/plotService';
import { cropService } from '../crops/services/cropService';
import { CreateCropModal } from '../crops/components/CreateCropModal';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCamera,
  IconCheck,
  IconClose,
  IconFarms,
  IconMapPin,
  IconPlus,
  IconSprout
} from '../../shared/components/Icons';

const CROP_SUGGESTIONS = ['Maize', 'Tomatoes', 'Beans', 'Cassava', 'Plantain', 'Cocoa', 'Coffee'];
const STAGES = ['Planned', 'Planting', 'Vegetative growth', 'Flowering', 'Maturing', 'Harvesting'];
const SOIL_TYPES = ['', 'Loamy', 'Clay', 'Sandy', 'Volcanic', 'Alluvial', 'Silty'];
const IRRIGATION_TYPES = ['', 'Rain-fed', 'Drip irrigation', 'Sprinkler', 'Furrow', 'Manual watering'];
const SLOPES = ['', 'Flat', 'Gentle slope', 'Moderate slope', 'Steep / Terraced'];

const cardStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid var(--color-card-border, #ECE7DC)',
  borderRadius: 'var(--radius-xl, 16px)',
  padding: '28px',
  boxShadow: 'var(--shadow-card, 0 4px 16px rgba(0,0,0,0.05))',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'var(--color-text-primary, #19201C)',
  marginBottom: '6px',
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1px solid var(--color-border-input, #DFD8CA)',
  backgroundColor: '#FFFFFF',
  color: 'var(--color-text-primary, #19201C)',
  fontSize: '0.9375rem',
  outline: 'none',
  boxSizing: 'border-box',
};

export function CreatePlotPage({ farmerId, initialFarmId, onBack, onNavigate, onPlotCreated }) {
  const [farms, setFarms] = useState([]);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [farmId, setFarmId] = useState(initialFarmId ? String(initialFarmId) : '');
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [location, setLocation] = useState('');
  const [locationTouched, setLocationTouched] = useState(false);
  const [cropType, setCropType] = useState('Maize');
  const [stage, setStage] = useState('Planting');
  const [soilType, setSoilType] = useState('');
  const [irrigationType, setIrrigationType] = useState('');
  const [slope, setSlope] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [farmerCrops, setFarmerCrops] = useState([]);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  useEffect(() => {
    if (!farmerId) return;
    let mounted = true;
    cropService.getCrops(farmerId)
      .then((list) => {
        if (mounted && Array.isArray(list)) {
          setFarmerCrops(list);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [farmerId]);

  useEffect(() => {
    let mounted = true;
    async function loadFarms() {
      setLoadingFarms(true);
      try {
        const list = await farmService.getFarms();
        const safeList = Array.isArray(list) ? list : [];
        if (!mounted) return;
        setFarms(safeList);

        const target =
          (initialFarmId && safeList.find((f) => String(f.id) === String(initialFarmId))) ||
          safeList[0];

        if (target) {
          setFarmId(String(target.id));
          const defaultLoc = [target.district, target.region].filter(Boolean).join(', ');
          if (defaultLoc) setLocation(defaultLoc);
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Could not load your farms.');
      } finally {
        if (mounted) setLoadingFarms(false);
      }
    }
    loadFarms();
    return () => { mounted = false; };
  }, [initialFarmId]);

  const selectedFarm = farms.find((f) => String(f.id) === String(farmId));

  const handleFarmChange = (nextFarmId) => {
    setFarmId(nextFarmId);
    const nextFarm = farms.find((f) => String(f.id) === String(nextFarmId));
    if (nextFarm && !locationTouched) {
      const defaultLoc = [nextFarm.district, nextFarm.region].filter(Boolean).join(', ');
      if (defaultLoc) setLocation(defaultLoc);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError('');
    setUploadingPhoto(true);
    try {
      const uploaded = [];
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds the 5 MB limit.`);
        }
        const res = await plotService.uploadPlotPhoto(file);
        if (res?.url) uploaded.push(res.url);
      }
      if (uploaded.length > 0) {
        setImageUrls((prev) => [...prev, ...uploaded]);
      }
    } catch (err) {
      setError(err.message || 'Could not upload plot image.');
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!farmId) {
      setError('Please select the farm this plot belongs to.');
      return;
    }
    if (!name.trim()) {
      setError('Plot name is required.');
      return;
    }
    const numericArea = parseFloat(area);
    if (area === '' || isNaN(numericArea) || numericArea <= 0) {
      setError('Area must be a positive number greater than 0 (e.g., 2.5 ha).');
      return;
    }
    if (!location.trim()) {
      setError('Location or field sector is required.');
      return;
    }

    setSubmitting(true);
    try {
      const saved = await plotService.createPlot(farmerId, {
        farmId: Number(farmId),
        name: name.trim(),
        area: numericArea,
        location: location.trim(),
        cropType: cropType.trim() || 'Unspecified',
        stage: stage || 'Planned',
        soilType: soilType || null,
        irrigationType: irrigationType || null,
        slope: slope || null,
        notes: notes.trim() || null,
        imageUrls,
      });
      if (onPlotCreated) {
        onPlotCreated(saved);
      } else if (onNavigate) {
        onNavigate('plot-details', saved.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to create plot. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = onBack || (() => onNavigate && onNavigate(initialFarmId ? 'farm-details' : 'farms', initialFarmId));

  return (
    <div className="fade-in" style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <button
          type="button"
          onClick={goBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '9999px',
            backgroundColor: '#FFFFFF',
            color: '#164230',
            border: '1.5px solid #164230',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <IconArrowLeft size={16} />
          <span>{selectedFarm && initialFarmId ? `Back to ${selectedFarm.name}` : 'Back to Farms & Plots'}</span>
        </button>
      </div>

      {loadingFarms ? (
        <div style={cardStyle}>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Loading your farms…</p>
        </div>
      ) : farms.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 24px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#EAF4ED',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
            }}
          >
            <IconFarms size={26} color="#164230" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#164230', margin: '0 0 8px' }}>
            Create a farm first
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', maxWidth: '420px', margin: '0 auto 20px' }}>
            Every plot must belong to a farm. Register your farm first, then add plots inside it.
          </p>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('create-farm')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 22px',
              borderRadius: '9999px',
              backgroundColor: '#164230',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: 'pointer',
            }}
          >
            <IconPlus size={16} /> Create Farm
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#EAF4ED',
                  color: '#3E7B52',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSprout size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#19201C', margin: 0 }}>
                  Register a New Plot
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                  Assign this plot to a farm and enter its cultivated area, location, crop, and current stage.
                </p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#B91C1C',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  marginBottom: '18px',
                }}
              >
                <IconAlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Assigned Farm */}
              <div>
                <label htmlFor="plot-farm-id" style={labelStyle}>
                  Assigned Farm <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  id="plot-farm-id"
                  value={farmId}
                  onChange={(e) => handleFarmChange(e.target.value)}
                  required
                  style={inputStyle}
                >
                  <option value="" disabled>Select a farm…</option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({[f.district, f.region].filter(Boolean).join(', ') || 'Farm'} · {f.size || 0} ha)
                    </option>
                  ))}
                </select>
                {selectedFarm && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconMapPin size={13} />
                    <span>
                      This plot will be registered under <strong>{selectedFarm.name}</strong> ({selectedFarm.size || 0} ha total farm size).
                    </span>
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {/* Plot Name */}
                <div>
                  <label htmlFor="plot-name" style={labelStyle}>
                    Plot Name <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    id="plot-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Plot A — Maize or North Parcel"
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Cultivated Area */}
                <div>
                  <label htmlFor="plot-area" style={labelStyle}>
                    Cultivated Area (ha) <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    id="plot-area"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g., 2.5"
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Location / Sector */}
              <div>
                <label htmlFor="plot-location" style={labelStyle}>
                  Location / Field Sector <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  id="plot-location"
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocationTouched(true);
                    setLocation(e.target.value);
                  }}
                  placeholder="e.g., North Field, Section 1"
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {/* Primary Crop */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label htmlFor="plot-crop" style={{ ...labelStyle, marginBottom: 0 }}>
                      Primary Crop
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCropModalOpen(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        border: '1px solid #3E7B52',
                        backgroundColor: '#EAF4ED',
                        color: '#2A6740',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <IconPlus size={12} /> Add New Crop
                    </button>
                  </div>
                  <input
                    id="plot-crop"
                    type="text"
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    placeholder="e.g., Maize, Tomatoes, Plantain"
                    style={inputStyle}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {Array.from(new Set([
                      ...farmerCrops.map((c) => c.displayName || c.name).filter(Boolean),
                      ...CROP_SUGGESTIONS,
                    ])).map((crop) => {
                      const active = cropType.toLowerCase() === crop.toLowerCase();
                      return (
                        <button
                          key={crop}
                          type="button"
                          onClick={() => setCropType(crop)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            border: active ? '1px solid #3E7B52' : '1px solid #DFD8CA',
                            backgroundColor: active ? '#EAF4ED' : '#F9F6F0',
                            color: active ? '#2A6740' : '#4B5752',
                            cursor: 'pointer',
                          }}
                        >
                          {crop}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Growth Stage */}
                <div>
                  <label htmlFor="plot-stage" style={labelStyle}>
                    Current Growth Stage
                  </label>
                  <select
                    id="plot-stage"
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    style={inputStyle}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#19201C', margin: '0 0 4px' }}>
              Plot Photos &amp; Supplementary Details <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>(optional)</span>
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: '0 0 18px' }}>
              Add photos of the parcel and record soil, irrigation, terrain, or field notes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Plot Photos */}
              <div>
                <label style={labelStyle}>Plot Images</label>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1.5px dashed #3E7B52',
                    backgroundColor: '#F9F6F0',
                    color: '#164230',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                  }}
                >
                  <IconCamera size={16} />
                  <span>{uploadingPhoto ? 'Uploading photo…' : 'Upload Plot Photos'}</span>
                </button>

                {imageUrls.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px', marginTop: '12px' }}>
                    {imageUrls.map((url, idx) => (
                      <div key={`${url}-${idx}`} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #ECE7DC', aspectRatio: '4 / 3' }}>
                        <img src={url} alt={`Plot preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <button
                          type="button"
                          aria-label="Remove image"
                          onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== idx))}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: 'none',
                            backgroundColor: 'rgba(25, 32, 28, 0.75)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <IconClose size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px' }}>
                <div>
                  <label htmlFor="plot-soil" style={labelStyle}>Soil Type</label>
                  <select id="plot-soil" value={soilType} onChange={(e) => setSoilType(e.target.value)} style={inputStyle}>
                    {SOIL_TYPES.map((s) => (
                      <option key={s || 'none'} value={s}>{s || 'Select soil type…'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="plot-irrigation" style={labelStyle}>Irrigation Method</label>
                  <select id="plot-irrigation" value={irrigationType} onChange={(e) => setIrrigationType(e.target.value)} style={inputStyle}>
                    {IRRIGATION_TYPES.map((s) => (
                      <option key={s || 'none'} value={s}>{s || 'Select irrigation…'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="plot-slope" style={labelStyle}>Terrain / Slope</label>
                  <select id="plot-slope" value={slope} onChange={(e) => setSlope(e.target.value)} style={inputStyle}>
                    {SLOPES.map((s) => (
                      <option key={s || 'none'} value={s}>{s || 'Select slope…'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="plot-notes" style={labelStyle}>Supplementary Field Notes</label>
                <textarea
                  id="plot-notes"
                  rows={3}
                  maxLength={1000}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Good drainage, partial shade on west border, close to water well…"
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingBottom: '24px' }}>
            <button
              type="button"
              onClick={goBack}
              disabled={submitting}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: '1px solid var(--color-border-input, #DFD8CA)',
                backgroundColor: '#FFFFFF',
                color: 'var(--color-text-secondary, #4B5752)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: submitting ? '#A4B0AA' : '#3E7B52',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              <IconCheck size={16} />
              <span>{submitting ? 'Creating Plot…' : 'Create Plot'}</span>
            </button>
          </div>
        </form>
      )}

      <CreateCropModal
        farmerId={farmerId}
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onCreated={(created) => {
          setFarmerCrops((prev) => [created, ...prev]);
          setCropType(created.displayName || created.name || '');
          setIsCropModalOpen(false);
        }}
      />
    </div>
  );
}

export default CreatePlotPage;

