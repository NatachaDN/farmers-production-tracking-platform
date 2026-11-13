import React, { useState, useEffect } from 'react';
import { FarmSummaryOverview } from './FarmSummaryOverview';
import { farmService } from './services/farmService';
import { plotService } from './services/plotService';
import {
  IconFarms,
  IconSprout,
  IconMapPin,
  IconCheck,
  IconEdit,
  IconWater,
  IconCalendar,
  IconFilter
} from '../../shared/components/Icons';

export function FarmDetailsView({ farmId, onNavigate, user }) {
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [plots, setPlots] = useState(null);
  const [plotsError, setPlotsError] = useState('');
  const [plotAttempt, setPlotAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadFarmDetails() {
      setLoading(true);
      setLoadError(null);
      if (!farmId) {
        setFarm(null);
        setLoadError('No farm selected.');
        setLoading(false);
        return;
      }
      try {
        const data = await farmService.getFarmById(farmId);
        if (isMounted) {
          setFarm(data);
          setEditFormData(data);
        }
      } catch (err) {
        if (isMounted) {
          setFarm(null);
          setLoadError(err?.message || 'Could not load this farm.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadFarmDetails();
    return () => { isMounted = false; };
  }, [farmId]);

  useEffect(() => {
    if (activeTab !== 'Plots' || !farmId || !user?.id) return;
    let current = true;
    setPlots(null);
    setPlotsError('');
    plotService.getPlots(user.id)
      .then(rows => { if (current) setPlots(rows.filter(row => String(row.farmId) === String(farmId))); })
      .catch(failure => { if (current) setPlotsError(failure.message); });
    return () => { current = false; };
  }, [activeTab, farmId, user?.id, plotAttempt]);

  const handleEditSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setEditError(null);

    try {
      const payload = {
        name: editFormData.name,
        type: editFormData.type,
        size: Number(editFormData.size),
        sizeUnit: editFormData.sizeUnit || 'HECTARES',
        description: editFormData.description,
        status: editFormData.status,
        country: editFormData.country,
        region: editFormData.region,
        district: editFormData.district,
        mapImageUrl: editFormData.mapImageUrl,
        soilType: editFormData.soilType,
        slope: editFormData.slope,
        accessToWater: editFormData.accessToWater,
        additionalNotes: editFormData.additionalNotes
      };

      const updated = await farmService.updateFarm(farm.id, payload);
      setFarm(updated);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update farm:', err);
      setEditError(err.message || 'Failed to update farm details');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Loading farm details...
      </div>
    );
  }

  if (!farm) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <p style={{ color: 'var(--color-accent-red)', marginBottom: '12px' }}>{loadError || 'Farm not found.'}</p>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('farms')}
          style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', fontWeight: 600, cursor: 'pointer' }}
        >
          ← Back to farms
        </button>
      </div>
    );
  }

  const currentFarm = farm;


  const tabs = ['Overview', 'Plots', 'Crops', 'Livestock', 'Equipment', 'Activities', 'Settings'];
  const workspaceRoutes = { Crops: 'crops', Livestock: 'livestock', Equipment: 'equipment', Activities: 'calendar', Settings: 'settings' };

  return (
    <div className="workspace-screen fade-in farm-detail-workspace">
      {/* Back Link & Header Bar */}
      <div className="acrea-responsive-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button
            onClick={() => onNavigate && onNavigate('farms')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: 'var(--color-brand-primary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '6px'
            }}
          >
            ← All farms
          </button>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            {currentFarm.name}
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)' }}>
            Monitor and manage all aspects of your farm in one place.
          </p>
        </div>

        {/* Edit Farm Action Button */}
        <button
          onClick={() => {
            setEditFormData(currentFarm);
            setIsEditModalOpen(true);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-card-border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 18px',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            boxShadow: 'var(--shadow-subtle)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4EFE6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
        >
          <IconEdit size={16} color="var(--color-brand-primary)" />
          <span>Edit farm</span>
        </button>
      </div>

      {/* Meta Info Banner Card */}
      <div className="acrea-responsive-grid" style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        boxShadow: 'var(--shadow-card)',
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: '28px',
        alignItems: 'center'
      }}>
        {/* Left Farm Landscape / Map Image */}
        <div style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          height: '160px',
          border: '1px solid var(--color-card-border)'
        }}>
          {currentFarm.mapImageUrl ? <img
            src={currentFarm.mapImageUrl}
            alt={`Saved image for ${currentFarm.name}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          /> : <div style={{ height: '100%', display: 'grid', placeItems: 'center', background: '#F4EFE6', color: 'var(--color-text-muted)' }}>No farm image saved.</div>}
        </div>

        {/* Right Meta Info List */}
        <div className="acrea-responsive-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Farm type</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.0rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              <IconSprout size={18} color="var(--color-brand-primary)" />
              <span>{currentFarm.type === 'CROP' ? 'Crop farm' : currentFarm.type === 'LIVESTOCK' ? 'Livestock farm' : 'Mixed farm'}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Total area</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {currentFarm.size} {currentFarm.sizeUnit === 'HECTARES' ? 'ha' : 'acres'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Location</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {currentFarm.district}, {currentFarm.region}, {currentFarm.country}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Status</div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: currentFarm.status === 'ACTIVE' ? '#EAF4ED' : '#F1F5F9',
              color: currentFarm.status === 'ACTIVE' ? '#2A6740' : '#475569',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 600
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: currentFarm.status === 'ACTIVE' ? '#22C55E' : '#94A3B8'
              }}></span>
              <span>{currentFarm.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="acrea-responsive-toolbar" style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--color-card-border)',
        paddingBottom: '2px'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            aria-pressed={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && <FarmSummaryOverview farmerId={user?.id} farm={currentFarm} onNavigate={onNavigate} />}
      {activeTab !== 'Overview' && <section className="summary-card">
        <h3>{activeTab}</h3>
        {activeTab === 'Plots' ? (
          <>
            {plotsError ? <p className="workspace-error" role="alert">{plotsError}{' '}
              <button className="workspace-button" type="button" onClick={() => setPlotAttempt(value => value + 1)}>Try again</button>
            </p> : !plots ? <p role="status">Loading plots…</p> : plots.length ? <ul className="summary-list">
              {plots.map(plot => <li key={plot.id}><strong>{plot.name}</strong><span>{plot.area} ha{plot.cropType ? ` · ${plot.cropType}` : ''}</span></li>)}
            </ul> : <p className="workspace-empty">This farm has no plots yet.</p>}
            <button className="workspace-button" type="button" onClick={() => onNavigate?.('farms')}>Manage plots</button>
          </>
        ) : (
          <button className="workspace-button" type="button" onClick={() => onNavigate?.(workspaceRoutes[activeTab])}>
            Open {activeTab.toLowerCase()}
          </button>
        )}
      </section>}

      {/* EDIT FARM MODAL */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-card-border)',
            padding: '28px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '18px' }}>
              Edit Farm Information
            </h2>

            {editError && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '14px' }}>
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Farm Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-card-border)' }}
                />
              </div>

              <div className="acrea-responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Farm Type
                  </label>
                  <select
                    value={editFormData.type || 'CROP'}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-card-border)' }}
                  >
                    <option value="CROP">Crop farm</option>
                    <option value="LIVESTOCK">Livestock farm</option>
                    <option value="MIXED">Mixed farm</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Farm Size ({editFormData.sizeUnit === 'ACRES' ? 'acres' : 'ha'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editFormData.size || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, size: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-card-border)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-card-border)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-card-border)', background: '#FFFFFF', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'var(--color-brand-primary)', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
