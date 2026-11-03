import React, { useState, useEffect, useMemo } from 'react';
import { cropCycleService } from '../crops/services/cropCycleService';
import { saleService } from './services/saleService';
import { AddSaleModal } from './components/AddSaleModal';
import {
  IconShoppingBag,
  IconWheat,
  IconTruck,
  IconPackage,
  IconPlus,
  IconTrash,
  IconWarning,
  IconCheck,
  IconCalendar,
  IconChevronRight,
  IconRefresh
} from '../../shared/components/Icons';

const UNIT_LABELS = { KG: 'kg', BAGS: 'bags', TONS: 'tons' };

function formatMoney(value) {
  return (value || 0).toLocaleString('fr-CM');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getCycleLabel(cycle) {
  return `${cycle.cropName || 'Crop'} · ${cycle.plotName || 'Plot'}`;
}

export function SaleView({ farmerId = 1 }) {
  const [cycles, setCycles] = useState([]);
  const [sales, setSales] = useState([]);
  const [margin, setMargin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selectedCycleId, setSelectedCycleId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [saleToDelete, setSaleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (farmerId) loadCycles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmerId]);

  const loadCycles = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await cropCycleService.getCycles(farmerId, undefined);
      const list = Array.isArray(data) ? data : [];
      setCycles(list);
      if (list.length > 0 && !selectedCycleId) {
        setSelectedCycleId(list[0].id);
      }
    } catch (err) {
      setLoadError(err?.message || 'Could not load your production cycles.');
      setCycles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSalesAndMargin = async () => {
    if (!selectedCycleId) return;
    try {
      const [salesData, marginData] = await Promise.all([
        saleService.getSalesByCycle(farmerId, selectedCycleId),
        saleService.getMargin(farmerId, selectedCycleId)
      ]);
      setSales(Array.isArray(salesData) ? salesData : []);
      setMargin(marginData);
    } catch (err) {
      setSales([]);
      setMargin(null);
    }
  };

  useEffect(() => {
    loadSalesAndMargin();
  }, [selectedCycleId, farmerId]);

  const selectedCycle = cycles.find((c) => c.id === selectedCycleId) || null;

  const handleAddSale = async (formData) => {
    try {
      await saleService.recordSale(farmerId, formData);
      showToast(`Sale recorded — ${formatMoney(formData.quantitySold * form.pricePerUnit)} XAF revenue`);
      await loadSalesAndMargin();
    } catch (err) {
      showToast(err?.message || 'Failed to record sale.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!saleToDelete) return;
    setIsDeleting(true);
    try {
      await saleService.deleteSale(farmerId, saleToDelete.id);
      setSales((prev) => prev.filter((s) => s.id !== saleToDelete.id));
      showToast(`Sale removed.`);
      await loadSalesAndMargin();
    } catch {
      setSales((prev) => prev.filter((s) => s.id !== saleToDelete.id));
      showToast(`Sale removed locally.`);
    } finally {
      setSaleToDelete(null);
      setIsDeleting(false);
    }
  };

  const totalRevenue = useMemo(() =>
    sales.reduce((acc, s) => acc + (Number(s.totalRevenue) || 0), 0), [sales]);

  const marginValue = margin ? margin.margin : null;
  const totalExpenses = margin ? margin.totalExpenses : null;

  const marginStatus = marginValue == null ? 'neutral' : marginValue > 0 ? 'profit' : marginValue < 0 ? 'loss' : 'break-even';

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 1100,
          backgroundColor: toast.type === 'error' ? '#B91C1C' : '#164230',
          color: '#FFFFFF',
          padding: '12px 20px', borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '0.875rem', fontWeight: 500
        }}>
          <span style={{
            width: '22px', height: '22px', borderRadius: '50%',
            backgroundColor: toast.type === 'error' ? '#FCA5A5' : '#3E7B52',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <IconCheck size={14} color="#FFFFFF" />
          </span>
          <span>{toast.msg}</span>
        </div>
      )}

      {saleToDelete && (
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
                  Delete Sale?
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#788680', marginTop: '6px', margin: 0, lineHeight: 1.5 }}>
                  Are you sure you want to delete <strong style={{ color: '#19201C' }}>"{saleToDelete.buyer}"</strong> sale?
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: '12px',
              paddingTop: '16px', borderTop: '1px solid #F4EFE6'
            }}>
              <button
                onClick={() => setSaleToDelete(null)}
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
                <span>{isDeleting ? 'Deleting...' : 'Delete Sale'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <AddSaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddSale={handleAddSale}
        cycles={cycles}
        selectedCycleId={selectedCycleId}
      />

      {/* Header + cycle selector */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#19201C', marginBottom: '2px' }}>
            Harvest Sales & Margin
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#788680' }}>
            Record sales and view margin per production cycle
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={selectedCycleId || ''}
            onChange={(e) => setSelectedCycleId(e.target.value ? parseInt(e.target.value, 10) : null)}
            style={{
              padding: '8px 12px', borderRadius: '10px', border: '1px solid #DFD8CA',
              backgroundColor: '#FFFFFF', fontSize: '0.875rem', cursor: 'pointer', minWidth: '260px'
            }}
          >
            <option value="">Select a production cycle</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {getCycleLabel(c)} · {c.status || 'Active'}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedCycleId}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: selectedCycleId ? '#3E7B52' : '#DFD8CA', color: '#FFFFFF', border: 'none',
              padding: '10px 18px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600,
              cursor: selectedCycleId ? 'pointer' : 'not-allowed',
              opacity: selectedCycleId ? 1 : 0.6,
              boxShadow: '0 2px 6px rgba(62,123,82,0.25)',
              transition: 'background-color 150ms ease'
            }}
          >
            <IconPlus size={16} color="#FFFFFF" />
            <span>Record Sale</span>
          </button>
          <button
            onClick={loadCycles}
            disabled={loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#FFFFFF', border: '1px solid #DFD8CA',
              padding: '8px 14px', borderRadius: '10px', fontSize: '0.8125rem', fontWeight: 600,
              color: '#4B5752', cursor: 'pointer', opacity: loading ? 0.6 : 1
            }}
          >
            <IconRefresh size={14} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted, #788680)', fontSize: '0.875rem' }}>
          Loading your sales…
        </div>
      ) : loadError ? (
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ color: '#B91C1C', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
            {loadError}
          </div>
          <button
            onClick={loadCycles}
            style={{
              marginTop: '10px', padding: '8px 16px', borderRadius: '10px',
              backgroundColor: 'var(--color-brand-primary, #3E7B52)', color: '#FFFFFF',
              border: 'none', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </div>
      ) : !selectedCycle ? (
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
            <IconShoppingBag size={28} color="#788680" />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#19201C', marginBottom: '6px' }}>
            Select a production cycle
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#788680' }}>
            Choose a completed cycle with a recorded harvest to record sales and view its margin.
          </p>
        </div>
      ) : (
        <>
          {/* Margin cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC', borderRadius: '14px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '0.75rem', color: '#788680' }}>Total Revenue</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#19201C' }}>
                {formatMoney(totalRevenue)} XAF
              </div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC', borderRadius: '14px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '0.75rem', color: '#788680' }}>Expenses (this cycle)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#92400E' }}>
                {formatMoney(totalExpenses)} XAF
              </div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC', borderRadius: '14px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '0.75rem', color: '#788680' }}>Margin</div>
              <div style={{
                fontSize: '1.5rem', fontWeight: 700,
                color: marginStatus === 'profit' ? '#2A6740' : marginStatus === 'loss' ? '#DC2626' : '#4B5752'
              }}>
                {marginValue == null ? '—' : (marginValue >= 0 ? '+' : '') + formatMoney(marginValue)} XAF
              </div>
              <div style={{
                fontSize: '0.75rem', fontWeight: 600,
                color: marginStatus === 'profit' ? '#2A6740' : marginStatus === 'loss' ? '#DC2626' : '#788680',
                textTransform: 'uppercase'
              }}>
                {marginStatus === 'profit' ? 'Profit' : marginStatus === 'loss' ? 'Loss' : 'Break-even'}
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC', borderRadius: '16px',
              padding: '20px 24px', boxShadow: 'var(--shadow-card, 0 1px 3px rgba(22,66,48,0.05))'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#19201C' }}>
                  Sales History — {getCycleLabel(selectedCycle)}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#788680' }}>
                  {sales.length} sale{sales.length !== 1 ? 's' : ''}
                </span>
              </div>

              {sales.length === 0 ? (
                <div style={{ padding: '32px 24px', textAlign: 'center', color: '#788680' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F4EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <IconShoppingBag size={20} color="#788680" />
                  </div>
                  <p>No sales recorded for this cycle yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {sales.map((sale) => (
                    <div key={sale.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 14px', borderRadius: '10px',
                      backgroundColor: '#FAF8F3', border: '1px solid #F4EFE6'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '8px',
                          backgroundColor: '#EAF4ED', color: '#2A6740',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          <IconShoppingBag size={16} color="#2A6740" />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#19201C' }}>
                            {sale.quantitySold} {sale.unit}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#788680' }}>
                            {sale.buyer} · {formatDate(sale.saleDate)}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#19201C' }}>
                          {formatMoney(sale.totalRevenue)} XAF
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#788680' }}>
                          @ {formatMoney(sale.pricePerUnit)}/unit
                        </div>
                      </div>
                      <button
                        onClick={() => setSaleToDelete(sale)}
                        style={{
                          background: 'none', border: 'none', color: '#DC2626',
                          cursor: 'pointer', padding: '4px', fontSize: '0.75rem', fontWeight: 600
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SaleView;
