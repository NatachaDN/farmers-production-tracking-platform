import React, { useState, useEffect } from 'react';
import { PlotCard } from '../../shared/components/PlotCard';
import { AddPlotModal } from './components/AddPlotModal';
import { NewFarmModal } from './components/NewFarmModal';
import { EditFarmModal } from './components/EditFarmModal';
import { plotService } from './services/plotService';
import { farmService } from './services/farmService';
import {
  IconFarms,
  IconPlus,
  IconSearch,
  IconFilter,
  IconSprout,
  IconTomato,
  IconBean,
  IconLeaf,
  IconCheck,
  IconPencil,
  IconTrash,
  IconWarning,
  IconClose,
  IconMapPin,
  IconGlobe
} from '../../shared/components/Icons';

const INITIAL_PLOTS = [
  {
    id: 1,
    title: 'Plot A — Maize',
    crop: 'Maize',
    areaVal: 2.5,
    area: '2.5 ha cultivated area',
    stage: 'Vegetative growth',
    location: 'North Field, Section 1',
    progress: 62,
    icon: <IconSprout size={20} color="#2D7A52" />
  },
  {
    id: 2,
    title: 'Plot B — Tomatoes',
    crop: 'Tomatoes',
    areaVal: 1.0,
    area: '1.0 ha cultivated area',
    stage: 'Flowering',
    location: 'East Field, Block B',
    progress: 74,
    icon: <IconTomato size={20} color="#2D7A52" />
  },
  {
    id: 3,
    title: 'Plot C — Beans',
    crop: 'Beans',
    areaVal: 0.8,
    area: '0.8 ha cultivated area',
    stage: 'Planting',
    location: 'South Plot, Zone 2',
    progress: 29,
    icon: <IconBean size={20} color="#2D7A52" />
  },
  {
    id: 4,
    title: 'Plot D — Cassava',
    crop: 'Cassava',
    areaVal: 2.0,
    area: '2.0 ha cultivated area',
    stage: 'Maturing',
    location: 'West Plot, Hillside',
    progress: 84,
    icon: <IconLeaf size={20} color="#2D7A52" />
  }
];

function getIconForCrop(crop) {
  const c = (crop || '').toLowerCase();
  if (c.includes('tomato')) return <IconTomato size={20} color="#2D7A52" />;
  if (c.includes('bean')) return <IconBean size={20} color="#2D7A52" />;
  if (c.includes('cassava')) return <IconLeaf size={20} color="#2D7A52" />;
  return <IconSprout size={20} color="#2D7A52" />;
}

export function FarmsAndPlotsView({ farmerId = 1 }) {
  const [farms, setFarms] = useState([]);
  const [activeFarm, setActiveFarm] = useState(null);
  const [plots, setPlots] = useState(INITIAL_PLOTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewTab, setViewTab] = useState('all-farms'); // 'all-farms' | 'plots'
  
  // Modals
  const [isAddPlotModalOpen, setIsAddPlotModalOpen] = useState(false);
  const [isNewFarmModalOpen, setIsNewFarmModalOpen] = useState(false);
  const [isEditFarmModalOpen, setIsEditFarmModalOpen] = useState(false);
  const [farmToEdit, setFarmToEdit] = useState(null);

  // Delete Confirmation Modal states
  const [farmToDelete, setFarmToDelete] = useState(null);
  const [isDeletingFarm, setIsDeletingFarm] = useState(false);

  const [plotToDelete, setPlotToDelete] = useState(null);
  const [isDeletingPlot, setIsDeletingPlot] = useState(false);

  const [toast, setToast] = useState(null);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Load farms & plots on mount
  useEffect(() => {
    loadFarmsAndPlots();
  }, [farmerId]);

  const loadFarmsAndPlots = async () => {
    try {
      const farmsData = await farmService.getFarms(farmerId);
      if (farmsData && Array.isArray(farmsData) && farmsData.length > 0) {
        setFarms(farmsData);
        const defaultOrFirst = farmsData.find(f => f.isDefault) || farmsData[0];
        setActiveFarm(defaultOrFirst);
      } else {
        const fallbackFarm = {
          id: 1,
          name: 'Green Acres Farm',
          location: 'Nakuru County, Kenya',
          country: 'Kenya',
          district: 'Nakuru',
          description: 'Main farm',
          isDefault: true,
          plotCount: 4,
          totalArea: 6.3
        };
        setFarms([fallbackFarm]);
        setActiveFarm(fallbackFarm);
      }
    } catch (err) {
      console.warn('Backend API farms fetch failed, using fallback:', err);
      const fallbackFarm = {
        id: 1,
        name: 'Green Acres Farm',
        location: 'Nakuru County, Kenya',
        country: 'Kenya',
        district: 'Nakuru',
        description: 'Main farm',
        isDefault: true,
        plotCount: 4,
        totalArea: 6.3
      };
      setFarms([fallbackFarm]);
      setActiveFarm(fallbackFarm);
    }

    try {
      const data = await plotService.getPlots(farmerId);
      if (data && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((p) => ({
          id: p.id,
          title: p.name,
          crop: p.cropType || 'Crop',
          areaVal: p.area,
          area: `${p.area} ha cultivated area`,
          stage: p.stage || 'Planting',
          location: p.location,
          progress: p.stage === 'Flowering' ? 74 : p.stage === 'Vegetative growth' ? 62 : p.stage === 'Maturing' ? 84 : 29,
          icon: getIconForCrop(p.cropType || p.name)
        }));
        setPlots(mapped);
      }
    } catch (err) {
      console.warn('Backend API plots fetch failed, using local plots:', err);
    }
  };

  const handleFarmCreated = (newFarm) => {
    setFarms(prev => [...prev, newFarm]);
    if (newFarm.isDefault || farms.length === 0) {
      setActiveFarm(newFarm);
    }
    showNotification(`Farm "${newFarm.name}" successfully created!`);
  };

  const handleFarmUpdated = (updatedFarm) => {
    setFarms(prev => prev.map(f => f.id === updatedFarm.id ? updatedFarm : f));
    if (activeFarm?.id === updatedFarm.id) {
      setActiveFarm(updatedFarm);
    }
    showNotification(`Farm "${updatedFarm.name}" details updated successfully!`);
  };

  const confirmDeleteFarm = async () => {
    if (!farmToDelete) return;
    setIsDeletingFarm(true);
    try {
      await farmService.deleteFarm(farmerId, farmToDelete.id);
    } catch (err) {
      console.warn('Backend delete farm failed, removing locally:', err);
    }

    const updatedFarms = farms.filter(f => f.id !== farmToDelete.id);
    setFarms(updatedFarms);

    // If active farm was deleted, switch to new default or first remaining farm
    if (activeFarm?.id === farmToDelete.id) {
      const nextActive = updatedFarms.find(f => f.isDefault) || updatedFarms[0] || null;
      setActiveFarm(nextActive);
    }

    showNotification(`Farm "${farmToDelete.name}" was deleted successfully.`);
    setFarmToDelete(null);
    setIsDeletingFarm(false);
  };

  const confirmDeletePlot = async () => {
    if (!plotToDelete) return;
    setIsDeletingPlot(true);
    try {
      await plotService.deletePlot(farmerId, plotToDelete.id);
    } catch (err) {
      console.warn('Backend delete plot failed, removing locally:', err);
    }

    setPlots(prev => prev.filter(p => p.id !== plotToDelete.id));
    showNotification(`Plot "${plotToDelete.title}" was deleted successfully.`);
    setPlotToDelete(null);
    setIsDeletingPlot(false);
  };

  const handleAddPlot = async (plotData) => {
    let savedPlot;
    try {
      savedPlot = await plotService.createPlot(farmerId, {
        ...plotData,
        farmId: activeFarm?.id
      });
    } catch (err) {
      console.warn('Backend save failed, adding to local state:', err);
    }

    const newPlotItem = {
      id: savedPlot?.id || Date.now(),
      title: plotData.name,
      crop: plotData.cropType || 'Crop',
      areaVal: plotData.area,
      area: `${plotData.area} ha cultivated area`,
      stage: plotData.stage || 'Planting',
      location: plotData.location,
      progress: plotData.stage === 'Flowering' ? 74 : plotData.stage === 'Vegetative growth' ? 62 : plotData.stage === 'Maturing' ? 84 : 20,
      icon: getIconForCrop(plotData.cropType || plotData.name)
    };

    setPlots((prev) => [newPlotItem, ...prev]);
    showNotification(`Plot "${plotData.name}" (${plotData.area} ha) successfully added to ${activeFarm?.name || 'farm'}!`);
  };

  const filteredPlots = plots.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.stage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalArea = plots.reduce((acc, curr) => acc + (curr.areaVal || 0), 0).toFixed(1);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            backgroundColor: '#164230',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md, 10px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 1200,
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#3E7B52',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconCheck size={14} color="#FFFFFF" />
          </div>
          <span>{toast}</span>
        </div>
      )}

      {/* Add Plot Modal */}
      <AddPlotModal
        isOpen={isAddPlotModalOpen}
        onClose={() => setIsAddPlotModalOpen(false)}
        onAddPlot={handleAddPlot}
      />

      {/* New Farm Modal */}
      <NewFarmModal
        isOpen={isNewFarmModalOpen}
        onClose={() => setIsNewFarmModalOpen(false)}
        onFarmCreated={handleFarmCreated}
        farmerId={farmerId}
      />

      {/* Edit Farm Modal */}
      <EditFarmModal
        isOpen={isEditFarmModalOpen}
        onClose={() => {
          setIsEditFarmModalOpen(false);
          setFarmToEdit(null);
        }}
        farm={farmToEdit || activeFarm}
        onFarmUpdated={handleFarmUpdated}
        farmerId={farmerId}
      />

      {/* Delete Farm Confirmation Modal */}
      {farmToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(19, 32, 28, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 40px rgba(22, 66, 48, 0.2)',
            width: '100%',
            maxWidth: '460px',
            padding: '28px',
            border: '1px solid var(--color-card-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <IconWarning size={22} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                  Delete Farm Holding?
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '6px', margin: 0, lineHeight: 1.5 }}>
                  Are you sure you want to delete <strong style={{ color: 'var(--color-text-primary)' }}>"{farmToDelete.name}"</strong>?
                  All associated plots will be unlinked or reassigned to your primary default farm.
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border-subtle)'
            }}>
              <button
                type="button"
                onClick={() => setFarmToDelete(null)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteFarm}
                disabled={isDeletingFarm}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: isDeletingFarm ? 'not-allowed' : 'pointer',
                  opacity: isDeletingFarm ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <IconTrash size={16} />
                <span>{isDeletingFarm ? 'Deleting...' : 'Delete Farm'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Plot Confirmation Modal */}
      {plotToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(19, 32, 28, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 40px rgba(22, 66, 48, 0.2)',
            width: '100%',
            maxWidth: '460px',
            padding: '28px',
            border: '1px solid var(--color-card-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <IconWarning size={22} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                  Delete Land Plot?
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '6px', margin: 0, lineHeight: 1.5 }}>
                  Are you sure you want to delete <strong style={{ color: 'var(--color-text-primary)' }}>"{plotToDelete.title}"</strong>?
                  This action cannot be undone and will remove the plot and its associated metrics.
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border-subtle)'
            }}>
              <button
                type="button"
                onClick={() => setPlotToDelete(null)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePlot}
                disabled={isDeletingPlot}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: isDeletingPlot ? 'not-allowed' : 'pointer',
                  opacity: isDeletingPlot ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <IconTrash size={16} />
                <span>{isDeletingPlot ? 'Deleting...' : 'Delete Plot'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar with Title & View Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Farms & Land Holdings
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '4px', margin: 0 }}>
            Manage all your registered farm holdings, view plot allocations, and edit or delete plots and farms.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* View Segmented Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: '#EFEAE2',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            gap: '4px'
          }}>
            <button
              onClick={() => setViewTab('all-farms')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: viewTab === 'all-farms' ? '#FFFFFF' : 'transparent',
                color: viewTab === 'all-farms' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                boxShadow: viewTab === 'all-farms' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              All Farms ({farms.length})
            </button>
            <button
              onClick={() => setViewTab('plots')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: viewTab === 'plots' ? '#FFFFFF' : 'transparent',
                color: viewTab === 'plots' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                boxShadow: viewTab === 'plots' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Plots & Crops ({plots.length})
            </button>
          </div>

          {/* + Add Farm Button */}
          <button
            onClick={() => setIsNewFarmModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-brand-primary)',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-subtle)',
              transition: 'background-color var(--transition-fast)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-brand-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-brand-primary)')}
          >
            <IconPlus size={16} />
            <span>Create New Farm</span>
          </button>
        </div>
      </div>

      {/* FARM SELECTION LIST / ALL FARMS GRID VIEW */}
      {viewTab === 'all-farms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
              Registered Farms ({farms.length})
            </h2>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Click on any farm card to activate and manage its individual plots
            </span>
          </div>

          {farms.length === 0 ? (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '40px',
              textAlign: 'center',
              border: '1px dashed var(--color-card-border)'
            }}>
              <IconFarms size={40} color="var(--color-text-muted)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '12px' }}>No farms created yet</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                Create your first farm holding to organize your agricultural plots and production cycles.
              </p>
              <button
                onClick={() => setIsNewFarmModalOpen(true)}
                style={{
                  backgroundColor: 'var(--color-brand-primary)',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                + Create First Farm
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {farms.map((f) => {
                const isActive = activeFarm?.id === f.id;
                const plotCount = f.plotCount !== undefined ? f.plotCount : plots.length;
                const farmArea = f.totalArea !== undefined ? f.totalArea : (f.size || totalArea);

                return (
                  <div
                    key={f.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 'var(--radius-xl)',
                      border: isActive ? '2px solid var(--color-brand-primary)' : '1px solid var(--color-card-border)',
                      padding: '22px',
                      boxShadow: isActive ? '0 6px 20px rgba(22, 66, 48, 0.12)' : 'var(--shadow-card)',
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      gap: '16px',
                      position: 'relative',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Card Header */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: isActive ? 'var(--color-brand-primary)' : 'var(--color-brand-tint)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isActive ? '#FFFFFF' : 'var(--color-brand-primary)'
                          }}>
                            <IconFarms size={20} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                              {f.name}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                              <IconMapPin size={12} />
                              <span>{f.location || 'Location Not Specified'}</span>
                            </div>
                          </div>
                        </div>

                        {f.isDefault && (
                          <span style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            backgroundColor: 'var(--color-brand-tint)',
                            color: 'var(--color-brand-primary)',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            border: '1px solid #C8E2D0',
                            whiteSpace: 'nowrap'
                          }}>
                            Default Container
                          </span>
                        )}
                      </div>

                      {f.description && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                          {f.description}
                        </p>
                      )}
                    </div>

                    {/* Farm Details Badge / Metrics */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: '#F9F6F0',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #ECE7DC'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Plots
                        </div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {plotCount} Plots
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Total Area
                        </div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
                          {farmArea} ha
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Region
                        </div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {f.district || f.country || 'Kenya'}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #F4EFE6' }}>
                      <button
                        onClick={() => {
                          setActiveFarm(f);
                          setViewTab('plots');
                        }}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: isActive ? 'var(--color-brand-tint)' : '#FFFFFF',
                          color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                          border: isActive ? '1px solid #C8E2D0' : '1px solid var(--color-border-subtle)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isActive ? '✓ Selected Active' : 'Select Farm'}
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setFarmToEdit(f);
                            setIsEditFarmModalOpen(true);
                          }}
                          title="Edit Farm"
                          style={{
                            padding: '7px 10px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--color-border-subtle)',
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8125rem',
                            fontWeight: 500
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F4EFE6';
                            e.currentTarget.style.color = 'var(--color-text-primary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--color-text-secondary)';
                          }}
                        >
                          <IconPencil size={14} />
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setFarmToDelete(f)}
                          title="Delete Farm"
                          style={{
                            padding: '8px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FCA5A5',
                            color: '#DC2626',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
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
                          <IconTrash size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ACTIVE FARM OVERVIEW & PLOTS SECTION */}
      {viewTab === 'plots' && (
        <>
          {/* Active Farm Overview Banner */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-card-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px 28px',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-brand-tint)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconFarms size={24} color="var(--color-brand-primary)" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.015em', margin: 0 }}>
                      {activeFarm?.name || 'Green Acres Farm'}
                    </h2>
                    {activeFarm?.isDefault && (
                      <span style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-brand-tint)',
                        color: 'var(--color-brand-primary)',
                        padding: '3px 8px',
                        borderRadius: '999px',
                        border: '1px solid #C8E2D0'
                      }}>
                        Default Container
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '4px', margin: 0 }}>
                    {activeFarm?.location || 'Nakuru County, Kenya'} {activeFarm?.description ? `· ${activeFarm.description}` : ''}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Multiple Farm Switcher dropdown */}
                {farms.length > 1 && (
                  <select
                    value={activeFarm?.id || ''}
                    onChange={(e) => {
                      const f = farms.find(farm => farm.id === Number(e.target.value));
                      if (f) setActiveFarm(f);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-input)',
                      fontSize: '0.8125rem',
                      backgroundColor: '#FFFFFF',
                      color: 'var(--color-text-primary)',
                      fontWeight: 600
                    }}
                  >
                    {farms.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} {f.isDefault ? '(Default)' : ''}
                      </option>
                    ))}
                  </select>
                )}

                {/* Edit Active Farm Button */}
                <button
                  onClick={() => {
                    setFarmToEdit(activeFarm);
                    setIsEditFarmModalOpen(true);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border-subtle)',
                    padding: '9px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F4EFE6';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  <IconPencil size={14} />
                  <span>Edit Active Farm</span>
                </button>

                {/* Delete Active Farm Button */}
                {activeFarm && (
                  <button
                    onClick={() => setFarmToDelete(activeFarm)}
                    title="Delete Active Farm"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      border: '1px solid #FCA5A5',
                      padding: '9px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
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
                    <IconTrash size={16} />
                  </button>
                )}

                {/* + Add Plot Button */}
                <button
                  onClick={() => setIsAddPlotModalOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--color-brand-primary)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-subtle)',
                    transition: 'background-color var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-brand-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-brand-primary)')}
                >
                  <IconPlus size={16} />
                  <span>Add Plot</span>
                </button>
              </div>
            </div>

            {/* Metric Summary Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '24px',
                paddingTop: '20px',
                borderTop: '1px solid #F4EFE6'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total area</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{totalArea} ha</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Plot count</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{plots.length} plots</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Active cycles</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {plots.filter(p => p.stage !== 'Completed' && p.stage !== 'Harvested').length} cycles
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Next harvest</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>Tomatoes · 18 Oct</div>
              </div>
            </div>
          </div>

          {/* Plots Section */}
          <div>
            {/* Section Header with Search & Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Plots in {activeFarm?.name || 'Farm'} ({filteredPlots.length})
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative', width: '220px' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                    <IconSearch size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search plots or crops..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 34px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-input)',
                      backgroundColor: '#FFFFFF',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border-input)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <IconFilter size={14} />
                  <span>All stages</span>
                </button>
              </div>
            </div>

            {/* Plots Grid */}
            {filteredPlots.length === 0 ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                padding: '36px',
                textAlign: 'center',
                border: '1px dashed var(--color-card-border)'
              }}>
                <IconSprout size={36} color="var(--color-text-muted)" />
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '10px', color: 'var(--color-text-primary)' }}>
                  No plots found
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                  {searchTerm ? 'No land plots match your search query.' : 'Add your first plot to start tracking crop cycles and harvests.'}
                </p>
                <button
                  onClick={() => setIsAddPlotModalOpen(true)}
                  style={{
                    backgroundColor: 'var(--color-brand-primary)',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer'
                  }}
                >
                  + Add Plot
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '20px'
                }}
              >
                {filteredPlots.map((plot) => (
                  <PlotCard
                    key={plot.id}
                    icon={plot.icon}
                    title={plot.title}
                    crop={plot.crop}
                    area={plot.area}
                    stage={plot.stage}
                    progress={plot.progress}
                    location={plot.location}
                    onDeletePlot={() => setPlotToDelete(plot)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
