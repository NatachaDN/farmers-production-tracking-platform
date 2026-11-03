import React, { useState } from 'react';
import { cropService } from '../services/cropService';
import { IconClose, IconSprout, IconCheck } from '../../../shared/components/Icons';

const POPULAR_SUGGESTIONS = [
  { name: 'Maize', varieties: ['Hybrid 614', 'Duma 43', 'H624'] },
  { name: 'Tomatoes', varieties: ['Anna F1', 'Kilele F1', 'Rio Grande'] },
  { name: 'Beans', varieties: ['Rosecoco (GLP-2)', 'Mwitemania', 'Yellow Bean'] },
  { name: 'Potatoes', varieties: ['Shangi', 'Dutch Robjin', 'Unica'] },
  { name: 'Cassava', varieties: ['Migyera', 'Tajirika', 'KME 1'] },
  { name: 'Rice', varieties: ['Basmati 370', 'Komboka', 'NERICA'] },
  { name: 'Coffee', varieties: ['SL28', 'Ruiru 11', 'Batian'] }
];

export function AddCropModal({ isOpen, onClose, onCropAdded, farmerId = 1 }) {
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSelectSuggestion = (crop) => {
    setName(crop.name);
    if (crop.varieties && crop.varieties.length > 0 && !variety) {
      setVariety(crop.varieties[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg('Please enter a crop name.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: trimmedName,
        variety: variety.trim() || undefined
      };
      const created = await cropService.createCrop(farmerId, payload);
      if (onCropAdded) {
        onCropAdded(created);
      }
      setName('');
      setVariety('');
      onClose();
    } catch (err) {
      console.error('Failed to register crop:', err);
      const message = err.message || 'Failed to register crop. Please check inputs.';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

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
      zIndex: 1200,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(22, 66, 48, 0.18)',
        width: '100%',
        maxWidth: '500px',
        overflow: 'hidden',
        border: '1px solid #ECE7DC',
        animation: 'fadeIn 180ms ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #ECE7DC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: '#FCFAF7'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#EAF4ED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3E7B52',
              border: '1px solid #C8E2D0'
            }}>
              <IconSprout size={22} color="#3E7B52" />
            </div>
            <div>
              <h2 style={{
                fontSize: '1.1875rem',
                fontWeight: 700,
                color: '#19201C',
                margin: 0
              }}>
                Register New Crop
              </h2>
              <p style={{
                fontSize: '0.8125rem',
                color: '#788680',
                margin: '2px 0 0 0'
              }}>
                Add to your personal crops list for easy cycle creation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              padding: '6px',
              borderRadius: '8px',
              color: '#788680',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {errorMsg && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '10px',
              color: '#991B1B',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Suggestions Chips */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#788680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              Quick Suggestions
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {POPULAR_SUGGESTIONS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: name.toLowerCase() === item.name.toLowerCase() ? 700 : 500,
                    backgroundColor: name.toLowerCase() === item.name.toLowerCase() ? '#EAF4ED' : '#F4EFE6',
                    color: name.toLowerCase() === item.name.toLowerCase() ? '#285336' : '#4B5752',
                    border: name.toLowerCase() === item.name.toLowerCase() ? '1px solid #3E7B52' : '1px solid #DFD8CA',
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                >
                  + {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Crop Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#19201C', marginBottom: '6px' }}>
              Crop Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Maize, Tomatoes, Coffee, Sorghum"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #DFD8CA',
                fontSize: '0.9375rem',
                backgroundColor: '#FFFFFF',
                color: '#19201C',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 150ms ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3E7B52';
                e.target.style.boxShadow = '0 0 0 3px rgba(62, 123, 82, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#DFD8CA';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Variety */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#19201C' }}>
                Variety / Cultivar
              </label>
              <span style={{ fontSize: '0.75rem', color: '#788680' }}>Optional</span>
            </div>
            <input
              type="text"
              placeholder="e.g. Hybrid 614, Anna F1, Rosecoco, Shangi"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #DFD8CA',
                fontSize: '0.9375rem',
                backgroundColor: '#FFFFFF',
                color: '#19201C',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 150ms ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3E7B52';
                e.target.style.boxShadow = '0 0 0 3px rgba(62, 123, 82, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#DFD8CA';
                e.target.style.boxShadow = 'none';
              }}
            />
            <p style={{ fontSize: '0.75rem', color: '#788680', margin: '4px 0 0 0' }}>
              Helps distinguish specific seed types, traits, or maturity periods.
            </p>
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '8px',
            paddingTop: '16px',
            borderTop: '1px solid #ECE7DC'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#4B5752',
                backgroundColor: '#FFFFFF',
                border: '1px solid #DFD8CA',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: submitting || !name.trim() ? '#94B49F' : '#3E7B52',
                border: 'none',
                cursor: submitting || !name.trim() ? 'not-allowed' : 'pointer',
                transition: 'background-color 150ms ease'
              }}
            >
              <IconCheck size={16} />
              <span>{submitting ? 'Adding...' : 'Add to My Crops'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
