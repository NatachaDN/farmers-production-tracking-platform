import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cropService } from '../../crops/services/cropService';
import { AddCropModal } from '../../crops/components/AddCropModal';

const ADD_NEW = '__ADD_NEW_CROP__';

/**
 * Crop picker for plots, fed by the farmer's own crop list (US-08).
 * Offers "+ Add new crop", which registers the crop in the farmer's list and selects it.
 * The value is the crop name (plots store the crop type as a name).
 */
export function CropTypeSelect({ farmerId, value, onChange, style }) {
  const [crops, setCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);

  useEffect(() => {
    if (!farmerId) return;
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    cropService.getCrops(farmerId)
      .then((data) => { if (isMounted) setCrops(Array.isArray(data) ? data : []); })
      .catch((err) => { if (isMounted) setError(err?.message || 'Could not load your crops.'); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [farmerId]);

  // One option per crop name (several varieties can share a name).
  const names = [...new Set(crops.map((c) => c.name).filter(Boolean))];
  // Keep a plot's existing crop selectable even if it is not in the list.
  if (value && !names.includes(value)) names.unshift(value);

  const handleSelect = (e) => {
    if (e.target.value === ADD_NEW) {
      setIsAddCropOpen(true);
      return;
    }
    onChange(e.target.value);
  };

  const handleCropAdded = (crop) => {
    setCrops((prev) => (prev.some((c) => c.id === crop.id) ? prev : [crop, ...prev]));
    onChange(crop.name);
    setIsAddCropOpen(false);
  };

  return (
    <>
      <select value={value || ''} onChange={handleSelect} disabled={isLoading} style={style}>
        <option value="">{isLoading ? 'Loading your crops…' : '— Select a crop —'}</option>
        {names.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
        <option value={ADD_NEW}>+ Add new crop…</option>
      </select>
      {(error || (!isLoading && crops.length === 0)) && (
        <div style={{ fontSize: '0.75rem', marginTop: '4px', color: error ? '#B42318' : 'var(--color-text-muted, #788680)' }}>
          {error || 'Your crop list is empty — choose "+ Add new crop…" to register one.'}
        </div>
      )}
      {/* Rendered in a portal (no <form> nested in the plot form), and its submit event
          is stopped so saving a crop does not also submit the surrounding plot form. */}
      {isAddCropOpen && createPortal(
        <div onSubmit={(e) => e.stopPropagation()}>
          <AddCropModal
            isOpen={isAddCropOpen}
            onClose={() => setIsAddCropOpen(false)}
            onCropAdded={handleCropAdded}
            farmerId={farmerId}
          />
        </div>,
        document.body
      )}
    </>
  );
}
