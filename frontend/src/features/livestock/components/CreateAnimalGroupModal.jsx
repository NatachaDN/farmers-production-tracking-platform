import React, { useState, useEffect } from 'react';
import { IconClose, IconLivestock, IconWarning } from '../../../shared/components/Icons';
import { farmService } from '../../farms/services/farmService';

const ANIMAL_TYPES = [
  { value: 'CATTLE', label: 'Cattle' },
  { value: 'POULTRY', label: 'Poultry' },
  { value: 'GOATS', label: 'Goats' },
  { value: 'SHEEP', label: 'Sheep' },
  { value: 'PIGS', label: 'Pigs' },
  { value: 'RABBITS', label: 'Rabbits' },
  { value: 'BEES', label: 'Bees' },
  { value: 'FISH', label: 'Fish' },
  { value: 'OTHER', label: 'Other' }
];

const COMMON_PURPOSES = [
  'Milk Production',
  'Meat Production',
  'Egg Production',
  'Breeding',
  'Wool / Fiber',
  'Honey & Pollination',
  'Dual Purpose',
  'Other'
];

export function CreateAnimalGroupModal({ isOpen, onClose, onCreateGroup }) {
  const [name, setName] = useState('');
  const [animalType, setAnimalType] = useState('CATTLE');
  const [breed, setBreed] = useState('');
  const [initialPopulation, setInitialPopulation] = useState('');
  const [currentPopulation, setCurrentPopulation] = useState('');
  const [location, setLocation] = useState('');
  const [farmId, setFarmId] = useState('');
  const [purpose, setPurpose] = useState('Milk Production');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [farms, setFarms] = useState([]);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      farmService.getFarms()
        .then((data) => {
          if (Array.isArray(data)) setFarms(data);
        })
        .catch(() => setFarms([]));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const trimmedName = name.trim();
    const initPopNum = parseInt(initialPopulation, 10);
    const currPopNum = currentPopulation.trim() !== '' ? parseInt(currentPopulation, 10) : initPopNum;

    // Client-side validations
    if (!trimmedName) {
      setValidationError('Please enter a group name or herd identifier.');
      return;
    }

    if (isNaN(initPopNum) || initPopNum <= 0) {
      setValidationError('Initial population must be a positive number greater than 0.');
      return;
    }

    if (isNaN(currPopNum) || currPopNum < 0) {
      setValidationError('Current population cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateGroup({
        name: trimmedName,
        animalType,
        breed: breed.trim() || null,
        initialPopulation: initPopNum,
        currentPopulation: currPopNum,
        location: location.trim() || null,
        farmId: farmId ? Number(farmId) : null,
        purpose: purpose || null,
        status: 'ACTIVE',
        startDate: startDate || null,
        notes: notes.trim() || null
      });

      // Reset and close
      setName('');
      setAnimalType('CATTLE');
      setBreed('');
      setInitialPopulation('');
      setCurrentPopulation('');
      setLocation('');
      setFarmId('');
      setPurpose('Milk Production');
      setNotes('');
      onClose();
    } catch (err) {
      setValidationError(err.message || 'Failed to create animal group. Please check your inputs.');
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
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid var(--color-card-border)',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 16px 40px rgba(22, 66, 48, 0.12)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid #ECE7DC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconLivestock size={22} color="#D97706" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                Register Animal Group
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Record a new herd, flock, pen, or livestock batch.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: '6px'
            }}
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {validationError && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#B91C1C',
                fontSize: '0.875rem'
              }}
            >
              <IconWarning size={18} color="#B91C1C" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Group Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              Group Name / Identifier <span style={{ color: '#B91C1C' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dairy Herd A, Layer Flock #1, Boer Goats"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #DFD8CA',
                fontSize: '0.9375rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Row: Animal Type & Breed */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                Animal Type <span style={{ color: '#B91C1C' }}>*</span>
              </label>
              <select
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #DFD8CA',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box'
                }}
              >
                {ANIMAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                Breed <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g. Holstein, Kuroiler, Dorper"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #DFD8CA',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Row: Initial Population & Current Population */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                Initial Population <span style={{ color: '#B91C1C' }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                value={initialPopulation}
                onChange={(e) => setInitialPopulation(e.target.value)}
                placeholder="e.g. 30"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #DFD8CA',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                Current Population <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(defaults to initial)</span>
              </label>
              <input
                type="number"
                min="0"
                value={currentPopulation}
                onChange={(e) => setCurrentPopulation(e.target.value)}
                placeholder={initialPopulation || "Same as initial"}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #DFD8CA',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Row: Housing/Location & Primary Purpose */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                Housing / Pen / Pasture
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Barn 2, Coop A, East Pasture"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #DFD8CA',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                Primary Purpose
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #DFD8CA',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box'
                }}
              >
                {COMMON_PURPOSES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Farm (if any) & Acquisition / Start Date */}
          <div style={{ display: 'grid', gridTemplateColumns: farms.length > 0 ? '1fr 1fr' : '1fr', gap: '14px' }}>
            {farms.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                  Associated Farm <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
                </label>
                <select
                  value={farmId}
                  onChange={(e) => setFarmId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #DFD8CA',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">No farm associated</option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                Acquisition / Establishment Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #DFD8CA',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              Notes <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Health status, sourcing info, batch markings..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #DFD8CA',
                fontSize: '0.9375rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #ECE7DC'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: '1px solid #DFD8CA',
                backgroundColor: '#FFFFFF',
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
              disabled={isSubmitting}
              style={{
                padding: '10px 22px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--color-brand-primary)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Registering...' : 'Register animal group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

