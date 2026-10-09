import React, { useState, useEffect } from 'react';
import { CropCycleCard } from '../../shared/components/CropCycleCard';
import { NewCropCycleModal } from './NewCropCycleModal';
import { cropCycleService } from './services/cropCycleService';
import {
  IconPlus,
  IconSprout,
  IconTomato,
  IconBean,
  IconLeaf,
  IconWheat
} from '../../shared/components/Icons';

const DEFAULT_CYCLES = [
  {
    id: 1,
    cropName: 'Maize',
    plotName: 'Plot A',
    acreage: 2.5,
    status: 'ACTIVE',
    plantingDate: '2026-07-12',
    plannedHarvestDate: '2026-11-28',
    expectedQuantity: 5000,
    expectedQuantityUnit: 'kg',
    stage: 'Vegetative growth',
    progress: 62,
    subStatus: 'On track'
  },
  {
    id: 2,
    cropName: 'Tomatoes',
    plotName: 'Plot B',
    acreage: 1.0,
    status: 'ACTIVE',
    plantingDate: '2026-08-03',
    plannedHarvestDate: '2026-10-18',
    expectedQuantity: 2800,
    expectedQuantityUnit: 'kg',
    stage: 'Flowering',
    progress: 74,
    subStatus: 'On track'
  },
  {
    id: 3,
    cropName: 'Beans',
    plotName: 'Plot C',
    acreage: 0.8,
    status: 'ACTIVE',
    plantingDate: '2026-09-20',
    plannedHarvestDate: '2026-12-14',
    expectedQuantity: 1200,
    expectedQuantityUnit: 'kg',
    stage: 'Planting',
    progress: 29,
    subStatus: 'On track'
  },
  {
    id: 4,
    cropName: 'Cassava',
    plotName: 'Plot D',
    acreage: 2.0,
    status: 'COMPLETED',
    plantingDate: '2026-02-15',
    plannedHarvestDate: '2026-11-30',
    expectedQuantity: 7900,
    expectedQuantityUnit: 'kg',
    stage: 'Harvested',
    progress: 100,
    subStatus: 'Final yield 7.9 t'
  }
];

function getCropIcon(cropName) {
  const name = (cropName || '').toLowerCase();
  if (name.includes('tomato')) return <IconTomato size={20} color="#2D7A52" />;
  if (name.includes('bean')) return <IconBean size={20} color="#2D7A52" />;
  if (name.includes('cassava') || name.includes('leaf') || name.includes('potato')) return <IconLeaf size={20} color="#2D7A52" />;
  return <IconSprout size={20} color="#2D7A52" />;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function CropProductionView({ farmerId = 1, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Active');
  const [cycles, setCycles] = useState(DEFAULT_CYCLES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCycles();
  }, [farmerId]);

  const loadCycles = async () => {
    setLoading(true);
    try {
      const data = await cropCycleService.getCycles(farmerId);
      if (data && data.length > 0) {
        setCycles(data);
      } else {
        setCycles(DEFAULT_CYCLES);
      }
    } catch (err) {
      console.warn('Could not fetch cycles from API, using fallback defaults:', err);
      setCycles(DEFAULT_CYCLES);
    } finally {
      setLoading(false);
    }
  };

  const handleCycleCreated = (newCycle) => {
    setCycles(prev => [newCycle, ...prev]);
    setActiveTab('Active');
  };

  const filteredCycles = cycles.filter(c => {
    const statusNormalized = (c.status || '').toUpperCase();
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return statusNormalized === 'ACTIVE';
    if (activeTab === 'Completed') return statusNormalized === 'COMPLETED';
    return true;
  });

  // Calculate dynamic metrics
  const activeCyclesCount = cycles.filter(c => (c.status || '').toUpperCase() === 'ACTIVE').length;
  const totalCultivatedArea = cycles
    .filter(c => (c.status || '').toUpperCase() === 'ACTIVE')
    .reduce((sum, c) => sum + (c.acreage || 0), 0);
  
  const totalExpectedTons = cycles
    .filter(c => (c.status || '').toUpperCase() === 'ACTIVE')
    .reduce((sum, c) => {
      const qty = c.expectedQuantity || 0;
      const unit = (c.expectedQuantityUnit || 'kg').toLowerCase();
      if (unit === 't' || unit === 'tons') return sum + qty;
      return sum + (qty / 1000.0);
    }, 0);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Control Bar: Tabs & Action Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Navigation Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {['All', 'Active', 'Completed'].map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.875rem',
                  fontWeight: isSelected ? 600 : 500,
                  backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                  color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  border: isSelected ? '1px solid var(--color-card-border)' : '1px solid transparent',
                  boxShadow: isSelected ? 'var(--shadow-subtle)' : 'none',
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* New Production Cycle Action */}
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-brand-primary)',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            boxShadow: 'var(--shadow-subtle)',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-brand-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-brand-primary)'}
        >
          <IconPlus size={16} />
          <span>New Production Cycle</span>
        </button>
      </div>

      {/* Summary Metrics Row (3 Columns) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Active cycles
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {activeCyclesCount}
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Cultivated area
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {totalCultivatedArea.toFixed(1)} ha
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Expected production
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {totalExpectedTons > 0 ? `${totalExpectedTons.toFixed(1)} t` : '—'}
          </div>
        </div>
      </div>

      {/* 2-Column Crop Cycles Grid */}
      {filteredCycles.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-card-border)',
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-brand-tint, #EAF4ED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconWheat size={24} color="var(--color-brand-primary, #164230)" />
            </div>
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
            No {activeTab.toLowerCase()} cycles found
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto 20px auto' }}>
            Click "New Production Cycle" above to schedule planting, target outputs, and follow your crops through harvest.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-brand-primary)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            + Create your first cycle
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px'
        }}>
          {filteredCycles.map((cycle) => (
            <CropCycleCard
              key={cycle.id}
              icon={getCropIcon(cycle.cropName)}
              cropName={cycle.cropName}
              plotName={cycle.plotName || (cycle.plot ? cycle.plot.name : 'Plot')}
              area={`${cycle.acreage || 0} ha cultivated`}
              status={(cycle.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? 'Active' : 'Completed'}
              plantingDate={formatDateDisplay(cycle.plantingDate || cycle.startDate)}
              expectedHarvest={formatDateDisplay(cycle.plannedHarvestDate || cycle.endDate)}
              expectedQuantity={cycle.expectedQuantity}
              expectedQuantityUnit={cycle.expectedQuantityUnit || 'kg'}
              stage={cycle.stage || 'Planting'}
              progress={cycle.progress ?? 0}
              subStatus={cycle.subStatus || ((cycle.status || '').toUpperCase() === 'ACTIVE' ? 'On track' : 'Completed')}
              onViewDetails={() => onNavigate && onNavigate('activities')}
            />
          ))}
        </div>
      )}

      {/* Creation Modal */}
      <NewCropCycleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCycleCreated={handleCycleCreated}
        farmerId={farmerId}
      />
    </div>
  );
}
