import React, { useState, useEffect } from 'react';
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

          {/* Profile Photo URL */}
          <div>
            <label htmlFor="modal-avatar-url" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Profile Photo / Avatar URL
            </label>
            <input
              id="modal-avatar-url"
              name="avatarUrl"
              type="text"
              value={formData.avatarUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
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
