import React, { useState, useEffect } from 'react';
import '../../shared/components/Skeleton.css';
import { CropCycleCard } from '../../shared/components/CropCycleCard';
import { NewCropCycleModal } from './NewCropCycleModal';
import { PlotDetailsModal } from './components/PlotDetailsModal';
import { cropCycleService } from './services/cropCycleService';
import { plotService } from '../farms/services/plotService';
import {
  IconPlus,
  IconSprout,
  IconTomato,
  IconBean,
  IconLeaf,
  IconWheat,
  IconTrash,
  IconCheck,
  IconInputs
} from '../../shared/components/Icons';

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

export function CropProductionView({ farmerId, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Active');
  const [cycles, setCycles] = useState([]);
  const [plots, setPlots] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageCropsOpen, setIsManageCropsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Plot Details Pop-up Modal State
  const [selectedPlotDetails, setSelectedPlotDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Delete confirmation state
  const [cycleToDelete, setCycleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (farmerId) {
      loadCycles();
    }
  }, [farmerId]);

  const loadCycles = async () => {
    if (!farmerId) return;
    setLoading(true);
    try {
      const [cyclesData, plotsData] = await Promise.all([
        cropCycleService.getCycles(farmerId),
        plotService.getPlots(farmerId).catch(() => []),
      ]);
      setCycles(Array.isArray(cyclesData) ? cyclesData : []);
      setPlots(Array.isArray(plotsData) ? plotsData : []);
    } catch (err) {
      console.warn('Could not fetch cycles from API:', err);
      setCycles([]);
      setPlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCycleCreated = (newCycle) => {
    setCycles(prev => [newCycle, ...prev]);
    setActiveTab('Active');
  };

  const handleViewDetails = (cycle) => {
    setSelectedPlotDetails(cycle);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (cycle) => {
    setCycleToDelete(cycle);
  };

  const confirmDeleteCycle = async () => {
    if (!cycleToDelete) return;
    setIsDeleting(true);
    try {
      await cropCycleService.deleteCycle(farmerId, cycleToDelete.id);
      setCycles((prev) => prev.filter((c) => c.id !== cycleToDelete.id));
      showToast(`"${cycleToDelete.cropName}" cycle deleted.`);
      setCycleToDelete(null);
    } catch (err) {
      showToast(err.message || `Failed to delete "${cycleToDelete.cropName}" cycle.`);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCycles = cycles.filter(c => {
    const statusNormalized = (c.status || '').toUpperCase();
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return statusNormalized === 'ACTIVE';
    if (activeTab === 'Completed') return statusNormalized === 'COMPLETED';
    return true;
  });

  const plotsById = plots.reduce((acc, p) => {
    if (p && p.id != null) acc[String(p.id)] = p;
    return acc;
  }, {});

  // Calculate dynamic metrics
  const activeCyclesCount = cycles.filter(c => (c.status || '').toUpperCase() === 'ACTIVE').length;
  const totalCultivatedArea = cycles
    .filter(c => (c.status || '').toUpperCase() === 'ACTIVE')
    .reduce((sum, c) => {
      const linkedPlot = c.plotId != null ? plotsById[String(c.plotId)] : null;
      const areaVal = (c.acreage != null && c.acreage > 0) ? c.acreage : (linkedPlot?.area || 0);
      return sum + areaVal;
    }, 0);

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
      {cycleToDelete && (
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
                <IconTrash size={22} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#19201C', margin: 0 }}>
                  Delete Production Cycle?
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#788680', marginTop: '6px', marginBottom: 0, lineHeight: 1.5 }}>
                  Are you sure you want to delete the <strong style={{ color: '#19201C' }}>"{cycleToDelete.cropName}"</strong> cycle
                  on <strong style={{ color: '#19201C' }}>{cycleToDelete.plotName || 'this plot'}</strong>?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: '12px',
              paddingTop: '16px', borderTop: '1px solid #F4EFE6'
            }}>
              <button
                onClick={() => setCycleToDelete(null)}
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
                onClick={confirmDeleteCycle}
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
                <span>{isDeleting ? 'Deleting...' : 'Delete Cycle'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

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

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Manage Personal Crops Catalog */}
          <button
            onClick={() => onNavigate && onNavigate('crops-catalog')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-text-primary)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              boxShadow: 'var(--shadow-subtle)',
              border: '1px solid var(--color-border-input)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
              e.currentTarget.style.backgroundColor = 'var(--color-brand-tint)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-input)';
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            <IconSprout size={16} color="var(--color-brand-primary)" />
            <span>Manage Crops</span>
          </button>

          {/* Cycle Inputs & Real Costs Action */}
          <button
            id="cycle-inputs-view-btn"
            onClick={() => onNavigate && onNavigate('cycle-inputs')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border-input)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
              e.currentTarget.style.backgroundColor = 'var(--color-brand-tint)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-input)';
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            <IconInputs size={16} color="var(--color-brand-primary)" />
            <span>Cycle Inputs & Costs</span>
          </button>

          {/* Record Harvest Action */}
          <button
            id="record-harvest-view-btn"
            onClick={() => onNavigate && onNavigate('production')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border-input)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
              e.currentTarget.style.backgroundColor = 'var(--color-brand-tint)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-input)';
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            <IconWheat size={16} color="var(--color-brand-primary)" />
            <span>Record Harvest</span>
          </button>

          {/* New Production Cycle Action */}
          <button
            onClick={() => onNavigate ? onNavigate('create-crop-cycle') : setIsModalOpen(true)}
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
      </div>

      {/* Summary Metrics Row (Responsive) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
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
            {loading ? <div className="acrea-skeleton" style={{ width: '40px', height: '30px', borderRadius: '4px' }} /> : activeCyclesCount}
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
            {loading ? <div className="acrea-skeleton" style={{ width: '70px', height: '30px', borderRadius: '4px' }} /> : `${totalCultivatedArea.toFixed(1)} ha`}
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
            {loading ? <div className="acrea-skeleton" style={{ width: '70px', height: '30px', borderRadius: '4px' }} /> : (totalExpectedTons > 0 ? `${totalExpectedTons.toFixed(1)} t` : '—')}
          </div>
        </div>
      </div>

      {/* Crop Cycles Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
          {[1, 2].map((n) => (
            <div key={n} style={{ border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-xl)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="acrea-skeleton" style={{ width: '45%', height: '22px', borderRadius: '4px' }} />
                <div className="acrea-skeleton" style={{ width: '70px', height: '22px', borderRadius: '9999px' }} />
              </div>
              <div className="acrea-skeleton" style={{ width: '30%', height: '14px', borderRadius: '4px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                <div className="acrea-skeleton" style={{ height: '36px', borderRadius: '6px' }} />
                <div className="acrea-skeleton" style={{ height: '36px', borderRadius: '6px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCycles.length === 0 ? (
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
            onClick={() => onNavigate ? onNavigate('create-crop-cycle') : setIsModalOpen(true)}
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
          gap: '20px'
        }}>
          {filteredCycles.map((cycle) => {
            const linkedPlot = cycle.plotId != null ? plotsById[String(cycle.plotId)] : null;
            const resolvedPlotName = cycle.plotName || linkedPlot?.name || (cycle.plot ? cycle.plot.name : null);
            const resolvedAcreage = (cycle.acreage != null && cycle.acreage > 0) ? cycle.acreage : (linkedPlot?.area || 0);
            const enrichedCycle = {
              ...cycle,
              plotName: resolvedPlotName,
              acreage: resolvedAcreage,
              location: linkedPlot?.location || cycle.location,
            };
            return (
              <CropCycleCard
                key={cycle.id}
                icon={getCropIcon(cycle.cropName)}
                cropName={cycle.cropName}
                plotName={resolvedPlotName}
                area={resolvedAcreage > 0 ? `${resolvedAcreage} ha cultivated` : 'No plot area set'}
                status={(cycle.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? 'Active' : 'Completed'}
                plantingDate={formatDateDisplay(cycle.plantingDate || cycle.startDate)}
                expectedHarvest={formatDateDisplay(cycle.plannedHarvestDate || cycle.endDate)}
                expectedQuantity={cycle.expectedQuantity}
                expectedQuantityUnit={cycle.expectedQuantityUnit || 'kg'}
                stage={cycle.stage || 'Planting'}
                progress={cycle.progress ?? 0}
                subStatus={cycle.subStatus || ((cycle.status || '').toUpperCase() === 'ACTIVE' ? 'On track' : 'Completed')}
                onViewDetails={() => handleViewDetails(enrichedCycle)}
                onDelete={() => handleDeleteClick(enrichedCycle)}
              />
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      <NewCropCycleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCycleCreated={handleCycleCreated}
        farmerId={farmerId}
      />

      {/* Plot Details Pop-up Modal */}
      <PlotDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedPlotDetails(null);
        }}
        plot={selectedPlotDetails}
        farmerId={farmerId}
        onGoToActivities={(plotItem) => {
          if (onNavigate) onNavigate('activities');
        }}
      />
    </div>
  );
}
