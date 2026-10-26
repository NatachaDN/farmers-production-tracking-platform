import React, { useState, useEffect } from 'react';
import {
  IconFarms,
  IconCrop,
  IconCheck,
  IconAlertCircle,
  IconUser,
  IconMapPin,
  IconSprout
} from '../../shared/components/Icons';
import { authService } from '../auth/services/authService';

const PRESET_AVATARS = [
  { id: 'av1', label: 'Farmer Joyce', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80' },
  { id: 'av2', label: 'Farmer Peter', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' },
  { id: 'av3', label: 'Farmer Maria', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80' },
  { id: 'av4', label: 'Farmer David', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80' },
  { id: 'av5', label: 'Field Hat', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
  { id: 'av6', label: 'Agricultural Lead', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80' }
];

const SUGGESTED_CROPS = ['Maize', 'Tomatoes', 'Beans', 'Cassava', 'Potatoes', 'Onions', 'Coffee', 'Sorghum'];

export function FarmerProfileSettingsView({ user, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    farmName: user?.farmName || 'Green Acres Farm',
    cropsGrown: user?.cropsGrown || 'Maize, Tomatoes, Beans, Cassava',
    totalArea: user?.totalArea !== undefined && user?.totalArea !== null ? user.totalArea : 8.7,
    avatarUrl: user?.avatarUrl || '',
    location: user?.location || 'Nakuru County, Kenya',
    farmType: user?.farmType || 'MIXED'
  });

  const [initialData, setInitialData] = useState(formData);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);

  useEffect(() => {
    if (user) {
      const synced = {
        fullName: user.fullName || '',
        farmName: user.farmName || 'Green Acres Farm',
        cropsGrown: user.cropsGrown || 'Maize, Tomatoes, Beans, Cassava',
        totalArea: user.totalArea !== undefined && user.totalArea !== null ? user.totalArea : 8.7,
        avatarUrl: user.avatarUrl || '',
        location: user.location || 'Nakuru County, Kenya',
        farmType: user.farmType || 'MIXED'
      };
      setFormData(synced);
      setInitialData(synced);
    }
  }, [user]);

  const validateField = (name, value) => {
    if (name === 'totalArea') {
      const num = parseFloat(value);
      if (isNaN(num)) {
        return 'Total area must be a valid number';
      }
      if (num < 0) {
        return 'Total area cannot be negative';
      }
    }
    if (name === 'farmName' && (!value || !value.trim())) {
      return 'Farm name cannot be empty';
    }
    if (name === 'fullName' && (!value || !value.trim())) {
      return 'Full name cannot be empty';
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError('');
    setSuccessMessage('');

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSelectPresetAvatar = (presetUrl) => {
    setFormData((prev) => ({ ...prev, avatarUrl: presetUrl }));
    setSelectedPreset(presetUrl);
    setSuccessMessage('');
  };

  const handleAddCropSuggestion = (crop) => {
    const existing = formData.cropsGrown
      ? formData.cropsGrown.split(',').map((c) => c.trim()).filter(Boolean)
      : [];
    if (!existing.includes(crop)) {
      const updated = [...existing, crop].join(', ');
      setFormData((prev) => ({ ...prev, cropsGrown: updated }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    // Client-side validations
    const newErrors = {};
    const areaError = validateField('totalArea', formData.totalArea);
    if (areaError) newErrors.totalArea = areaError;

    const farmNameError = validateField('farmName', formData.farmName);
    if (farmNameError) newErrors.farmName = farmNameError;

    const fullNameError = validateField('fullName', formData.fullName);
    if (fullNameError) newErrors.fullName = fullNameError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        farmName: formData.farmName.trim(),
        cropsGrown: formData.cropsGrown.trim(),
        totalArea: parseFloat(formData.totalArea),
        avatarUrl: formData.avatarUrl ? formData.avatarUrl.trim() : null,
        location: formData.location.trim(),
        farmType: formData.farmType
      };

      const updatedUser = await authService.updateProfile(payload);
      setSuccessMessage('Profile updated successfully! All farm and production changes have been saved.');
      setInitialData(formData);
      if (onProfileUpdated) {
        onProfileUpdated(updatedUser);
      }
    } catch (err) {
      const msg = err.message || 'Failed to update profile. Please check the inputs.';
      setServerError(msg);
      if (err.data?.validationErrors) {
        setErrors(err.data.validationErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setErrors({});
    setServerError('');
    setSuccessMessage('');
  };

  const initials = formData.fullName
    ? formData.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'JM';

  return (
    <div className="fade-in" style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            Farm & Profile Settings
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Manage your personal farmer identity, holding details, crops grown and cultivated land area.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 'var(--radius-pill, 9999px)',
            backgroundColor: 'var(--color-brand-tint, #EAF4ED)',
            color: 'var(--color-brand-primary, #164230)',
            border: '1px solid #C8E2D0'
          }}>
            Authenticated Farmer
          </span>
        </div>
      </div>

      {/* Confirmation & Error Banners */}
      {successMessage && (
        <div
          id="profile-success-message"
          style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: 'var(--radius-md, 10px)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#065F46',
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <IconCheck size={14} color="#FFFFFF" />
          </div>
          <span style={{ flex: 1 }}>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage('')}
            style={{ background: 'none', border: 'none', color: '#065F46', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {serverError && (
        <div
          id="profile-error-message"
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md, 10px)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#991B1B',
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          <IconAlertCircle size={20} color="#DC2626" />
          <span style={{ flex: 1 }}>{serverError}</span>
          <button
            onClick={() => setServerError('')}
            style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Hero Profile Overview Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl, 16px)',
        border: '1px solid var(--color-card-border, #ECE7DC)',
        padding: '24px',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Avatar Preview */}
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            backgroundColor: '#E2EAE5',
            color: 'var(--color-sidebar-bg, #164230)',
            fontSize: '1.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: '3px solid #FFFFFF',
            boxShadow: '0 4px 14px rgba(22, 66, 48, 0.12)',
            position: 'relative'
          }}>
            {formData.avatarUrl ? (
              <img
                src={formData.avatarUrl}
                alt={formData.fullName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary, #19201C)', margin: 0 }}>
                {formData.fullName || 'Joyce Muthoni'}
              </h3>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: '#FEF3C7',
                color: '#92400E'
              }}>
                {formData.farmType} FARM
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #4B5752)', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconFarms size={15} color="var(--color-brand-primary, #164230)" />
              <strong style={{ color: 'var(--color-text-primary)' }}>{formData.farmName || 'Green Acres Farm'}</strong>
              <span style={{ color: 'var(--color-text-muted)' }}>· {formData.location || 'Nakuru County'}</span>
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              <span>Total Area: <strong style={{ color: 'var(--color-text-primary)' }}>{formData.totalArea} ha</strong></span>
              <span>•</span>
              <span>Crops: <strong style={{ color: 'var(--color-text-primary)' }}>{formData.cropsGrown || 'None listed'}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick stat chips */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{
            padding: '12px 18px',
            backgroundColor: '#F9F6F0',
            borderRadius: '12px',
            border: '1px solid #ECE7DC',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>REGISTERED AREA</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand-primary, #164230)' }}>
              {formData.totalArea} ha
            </div>
          </div>
        </div>
      </div>

      {/* Main Edit Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: Farm Holding Details */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl, 16px)',
          border: '1px solid var(--color-card-border, #ECE7DC)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--color-text-primary, #19201C)',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <IconFarms size={18} color="var(--color-brand-primary, #164230)" />
            <span>Farm Holding Information</span>
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {/* Farm Name */}
            <div>
              <label htmlFor="profile-farm-name" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Farm Name <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                id="profile-farm-name"
                name="farmName"
                type="text"
                value={formData.farmName}
                onChange={handleChange}
                placeholder="e.g. Green Acres Farm"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: errors.farmName ? '1.5px solid #DC2626' : '1px solid var(--color-border-input, #DFD8CA)',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-primary)'
                }}
              />
              {errors.farmName && (
                <p id="error-farm-name" style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '4px', margin: '4px 0 0 0' }}>
                  {errors.farmName}
                </p>
              )}
            </div>

            {/* Farm Location */}
            <div>
              <label htmlFor="profile-location" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Farm Location / Region
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="profile-location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Nakuru County, Kenya"
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 36px',
                    borderRadius: '10px',
                    border: '1px solid var(--color-border-input, #DFD8CA)',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--color-text-primary)'
                  }}
                />
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <IconMapPin size={16} color="var(--color-text-muted)" />
                </div>
              </div>
            </div>

            {/* Farm Type */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                Farming Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { id: 'CROP', label: 'Crop Production', desc: 'Grain, horticulture & field crops', icon: IconCrop },
                  { id: 'LIVESTOCK', label: 'Livestock / Animals', desc: 'Cattle, poultry, small stock', icon: IconFarms },
                  { id: 'MIXED', label: 'Mixed Farming', desc: 'Both crops and livestock groups', icon: IconSprout }
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.farmType === type.id;
                  return (
                    <div
                      key={type.id}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, farmType: type.id }));
                        setSuccessMessage('');
                      }}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid var(--color-brand-primary, #164230)' : '1px solid #ECE7DC',
                        backgroundColor: isSelected ? 'var(--color-brand-tint, #EAF4ED)' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Icon size={18} color={isSelected ? 'var(--color-brand-primary, #164230)' : 'var(--color-text-secondary)'} />
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: isSelected ? 'var(--color-brand-primary, #164230)' : 'var(--color-text-primary)' }}>
                            {type.label}
                          </span>
                        </div>
                        {isSelected && <IconCheck size={16} color="var(--color-brand-primary, #164230)" />}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{type.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Cultivation & Crops Grown */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl, 16px)',
          border: '1px solid var(--color-card-border, #ECE7DC)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--color-text-primary, #19201C)',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <IconCrop size={18} color="var(--color-brand-primary, #164230)" />
            <span>Crops Grown & Total Land Area</span>
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {/* Total Area */}
            <div>
              <label htmlFor="profile-total-area" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Total Farm / Cultivated Area (Hectares) <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="profile-total-area"
                  name="totalArea"
                  type="number"
                  step="0.01"
                  value={formData.totalArea}
                  onChange={handleChange}
                  placeholder="e.g. 8.7"
                  style={{
                    width: '100%',
                    padding: '10px 48px 10px 14px',
                    borderRadius: '10px',
                    border: errors.totalArea ? '1.5px solid #DC2626' : '1px solid var(--color-border-input, #DFD8CA)',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--color-text-primary)'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)'
                }}>
                  ha
                </span>
              </div>
              {errors.totalArea ? (
                <p id="error-total-area" style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '4px', margin: '4px 0 0 0', fontWeight: 500 }}>
                  {errors.totalArea}
                </p>
              ) : (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px', margin: '4px 0 0 0' }}>
                  Must be 0 or a positive number.
                </p>
              )}
            </div>

            {/* Crops Grown */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="profile-crops-grown" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Crops Grown (Comma-separated)
              </label>
              <input
                id="profile-crops-grown"
                name="cropsGrown"
                type="text"
                value={formData.cropsGrown}
                onChange={handleChange}
                placeholder="e.g. Maize, Tomatoes, Beans, Cassava"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border-input, #DFD8CA)',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-primary)'
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Quick add:</span>
                {SUGGESTED_CROPS.map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => handleAddCropSuggestion(crop)}
                    style={{
                      fontSize: '0.75rem',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill, 9999px)',
                      backgroundColor: '#F4EFE6',
                      border: '1px solid #ECE7DC',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 120ms ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-brand-tint, #EAF4ED)';
                      e.currentTarget.style.color = 'var(--color-brand-primary, #164230)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F4EFE6';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }}
                  >
                    + {crop}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Farmer Personal Profile & Photo */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl, 16px)',
          border: '1px solid var(--color-card-border, #ECE7DC)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--color-text-primary, #19201C)',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <IconUser size={18} color="var(--color-brand-primary, #164230)" />
            <span>Farmer Identity & Profile Photo</span>
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {/* Full Name */}
            <div>
              <label htmlFor="profile-full-name" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Full Name <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                id="profile-full-name"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Joyce Muthoni"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: errors.fullName ? '1.5px solid #DC2626' : '1px solid var(--color-border-input, #DFD8CA)',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-primary)'
                }}
              />
              {errors.fullName && (
                <p id="error-full-name" style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '4px', margin: '4px 0 0 0' }}>
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Photo / Avatar URL */}
            <div>
              <label htmlFor="profile-avatar-url" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Profile Photo / Avatar Image URL
              </label>
              <input
                id="profile-avatar-url"
                name="avatarUrl"
                type="text"
                value={formData.avatarUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border-input, #DFD8CA)',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>

            {/* Preset Avatars Selector */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                Or select an authentic farmer avatar portrait:
              </label>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                {PRESET_AVATARS.map((preset) => {
                  const isChosen = formData.avatarUrl === preset.url;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPresetAvatar(preset.url)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: isChosen ? '3px solid var(--color-brand-primary, #164230)' : '2px solid #ECE7DC',
                        boxShadow: isChosen ? '0 0 0 2px rgba(22, 66, 48, 0.25)' : 'none',
                        transition: 'all 150ms ease'
                      }}>
                        <img
                          src={preset.url}
                          alt={preset.label}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: isChosen ? 'var(--color-brand-primary, #164230)' : 'var(--color-text-muted)', fontWeight: isChosen ? 700 : 500 }}>
                        {preset.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', paddingBottom: '32px' }}>
          <button
            type="button"
            id="discard-profile-btn"
            onClick={handleReset}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: '1px solid var(--color-border-input, #DFD8CA)',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-text-secondary, #4B5752)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 150ms'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4EFE6')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
          >
            Reset
          </button>

          <button
            type="submit"
            id="save-profile-btn"
            disabled={isSubmitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              borderRadius: '10px',
              backgroundColor: isSubmitting ? '#9CA3AF' : 'var(--color-brand-primary, #3E7B52)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-subtle)',
              transition: 'background-color 150ms'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) e.currentTarget.style.backgroundColor = 'var(--color-brand-hover, #336844)';
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) e.currentTarget.style.backgroundColor = 'var(--color-brand-primary, #3E7B52)';
            }}
          >
            <IconCheck size={16} />
            <span>{isSubmitting ? 'Saving changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
