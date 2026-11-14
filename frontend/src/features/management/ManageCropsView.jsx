import React, { useEffect, useState } from 'react';
import { managerService } from '../manager/services/managerService';
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

const CATEGORIES = ['Cereal', 'Vegetable', 'Root & Tuber', 'Legume', 'Fruit', 'Cash Crop', 'Other'];

export function ManageCropsView() {
  const [search, setSearch] = useState('');
  const [crops, setCrops] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(null);
  const [detailCrop, setDetailCrop] = useState(null);
  const [saving, setSaving] = useState(false);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [cList, fList] = await Promise.all([
        managerService.listCrops(search),
        managerService.getFarmers({}),
      ]);
      setCrops(Array.isArray(cList) ? cList : []);
      setFarmers(Array.isArray(fList) ? fList : []);
    } catch (err) {
      setError(err.message || 'Failed to load crops.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openCreate = () => {
    setModal({
      mode: 'create',
      data: {
        farmerId: farmers[0]?.id ? String(farmers[0].id) : '',
        name: '',
        variety: '',
        category: 'Cereal',
        growthDurationDays: '90',
        expectedYieldPerHectare: '',
        yieldUnit: 'kg/ha',
        plantingSeason: '',
        waterRequirement: 'Moderate',
        soilPreference: '',
        description: '',
      },
    });
  };

  const openEdit = (c) => {
    setModal({
      mode: 'edit',
      id: c.id,
      data: {
        farmerId: String(c.farmerId),
        name: c.name || '',
        variety: c.variety || '',
        category: c.category || 'Cereal',
        growthDurationDays: c.growthDurationDays != null ? String(c.growthDurationDays) : '',
        expectedYieldPerHectare: c.expectedYieldPerHectare != null ? String(c.expectedYieldPerHectare) : '',
        yieldUnit: c.yieldUnit || 'kg/ha',
        plantingSeason: c.plantingSeason || '',
        waterRequirement: c.waterRequirement || 'Moderate',
        soilPreference: c.soilPreference || '',
        description: c.description || '',
      },
    });
  };

  const saveCrop = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const d = modal.data;
      const payload = {
        farmerId: Number(d.farmerId),
        name: d.name.trim(),
        variety: d.variety,
        category: d.category,
        growthDurationDays: d.growthDurationDays ? Number(d.growthDurationDays) : null,
        expectedYieldPerHectare: d.expectedYieldPerHectare ? Number(d.expectedYieldPerHectare) : null,
        yieldUnit: d.yieldUnit,
        plantingSeason: d.plantingSeason,
        waterRequirement: d.waterRequirement,
        soilPreference: d.soilPreference,
        description: d.description,
      };
      if (modal.mode === 'create') {
        await managerService.createCrop(payload);
        flash('Crop created.');
      } else {
        await managerService.updateCrop(modal.id, payload);
        flash('Crop updated.');
      }
      setModal(null);
      await loadAll();
    } catch (err) {
      setError(err.message || 'Could not save crop.');
    } finally {
      setSaving(false);
    }
  };

  const deleteCrop = async (c) => {
    if (!window.confirm(`Delete crop "${c.name}"?`)) return;
    try {
      await managerService.deleteCrop(c.id);
      flash('Crop deleted.');
      await loadAll();
    } catch (err) {
      setError(err.message || 'Could not delete crop.');
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
          <div>
            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#164230' }}>
              Crops Catalog ({crops.length})
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: '#64716B' }}>
              Create, update, and manage registered crops and varieties across all farmers.
            </p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); loadAll(); }} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: '1 1 260px', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #DFD8CA', borderRadius: '9999px', padding: '6px 14px', flex: '1 1 180px', maxWidth: '280px', minWidth: 0 }}>
              <IconSearch size={15} color="#7A8680" />
              <input
                type="text"
                placeholder="Search crops..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', minWidth: 0, fontSize: '0.8125rem' }}
              />
            </div>
            <button type="submit" style={btnSecondary}>Filter</button>
            <button type="button" style={btnPrimary} onClick={openCreate}>
              <IconPlus size={15} /> New Crop
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div style={cardStyle}><p style={{ margin: 0, color: '#64716B' }}>Loading crops…</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
          {crops.length === 0 ? (
            <div style={cardStyle}><p style={{ margin: 0, color: '#64716B' }}>No crops found.</p></div>
          ) : crops.map((c) => (
            <div key={c.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#164230' }}>
                    {c.name}{c.variety ? ` (${c.variety})` : ''}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: '#64716B' }}>
                    Farmer: <strong>{c.farmerName}</strong>
                  </p>
                </div>
                {c.category && (
                  <span style={{ padding: '3px 9px', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#EAF4ED', color: '#2A6740' }}>
                    {c.category}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#4B5752', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                {c.growthDurationDays != null && <span>Duration: <strong>{c.growthDurationDays} days</strong></span>}
                {c.expectedYieldPerHectare != null && <span>Expected Yield: <strong>{c.expectedYieldPerHectare} {c.yieldUnit || 'kg/ha'}</strong></span>}
                {c.plantingSeason && <span>Season: {c.plantingSeason}</span>}
                {c.waterRequirement && <span>Water: {c.waterRequirement}</span>}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #ECE7DC', paddingTop: '10px' }}>
                <button type="button" style={btnSecondary} onClick={() => setDetailCrop(c)}>
                  <IconEye size={13} /> View
                </button>
                <button type="button" style={btnSecondary} onClick={() => openEdit(c)}>
                  <IconEdit size={13} /> Edit
                </button>
                <button type="button" style={{ ...btnSecondary, color: '#B91C1C', borderColor: '#FECACA' }} onClick={() => deleteCrop(c)}>
                  <IconTrash size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(22,66,48,0.4)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <form onSubmit={saveCrop} style={{ ...cardStyle, width: 'min(96vw, 540px)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#164230' }}>{modal.mode === 'create' ? 'Create Crop' : 'Edit Crop'}</h3>
              <button type="button" onClick={() => setModal(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><IconClose size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Farmer *</label>
                <select value={modal.data.farmerId} onChange={(e) => setModal({ ...modal, data: { ...modal.data, farmerId: e.target.value } })} style={inputStyle} required>
                  {farmers.map((f) => <option key={f.id} value={f.id}>{f.fullName}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Crop Name *</label>
                <input required value={modal.data.name} onChange={(e) => setModal({ ...modal, data: { ...modal.data, name: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Variety</label>
                <input value={modal.data.variety} onChange={(e) => setModal({ ...modal, data: { ...modal.data, variety: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={modal.data.category} onChange={(e) => setModal({ ...modal, data: { ...modal.data, category: e.target.value } })} style={inputStyle}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Growth Duration (days)</label>
                <input type="number" min="1" value={modal.data.growthDurationDays} onChange={(e) => setModal({ ...modal, data: { ...modal.data, growthDurationDays: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Expected Yield / ha</label>
                <input type="number" step="0.1" value={modal.data.expectedYieldPerHectare} onChange={(e) => setModal({ ...modal, data: { ...modal.data, expectedYieldPerHectare: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Planting Season</label>
                <input value={modal.data.plantingSeason} onChange={(e) => setModal({ ...modal, data: { ...modal.data, plantingSeason: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Water Requirement</label>
                <select value={modal.data.waterRequirement} onChange={(e) => setModal({ ...modal, data: { ...modal.data, waterRequirement: e.target.value } })} style={inputStyle}>
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '12px' }}>
              <label style={labelStyle}>Description</label>
              <textarea rows={2} value={modal.data.description} onChange={(e) => setModal({ ...modal, data: { ...modal.data, description: e.target.value } })} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button type="button" style={btnSecondary} onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" style={btnPrimary} disabled={saving}>{saving ? 'Saving…' : 'Save Crop'}</button>
            </div>
          </form>
        </div>
      )}

      {detailCrop && (
        <EntityDetailModal
          open
          onClose={() => setDetailCrop(null)}
          title={`${detailCrop.name}${detailCrop.variety ? ` (${detailCrop.variety})` : ''}`}
          subtitle={`Crop #${detailCrop.id} · Farmer: ${detailCrop.farmerName}`}
          badge={detailCrop.category}
          fields={[
            { label: 'Farmer', value: detailCrop.farmerName },
            { label: 'Crop Name', value: detailCrop.name },
            { label: 'Variety', value: detailCrop.variety },
            { label: 'Category', value: detailCrop.category },
            { label: 'Growth Duration', value: detailCrop.growthDurationDays != null ? `${detailCrop.growthDurationDays} days` : '—' },
            { label: 'Expected Yield / ha', value: detailCrop.expectedYieldPerHectare != null ? `${detailCrop.expectedYieldPerHectare} ${detailCrop.yieldUnit || 'kg/ha'}` : '—' },
            { label: 'Planting Season', value: detailCrop.plantingSeason },
            { label: 'Water Requirement', value: detailCrop.waterRequirement },
            { label: 'Soil Preference', value: detailCrop.soilPreference },
            { label: 'Created At', value: detailCrop.createdAt ? new Date(detailCrop.createdAt).toLocaleString() : '—' },
          ]}
          longFields={[
            { label: 'Description', value: detailCrop.description },
          ]}
          editLabel="Edit Crop"
          onEdit={() => {
            const target = detailCrop;
            setDetailCrop(null);
            openEdit(target);
          }}
        />
      )}
    </div>
  );
}

