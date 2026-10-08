import React, { useState, useEffect } from 'react';
import { AddInputModal } from './components/AddInputModal';
import { inputService } from './services/inputService';

/* ─── Type metadata ─────────────────────────────────────────────── */
const TYPE_META = {
  SEEDS:      { emoji: '🌱', label: 'Seeds',      bg: '#EAF4ED', text: '#2A6740', border: '#C8E2D0' },
  FERTILIZER: { emoji: '🧪', label: 'Fertilizer', bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  PESTICIDE:  { emoji: '🛡️', label: 'Pesticide',  bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
  OTHER:      { emoji: '📦', label: 'Other',       bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' }
};

/* ─── Seed data for offline-first demo ─────────────────────────── */
const SEED_INPUTS = [
  {
    id: 1, name: 'Hybrid Maize Seed 614D', type: 'SEEDS',
    totalQuantity: 120, unit: 'kg', totalCost: 54000,
    purchaseDate: '2026-09-10', lastUpdated: '2026-09-10'
  },
  {
    id: 2, name: 'CAN Fertilizer (Calcium Ammonium Nitrate)', type: 'FERTILIZER',
    totalQuantity: 200, unit: 'kg', totalCost: 32000,
    purchaseDate: '2026-09-14', lastUpdated: '2026-09-14'
  },
  {
    id: 3, name: 'Dimethoate Pesticide', type: 'PESTICIDE',
    totalQuantity: 5, unit: 'L', totalCost: 8500,
    purchaseDate: '2026-09-20', lastUpdated: '2026-09-20'
  },
  {
    id: 4, name: 'NPK 17-17-17', type: 'FERTILIZER',
    totalQuantity: 150, unit: 'kg', totalCost: 27000,
    purchaseDate: '2026-09-22', lastUpdated: '2026-09-22'
  },
  {
    id: 5, name: 'Tomato Seedlings F1', type: 'SEEDS',
    totalQuantity: 2000, unit: 'unit', totalCost: 18000,
    purchaseDate: '2026-10-01', lastUpdated: '2026-10-01'
  }
];

/* ─── Single Input Card ─────────────────────────────────────────── */
function InputCard({ input }) {
  const meta = TYPE_META[input.type] || TYPE_META.OTHER;
  const formattedCost = (input.totalCost || 0).toLocaleString('fr-CM');
  const formattedDate = input.purchaseDate
    ? new Date(input.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #ECE7DC',
        borderRadius: '16px',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        transition: 'box-shadow 200ms ease, transform 200ms ease',
        cursor: 'default'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(22, 66, 48, 0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Icon + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            backgroundColor: meta.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem', flexShrink: 0
          }}>
            {meta.emoji}
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#19201C', lineHeight: 1.3 }}>
              {input.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#788680', marginTop: '2px' }}>
              Purchased: {formattedDate}
            </div>
          </div>
        </div>

        {/* Type badge */}
        <span style={{
          padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem',
          fontWeight: 600, backgroundColor: meta.bg, color: meta.text,
          border: `1px solid ${meta.border}`, whiteSpace: 'nowrap'
        }}>
          {meta.label}
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: '#F4EFE6' }} />

      {/* Metrics row */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#788680', marginBottom: '3px' }}>Stock</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#19201C' }}>
            {input.totalQuantity} <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#4B5752' }}>{input.unit}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: '#788680', marginBottom: '3px' }}>Total Cost</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#19201C' }}>
            {formattedCost} <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#4B5752' }}>XAF</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stat mini-card ─────────────────────────────────────────────── */
function StatChip({ label, value, accent }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC',
      borderRadius: '14px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px'
    }}>
      <div style={{ fontSize: '0.75rem', color: '#788680' }}>{label}</div>
      <div style={{ fontSize: '1.375rem', fontWeight: 700, color: accent || '#19201C' }}>{value}</div>
    </div>
  );
}

/* ─── Main view ─────────────────────────────────────────────────── */
export function FarmInputsView({ farmerId = 1 }) {
  const [inputs, setInputs] = useState(SEED_INPUTS);
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  /* Load from API */
  useEffect(() => {
    async function load() {
      try {
        const data = await inputService.getInputs(farmerId);
        if (Array.isArray(data) && data.length > 0) setInputs(data);
      } catch {
        /* Use seed data */
      }
    }
    load();
  }, [farmerId]);

  /* Add handler */
  const handleAddInput = async (formData) => {
    let saved;
    try {
      saved = await inputService.registerOrUpdateInput(farmerId, formData);
    } catch {
      /* offline-first: merge into local state */
    }

    const newItem = {
      id: saved?.id || Date.now(),
      name: formData.name,
      type: formData.type,
      totalQuantity: formData.quantity,
      unit: formData.unit,
      totalCost: formData.purchasePrice,
      purchaseDate: formData.purchaseDate,
      lastUpdated: formData.purchaseDate
    };

    setInputs((prev) => {
      /* If backend returned an updated record (same name+type exists), replace */
      if (saved?.id) {
        const exists = prev.findIndex((i) => i.id === saved.id);
        if (exists >= 0) {
          const next = [...prev];
          next[exists] = { ...next[exists], ...newItem };
          return next;
        }
      }
      return [newItem, ...prev];
    });

    showToast(`"${formData.name}" added — ${formData.quantity} ${formData.unit} @ ${Number(formData.purchasePrice).toLocaleString('fr-CM')} XAF`);
  };

  /* Derived lists */
  const filtered = inputs.filter((i) => {
    const matchesType = filterType === 'ALL' || i.type === filterType;
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalCost = inputs.reduce((acc, i) => acc + (i.totalCost || 0), 0);
  const totalItems = inputs.length;
  const typeCount = (t) => inputs.filter((i) => i.type === t).length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 1100,
          backgroundColor: '#164230', color: '#FFFFFF',
          padding: '12px 20px', borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '0.875rem', fontWeight: 500
        }}>
          <span style={{
            width: '22px', height: '22px', borderRadius: '50%',
            backgroundColor: '#3E7B52', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '0.75rem'
          }}>✓</span>
          <span>{toast}</span>
        </div>
      )}

      <AddInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddInput={handleAddInput}
      />

      {/* Summary bar */}
      <div style={{
        backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC',
        borderRadius: '20px', padding: '24px 28px',
        boxShadow: '0 2px 8px rgba(22, 66, 48, 0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              backgroundColor: '#EAF4ED', fontSize: '1.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>🌿</div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#19201C', marginBottom: '2px', letterSpacing: '-0.01em' }}>
                Input Inventory
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#788680' }}>
                Manage your seeds, fertilizers, and pesticides
              </p>
            </div>
          </div>
          <button
            id="open-add-input-modal"
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#3E7B52', color: '#FFFFFF', border: 'none',
              padding: '10px 18px', borderRadius: '10px',
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(62,123,82,0.25)',
              transition: 'background-color 150ms ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#336844'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3E7B52'}
          >
            + Add Input
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <StatChip label="Total inputs" value={totalItems} />
          <StatChip label="Seeds" value={typeCount('SEEDS')} accent="#2A6740" />
          <StatChip label="Fertilizers" value={typeCount('FERTILIZER')} accent="#92400E" />
          <StatChip
            label="Total cost"
            value={`${totalCost.toLocaleString('fr-CM')} XAF`}
            accent="#3E7B52"
          />
        </div>
      </div>

      {/* Filters + Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        {/* Type pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', ...Object.keys(TYPE_META)].map((t) => {
            const isActive = filterType === t;
            const meta = TYPE_META[t];
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                style={{
                  padding: '6px 14px', borderRadius: '9999px',
                  fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                  backgroundColor: isActive ? (meta?.bg || '#164230') : '#FFFFFF',
                  color: isActive ? (meta?.text || '#FFFFFF') : '#4B5752',
                  border: isActive
                    ? `1.5px solid ${meta?.border || '#3E7B52'}`
                    : '1.5px solid #DFD8CA',
                  transition: 'all 150ms ease'
                }}
              >
                {t === 'ALL' ? 'All' : `${meta.emoji} ${meta.label}`}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          backgroundColor: '#FFFFFF', border: '1px solid #DFD8CA',
          borderRadius: '10px', padding: '8px 14px', width: '240px'
        }}>
          <span style={{ color: '#788680', fontSize: '0.875rem' }}>🔍</span>
          <input
            type="text"
            placeholder="Search inputs…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none', outline: 'none', fontSize: '0.8125rem',
              color: '#19201C', width: '100%', backgroundColor: 'transparent'
            }}
          />
        </div>
      </div>

      {/* Input cards grid */}
      {filtered.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC',
          borderRadius: '16px', padding: '60px 40px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📦</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#19201C', marginBottom: '6px' }}>
            No inputs found
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#788680' }}>
            {searchTerm || filterType !== 'ALL'
              ? 'Try adjusting your filters or search term.'
              : 'Click "Add Input" to register your first farm input.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {filtered.map((input) => (
            <InputCard key={input.id} input={input} />
          ))}
        </div>
      )}
    </div>
  );
}
