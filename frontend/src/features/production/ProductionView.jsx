import React, { useState, useEffect, useMemo } from 'react';
import { cropCycleService } from '../crops/services/cropCycleService';
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
  IconClose,
  IconRefresh,
  IconChevronRight,
  IconArrowRight,
  IconCheckCircle
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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedCycleId, setSelectedCycleId] = useState(null);

  const loadCycles = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await cropCycleService.getCycles(farmerId, undefined);
      setCycles(Array.isArray(data) ? data : []);
    } catch (err) {
      setLoadError(err?.message || 'Could not load your production cycles.');
      setCycles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (farmerId) loadCycles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmerId]);

  /* Always date-sorted, newest first. The API already sorts; this keeps the
     guarantee after local updates (e.g. harvest recorded). */
  const sortedCycles = useMemo(() => {
    return [...cycles].sort((a, b) => {
      const dateA = effectiveCycleDate(a);
      const dateB = effectiveCycleDate(b);
      if (dateA === dateB) return (b.id || 0) - (a.id || 0);
      return dateA < dateB ? 1 : -1;
    });
  }, [cycles]);

  const ongoingCount = sortedCycles.filter((c) => cycleStatusOf(c) === 'ACTIVE').length;
  const completedCount = sortedCycles.filter((c) => cycleStatusOf(c) === 'COMPLETED').length;

  const totalHarvestedKg = sortedCycles
    .filter((c) => cycleStatusOf(c) === 'COMPLETED')
    .reduce((sum, c) => {
      const qty = c.harvestedQuantity || 0;
      const unit = ((c.harvestedUnit || 'KG') + '').toUpperCase();
      if (unit === 'TONS') return sum + qty * 1000;
      if (unit === 'KG') return sum + qty;
      return sum; // BAGS cannot be converted safely to kg
    }, 0);

  const totalHarvestLabel = totalHarvestedKg >= 1000
    ? `${(totalHarvestedKg / 1000).toFixed(1)} t`
    : `${Math.round(totalHarvestedKg)} kg`;

  const activeCycle = sortedCycles.find((c) => c.id === selectedCycleId) || null;

  const handleCycleUpdated = (updated) => {
    if (!updated?.id) return;
    setCycles((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
  };

  const tabs = [
    { id: 'All', count: sortedCycles.length },
    { id: 'Ongoing', count: ongoingCount },
    { id: 'Completed', count: completedCount }
  ];

  const visibleCycles = sortedCycles.filter((c) => {
    if (activeTab === 'All') return true;
    const status = cycleStatusOf(c);
    if (activeTab === 'Ongoing') return status === 'ACTIVE';
    return status === 'COMPLETED';
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Summary metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        <MetricCard
          label="Total cycles"
          value={sortedCycles.length}
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

      {/* Filter tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
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
        </div>
        <button
          onClick={loadCycles}
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
        ) : visibleCycles.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              backgroundColor: '#EAF4ED', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <IconWheat size={24} color="#3E7B52" />
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#19201C', margin: '0 0 6px 0' }}>
              No {activeTab.toLowerCase() === 'all' ? '' : activeTab.toLowerCase() + ' '}cycles yet
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#788680', maxWidth: '420px', margin: '0 auto' }}>
              Open the Crop Production module and create a production cycle. It will appear here with its
              status, activities, incidents and harvest.
            </p>
          </div>
        ) : (
          visibleCycles.map((cycle, index) => {
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
                  borderBottom: index < visibleCycles.length - 1 ? '1px solid var(--color-border-subtle, #ECE7DC)' : 'none',
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
