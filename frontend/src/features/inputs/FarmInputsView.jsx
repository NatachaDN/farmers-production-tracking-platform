import React, { useState, useEffect } from 'react';
import { inputService } from './services/inputService';
import {
  IconSprout,
  IconFlask,
  IconShieldAlert,
  IconPackage,
  IconSearch,
  IconCheck,
  IconPlus,
  IconLeaf,
  IconTrash,
  IconWarning,
  IconInputs,
  IconPin,
  IconCalendar
} from '../../shared/components/Icons';
import { Skeleton } from '../../shared/components/Skeleton';

/* ─── Type metadata ─────────────────────────────────────────────── */
const TYPE_META = {
  SEEDS:      { icon: IconSprout,      label: 'Seeds',      bg: '#EAF4ED', text: '#2A6740', border: '#C8E2D0' },
  FERTILIZER: { icon: IconFlask,       label: 'Fertilizer', bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  PESTICIDE:  { icon: IconShieldAlert, label: 'Pesticide',  bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
  OTHER:      { icon: IconPackage,     label: 'Other',      bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' }
};

/* ─── Single Input Card ─────────────────────────────────────────── */
function InputCard({ input, onDelete }) {
  const meta = TYPE_META[input.type] || TYPE_META.OTHER;
  const IconComponent = meta.icon;
  const stockQty = input.quantity ?? input.totalQuantity ?? 0;
  const costVal = input.cumulativeCost ?? input.totalCost ?? input.purchasePrice ?? 0;
  const formattedCost = costVal.toLocaleString('fr-CM');
  const formattedDate = input.purchaseDate
    ? new Date(input.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  const formattedExpiry = input.expiryDate
    ? new Date(input.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

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
        cursor: 'default',
        position: 'relative'
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
            color: meta.text, flexShrink: 0
          }}>
            <IconComponent size={22} color={meta.text} />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#19201C', lineHeight: 1.3 }}>
              {input.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#788680', marginTop: '2px' }}>
              Purchased: {formattedDate}
              {input.brand ? ` • ${input.brand}` : ''}
            </div>
          </div>
        </div>

        {/* Right side: type badge + delete icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem',
            fontWeight: 600, backgroundColor: meta.bg, color: meta.text,
            border: `1px solid ${meta.border}`, whiteSpace: 'nowrap',
            display: 'inline-flex', alignItems: 'center', gap: '5px'
          }}>
            <IconComponent size={13} color={meta.text} />
            {meta.label}
          </span>

          {/* Delete icon-only button */}
          <button
            onClick={() => onDelete(input)}
            title="Delete input"
            style={{
              width: '30px',
              height: '30px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              color: '#DC2626',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#DC2626';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FEF2F2';
              e.currentTarget.style.color = '#DC2626';
            }}
          >
            <IconTrash size={14} />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: '#F4EFE6' }} />

      {/* Metrics row */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#788680', marginBottom: '3px' }}>Stock</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#19201C' }}>
            {stockQty} <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#4B5752' }}>{input.unit}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: '#788680', marginBottom: '3px' }}>Total Cost</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#19201C' }}>
            {formattedCost} <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#4B5752' }}>XAF</span>
          </div>
        </div>
      </div>

      {/* Extra traceability / storage details when present */}
      {(input.supplier || input.storageLocation || input.batchNumber || formattedExpiry || input.description) && (
        <div style={{
          paddingTop: '10px',
          borderTop: '1px solid #F4EFE6',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          fontSize: '0.75rem',
          color: '#4B5752'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {input.supplier && (
              <span>Supplier: <strong style={{ color: '#19201C' }}>{input.supplier}</strong></span>
            )}
            {input.storageLocation && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <IconPin size={12} color="#788680" />
                {input.storageLocation}
              </span>
            )}
            {input.batchNumber && (
              <span>Lot: <strong style={{ color: '#19201C' }}>{input.batchNumber}</strong></span>
            )}
            {formattedExpiry && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <IconCalendar size={12} color="#788680" />
                Exp: {formattedExpiry}
              </span>
            )}
          </div>
          {input.description && (
            <div style={{
              color: '#788680',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {input.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Stat mini-card ─────────────────────────────────────────────── */
function StatChip({ label, value, accent, loading }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC',
      borderRadius: '14px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px'
    }}>
      <div style={{ fontSize: '0.75rem', color: '#788680' }}>{label}</div>
      {loading ? (
        <Skeleton width="60%" height="28px" borderRadius="6px" />
      ) : (
        <div style={{ fontSize: '1.375rem', fontWeight: 700, color: accent || '#19201C' }}>{value}</div>
      )}
    </div>
  );
}

/* ─── Main view ─────────────────────────────────────────────────── */
export function FarmInputsView({ farmerId, onNavigate }) {
  const [inputs, setInputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  // Delete confirmation modal state
  const [inputToDelete, setInputToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  /* Load from API */
  useEffect(() => {
    async function load() {
      if (!farmerId) return;
      setLoading(true);
      try {
        const data = await inputService.getInputs(farmerId);
        setInputs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load inputs:', err);
        setInputs([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [farmerId]);

  /* Delete handler */
  const confirmDelete = async () => {
    if (!inputToDelete) return;
    setIsDeleting(true);
    try {
      await inputService.deleteInput(farmerId, inputToDelete.id);
    } catch {
      /* Remove locally even if backend fails */
    }
    setInputs((prev) => prev.filter((i) => i.id !== inputToDelete.id));
    showToast(`"${inputToDelete.name}" removed from inventory.`);
    setInputToDelete(null);
    setIsDeleting(false);
  };

  /* Derived lists */
  const filtered = inputs.filter((i) => {
    const matchesType = filterType === 'ALL' || i.type === filterType;
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalCost = inputs.reduce((acc, i) => acc + (i.cumulativeCost ?? i.totalCost ?? i.purchasePrice ?? 0), 0);
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
            justifyContent: 'center'
          }}>
            <IconCheck size={14} color="#FFFFFF" />
          </span>
          <span>{toast}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {inputToDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(19, 32, 28, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1300, padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(22, 66, 48, 0.2)',
            width: '100%', maxWidth: '460px',
            padding: '28px',
            border: '1px solid #ECE7DC',
            display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                backgroundColor: '#FEE2E2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <IconWarning size={22} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#19201C', margin: 0 }}>
                  Remove Input?
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#788680', marginTop: '6px', margin: 0, lineHeight: 1.5 }}>
                  Are you sure you want to delete <strong style={{ color: '#19201C' }}>"{inputToDelete.name}"</strong> from your inventory?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: '12px',
              paddingTop: '16px', borderTop: '1px solid #F4EFE6'
            }}>
              <button
                onClick={() => setInputToDelete(null)}
                style={{
                  padding: '10px 18px', borderRadius: '10px',
                  backgroundColor: 'transparent',
                  border: '1px solid #DFD8CA',
                  color: '#4B5752', fontWeight: 600,
                  fontSize: '0.875rem', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                style={{
                  padding: '10px 20px', borderRadius: '10px',
                  backgroundColor: '#DC2626', color: '#FFFFFF',
                  border: 'none', fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.7 : 1,
                  display: 'inline-flex', alignItems: 'center', gap: '6px'
                }}
              >
                <IconTrash size={15} />
                <span>{isDeleting ? 'Deleting...' : 'Delete Input'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
              backgroundColor: '#EAF4ED', color: '#2A6740',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <IconLeaf size={24} color="#2A6740" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#19201C', marginBottom: '2px', letterSpacing: '-0.01em' }}>
                Input Inventory
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#788680' }}>
                Manage your seeds, fertilizers, and pesticides
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onNavigate && (
              <button
                id="go-to-cycle-inputs-btn"
                onClick={() => onNavigate('cycle-inputs')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  backgroundColor: '#FFFFFF', color: '#164230', border: '1px solid #C8E2D0',
                  padding: '10px 16px', borderRadius: '10px',
                  fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EAF4ED'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                <IconInputs size={16} color="#3E7B52" />
                <span>Record Cycle Consumption →</span>
              </button>
            )}
            <button
              id="open-add-input-modal"
              onClick={() => onNavigate?.('create-farm-input')}
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
              <IconPlus size={16} color="#FFFFFF" />
              Add Input
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '16px' }}>
          <StatChip label="Total inputs" value={totalItems} loading={loading} />
          <StatChip label="Seeds" value={typeCount('SEEDS')} accent="#2A6740" loading={loading} />
          <StatChip label="Fertilizers" value={typeCount('FERTILIZER')} accent="#92400E" loading={loading} />
          <StatChip
            label="Total cost"
            value={`${totalCost.toLocaleString('fr-CM')} XAF`}
            accent="#3E7B52"
            loading={loading}
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
            const IconComp = meta?.icon;
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
                  transition: 'all 150ms ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {t === 'ALL' ? (
                  'All'
                ) : (
                  <>
                    <IconComp size={14} color={isActive ? meta.text : '#4B5752'} />
                    <span>{meta.label}</span>
                  </>
                )}
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
          <IconSearch size={16} color="#788680" />
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
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECE7DC',
                borderRadius: '16px',
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Skeleton width="42px" height="42px" borderRadius="12px" />
                  <div>
                    <Skeleton width="120px" height="18px" style={{ marginBottom: '6px' }} />
                    <Skeleton width="90px" height="12px" />
                  </div>
                </div>
                <Skeleton width="75px" height="24px" borderRadius="9999px" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '10px', borderTop: '1px solid #F4EFE6' }}>
                <div>
                  <Skeleton width="60px" height="12px" style={{ marginBottom: '4px' }} />
                  <Skeleton width="80px" height="18px" />
                </div>
                <div>
                  <Skeleton width="60px" height="12px" style={{ marginBottom: '4px' }} />
                  <Skeleton width="90px" height="18px" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC',
          borderRadius: '16px', padding: '60px 40px', textAlign: 'center'
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            backgroundColor: '#F4EFE6', color: '#788680',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <IconPackage size={28} color="#788680" />
          </div>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
          {filtered.map((input) => (
            <InputCard
              key={input.id}
              input={input}
              onDelete={(inp) => setInputToDelete(inp)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
