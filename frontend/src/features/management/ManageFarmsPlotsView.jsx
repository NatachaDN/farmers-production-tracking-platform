import React, { useEffect, useState } from 'react';
import { managerService } from '../manager/services/managerService';
import { adminService } from '../admin/services/adminService';
import { IconPlus, IconSearch, IconClose, IconEdit, IconTrash, IconEye } from '../../shared/components/Icons';
import { EntityDetailModal } from '../../shared/components/EntityDetailModal';

const cardStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #ECE7DC',
  borderRadius: '16px',
  padding: 'clamp(16px, 3vw, 24px)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
};

const inputStyle = {
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid #DFD8CA',
  fontSize: '0.875rem',
  backgroundColor: '#FFFFFF',
  color: '#19201C',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#4B5752',
  marginBottom: '5px',
};

const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '9px 16px',
  borderRadius: '9999px',
  border: 'none',
  backgroundColor: '#164230',
  color: '#FFFFFF',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnSecondary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 14px',
  borderRadius: '9999px',
  border: '1px solid #DFD8CA',
  backgroundColor: '#FFFFFF',
  color: '#19201C',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const FARM_TYPES = ['CROP', 'LIVESTOCK', 'MIXED'];
const SIZE_UNITS = ['HECTARES', 'ACRES'];
const FARM_STATUSES = ['ACTIVE', 'INACTIVE'];
const PLOT_STAGES = ['Planned', 'Planting', 'Vegetative growth', 'Flowering', 'Maturing', 'Harvesting'];

export function ManageFarmsPlotsView({ initialTab = 'farms' }) {
  const [tab, setTab] = useState(initialTab);
  const [search, setSearch] = useState('');
  const [farms, setFarms] = useState([]);
  const [plots, setPlots] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [animalGroups, setAnimalGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [farmModal, setFarmModal] = useState(null); // null | { mode: 'create'|'edit', data }
  const [plotModal, setPlotModal] = useState(null); // null | { mode: 'create'|'edit', data }
  const [detailItem, setDetailItem] = useState(null); // null | { type: 'farm'|'plot', data }
  const [saving, setSaving] = useState(false);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [fList, pList, farmerList, groupList, managerList] = await Promise.all([
        managerService.listFarms(search),
        managerService.listPlots({ search }),
        managerService.getFarmers({}),
        managerService.listAnimalGroups(''),
        adminService.users({ role: 'ROLE_MANAGER' }).catch(() => []),
      ]);
      setFarms(Array.isArray(fList) ? fList : []);
      setPlots(Array.isArray(pList) ? pList : []);
      setFarmers(Array.isArray(farmerList) ? farmerList : []);
      setAnimalGroups(Array.isArray(groupList) ? groupList : []);
      setManagers(Array.isArray(managerList) ? managerList : []);
    } catch (err) {
      setError(err.message || 'Failed to load farms and plots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadAll();
  };

  const openCreateFarm = () => {
    setFarmModal({
      mode: 'create',
      data: {
        farmerId: farmers[0]?.id ? String(farmers[0].id) : '',
        managerId: '',
        name: '',
        type: 'MIXED',
        size: '5',
        sizeUnit: 'HECTARES',
        status: 'ACTIVE',
        country: 'Cameroon',
        region: 'West',
        district: 'Bafoussam',
        description: '',
      },
    });
  };

  const openEditFarm = (farm) => {
    setFarmModal({
      mode: 'edit',
      id: farm.id,
      data: {
        farmerId: String(farm.farmerId),
        managerId: farm.managerId ? String(farm.managerId) : '',
        name: farm.name || '',
        type: farm.type || 'MIXED',
        size: String(farm.size ?? 1),
        sizeUnit: farm.sizeUnit || 'HECTARES',
        status: farm.status || 'ACTIVE',
        country: farm.country || 'Cameroon',
        region: farm.region || '',
        district: farm.district || '',
        description: farm.description || '',
      },
    });
  };

  const saveFarm = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const d = farmModal.data;
      const payload = {
        farmerId: Number(d.farmerId),
        managerId: d.managerId ? Number(d.managerId) : null,
        name: d.name.trim(),
        type: d.type,
        size: Number(d.size) || 1,
        sizeUnit: d.sizeUnit,
        status: d.status,
        country: d.country,
        region: d.region,
        district: d.district,
        description: d.description,
      };
      if (farmModal.mode === 'create') {
        await managerService.createFarm(payload);
        notify('Farm created.');
      } else {
        await managerService.updateFarm(farmModal.id, payload);
        notify('Farm updated.');
      }
      setFarmModal(null);
      await loadAll();
    } catch (err) {
      setError(err.message || 'Could not save farm.');
    } finally {
      setSaving(false);
    }
  };

  const deleteFarm = async (farm) => {
    if (!window.confirm(`Delete farm "${farm.name}"?`)) return;
    try {
      await managerService.deleteFarm(farm.id);
      notify('Farm deleted.');
      await loadAll();
    } catch (err) {
      setError(err.message || 'Could not delete farm.');
    }
  };

  const openCreatePlot = () => {
    const firstFarm = farms[0];
    setPlotModal({
      mode: 'create',
      data: {
        farmerId: firstFarm?.farmerId ? String(firstFarm.farmerId) : (farmers[0]?.id ? String(farmers[0].id) : ''),
        farmId: firstFarm?.id ? String(firstFarm.id) : '',
        name: '',
        area: '1.5',
        location: firstFarm ? `${firstFarm.district || ''}, ${firstFarm.region || ''}`.replace(/^,\s*|,\s*$/g, '') : '',
        cropType: 'Maize',
        stage: 'Planting',
        soilType: '',
        irrigationType: '',
        slope: '',
        notes: '',
        animalGroupId: '',
      },
    });
  };

  const openEditPlot = (plot) => {
    setPlotModal({
      mode: 'edit',
      id: plot.id,
      data: {
        farmerId: String(plot.farmerId),
        farmId: plot.farmId ? String(plot.farmId) : '',
        name: plot.name || '',
        area: String(plot.area ?? 1),
        location: plot.location || '',
        cropType: plot.cropType || 'Maize',
        stage: plot.stage || 'Planting',
        soilType: plot.soilType || '',
        irrigationType: plot.irrigationType || '',
        slope: plot.slope || '',
        notes: plot.notes || '',
        animalGroupId: plot.animalGroupId ? String(plot.animalGroupId) : '',
      },
    });
  };

  const savePlot = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const d = plotModal.data;
      const selectedGroup = d.animalGroupId ? animalGroups.find((g) => String(g.id) === String(d.animalGroupId)) : null;
      const payload = {
        farmerId: Number(d.farmerId),
        farmId: d.farmId ? Number(d.farmId) : null,
        name: d.name.trim(),
        area: Number(d.area) || 1,
        location: d.location.trim(),
        cropType: d.cropType.trim() || 'Unspecified',
        stage: d.stage || 'Planned',
        soilType: d.soilType || null,
        irrigationType: d.irrigationType || null,
        slope: d.slope || null,
        notes: d.notes || null,
        animalGroupId: selectedGroup ? Number(selectedGroup.id) : null,
        animalGroupName: selectedGroup ? selectedGroup.name : null,
      };
      if (plotModal.mode === 'create') {
        await managerService.createPlot(payload);
        notify('Plot created.');
      } else {
        await managerService.updatePlot(plotModal.id, payload);
        notify('Plot updated.');
      }
      setPlotModal(null);
      await loadAll();
    } catch (err) {
      setError(err.message || 'Could not save plot.');
    } finally {
      setSaving(false);
    }
  };

  const deletePlot = async (plot) => {
    if (!window.confirm(`Delete plot "${plot.name}"?`)) return;
    try {
      await managerService.deletePlot(plot.id);
      notify('Plot deleted.');
      await loadAll();
    } catch (err) {
      setError(err.message || 'Could not delete plot.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toast && (
        <div style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: '#EAF4ED', border: '1px solid #B7DEC2', color: '#164230', fontWeight: 600, fontSize: '0.875rem' }}>
          {toast}
        </div>
      )}
      {error && (
        <div style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontWeight: 600, fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setTab('farms')}
              style={tab === 'farms' ? btnPrimary : btnSecondary}
            >
              Farms ({farms.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('plots')}
              style={tab === 'plots' ? btnPrimary : btnSecondary}
            >
              Plots ({plots.length})
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: '1 1 260px', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #DFD8CA', borderRadius: '9999px', padding: '6px 14px', flex: '1 1 180px', maxWidth: '280px', minWidth: 0 }}>
              <IconSearch size={15} color="#7A8680" />
              <input
                type="text"
                placeholder={`Search ${tab}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', minWidth: 0, fontSize: '0.8125rem' }}
              />
            </div>
            <button type="submit" style={btnSecondary}>Filter</button>
            <button
              type="button"
              style={btnPrimary}
              onClick={tab === 'farms' ? openCreateFarm : openCreatePlot}
            >
              <IconPlus size={15} /> {tab === 'farms' ? 'New Farm' : 'New Plot'}
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div style={cardStyle}>
          <p style={{ margin: 0, color: '#64716B' }}>Loading {tab}…</p>
        </div>
      ) : tab === 'farms' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
          {farms.length === 0 ? (
            <div style={cardStyle}><p style={{ margin: 0, color: '#64716B' }}>No farms found.</p></div>
          ) : farms.map((farm) => (
            <div key={farm.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#164230' }}>{farm.name}</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: '#64716B' }}>
                    Owner: <strong>{farm.farmerName}</strong>
                  </p>
                </div>
                <span style={{
                  padding: '3px 9px', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700,
                  backgroundColor: farm.status === 'ACTIVE' ? '#EAF4ED' : '#F4EFE6',
                  color: farm.status === 'ACTIVE' ? '#164230' : '#64716B',
                }}>
                  {farm.status}
                </span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#4B5752', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                <span>Assigned Manager: <strong>{farm.managerName || 'Unassigned'}</strong></span>
                <span>Type: <strong>{farm.type}</strong> · Size: <strong>{farm.size} {farm.sizeUnit?.toLowerCase()}</strong></span>
                <span>Location: {[farm.district, farm.region, farm.country].filter(Boolean).join(', ')}</span>
                <span>Registered Plots: <strong>{farm.plotCount}</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #ECE7DC', paddingTop: '10px' }}>
                <button type="button" style={btnSecondary} onClick={() => setDetailItem({ type: 'farm', data: farm })}>
                  <IconEye size={13} /> View
                </button>
                <button type="button" style={btnSecondary} onClick={() => openEditFarm(farm)}>
                  <IconEdit size={13} /> Edit
                </button>
                <button type="button" style={{ ...btnSecondary, color: '#B91C1C', borderColor: '#FECACA' }} onClick={() => deleteFarm(farm)}>
                  <IconTrash size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
          {plots.length === 0 ? (
            <div style={cardStyle}><p style={{ margin: 0, color: '#64716B' }}>No plots found.</p></div>
          ) : plots.map((plot) => (
            <div key={plot.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#164230' }}>{plot.name}</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: '#64716B' }}>
                    {plot.farmerName} {plot.farmName ? `· ${plot.farmName}` : ''}
                  </p>
                </div>
                <span style={{ padding: '3px 9px', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#EAF4ED', color: '#2A6740' }}>
                  {plot.stage || 'Planned'}
                </span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#4B5752', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                <span>Crop: <strong>{plot.cropType || 'Unspecified'}</strong> · Area: <strong>{plot.area} ha</strong></span>
                <span>Sector: {plot.location}</span>
                {plot.animalGroupName && (
                  <span>Linked Animal Group: <strong>{plot.animalGroupName}</strong></span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #ECE7DC', paddingTop: '10px' }}>
                <button type="button" style={btnSecondary} onClick={() => setDetailItem({ type: 'plot', data: plot })}>
                  <IconEye size={13} /> View
                </button>
                <button type="button" style={btnSecondary} onClick={() => openEditPlot(plot)}>
                  <IconEdit size={13} /> Edit
                </button>
                <button type="button" style={{ ...btnSecondary, color: '#B91C1C', borderColor: '#FECACA' }} onClick={() => deletePlot(plot)}>
                  <IconTrash size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Farm Modal */}
      {farmModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(22,66,48,0.4)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <form onSubmit={saveFarm} style={{ ...cardStyle, width: 'min(96vw, 520px)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#164230' }}>{farmModal.mode === 'create' ? 'Create Farm' : 'Edit Farm'}</h3>
              <button type="button" onClick={() => setFarmModal(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><IconClose size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Owner (Farmer)</label>
                <select value={farmModal.data.farmerId} onChange={(e) => setFarmModal({ ...farmModal, data: { ...farmModal.data, farmerId: e.target.value } })} style={inputStyle} required>
                  {farmers.map((f) => <option key={f.id} value={f.id}>{f.fullName}</option>)}
                </select>
              </div>
              {managers.length > 0 && (
                <div>
                  <label style={labelStyle}>Assigned Manager</label>
                  <select value={farmModal.data.managerId} onChange={(e) => setFarmModal({ ...farmModal, data: { ...farmModal.data, managerId: e.target.value } })} style={inputStyle}>
                    <option value="">Unassigned</option>
                    {managers.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label style={labelStyle}>Farm Name</label>
                <input value={farmModal.data.name} onChange={(e) => setFarmModal({ ...farmModal, data: { ...farmModal.data, name: e.target.value } })} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Farm Type</label>
                <select value={farmModal.data.type} onChange={(e) => setFarmModal({ ...farmModal, data: { ...farmModal.data, type: e.target.value } })} style={inputStyle}>
                  {FARM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Size</label>
                <input type="number" step="0.1" min="0.1" value={farmModal.data.size} onChange={(e) => setFarmModal({ ...farmModal, data: { ...farmModal.data, size: e.target.value } })} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Size Unit</label>
                <select value={farmModal.data.sizeUnit} onChange={(e) => setFarmModal({ ...farmModal, data: { ...farmModal.data, sizeUnit: e.target.value } })} style={inputStyle}>
                  {SIZE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={farmModal.data.status} onChange={(e) => setFarmModal({ ...farmModal, data: { ...farmModal.data, status: e.target.value } })} style={inputStyle}>
                  {FARM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Region</label>
                <input value={farmModal.data.region} onChange={(e) => setFarmModal({ ...farmModal, data: { ...farmModal.data, region: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>District</label>
                <input value={farmModal.data.district} onChange={(e) => setFarmModal({ ...farmModal, data: { ...farmModal.data, district: e.target.value } })} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginTop: '12px' }}>
              <label style={labelStyle}>Description</label>
              <textarea rows={2} value={farmModal.data.description} onChange={(e) => setFarmModal({ ...farmModal, data: { ...farmModal.data, description: e.target.value } })} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button type="button" style={btnSecondary} onClick={() => setFarmModal(null)}>Cancel</button>
              <button type="submit" style={btnPrimary} disabled={saving}>{saving ? 'Saving…' : 'Save Farm'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Plot Modal */}
      {plotModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(22,66,48,0.4)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <form onSubmit={savePlot} style={{ ...cardStyle, width: 'min(96vw, 540px)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#164230' }}>{plotModal.mode === 'create' ? 'Create Plot' : 'Edit Plot'}</h3>
              <button type="button" onClick={() => setPlotModal(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><IconClose size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Farmer</label>
                <select value={plotModal.data.farmerId} onChange={(e) => setPlotModal({ ...plotModal, data: { ...plotModal.data, farmerId: e.target.value } })} style={inputStyle} required>
                  {farmers.map((f) => <option key={f.id} value={f.id}>{f.fullName}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Farm</label>
                <select value={plotModal.data.farmId} onChange={(e) => setPlotModal({ ...plotModal, data: { ...plotModal.data, farmId: e.target.value } })} style={inputStyle}>
                  <option value="">Unassigned</option>
                  {farms.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.farmerName})</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Plot Name</label>
                <input value={plotModal.data.name} onChange={(e) => setPlotModal({ ...plotModal, data: { ...plotModal.data, name: e.target.value } })} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Area (ha)</label>
                <input type="number" step="0.01" min="0.01" value={plotModal.data.area} onChange={(e) => setPlotModal({ ...plotModal, data: { ...plotModal.data, area: e.target.value } })} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Location / Sector</label>
                <input value={plotModal.data.location} onChange={(e) => setPlotModal({ ...plotModal, data: { ...plotModal.data, location: e.target.value } })} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Primary Crop</label>
                <input value={plotModal.data.cropType} onChange={(e) => setPlotModal({ ...plotModal, data: { ...plotModal.data, cropType: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Growth Stage</label>
                <select value={plotModal.data.stage} onChange={(e) => setPlotModal({ ...plotModal, data: { ...plotModal.data, stage: e.target.value } })} style={inputStyle}>
                  {PLOT_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Linked Animal Group (optional)</label>
                <select value={plotModal.data.animalGroupId} onChange={(e) => setPlotModal({ ...plotModal, data: { ...plotModal.data, animalGroupId: e.target.value } })} style={inputStyle}>
                  <option value="">None</option>
                  {animalGroups.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.animalType})</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: '12px' }}>
              <label style={labelStyle}>Notes</label>
              <textarea rows={2} value={plotModal.data.notes} onChange={(e) => setPlotModal({ ...plotModal, data: { ...plotModal.data, notes: e.target.value } })} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button type="button" style={btnSecondary} onClick={() => setPlotModal(null)}>Cancel</button>
              <button type="submit" style={btnPrimary} disabled={saving}>{saving ? 'Saving…' : 'Save Plot'}</button>
            </div>
          </form>
        </div>
      )}

      {detailItem?.type === 'farm' && (
        <EntityDetailModal
          open
          onClose={() => setDetailItem(null)}
          title={detailItem.data.name}
          subtitle={`Farm #${detailItem.data.id} · Owner: ${detailItem.data.farmerName}`}
          badge={detailItem.data.status}
          badgeStyle={{
            backgroundColor: detailItem.data.status === 'ACTIVE' ? '#EAF4ED' : '#F4EFE6',
            color: detailItem.data.status === 'ACTIVE' ? '#164230' : '#64716B',
          }}
          fields={[
            { label: 'Owner (Farmer)', value: detailItem.data.farmerName },
            { label: 'Assigned Manager', value: detailItem.data.managerName || 'Unassigned' },
            { label: 'Farm Type', value: detailItem.data.type },
            { label: 'Size', value: detailItem.data.size != null ? `${detailItem.data.size} ${detailItem.data.sizeUnit || 'HECTARES'}` : '—' },
            { label: 'Registered Plots', value: detailItem.data.plotCount },
            { label: 'Country', value: detailItem.data.country },
            { label: 'Region', value: detailItem.data.region },
            { label: 'District / Sub-region', value: detailItem.data.district },
            { label: 'Created At', value: detailItem.data.createdAt ? new Date(detailItem.data.createdAt).toLocaleString() : '—' },
          ]}
          longFields={[
            { label: 'Description', value: detailItem.data.description },
          ]}
          sections={[
            {
              title: 'Farmers',
              emptyText: 'No farmers linked to this farm.',
              items: (detailItem.data.farmers || []).map((f) => ({
                primary: f.fullName,
                secondary: f.emailOrPhone || '',
                badge: 'Farmer',
              })),
            },
            {
              title: 'Managers',
              emptyText: 'No managers assigned.',
              items: (detailItem.data.managers || []).map((m) => ({
                primary: m.fullName,
                secondary: m.emailOrPhone || '',
                badge: m.role === 'ROLE_ADMIN' ? 'Admin' : 'Manager',
              })),
            },
            {
              title: 'Plots',
              emptyText: 'No plots registered in this farm yet.',
              items: (detailItem.data.plots || []).map((p) => ({
                primary: p.name,
                secondary: `${p.area ?? '—'} ha · Crop: ${p.cropType || 'Unspecified'}${p.location ? ` · ${p.location}` : ''}`,
                badge: p.stage || 'Planned',
              })),
            },
            {
              title: 'Crops',
              emptyText: 'No crops recorded on this farm yet.',
              items: (detailItem.data.crops || []).map((c) => ({
                primary: c.variety ? `${c.name} (${c.variety})` : c.name,
                secondary: c.category || '',
                badge: c.category || 'Crop',
              })),
            },
            {
              title: 'Animal Groups',
              emptyText: 'No animal groups on this farm yet.',
              items: (detailItem.data.animalGroups || []).map((g) => ({
                primary: g.name,
                secondary: `${g.animalType}${g.currentPopulation != null ? ` · ${g.currentPopulation} head` : ''}`,
                badge: g.status || 'ACTIVE',
              })),
            },
          ]}
          editLabel="Edit Farm"
          onEdit={() => {
            const target = detailItem.data;
            setDetailItem(null);
            openEditFarm(target);
          }}
        />
      )}

      {detailItem?.type === 'plot' && (
        <EntityDetailModal
          open
          onClose={() => setDetailItem(null)}
          title={detailItem.data.name}
          subtitle={`Plot #${detailItem.data.id} · ${detailItem.data.farmerName}${detailItem.data.farmName ? ` · ${detailItem.data.farmName}` : ''}`}
          badge={detailItem.data.stage || 'Planned'}
          fields={[
            { label: 'Owner (Farmer)', value: detailItem.data.farmerName },
            { label: 'Parent Farm', value: detailItem.data.farmName || 'Standalone' },
            { label: 'Area', value: detailItem.data.area != null ? `${detailItem.data.area} ha` : '—' },
            { label: 'Location / Sector', value: detailItem.data.location },
            { label: 'Primary Crop', value: detailItem.data.cropType },
            { label: 'Growth Stage', value: detailItem.data.stage },
            { label: 'Soil Type', value: detailItem.data.soilType },
            { label: 'Irrigation Type', value: detailItem.data.irrigationType },
            { label: 'Slope / Terrain', value: detailItem.data.slope },
            { label: 'Linked Animal Group', value: detailItem.data.animalGroupName || 'None' },
            { label: 'Created At', value: detailItem.data.createdAt ? new Date(detailItem.data.createdAt).toLocaleString() : '—' },
          ]}
          longFields={[
            { label: 'Field Notes', value: detailItem.data.notes },
          ]}
          editLabel="Edit Plot"
          onEdit={() => {
            const target = detailItem.data;
            setDetailItem(null);
            openEditPlot(target);
          }}
        />
      )}
    </div>
  );
}

