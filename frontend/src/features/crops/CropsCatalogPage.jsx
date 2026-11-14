import React, { useState, useEffect, useMemo } from 'react';
import { cropService } from './services/cropService';
import { ConfirmModal } from '../../shared/components/ConfirmModal';
import {
  IconSprout,
  IconPlus,
  IconTrash,
  IconTomato,
  IconBean,
  IconLeaf,
  IconWheat,
  IconCheck,
  IconArrowLeft,
  IconSearch,
  IconCamera,
  IconClose,
  IconPencil,
  IconDroplets,
  IconCalendar,
  IconPin
} from '../../shared/components/Icons';

const BACKEND_ORIGIN = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8080/api/v1'
).replace(/\/api\/v1\/?$/, '');

function resolveImageUrl(url) {
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

const CROP_CATEGORIES = [
  'Cereals',
  'Legumes',
  'Vegetables',
  'Roots & Tubers',
  'Fruits',
  'Cash Crops',
  'Other'
];

const WATER_LEVELS = ['Low', 'Moderate', 'High'];
const YIELD_UNITS = ['kg/ha', 't/ha', 'bags/ha'];

const POPULAR_TEMPLATES = [
  {
    name: 'Maize',
    variety: 'Hybrid 614',
    category: 'Cereals',
    growthDurationDays: 120,
    expectedYieldPerHectare: 4500,
    yieldUnit: 'kg/ha',
    plantingSeason: 'Long Rains (Mar–May)',
    waterRequirement: 'Moderate',
    soilPreference: 'Well-drained fertile loamy soil, pH 5.8–7.0',
    description: 'High-yielding highland maize variety suited for medium to high altitude zones with good rainfall distribution.'
  },
  {
    name: 'Tomatoes',
    variety: 'Anna F1',
    category: 'Vegetables',
    growthDurationDays: 75,
    expectedYieldPerHectare: 35,
    yieldUnit: 't/ha',
    plantingSeason: 'Year-round (with irrigation)',
    waterRequirement: 'High',
    soilPreference: 'Deep, well-drained sandy loam, pH 6.0–6.8',
    description: 'Determinate/semi-indeterminate hybrid tomato with firm fruits, good shelf life, and strong disease tolerance.'
  },
  {
    name: 'Beans',
    variety: 'Rosecoco (GLP-2)',
    category: 'Legumes',
    growthDurationDays: 90,
    expectedYieldPerHectare: 1800,
    yieldUnit: 'kg/ha',
    plantingSeason: 'Long & Short Rains',
    waterRequirement: 'Moderate',
    soilPreference: 'Well-drained loamy soil, pH 6.0–7.5',
    description: 'Popular bush bean variety with mottled red-cream seeds, fast cooking time, and strong market demand.'
  },
  {
    name: 'Potatoes',
    variety: 'Shangi',
    category: 'Roots & Tubers',
    growthDurationDays: 95,
    expectedYieldPerHectare: 25,
    yieldUnit: 't/ha',
    plantingSeason: 'Cool highland seasons',
    waterRequirement: 'Moderate',
    soilPreference: 'Loose, well-aerated loamy soil, pH 5.5–6.5',
    description: 'Fast-maturing ware potato variety with short dormancy and high culinary versatility.'
  },
  {
    name: 'Cassava',
    variety: 'Migyera',
    category: 'Roots & Tubers',
    growthDurationDays: 270,
    expectedYieldPerHectare: 22,
    yieldUnit: 't/ha',
    plantingSeason: 'Onset of rains',
    waterRequirement: 'Low',
    soilPreference: 'Light sandy loam, tolerates poorer soils',
    description: 'Drought-tolerant cassava cultivar with strong resistance to cassava mosaic disease.'
  },
  {
    name: 'Rice',
    variety: 'Basmati 370',
    category: 'Cereals',
    growthDurationDays: 135,
    expectedYieldPerHectare: 4000,
    yieldUnit: 'kg/ha',
    plantingSeason: 'Irrigated / Wet season',
    waterRequirement: 'High',
    soilPreference: 'Clayey or silty loam with good water retention',
    description: 'Aromatic long-grain rice prized for its slender grains and fragrance.'
  },
  {
    name: 'Coffee',
    variety: 'Ruiru 11',
    category: 'Cash Crops',
    growthDurationDays: 365,
    expectedYieldPerHectare: 2000,
    yieldUnit: 'kg/ha',
    plantingSeason: 'Rainy season transplanting',
    waterRequirement: 'Moderate',
    soilPreference: 'Deep, fertile volcanic loam, pH 5.5–6.5',
    description: 'Compact Arabica cultivar resistant to Coffee Berry Disease and Coffee Leaf Rust.'
  }
];

function getCropIcon(cropName, size = 20) {
  const name = (cropName || '').toLowerCase();
  if (name.includes('tomato')) return <IconTomato size={size} color="#2D7A52" />;
  if (name.includes('bean')) return <IconBean size={size} color="#2D7A52" />;
  if (name.includes('cassava') || name.includes('leaf') || name.includes('potato')) {
    return <IconLeaf size={size} color="#2D7A52" />;
  }
  if (name.includes('rice') || name.includes('wheat')) return <IconWheat size={size} color="#2D7A52" />;
  return <IconSprout size={size} color="#2D7A52" />;
}

const EMPTY_FORM = {
  name: '',
  variety: '',
  category: '',
  description: '',
  growthDurationDays: '',
  expectedYieldPerHectare: '',
  yieldUnit: 'kg/ha',
  plantingSeason: '',
  waterRequirement: '',
  soilPreference: '',
  imageUrls: []
};

function cropToForm(crop) {
  return {
    name: crop.name || '',
    variety: crop.variety || '',
    category: crop.category || '',
    description: crop.description || '',
    growthDurationDays: crop.growthDurationDays != null ? String(crop.growthDurationDays) : '',
    expectedYieldPerHectare: crop.expectedYieldPerHectare != null ? String(crop.expectedYieldPerHectare) : '',
    yieldUnit: crop.yieldUnit || 'kg/ha',
    plantingSeason: crop.plantingSeason || '',
    waterRequirement: crop.waterRequirement || '',
    soilPreference: crop.soilPreference || '',
    imageUrls: Array.isArray(crop.imageUrls) ? [...crop.imageUrls] : []
  };
}

export function CropsCatalogPage({ farmerId = 1, onNavigate }) {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Page mode: 'list' | 'detail' | 'form'
  const [mode, setMode] = useState('list');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Form state
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete confirmation modal
  const [cropToDelete, setCropToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    loadCrops();
  }, [farmerId]);

  const loadCrops = async () => {
    setLoading(true);
    try {
      const data = await cropService.getCrops(farmerId);
      setCrops(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load crops:', err);
      showToast(err.message || 'Failed to load crops catalog.', true);
    } finally {
      setLoading(false);
    }
  };

  const categoriesInCatalog = useMemo(() => {
    const used = new Set(crops.map((c) => c.category).filter(Boolean));
    return ['All', ...CROP_CATEGORIES.filter((cat) => used.has(cat))];
  }, [crops]);

  const filteredCrops = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return crops.filter((crop) => {
      const matchesCategory = selectedCategory === 'All' || crop.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        (crop.name || '').toLowerCase().includes(q) ||
        (crop.variety || '').toLowerCase().includes(q) ||
        (crop.category || '').toLowerCase().includes(q) ||
        (crop.description || '').toLowerCase().includes(q)
      );
    });
  }, [crops, searchQuery, selectedCategory]);

  const openCreateForm = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setImageUrlInput('');
    setFormError(null);
    setMode('form');
  };

  const openEditForm = (crop) => {
    setEditingId(crop.id);
    setFormData(cropToForm(crop));
    setImageUrlInput('');
    setFormError(null);
    setMode('form');
  };

  const openDetailView = (crop) => {
    setSelectedCrop(crop);
    setActivePhotoIndex(0);
    setMode('detail');
  };

  const applyTemplate = (tpl) => {
    setFormData((prev) => ({
      ...prev,
      name: tpl.name,
      variety: tpl.variety,
      category: tpl.category,
      growthDurationDays: String(tpl.growthDurationDays),
      expectedYieldPerHectare: String(tpl.expectedYieldPerHectare),
      yieldUnit: tpl.yieldUnit,
      plantingSeason: tpl.plantingSeason,
      waterRequirement: tpl.waterRequirement,
      soilPreference: tpl.soilPreference,
      description: tpl.description
    }));
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingPhoto(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        try {
          const res = await cropService.uploadCropPhoto(file);
          if (res?.url) {
            uploadedUrls.push(res.url);
          }
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
        setFormData((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...uploadedUrls]
        }));
      }
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    setFormData((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, trimmed]
    }));
    setImageUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name.trim()) {
      setFormError('Crop name is required.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      variety: formData.variety.trim() || undefined,
      category: formData.category || undefined,
      description: formData.description.trim() || undefined,
      growthDurationDays: formData.growthDurationDays ? Number(formData.growthDurationDays) : undefined,
      expectedYieldPerHectare: formData.expectedYieldPerHectare ? Number(formData.expectedYieldPerHectare) : undefined,
      yieldUnit: formData.expectedYieldPerHectare ? formData.yieldUnit || 'kg/ha' : undefined,
      plantingSeason: formData.plantingSeason.trim() || undefined,
      waterRequirement: formData.waterRequirement || undefined,
      soilPreference: formData.soilPreference.trim() || undefined,
      imageUrls: formData.imageUrls
    };

    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await cropService.updateCrop(farmerId, editingId, payload);
        setCrops((prev) =>
          prev.map((c) => (c.id === editingId ? updated : c)).sort((a, b) => a.name.localeCompare(b.name))
        );
        setSelectedCrop(updated);
        setActivePhotoIndex(0);
        setMode('detail');
        showToast(`"${updated.displayName || updated.name}" updated.`);
      } else {
        const created = await cropService.createCrop(farmerId, payload);
        setCrops((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        setSelectedCrop(created);
        setActivePhotoIndex(0);
        setMode('detail');
        showToast(`"${created.displayName || created.name}" added to your catalog.`);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save crop. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteCrop = async () => {
    if (!cropToDelete) return;
    setDeleting(true);
    try {
      await cropService.deleteCrop(farmerId, cropToDelete.id);
      setCrops((prev) => prev.filter((c) => c.id !== cropToDelete.id));
      showToast(`"${cropToDelete.displayName || cropToDelete.name}" removed from catalog.`);
      if (selectedCrop?.id === cropToDelete.id) {
        setSelectedCrop(null);
        setMode('list');
      }
      setCropToDelete(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete crop.', true);
    } finally {
      setDeleting(false);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1400,
          backgroundColor: toast.isError ? '#991B1B' : '#164230',
          color: '#FFFFFF',
          padding: '12px 18px',
          borderRadius: '12px',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: '0 10px 28px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <IconCheck size={15} color={toast.isError ? '#FECACA' : '#C8E2D0'} />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODE 1: CATALOG LIST VIEW                                         */}
      {/* ================================================================= */}
      {mode === 'list' && (
        <>
          {/* Top Navigation & Actions Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('crops')}
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
              <span>Back to Crop Production</span>
            </button>

            <button
              type="button"
              onClick={openCreateForm}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--color-brand-primary)',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <IconPlus size={16} color="#FFFFFF" />
              <span>Add New Crop</span>
            </button>
          </div>

          {/* Search & Category Filter Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--color-card-border)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '460px' }}>
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  pointerEvents: 'none'
                }}>
                  <IconSearch size={16} color="var(--color-text-muted)" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search crops, varieties, or descriptions..."
                  style={{ ...inputStyle, paddingLeft: '36px' }}
                />
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                {filteredCrops.length} {filteredCrops.length === 1 ? 'crop' : 'crops'} in catalog
              </div>
            </div>

            {categoriesInCatalog.length > 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categoriesInCatalog.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '999px',
                        fontSize: '0.8125rem',
                        fontWeight: active ? 600 : 500,
                        border: active ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-card-border)',
                        backgroundColor: active ? 'var(--color-brand-tint)' : '#FAF8F5',
                        color: active ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Crop Cards Grid */}
          {loading ? (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid var(--color-card-border)',
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--color-text-muted)'
            }}>
              Loading your crops catalog...
            </div>
          ) : filteredCrops.length === 0 ? (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid var(--color-card-border)',
              padding: '48px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'var(--color-brand-tint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IconSprout size={28} color="var(--color-brand-primary)" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {crops.length === 0 ? 'No crops in your catalog yet' : 'No matching crops found'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-text-muted)', maxWidth: '420px' }}>
                {crops.length === 0
                  ? 'Register the crops and varieties you grow with photos and agronomic details to reuse them across production cycles.'
                  : 'Try clearing your search or selecting another category.'}
              </p>
              {crops.length === 0 && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  style={{
                    marginTop: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: 'var(--color-brand-primary)',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <IconPlus size={16} color="#FFFFFF" />
                  <span>Add your first crop</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 310px), 1fr))',
              gap: '18px'
            }}>
              {filteredCrops.map((crop) => {
                const coverUrl = resolveImageUrl(crop.imageUrls?.[0]);
                const extraPhotos = (crop.imageUrls?.length || 0) - 1;
                return (
                  <div
                    key={crop.id}
                    onClick={() => openDetailView(crop)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid var(--color-card-border)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-subtle)',
                      transition: 'transform 160ms ease, box-shadow 160ms ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'var(--shadow-subtle)';
                    }}
                  >
                    {/* Cover Photo or Botanical Banner */}
                    <div style={{
                      height: '164px',
                      backgroundColor: '#F4EFE6',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderBottom: '1px solid var(--color-card-border)'
                    }}>
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={crop.displayName || crop.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          color: 'var(--color-text-muted)'
                        }}>
                          <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '14px',
                            backgroundColor: '#EAF4ED',
                            border: '1px solid #C8E2D0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {getCropIcon(crop.name, 26)}
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>No photo added</span>
                        </div>
                      )}

                      {crop.category && (
                        <span style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: 'rgba(255, 255, 255, 0.94)',
                          color: '#164230',
                          border: '1px solid #ECE7DC'
                        }}>
                          {crop.category}
                        </span>
                      )}

                      {extraPhotos > 0 && (
                        <span style={{
                          position: 'absolute',
                          bottom: '10px',
                          right: '10px',
                          padding: '3px 9px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: 'rgba(25, 32, 28, 0.78)',
                          color: '#FFFFFF'
                        }}>
                          +{extraPhotos} {extraPhotos === 1 ? 'photo' : 'photos'}
                        </span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{
                            margin: 0,
                            fontSize: '1.0625rem',
                            fontWeight: 700,
                            color: 'var(--color-text-primary)'
                          }}>
                            {crop.name}
                          </h3>
                          {crop.variety && (
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#2A6740',
                              backgroundColor: '#EAF4ED',
                              border: '1px solid #CDE2D4',
                              padding: '2px 8px',
                              borderRadius: '999px'
                            }}>
                              {crop.variety}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description preview */}
                      <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                        color: crop.description ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '2.6em'
                      }}>
                        {crop.description || 'No description added yet. Open details to record growing notes and specs.'}
                      </p>

                      {/* Agronomic Chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {crop.growthDurationDays && (
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            padding: '4px 9px',
                            borderRadius: '8px',
                            backgroundColor: '#F4EFE6',
                            color: 'var(--color-text-secondary)'
                          }}>
                            {crop.growthDurationDays} days cycle
                          </span>
                        )}
                        {crop.expectedYieldPerHectare != null && (
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            padding: '4px 9px',
                            borderRadius: '8px',
                            backgroundColor: '#F4EFE6',
                            color: 'var(--color-text-secondary)'
                          }}>
                            {crop.expectedYieldPerHectare} {crop.yieldUnit || 'kg/ha'}
                          </span>
                        )}
                        {crop.waterRequirement && (
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            padding: '4px 9px',
                            borderRadius: '8px',
                            backgroundColor: '#E6F6F4',
                            color: '#0D9488'
                          }}>
                            Water: {crop.waterRequirement}
                          </span>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div
                        style={{
                          marginTop: 'auto',
                          paddingTop: '12px',
                          borderTop: '1px solid var(--color-card-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => openDetailView(crop)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--color-brand-primary)',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '4px 0'
                          }}
                        >
                          View details →
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => openEditForm(crop)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              border: '1px solid var(--color-border-input)',
                              backgroundColor: '#FFFFFF',
                              color: 'var(--color-text-primary)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <IconPencil size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            aria-label={`Delete ${crop.name}`}
                            onClick={() => setCropToDelete(crop)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '6px 8px',
                              borderRadius: '8px',
                              border: '1px solid #FECACA',
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              cursor: 'pointer'
                            }}
                          >
                            <IconTrash size={14} color="#DC2626" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ================================================================= */}
      {/* MODE 2: FULL CROP DETAILS VIEW                                    */}
      {/* ================================================================= */}
      {mode === 'detail' && selectedCrop && (
        <>
          {/* Top Action Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={() => setMode('list')}
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
              <span>Back to Crops Catalog</span>
            </button>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="button"
                onClick={() => openEditForm(selectedCrop)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
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
                <IconPencil size={15} />
                <span>Edit Crop</span>
              </button>

              <button
                type="button"
                onClick={() => setCropToDelete(selectedCrop)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  border: '1px solid #FECACA',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <IconTrash size={15} color="#DC2626" />
                <span>Delete</span>
              </button>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('create-crop-cycle')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: 'var(--color-brand-primary)',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <IconPlus size={15} color="#FFFFFF" />
                  <span>Start Production Cycle</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Detail Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--color-card-border)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            {/* Photo Gallery */}
            <div style={{ backgroundColor: '#F4EFE6', borderBottom: '1px solid var(--color-card-border)' }}>
              {selectedCrop.imageUrls?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px' }}>
                  <div style={{
                    width: '100%',
                    height: 'clamp(220px, 38vw, 380px)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#EAE4D8'
                  }}>
                    <img
                      src={resolveImageUrl(selectedCrop.imageUrls[activePhotoIndex] || selectedCrop.imageUrls[0])}
                      alt={selectedCrop.displayName || selectedCrop.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  {selectedCrop.imageUrls.length > 1 && (
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {selectedCrop.imageUrls.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActivePhotoIndex(idx)}
                          style={{
                            width: '72px',
                            height: '56px',
                            flexShrink: 0,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            padding: 0,
                            cursor: 'pointer',
                            border: idx === activePhotoIndex ? '2px solid var(--color-brand-primary)' : '1px solid #DFD8CA'
                          }}
                        >
                          <img
                            src={resolveImageUrl(url)}
                            alt={`${selectedCrop.name} ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  padding: '36px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    backgroundColor: '#EAF4ED',
                    border: '1px solid #C8E2D0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getCropIcon(selectedCrop.name, 28)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    No photos uploaded for this crop yet.
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditForm(selectedCrop)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border-input)',
                      backgroundColor: '#FFFFFF',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <IconCamera size={14} />
                    <span>Add Photos</span>
                  </button>
                </div>
              )}
            </div>

            {/* Crop Title, Description & Agronomic Specs */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {selectedCrop.name}
                </h2>
                {selectedCrop.variety && (
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#2A6740',
                    backgroundColor: '#EAF4ED',
                    border: '1px solid #CDE2D4',
                    padding: '4px 12px',
                    borderRadius: '999px'
                  }}>
                    {selectedCrop.variety}
                  </span>
                )}
                {selectedCrop.category && (
                  <span style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#3D4944',
                    backgroundColor: '#F4EFE6',
                    border: '1px solid #DFD9CE',
                    padding: '4px 12px',
                    borderRadius: '999px'
                  }}>
                    {selectedCrop.category}
                  </span>
                )}
              </div>

              {/* Description */}
              <div style={{
                padding: '18px',
                borderRadius: '12px',
                backgroundColor: '#FCFAF7',
                border: '1px solid var(--color-card-border)'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--color-text-muted)',
                  marginBottom: '8px'
                }}>
                  Description & Agronomic Notes
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '0.9375rem',
                  lineHeight: 1.65,
                  color: selectedCrop.description ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  whiteSpace: 'pre-line'
                }}>
                  {selectedCrop.description || 'No description provided yet. Click "Edit Crop" to add growing characteristics, spacing, or market notes.'}
                </p>
              </div>

              {/* Agronomic Specifications Grid */}
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  marginBottom: '12px'
                }}>
                  Agronomic Specifications
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                  gap: '12px'
                }}>
                  <SpecCard
                    icon={<IconCalendar size={16} color="var(--color-brand-primary)" />}
                    label="Growth Duration"
                    value={selectedCrop.growthDurationDays ? `${selectedCrop.growthDurationDays} days` : 'Not specified'}
                  />
                  <SpecCard
                    icon={<IconSprout size={16} color="var(--color-brand-primary)" />}
                    label="Expected Yield"
                    value={
                      selectedCrop.expectedYieldPerHectare != null
                        ? `${selectedCrop.expectedYieldPerHectare} ${selectedCrop.yieldUnit || 'kg/ha'}`
                        : 'Not specified'
                    }
                  />
                  <SpecCard
                    icon={<IconCalendar size={16} color="var(--color-brand-primary)" />}
                    label="Planting Season"
                    value={selectedCrop.plantingSeason || 'Not specified'}
                  />
                  <SpecCard
                    icon={<IconDroplets size={16} color="#0D9488" />}
                    label="Water Requirement"
                    value={selectedCrop.waterRequirement || 'Not specified'}
                  />
                  <SpecCard
                    icon={<IconPin size={16} color="#D97706" />}
                    label="Soil Preference"
                    value={selectedCrop.soilPreference || 'Not specified'}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================================================================= */}
      {/* MODE 3: ADD / EDIT FULL-PAGE FORM                                 */}
      {/* ================================================================= */}
      {mode === 'form' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setMode(editingId && selectedCrop ? 'detail' : 'list')}
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
              <span>{editingId ? 'Back to Crop Details' : 'Back to Crops Catalog'}</span>
            </button>
          </div>

          <form
            onSubmit={handleSaveForm}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid var(--color-card-border)',
              padding: 'clamp(18px, 3vw, 28px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
              boxShadow: 'var(--shadow-subtle)'
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {editingId ? 'Edit Crop Details' : 'Register New Crop'}
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Record complete crop details, pictures, and growing notes for your farm catalog.
              </p>
            </div>

            {formError && (
              <div style={{
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                {formError}
              </div>
            )}

            {/* Quick Templates (only when creating new crop) */}
            {!editingId && (
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  Quick-fill from common crops (optional)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {POPULAR_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.name}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '999px',
                        border: '1px solid var(--color-border-input)',
                        backgroundColor: formData.name === tpl.name ? 'var(--color-brand-tint)' : '#FAF8F5',
                        color: formData.name === tpl.name ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {tpl.name} ({tpl.variety})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Identity Fields */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: '16px'
            }}>
              <div>
                <label style={labelStyle}>Crop Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Maize, Tomatoes, Beans"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Variety / Cultivar</label>
                <input
                  type="text"
                  value={formData.variety}
                  onChange={(e) => setFormData((p) => ({ ...p, variety: e.target.value }))}
                  placeholder="e.g. Hybrid 614, Anna F1"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Select category...</option>
                  {CROP_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Photos Section */}
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
                    Crop Pictures
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Upload photos of seeds, leaves, or harvestable produce. First photo is used as cover.
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

              {/* Optional Image URL Input */}
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

              {formData.imageUrls.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {formData.imageUrls.map((url, idx) => (
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
                        src={resolveImageUrl(url)}
                        alt={`Crop preview ${idx + 1}`}
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

            {/* Description */}
            <div>
              <label style={labelStyle}>Description & Growing Notes</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe variety traits, disease resistance, spacing, harvest indicators, or market notes..."
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              />
            </div>

            {/* Agronomic Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: '16px'
            }}>
              <div>
                <label style={labelStyle}>Growth Duration (days)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.growthDurationDays}
                  onChange={(e) => setFormData((p) => ({ ...p, growthDurationDays: e.target.value }))}
                  placeholder="e.g. 120"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Expected Yield per Hectare</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.expectedYieldPerHectare}
                    onChange={(e) => setFormData((p) => ({ ...p, expectedYieldPerHectare: e.target.value }))}
                    placeholder="e.g. 4500"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <select
                    value={formData.yieldUnit}
                    onChange={(e) => setFormData((p) => ({ ...p, yieldUnit: e.target.value }))}
                    style={{ ...inputStyle, width: '100px' }}
                  >
                    {YIELD_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Planting Season</label>
                <input
                  type="text"
                  value={formData.plantingSeason}
                  onChange={(e) => setFormData((p) => ({ ...p, plantingSeason: e.target.value }))}
                  placeholder="e.g. Long Rains (Mar–May)"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Water Requirement</label>
                <select
                  value={formData.waterRequirement}
                  onChange={(e) => setFormData((p) => ({ ...p, waterRequirement: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Select water level...</option>
                  {WATER_LEVELS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Soil Preference</label>
                <input
                  type="text"
                  value={formData.soilPreference}
                  onChange={(e) => setFormData((p) => ({ ...p, soilPreference: e.target.value }))}
                  placeholder="e.g. Well-drained fertile loamy soil, pH 6.0–7.0"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Submit Actions */}
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
                onClick={() => setMode(editingId && selectedCrop ? 'detail' : 'list')}
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
                disabled={submitting}
                style={{
                  padding: '10px 22px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: 'var(--color-brand-primary)',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: submitting ? 'wait' : 'pointer',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Save Crop to Catalog'}
              </button>
            </div>
          </form>
        </>
      )}

      {/* Styled Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!cropToDelete}
        onClose={() => setCropToDelete(null)}
        onConfirm={confirmDeleteCrop}
        title="Remove Crop from Catalog"
        message={`Are you sure you want to remove "${cropToDelete?.displayName || cropToDelete?.name}" from your personal crops catalog?`}
        confirmText="Remove Crop"
        isDestructive={true}
        isLoading={deleting}
      />
    </div>
  );
}

function SpecCard({ icon, label, value }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: '12px',
      backgroundColor: '#FFFFFF',
      border: '1px solid var(--color-card-border)',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
        {icon}
        <span>{label}</span>
      </div>
      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        {value}
      </div>
    </div>
  );
}
