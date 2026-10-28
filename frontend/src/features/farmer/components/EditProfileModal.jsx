import React, { useState, useEffect, useRef } from 'react';
import {
  IconClose,
  IconCheck,
  IconAlertCircle,
  IconFarms,
  IconCrop,
  IconUser
} from '../../../shared/components/Icons';
import { authService } from '../../auth/services/authService';

export function EditProfileModal({ isOpen, onClose, user, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    fullName: '',
    farmName: '',
    cropsGrown: '',
    totalArea: '',
    avatarUrl: '',
    location: '',
    farmType: 'MIXED'
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        fullName: user.fullName || '',
        farmName: user.farmName || 'Green Acres Farm',
        cropsGrown: user.cropsGrown || 'Maize, Tomatoes, Beans, Cassava',
        totalArea: user.totalArea !== undefined && user.totalArea !== null ? user.totalArea : 8.7,
        avatarUrl: user.avatarUrl || '',
        location: user.location || 'Nakuru County, Kenya',
        farmType: user.farmType || 'MIXED'
      });
      setErrors({});
      setServerError('');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleDeviceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) { setUploadError('Only JPEG, PNG, WebP or GIF are supported.'); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError('Image must be smaller than 5 MB.'); return; }
    setUploadError('');
    setIsUploadingPhoto(true);
    try {
      const localPreview = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatarUrl: localPreview }));
      const url = await authService.uploadAvatar(file);
      if (url) setFormData((prev) => ({ ...prev, avatarUrl: url }));
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const validateArea = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return 'Total area must be a valid number';
    if (num < 0) return 'Total area cannot be negative';
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError('');
    if (name === 'totalArea') {
      const err = validateArea(value);
      setErrors((prev) => ({ ...prev, totalArea: err }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const areaErr = validateArea(formData.totalArea);
    if (areaErr) {
      setErrors({ totalArea: areaErr });
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
      if (onProfileUpdated) {
        onProfileUpdated(updatedUser);
      }
      onClose();
    } catch (err) {
      const msg = err.message || 'Failed to update profile';
      setServerError(msg);
      if (err.data?.validationErrors) {
        setErrors(err.data.validationErrors);
      }
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
        backgroundColor: 'rgba(22, 66, 48, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #ECE7DC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary, #19201C)', margin: 0 }}>
              Edit Farmer Profile
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
              Update your farm name, crops grown, total area, and profile photo.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: '6px',
              borderRadius: '8px'
            }}
            aria-label="Close modal"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {serverError && (
            <div
              id="modal-profile-error"
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#991B1B',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <IconAlertCircle size={18} color="#DC2626" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Farm Name */}
          <div>
            <label htmlFor="modal-farm-name" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Farm Name <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              id="modal-farm-name"
              name="farmName"
              type="text"
              required
              value={formData.farmName}
              onChange={handleChange}
              placeholder="e.g. Green Acres Farm"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border-input, #DFD8CA)',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Crops Grown */}
          <div>
            <label htmlFor="modal-crops-grown" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Crops Grown
            </label>
            <input
              id="modal-crops-grown"
              name="cropsGrown"
              type="text"
              value={formData.cropsGrown}
              onChange={handleChange}
              placeholder="e.g. Maize, Tomatoes, Beans"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border-input, #DFD8CA)',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Total Area */}
          <div>
            <label htmlFor="modal-total-area" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Total Area (Hectares) <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="modal-total-area"
                name="totalArea"
                type="number"
                step="0.01"
                required
                value={formData.totalArea}
                onChange={handleChange}
                placeholder="e.g. 8.7"
                style={{
                  width: '100%',
                  padding: '10px 48px 10px 14px',
                  borderRadius: '8px',
                  border: errors.totalArea ? '1.5px solid #DC2626' : '1px solid var(--color-border-input, #DFD8CA)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                ha
              </span>
            </div>
            {errors.totalArea && (
              <p id="modal-error-total-area" style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '4px', margin: '4px 0 0 0' }}>
                {errors.totalArea}
              </p>
            )}
          </div>

          {/* Profile Photo */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
              Profile Photo
            </label>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              id="modal-photo-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handleDeviceUpload}
            />

            {/* Upload button row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                id="modal-upload-photo-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 18px', borderRadius: '8px',
                  border: '1.5px solid var(--color-brand-primary, #164230)',
                  backgroundColor: isUploadingPhoto ? '#f0f5f2' : '#FFFFFF',
                  color: 'var(--color-brand-primary, #164230)',
                  fontSize: '0.8125rem', fontWeight: 600,
                  cursor: isUploadingPhoto ? 'not-allowed' : 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => { if (!isUploadingPhoto) e.currentTarget.style.backgroundColor = '#eef4f1'; }}
                onMouseLeave={(e) => { if (!isUploadingPhoto) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
              >
                {isUploadingPhoto ? (
                  <><span style={{ width: '14px', height: '14px', border: '2px solid #164230', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Uploading…</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>Upload from device</>
                )}
              </button>
              {formData.avatarUrl && (
                <button type="button" onClick={() => { setFormData((p) => ({ ...p, avatarUrl: '' })); setUploadError(''); }}
                  style={{ fontSize: '0.75rem', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                  Remove
                </button>
              )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            {uploadError && <p style={{ color: '#DC2626', fontSize: '0.75rem', marginBottom: '10px' }}>⚠ {uploadError}</p>}

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '2px 0 12px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-card-border, #ECE7DC)' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>or choose an avatar</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-card-border, #ECE7DC)' }} />
            </div>

            {/* Preset portraits */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { id: 'av1', label: 'Joyce', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80' },
                { id: 'av2', label: 'Peter', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' },
                { id: 'av3', label: 'Maria', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80' },
                { id: 'av4', label: 'David', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80' },
                { id: 'av5', label: 'Field Hat', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
                { id: 'av6', label: 'Agri Lead', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80' },
              ].map((p) => {
                const chosen = formData.avatarUrl === p.url;
                return (
                  <div key={p.id} onClick={() => { setFormData((prev) => ({ ...prev, avatarUrl: p.url })); setUploadError(''); }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden',
                      border: chosen ? '3px solid var(--color-brand-primary, #164230)' : '2px solid #ECE7DC',
                      boxShadow: chosen ? '0 0 0 2px rgba(22, 66, 48, 0.18)' : 'none',
                      transform: chosen ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 150ms ease',
                    }}>
                      <img src={p.url} alt={p.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: chosen ? 'var(--color-brand-primary, #164230)' : 'var(--color-text-muted)', fontWeight: chosen ? 700 : 500 }}>{p.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Name & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label htmlFor="modal-full-name" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                id="modal-full-name"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border-input, #DFD8CA)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label htmlFor="modal-location" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Location
              </label>
              <input
                id="modal-location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border-input, #DFD8CA)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid #ECE7DC', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #DFD8CA',
                backgroundColor: '#FFFFFF',
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="modal-save-profile-btn"
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                borderRadius: '8px',
                backgroundColor: isSubmitting ? '#9CA3AF' : 'var(--color-brand-primary, #3E7B52)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              <IconCheck size={16} />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
