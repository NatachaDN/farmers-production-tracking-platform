import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { cropCycleService } from '../crops/services/cropCycleService';
import { plotService } from '../farms/services/plotService';
import { CycleDetailDrawer } from './CycleDetailDrawer';
import { MetricCard } from '../../shared/components/MetricCard';
import {
  IconSprout,
  IconTomato,
  IconBean,
  IconLeaf,
  IconWheat,
  IconCrop,
  IconCalendar,
  IconTrendingUp,
  IconCheckCircle,
  IconChevronRight,
  IconRefresh,
  IconFilter,
  IconClose
} from '../../shared/components/Icons';

/** Normalizes a cycle's status to COMPLETED / ACTIVE. */
const cycleStatusOf = (cycle) =>
  ((cycle?.status || 'ACTIVE') + '').toUpperCase() === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE';

function getCropIcon(cropName, size = 18) {
  const name = (cropName || '').toLowerCase();
  if (name.includes('tomato')) return <IconTomato size={size} />;
  if (name.includes('bean')) return <IconBean size={size} />;
  if (name.includes('cassava') || name.includes('potato')) return <IconLeaf size={size} />;
  return <IconSprout size={size} />;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/** Effective date used to sort cycles (planting date falls back to creation date). */
function effectiveCycleDate(cycle) {
  if (cycle.plantingDate) return cycle.plantingDate;
  if (cycle.createdAt) return String(cycle.createdAt).slice(0, 10);
  return '0000-00-00';
}

/** Ongoing / Completed status pill following the Acrea status palette. */
function CycleStatusBadge({ status }) {
  const completed = status === 'COMPLETED';
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      backgroundColor: completed ? '#F1F5F9' : '#EAF4ED',
      color: completed ? '#475569' : '#2A6740',
      border: `1px solid ${completed ? '#E2E8F0' : '#CDE2D4'}`,
      borderRadius: '9999px',
      padding: '2px 8px',
      fontSize: '0.7rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap'
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        backgroundColor: completed ? '#64748B' : '#3E7B52'
      }} />
      {completed ? 'Completed' : 'Ongoing'}
    </span>
  );
}

function QuantityLabel({ quantity, unit, fallback = '—' }) {
  if (quantity == null) return <>{fallback}</>;
  return <>{Number(quantity).toLocaleString()} {unit || 'kg'}</>;
}

export function ProductionView({ farmerId = 1 }) {
  const [cycles, setCycles] = useState([]);
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedCycleId, setSelectedCycleId] = useState(null);

  /* Filter state */
  const [filters, setFilters] = useState({
    farmId: '',
    plotId: '',
    crop: '',
    dateFrom: '',
    dateTo: ''
  });

  // ------------------------------------------------------------------ //
  //  Load cycles + plots (plots drive the farm & plot filter options)   //
  // ------------------------------------------------------------------ //
  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [cycleData, plotData] = await Promise.all([
        cropCycleService.getCycles(farmerId, undefined),
        plotService.getPlots(farmerId)
      ]);
      setCycles(Array.isArray(cycleData) ? cycleData : []);
      setPlots(Array.isArray(plotData) ? plotData : []);
    } catch (err) {
      setLoadError(err?.message || 'Could not load your production cycles.');
      setCycles([]);
      setPlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (farmerId) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmerId]);

  // Map plot id -> { name, farmId, farmName }
  const plotMap = useMemo(() => {
    const map = {};
    (plots || []).forEach((p) => {
      map[p.id] = {
        name: p.name,
        farmId: p.farmId,
        farmName: p.farmName || 'Unassigned farm'
      };
    });
    return map;
  }, [plots]);

  // Resolve the farm for a cycle (backend supplies plotId; demo data may not)
  const resolveCycleFarm = useCallback((cycle) => {
    const plot = cycle.plotId != null ? plotMap[cycle.plotId] : null;
    if (plot) return plot;
    // Fallback for demo data that only carries plotName
    const fallbackPlot = (plots || []).find((p) => p.name === cycle.plotName);
    if (fallbackPlot) return {
      name: fallbackPlot.name,
      farmId: fallbackPlot.farmId,
      farmName: fallbackPlot.farmName || 'Unassigned farm'
    };
    return { name: cycle.plotName || 'Plot', farmId: null, farmName: 'Unassigned farm' };
  }, [plots, plotMap]);

  /* Unique filter options derived from the data */
  const farmOptions = useMemo(() => {
    const seen = new Set();
    const opts = [];
    (plots || []).forEach((p) => {
      if (p.farmId && !seen.has(p.farmId)) {
        seen.add(p.farmId);
        opts.push({ id: p.farmId, label: p.farmName || 'Unassigned farm' });
      }
    });
    return opts;
  }, [plots]);

  const plotOptions = useMemo(() => {
    const selectedFarm = filters.farmId;
    const seen = new Set();
    const opts = [];
    (plots || []).forEach((p) => {
      if (selectedFarm && p.farmId != null && String(p.farmId) !== String(selectedFarm)) return;
      if (seen.has(p.id)) return;
      seen.add(p.id);
      opts.push({ id: p.id, label: p.name });
    });
    return opts;
  }, [plots, filters.farmId]);

  const cropOptions = useMemo(() => {
    const seen = new Set();
    const opts = [];
    (cycles || []).forEach((c) => {
      const crop = c.cropName;
      if (!crop || seen.has(crop)) return;
      seen.add(crop);
      opts.push({ id: crop, label: crop });
    });
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  }, [cycles]);

  /* Always date-sorted, newest first. */
  const sortedCycles = useMemo(() => {
    return [...cycles].sort((a, b) => {
      const dateA = effectiveCycleDate(a);
      const dateB = effectiveCycleDate(b);
      if (dateA === dateB) return (b.id || 0) - (a.id || 0);
      return dateA < dateB ? 1 : -1;
    });
  }, [cycles]);

  /* Apply status tab + farm/plot/crop/period filters */
  const filteredCycles = useMemo(() => {
    const { farmId, plotId, crop, dateFrom, dateTo } = filters;
    return sortedCycles.filter((cycle) => {
      // Status tab filter
      if (activeTab !== 'All') {
        const status = cycleStatusOf(cycle);
        const want = activeTab === 'Ongoing' ? 'ACTIVE' : 'COMPLETED';
        if (status !== want) return false;
      }
      // Farm filter
      if (farmId) {
        const farm = resolveCycleFarm(cycle);
        if (!farm.farmId || String(farm.farmId) !== String(farmId)) return false;
      }
      // Plot filter
      if (plotId) {
        const plotMatch = cycle.plotId != null
          ? String(cycle.plotId) === String(plotId)
          : cycle.plotName === plotOptions.find((p) => String(p.id) === String(plotId))?.label;
        if (!plotMatch) return false;
      }
      // Crop filter (case-insensitive)
      if (crop) {
        if (!cycle.cropName || cycle.cropName.toLowerCase() !== crop.toLowerCase()) return false;
      }
      // Period filter on planting date
      if (dateFrom || dateTo) {
        const planting = cycle.plantingDate;
        if (!planting) return false;
        const d = new Date(planting + 'T00:00:00');
        if (isNaN(d.getTime())) return false;
        if (dateFrom && d < new Date(dateFrom + 'T00:00:00')) return false;
        if (dateTo && d > new Date(dateTo + 'T00:00:00')) return false;
      }
      return true;
    });
  }, [sortedCycles, activeTab, filters, resolveCycleFarm, plotOptions]);

  const ongoingCount = filteredCycles.filter((c) => cycleStatusOf(c) === 'ACTIVE').length;
  const completedCount = filteredCycles.filter((c) => cycleStatusOf(c) === 'COMPLETED').length;

  const totalHarvestedKg = filteredCycles
    .filter((c) => cycleStatusOf(c) === 'COMPLETED')
    .reduce((sum, c) => {
      const qty = c.harvestedQuantity || 0;
      const unit = ((c.harvestedUnit || 'KG') + '').toUpperCase();
      if (unit === 'TONS') return sum + qty * 1000;
      if (unit === 'KG') return sum + qty;
      return sum;
    }, 0);

  const totalHarvestLabel = totalHarvestedKg >= 1000
    ? `${(totalHarvestedKg / 1000).toFixed(1)} t`
    : `${Math.round(totalHarvestedKg)} kg`;

  const activeCycle = sortedCycles.find((c) => c.id === selectedCycleId) || null;

  // How many filters are currently active (for the badge)
  const activeFilterCount = useMemo(() => {
    const { farmId, plotId, crop, dateFrom, dateTo } = filters;
    return [Boolean(farmId), Boolean(plotId), Boolean(crop), Boolean(dateFrom), Boolean(dateTo)]
      .filter(Boolean).length;
  }, [filters]);

  const handleCycleUpdated = (updated) => {
    if (!updated?.id) return;
    setCycles((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
  };

  const clearFilters = useCallback(() => {
    setFilters({ farmId: '', plotId: '', crop: '', dateFrom: '', dateTo: '' });
  }, []);

  const tabs = [
    { id: 'All', count: filteredCycles.length },
    { id: 'Ongoing', count: ongoingCount },
    { id: 'Completed', count: completedCount }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Summary metrics (reflect filtered results) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        <MetricCard
          label="Total cycles"
          value={filteredCycles.length}
          subtext={`${ongoingCount} ongoing · ${completedCount} completed`}
          icon={<IconCrop size={18} color="var(--color-brand-primary)" />}
        />
        <MetricCard
          label="Ongoing cycles"
          value={ongoingCount}
          subtext="Crops currently in the field"
          icon={<IconCalendar size={18} color="var(--color-brand-primary)" />}
        />
        <MetricCard
          label="Completed cycles"
          value={completedCount}
          subtext="Harvested to date"
          icon={<IconCheckCircle size={18} color="var(--color-brand-primary)" />}
          iconBg="#E6F6F4"
        />
        <MetricCard
          label="Total harvested"
          value={totalHarvestLabel}
          subtext="All recorded harvests"
          icon={<IconTrendingUp size={18} color="var(--color-brand-primary)" />}
          iconBg="#FEF3C7"
        />
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '10px 0'
      }}>
        {/* Filter chips (active filters with remove) */}
        {activeFilterCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Filtering:
            </span>
            {filters.farmId && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: 'var(--radius-pill)',
                padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #FDE68A'
              }}>
                {farmOptions.find((f) => String(f.id) === String(filters.farmId))?.label || 'Farm'}
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, farmId: '' }))}
                  style={{ background: 'none', border: 'none', color: '#92400E', cursor: 'pointer', padding: 0, fontSize: '0.75rem', lineHeight: 1 }}
                >
                  <IconClose size={12} color="currentColor" />
                </button>
              </span>
            )}
            {filters.plotId && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: 'var(--radius-pill)',
                padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #FDE68A'
              }}>
                {plotOptions.find((p) => String(p.id) === String(filters.plotId))?.label || 'Plot'}
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, plotId: '' }))}
                  style={{ background: 'none', border: 'none', color: '#92400E', cursor: 'pointer', padding: 0, fontSize: '0.75rem', lineHeight: 1 }}
                >
                  <IconClose size={12} color="currentColor" />
                </button>
              </span>
            )}
            {filters.crop && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: 'var(--radius-pill)',
                padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #FDE68A'
              }}>
                {filters.crop}
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, crop: '' }))}
                  style={{ background: 'none', border: 'none', color: '#92400E', cursor: 'pointer', padding: 0, fontSize: '0.75rem', lineHeight: 1 }}
                >
                  <IconClose size={12} color="currentColor" />
                </button>
              </span>
            )}
            {(filters.dateFrom || filters.dateTo) && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: 'var(--radius-pill)',
                padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #FDE68A'
              }}>
                Period: {filters.dateFrom || '—'} to {filters.dateTo || '—'}
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, dateFrom: '', dateTo: '' }))}
                  style={{ background: 'none', border: 'none', color: '#92400E', cursor: 'pointer', padding: 0, fontSize: '0.75rem', lineHeight: 1 }}
                >
                  <IconClose size={12} color="currentColor" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={clearFilters}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                backgroundColor: 'transparent', color: 'var(--color-brand-primary)',
                fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              <IconClose size={14} color="currentColor" />
              <span>Clear all</span>
            </button>
          </div>
        )}

        {/* Filter controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
              Farm
            </label>
            <select
              value={filters.farmId}
              onChange={(e) => {
                const val = e.target.value;
                setFilters((prev) => ({ ...prev, farmId: val, plotId: val ? '' : prev.plotId }));
              }}
              style={{
                padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--color-border-input)',
                backgroundColor: '#FFFFFF', fontSize: '0.8125rem', color: 'var(--color-text-primary)',
                cursor: 'pointer', minWidth: '140px'
              }}
            >
              <option value="">All farms</option>
              {farmOptions.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
              Plot
            </label>
            <select
              value={filters.plotId}
              onChange={(e) => setFilters((prev) => ({ ...prev, plotId: e.target.value }))}
              style={{
                padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--color-border-input)',
                backgroundColor: '#FFFFFF', fontSize: '0.8125rem', color: 'var(--color-text-primary)',
                cursor: 'pointer', minWidth: '140px'
              }}
            >
              <option value="">All plots</option>
              {plotOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
              Crop
            </label>
            <select
              value={filters.crop}
              onChange={(e) => setFilters((prev) => ({ ...prev, crop: e.target.value }))}
              style={{
                padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--color-border-input)',
                backgroundColor: '#FFFFFF', fontSize: '0.8125rem', color: 'var(--color-text-primary)',
                cursor: 'pointer', minWidth: '140px'
              }}
            >
              <option value="">All crops</option>
              {cropOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
              Period
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
              style={{
                padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--color-border-input)',
                backgroundColor: '#FFFFFF', fontSize: '0.8125rem', color: 'var(--color-text-primary)'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>to</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
              style={{
                padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--color-border-input)',
                backgroundColor: '#FFFFFF', fontSize: '0.8125rem', color: 'var(--color-text-primary)'
              }}
            />
          </div>

        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  fontSize: '0.875rem',
                  fontWeight: isSelected ? 600 : 500,
                  backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                  color: isSelected ? 'var(--color-text-primary, #19201C)' : 'var(--color-text-muted, #788680)',
                  border: isSelected ? '1px solid var(--color-border-subtle, #ECE7DC)' : '1px solid transparent',
                  boxShadow: isSelected ? 'var(--shadow-subtle, 0 1px 2px rgba(22,66,48,0.06))' : 'none',
                  transition: 'all var(--transition-fast, 150ms ease)',
                  cursor: 'pointer'
                }}
              >
                {tab.id} ({tab.count})
              </button>
            );
          })}
          <button
            onClick={loadData}
            disabled={loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#FFFFFF', border: '1px solid var(--color-border-input, #DFD8CA)',
              padding: '8px 14px', borderRadius: '10px', fontSize: '0.8125rem', fontWeight: 600,
              color: 'var(--color-text-secondary, #4B5752)', cursor: 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            <IconRefresh size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Cycle list */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-border-subtle, #ECE7DC)',
        borderRadius: 'var(--radius-xl, 16px)',
        boxShadow: 'var(--shadow-card, 0 1px 3px rgba(22,66,48,0.05))',
        overflow: 'hidden'
      }}>
        {/* List header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 2fr) minmax(180px, 1.4fr) 110px minmax(140px, 1fr) 110px',
          gap: '16px',
          padding: '14px 24px',
          backgroundColor: 'var(--color-surface-subtle, #F4EFE6)',
          borderBottom: '1px solid var(--color-border-subtle, #ECE7DC)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--color-text-secondary, #4B5752)',
          letterSpacing: '0.03em'
        }}>
          <span>Cycle</span>
          <span>Date (planting → harvest)</span>
          <span>Status</span>
          <span>Cycle progress</span>
          <span style={{ textAlign: 'right' }}>Detail</span>
        </div>

        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted, #788680)', fontSize: '0.875rem' }}>
            Loading your production cycles…
          </div>
        ) : loadError ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ color: '#B91C1C', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
              {loadError}
            </div>
            <button
              onClick={loadData}
              style={{
                marginTop: '10px', padding: '8px 16px', borderRadius: '10px',
                backgroundColor: 'var(--color-brand-primary, #3E7B52)', color: '#FFFFFF',
                border: 'none', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer'
              }}
            >
              Try again
            </button>
          </div>
        ) : filteredCycles.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              backgroundColor: '#EAF4ED', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <IconFilter size={24} color="#3E7B52" />
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#19201C', margin: '0 0 6px 0' }}>
              {activeFilterCount > 0
                ? 'No cycles match your filters'
                : `No ${activeTab.toLowerCase() === 'all' ? '' : activeTab.toLowerCase() + ' '}cycles yet`}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#788680', maxWidth: '420px', margin: '0 auto' }}>
              {activeFilterCount > 0
                ? 'Try adjusting your farm, plot, crop, or period filters.'
                : 'Open the Crop Production module and create a production cycle. It will appear here with its status, activities, incidents and harvest.'}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                style={{
                  marginTop: '14px', padding: '10px 20px', borderRadius: '10px',
                  backgroundColor: 'var(--color-brand-primary)', color: '#FFFFFF',
                  border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer'
                }}
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          filteredCycles.map((cycle, index) => {
            const status = cycleStatusOf(cycle);
            const plotName = cycle.plotName || (cycle.plot ? cycle.plot.name : 'Plot');
            const isCompleted = status === 'COMPLETED';
            return (
              <div
                key={cycle.id}
                onClick={() => setSelectedCycleId(cycle.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(220px, 2fr) minmax(180px, 1.4fr) 110px minmax(140px, 1fr) 110px',
                  gap: '16px',
                  padding: '18px 24px',
                  alignItems: 'center',
                  borderBottom: index < filteredCycles.length - 1 ? '1px solid var(--color-border-subtle, #ECE7DC)' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FAF8F3'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {/* Cycle identity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    backgroundColor: '#EAF4ED', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#2D7A52'
                  }}>
                    {getCropIcon(cycle.cropName)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.9375rem', fontWeight: 600, color: '#19201C',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {cycle.cropName || 'Crop'} · {plotName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#788680' }}>
                      {(cycle.acreage ?? cycle.acreage === 0) ? `${cycle.acreage} ha` : '—'} ·{' '}
                      Expect <QuantityLabel quantity={cycle.expectedQuantity} unit={cycle.expectedQuantityUnit} />
                      {isCompleted && cycle.harvestedQuantity != null ? (
                        <> · Harvested{' '}
                          <QuantityLabel quantity={cycle.harvestedQuantity} unit={cycle.harvestedUnit} /></>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div style={{ fontSize: '0.8125rem', color: '#4B5752', whiteSpace: 'nowrap' }}>
                  {formatDateDisplay(effectiveCycleDate(cycle))} →{' '}
                  {formatDateDisplay(cycle.plannedHarvestDate || cycle.endDate)}
                </div>

                {/* Status */}
                <div><CycleStatusBadge status={status} /></div>

                {/* Progress */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      flex: 1, height: '6px', borderRadius: '999px',
                      backgroundColor: 'var(--color-border-subtle, #ECE7DC)', overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min(100, Math.max(0, cycle.progress ?? 0))}%`,
                        height: '100%',
                        backgroundColor: isCompleted ? '#2E7D32' : '#3E7B52',
                        borderRadius: '999px'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5752', minWidth: '34px' }}>
                      {cycle.progress ?? 0}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#788680', marginTop: '3px' }}>
                    {cycle.stage || (isCompleted ? 'Harvested' : 'In progress')}
                  </div>
                </div>

                {/* Action */}
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '0.8125rem', fontWeight: 600, color: '#3E7B52'
                  }}>
                    View
                    <IconChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail drawer */}
      <CycleDetailDrawer
        isOpen={selectedCycleId != null}
        cycle={activeCycle}
        farmerId={farmerId}
        onClose={() => setSelectedCycleId(null)}
        onCycleUpdated={handleCycleUpdated}
      />
    </div>
  );
}

export default ProductionView;
