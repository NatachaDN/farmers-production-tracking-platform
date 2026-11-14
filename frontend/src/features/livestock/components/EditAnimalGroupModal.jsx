import React, { useState, useEffect } from 'react';
import { IconClose, IconPencil, IconWarning } from '../../../shared/components/Icons';
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

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'ARCHIVED', label: 'Archived' }
];

export function EditAnimalGroupModal({ isOpen, onClose, group, onUpdateGroup }) {
  const [name, setName] = useState('');
  const [animalType, setAnimalType] = useState('CATTLE');
  const [breed, setBreed] = useState('');
  const [currentPopulation, setCurrentPopulation] = useState('');
  const [initialPopulation, setInitialPopulation] = useState('');
  const [location, setLocation] = useState('');
  const [farmId, setFarmId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');

  const [farms, setFarms] = useState([]);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (group && isOpen) {
      setName(group.name || '');
      setAnimalType(group.animalType || 'CATTLE');
      setBreed(group.breed || '');
      setCurrentPopulation(String(group.currentPopulation ?? group.initialPopulation ?? 0));
      setInitialPopulation(String(group.initialPopulation ?? 0));
      setLocation(group.location || '');
      setFarmId(group.farmId ? String(group.farmId) : '');
      setPurpose(group.purpose || '');
      setStatus(group.status || 'ACTIVE');
      setStartDate(group.startDate || '');
      setNotes(group.notes || '');
      setValidationError('');

      farmService.getFarms()
        .then((data) => {
          if (Array.isArray(data)) setFarms(data);
        })
        .catch(() => setFarms([]));
    }
  }, [group, isOpen]);

  if (!isOpen || !group) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const trimmedName = name.trim();
    const currPopNum = parseInt(currentPopulation, 10);
    const initPopNum = initialPopulation ? parseInt(initialPopulation, 10) : group.initialPopulation;

    if (!trimmedName) {
      setValidationError('Please enter a group name.');
      return;
    }

    if (isNaN(currPopNum) || currPopNum < 0) {
      setValidationError('Current population must be a non-negative number (0 or greater).');
      return;
    }

    if (initPopNum !== null && (isNaN(initPopNum) || initPopNum <= 0)) {
      setValidationError('Initial population must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateGroup(group.id, {
        name: trimmedName,
        animalType,
        breed: breed.trim() || null,
        currentPopulation: currPopNum,
        initialPopulation: initPopNum,
        location: location.trim() || null,
        farmId: farmId ? Number(farmId) : null,
        purpose: purpose.trim() || null,
        status,
        startDate: startDate || null,
        notes: notes.trim() || null
      });
      onClose();
    } catch (err) {
      setValidationError(err.message || 'Failed to update animal group.');
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
        {/* Header */}
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
                backgroundColor: '#EAF4ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconPencil size={20} color="#2D7A52" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                Edit Animal Group
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Update group details, current headcount, or status.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '6px' }}
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Form */}
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

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              Group Name / Identifier <span style={{ color: '#B91C1C' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #DFD8CA',
                fontSize: '0.9375rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

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
                Breed
              </label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g. Cobb 500, Goliath, Goudali, Porc blanc de l'Ouest"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #DFD8CA',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                Current Population <span style={{ color: '#B91C1C' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                value={currentPopulation}
                onChange={(e) => setCurrentPopulation(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #DFD8CA',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #DFD8CA',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                Housing / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Poulailler Bandjoun N°1, Enclos Bassa"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #DFD8CA',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                Purpose
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Poulets de chair, Œufs de table, Vente locale à Bafoussam"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #DFD8CA',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              Notes
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #DFD8CA',
                fontSize: '0.9375rem',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>

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
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

