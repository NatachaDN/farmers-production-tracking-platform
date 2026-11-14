import React from 'react';
import { IconCamera, IconFarms } from '../../../shared/components/Icons';

/**
 * FarmHeroBanner — displays farm photo hero (or empty-photo CTA).
 * Designed for older farmers: big camera button, plain language.
 */
export function FarmHeroBanner({ farm, uploadingPhoto, onPhotoChange }) {
  if (farm.mapImageUrl) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '280px', backgroundColor: '#EAF4ED' }}>
        <img
          src={farm.mapImageUrl}
          alt={farm.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* Gradient overlay at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '100px',
          background: 'linear-gradient(to top, rgba(19,32,28,0.7), transparent)'
        }} />
        {/* Update photo button overlay */}
        <label style={{
          position: 'absolute', top: '16px', right: '16px',
          backgroundColor: 'rgba(255,255,255,0.95)',
          color: '#164230',
          padding: '8px 16px',
          borderRadius: '9999px',
          fontSize: '0.8125rem',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <IconCamera size={15} />
          {uploadingPhoto ? 'Updating...' : 'Update Photo'}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            disabled={uploadingPhoto}
            onChange={onPhotoChange}
          />
        </label>
      </div>
    );
  }

  return (
    <div style={{
      padding: '36px 24px',
      backgroundColor: '#FAF9F6',
      borderBottom: '1px solid #ECE7DC',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      <div style={{
        width: '64px', height: '64px',
        borderRadius: '50%',
        backgroundColor: '#EAF4ED',
        color: '#164230',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '14px'
      }}>
        <IconFarms size={30} color="#164230" />
      </div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#164230', margin: '0 0 6px' }}>
        Add a Photo of Your Farm
      </h3>
      <p style={{ color: '#5C6F64', fontSize: '0.875rem', maxWidth: '400px', margin: '0 0 18px' }}>
        Take a photo with your phone or choose a picture from your device.
        It makes your farm easy to recognise.
      </p>
      <label style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '12px 24px',
        borderRadius: '9999px',
        backgroundColor: '#164230',
        color: '#FFFFFF',
        fontWeight: 600,
        fontSize: '0.9375rem',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(22,66,48,0.2)'
      }}>
        <IconCamera size={18} />
        {uploadingPhoto ? 'Uploading photo...' : 'Choose or Take Photo'}
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          disabled={uploadingPhoto}
          onChange={onPhotoChange}
        />
      </label>
    </div>
  );
}

