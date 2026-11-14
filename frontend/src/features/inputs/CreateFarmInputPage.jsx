import React, { useState } from 'react';
import { inputService } from './services/inputService';
import {
  IconArrowLeft,
  IconSprout,
  IconFlask,
  IconShieldAlert,
  IconPackage,
  IconCheck,
  IconCalendar,
  IconPin,
  IconScale,
  IconWarning
} from '../../shared/components/Icons';

const INPUT_CATEGORIES = [
  {
    value: 'SEEDS',
    label: 'Seeds & Planting Material',
    shortLabel: 'Seeds',
    description: 'Certified seeds, seedlings, tubers, or cuttings',
    icon: IconSprout,
    bg: '#EAF4ED',
    text: '#2A6740',
    border: '#C8E2D0'
  },
  {
    value: 'FERTILIZER',
    label: 'Fertilizer & Soil Amendments',
    shortLabel: 'Fertilizer',
    description: 'NPK, Urea, DAP, organic compost, or manure',
    icon: IconFlask,
    bg: '#FEF3C7',
    text: '#92400E',
    border: '#FDE68A'
  },
  {
    value: 'PESTICIDE',
    label: 'Crop Protection',
    shortLabel: 'Pesticide',
    description: 'Herbicides, insecticides, fungicides, or biopesticides',
    icon: IconShieldAlert,
    bg: '#FEE2E2',
    text: '#991B1B',
    border: '#FECACA'
  },
  {
    value: 'OTHER',
    label: 'Other Farm Supplies',
    shortLabel: 'Other',
    description: 'Tools, packaging bags, irrigation fittings, or fuel',
    icon: IconPackage,
    bg: '#F4EFE6',
    text: '#4B5752',
    border: '#DFD8CA'
  }
];

const UNITS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'L', label: 'Litres (L)' },
  { value: 'mL', label: 'Millilitres (mL)' },
  { value: 'bag', label: 'Bags (50kg / standard)' },
  { value: 'ton', label: 'Metric Tons (t)' },
  { value: 'unit', label: 'Units / Pieces' }
];

const labelStyle = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: '#19201C',
  marginBottom: '6px'
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1px solid #DFD8CA',
  fontSize: '0.875rem',
  color: '#19201C',
  backgroundColor: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 150ms ease, box-shadow 150ms ease'
};

const cardStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #ECE7DC',
  borderRadius: '20px',
  padding: 'clamp(18px, 3vw, 28px)',
  boxShadow: '0 2px 8px rgba(22, 66, 48, 0.04)'
};

export function CreateFarmInputPage({ farmerId, onBack, onCreated }) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    type: 'SEEDS',
    name: '',
    brand: '',
    supplier: '',
    quantity: '',
    unit: 'kg',
    purchasePrice: '',
    purchaseDate: today,
    expiryDate: '',
    batchNumber: '',
    storageLocation: '',
    description: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const qtyNum = parseFloat(formData.quantity);
  const priceNum = parseFloat(formData.purchasePrice);
  const unitCost =
    !Number.isNaN(qtyNum) && qtyNum > 0 && !Number.isNaN(priceNum) && priceNum > 0
      ? priceNum / qtyNum
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Please enter the input name.');
      return;
    }
    if (Number.isNaN(qtyNum) || qtyNum <= 0) {
      setError('Quantity must be a positive number.');
      return;
    }
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      setError('Total purchase price must be a positive number.');
      return;
    }
    if (!formData.purchaseDate) {
      setError('Please select the purchase date.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      quantity: qtyNum,
      unit: formData.unit,
      purchaseDate: formData.purchaseDate,
      purchasePrice: priceNum,
      brand: formData.brand.trim() || null,
      supplier: formData.supplier.trim() || null,
      batchNumber: formData.batchNumber.trim() || null,
      expiryDate: formData.expiryDate || null,
      storageLocation: formData.storageLocation.trim() || null,
      description: formData.description.trim() || null
    };

    setSubmitting(true);
    try {
      const saved = await inputService.registerOrUpdateInput(farmerId, payload);
      if (onCreated) {
        onCreated(saved);
      } else if (onBack) {
        onBack();
      }
    } catch (err) {
      console.error('Failed to register farm input:', err);
      setError(err?.message || 'Unable to save farm input. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCategory = INPUT_CATEGORIES.find((c) => c.value === formData.type) || INPUT_CATEGORIES[0];

  return (
    <div className="fade-in" style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            alignSelf: 'flex-start',
            backgroundColor: '#FFFFFF',
            border: '1px solid #DFD8CA',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#164230',
            cursor: 'pointer',
            transition: 'background-color 150ms ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F4EFE6'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
        >
          <IconArrowLeft size={16} color="#164230" />
          <span>Back to Farm Inputs</span>
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.875rem)', fontWeight: 700, color: '#19201C', letterSpacing: '-0.02em', margin: 0 }}>
              Register Farm Input
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#788680', marginTop: '4px', marginBottom: 0 }}>
              Record stock purchases, supplier traceability, storage location, and usage specifications.
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: '14px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#991B1B',
          fontSize: '0.875rem',
          fontWeight: 500
        }}>
          <IconWarning size={18} color="#DC2626" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Section 1: Category & Identity */}
        <section style={cardStyle}>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#19201C', margin: 0 }}>
              1. Category & Identification
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#788680', marginTop: '3px', marginBottom: 0 }}>
              Choose the input category and enter product identification details. If an item with the same name exists, stock and cumulative cost will be updated.
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Input Category *</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))',
              gap: '12px'
            }}>
              {INPUT_CATEGORIES.map((cat) => {
                const IconComp = cat.icon;
                const isSelected = formData.type === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleChange('type', cat.value)}
                    style={{
                      textAlign: 'left',
                      padding: '14px 16px',
                      borderRadius: '14px',
                      border: isSelected ? `2px solid ${cat.text}` : '1px solid #ECE7DC',
                      backgroundColor: isSelected ? cat.bg : '#FAF8F4',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 150ms ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        backgroundColor: isSelected ? '#FFFFFF' : cat.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <IconComp size={18} color={cat.text} />
                      </div>
                      {isSelected && (
                        <span style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: cat.text,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <IconCheck size={12} color="#FFFFFF" />
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#19201C' }}>
                        {cat.shortLabel}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#4B5752', lineHeight: 1.35, marginTop: '2px' }}>
                        {cat.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: '16px'
          }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="input-name" style={labelStyle}>Input Name *</label>
              <input
                id="input-name"
                type="text"
                required
                placeholder={
                  formData.type === 'SEEDS'
                    ? 'e.g. Semences Maïs CMS 8704 / Rosecoco Beans'
                    : formData.type === 'FERTILIZER'
                      ? 'e.g. NPK 20-10-10 / Urea 46% / Poultry Manure'
                      : formData.type === 'PESTICIDE'
                        ? 'e.g. Glyphosate 360 SL / Cypermethrin'
                        : 'e.g. Polythene Nursery Bags / Sisal Twine'
                }
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="input-brand" style={labelStyle}>Brand / Manufacturer</label>
              <input
                id="input-brand"
                type="text"
                placeholder="e.g. Yara, Syngenta, IRAD, Bayer"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="input-supplier" style={labelStyle}>Supplier / Agro-dealer</label>
              <input
                id="input-supplier"
                type="text"
                placeholder="e.g. Coopérative Agricole de Bafoussam"
                value={formData.supplier}
                onChange={(e) => handleChange('supplier', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </section>

        {/* Section 2: Stock Quantity & Purchase Cost */}
        <section style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: activeCategory.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconScale size={18} color={activeCategory.text} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#19201C', margin: 0 }}>
                2. Quantity & Financial Cost
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#788680', marginTop: '2px', marginBottom: 0 }}>
                Specify stock volume and total amount paid for accurate cycle cost allocation.
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: '16px'
          }}>
            <div>
              <label htmlFor="input-quantity" style={labelStyle}>Quantity Purchased *</label>
              <input
                id="input-quantity"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="e.g. 50"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="input-unit" style={labelStyle}>Unit of Measure *</label>
              <select
                id="input-unit"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                style={inputStyle}
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="input-price" style={labelStyle}>Total Purchase Price (XAF) *</label>
              <input
                id="input-price"
                type="number"
                step="1"
                min="1"
                required
                placeholder="e.g. 25000"
                value={formData.purchasePrice}
                onChange={(e) => handleChange('purchasePrice', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {unitCost !== null && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: '#EAF4ED',
              border: '1px solid #C8E2D0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#164230' }}>
                Calculated Unit Cost
              </span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#2A6740' }}>
                {unitCost.toLocaleString('fr-CM', { maximumFractionDigits: 2 })} XAF / {formData.unit}
              </span>
            </div>
          )}
        </section>

        {/* Section 3: Traceability & Storage */}
        <section style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#F4EFE6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconCalendar size={18} color="#4B5752" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#19201C', margin: 0 }}>
                3. Traceability & Storage
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#788680', marginTop: '2px', marginBottom: 0 }}>
                Track purchase & expiry dates, batch codes, and where stock is stored on the farm.
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: '16px'
          }}>
            <div>
              <label htmlFor="input-purchase-date" style={labelStyle}>Purchase Date *</label>
              <input
                id="input-purchase-date"
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => handleChange('purchaseDate', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="input-expiry-date" style={labelStyle}>Expiry / Best Before Date</label>
              <input
                id="input-expiry-date"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleChange('expiryDate', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="input-batch" style={labelStyle}>Batch / Lot Number</label>
              <input
                id="input-batch"
                type="text"
                placeholder="e.g. LOT-2026-04B"
                value={formData.batchNumber}
                onChange={(e) => handleChange('batchNumber', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="input-storage" style={labelStyle}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <IconPin size={13} color="#788680" />
                  Storage Location
                </span>
              </label>
              <input
                id="input-storage"
                type="text"
                placeholder="e.g. Main Barn, Seed Store, Chemical Shed"
                value={formData.storageLocation}
                onChange={(e) => handleChange('storageLocation', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </section>

        {/* Section 4: Usage Notes & Specifications */}
        <section style={cardStyle}>
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#19201C', margin: 0 }}>
              4. Agronomic Specifications & Usage Notes
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#788680', marginTop: '3px', marginBottom: 0 }}>
              Record active ingredients, NPK ratios, recommended dosage per hectare, or safety instructions.
            </p>
          </div>

          <textarea
            id="input-description"
            rows={4}
            placeholder="e.g. Apply 200 kg/ha at planting as basal dressing. Keep dry on wooden pallets away from direct sunlight."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            style={{
              ...inputStyle,
              resize: 'vertical',
              fontFamily: 'inherit',
              lineHeight: 1.5
            }}
          />
        </section>

        {/* Action Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          paddingTop: '4px'
        }}>
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            style={{
              padding: '11px 20px',
              borderRadius: '10px',
              border: '1px solid #DFD8CA',
              backgroundColor: '#FFFFFF',
              color: '#4B5752',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            id="submit-create-farm-input"
            type="submit"
            disabled={submitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 24px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: submitting ? '#788680' : '#3E7B52',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(62, 123, 82, 0.25)'
            }}
          >
            <IconCheck size={16} color="#FFFFFF" />
            <span>{submitting ? 'Saving Input...' : 'Save Farm Input'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

