import React, { useEffect, useState } from 'react';
import { managerService } from '../manager/services/managerService';
import { IconPlus, IconSearch, IconClose, IconEdit, IconTrash } from '../../shared/components/Icons';

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

const ANIMAL_TYPES = ['CATTLE', 'POULTRY', 'GOATS', 'SHEEP', 'PIGS', 'RABBITS', 'BEES', 'FISH', 'OTHER'];
const GROUP_STATUSES = ['ACTIVE', 'INACTIVE', 'ARCHIVED', 'SOLD'];

export function ManageAnimalGroupsView() {
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [gList, farmerList, farmList] = await Promise.all([
        managerService.listAnimalGroups(search),
        managerService.getFarmers({}),
        managerService.listFarms(''),
      ]);
      setGroups(Array.isArray(gList) ? gList : []);
      setFarmers(Array.isArray(farmerList) ? farmerList : []);
      setFarms(Array.isArray(farmList) ? farmList : []);
    } catch (err) {
      setError(err.message || 'Failed to load animal groups.');
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
        farmId: farms[0]?.id ? String(farms[0].id) : '',
        name: '',
        animalType: 'POULTRY',
        breed: '',
        initialPopulation: '50',
        currentPopulation: '50',
        location: '',
        purpose: '',
        status: 'ACTIVE',
        healthStatus: 'Healthy',
        notes: '',
      },
    });
  };

  const openEdit = (g) => {
    setModal({
      mode: 'edit',
      id: g.id,
      data: {
        farmerId: String(g.farmerId),
        farmId: g.farmId ? String(g.farmId) : '',
        name: g.name || '',
        animalType: g.animalType || 'OTHER',
        breed: g.breed || '',
        initialPopulation: String(g.initialPopulation ?? 0),
        currentPopulation: String(g.currentPopulation ?? 0),
        location: g.location || '',
        purpose: g.purpose || '',
        status: g.status || 'ACTIVE',
        healthStatus: g.healthStatus || '',
        notes: g.notes || '',
      },
    });
  };

  const saveGroup = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const d = modal.data;
      const payload = {
        farmerId: Number(d.farmerId),
        farmId: d.farmId ? Number(d.farmId) : null,
        name: d.name.trim(),
        animalType: d.animalType,
        breed: d.breed,
        initialPopulation: Number(d.initialPopulation) || 0,
        currentPopulation: Number(d.currentPopulation) || 0,
        location: d.location,
        purpose: d.purpose,
        status: d.status,
        healthStatus: d.healthStatus,
        notes: d.notes,
      };
      if (modal.mode === 'create') {
        await managerService.createAnimalGroup(payload);
        notify('Animal group created.');
      } else {
        await managerService.updateAnimalGroup(modal.id, payload);
        notify('Animal group updated.');
      }
      setModal(null);
      await loadAll();
    } catch (err) {
      setError(err.message || 'Could not save animal group.');
    } finally {
      setSaving(false);
    }
  };

  const deleteGroup = async (g) => {
    if (!window.confirm(`Delete animal group "${g.name}"?`)) return;
    try {
      await managerService.deleteAnimalGroup(g.id);
      notify('Animal group deleted.');
      await loadAll();
    } catch (err) {
      setError(err.message || 'Could not delete animal group.');
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
              Animal Groups ({groups.length})
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: '#64716B' }}>
              Manage herds, flocks, and livestock groups across all farms.
            </p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); loadAll(); }} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: '1 1 260px', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #DFD8CA', borderRadius: '9999px', padding: '6px 14px', flex: '1 1 180px', maxWidth: '280px', minWidth: 0 }}>
              <IconSearch size={15} color="#7A8680" />
              <input
                type="text"
                placeholder="Search animal groups..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', minWidth: 0, fontSize: '0.8125rem' }}
              />
            </div>
            <button type="submit" style={btnSecondary}>Filter</button>
            <button type="button" style={btnPrimary} onClick={openCreate}>
              <IconPlus size={15} /> New Animal Group
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div style={cardStyle}><p style={{ margin: 0, color: '#64716B' }}>Loading animal groups…</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
          {groups.length === 0 ? (
            <div style={cardStyle}><p style={{ margin: 0, color: '#64716B' }}>No animal groups found.</p></div>
          ) : groups.map((g) => (
            <div key={g.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#164230' }}>{g.name}</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: '#64716B' }}>
                    {g.farmerName} {g.farmName ? `· ${g.farmName}` : ''}
                  </p>
                </div>
                <span style={{
                  padding: '3px 9px', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700,
                  backgroundColor: g.status === 'ACTIVE' ? '#EAF4ED' : '#F4EFE6',
                  color: g.status === 'ACTIVE' ? '#164230' : '#64716B',
                }}>
                  {g.status}
                </span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#4B5752', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                <span>Species: <strong>{g.animalType}</strong> {g.breed ? `(${g.breed})` : ''}</span>
                <span>Population: <strong>{g.currentPopulation}</strong> head (initial: {g.initialPopulation})</span>
                {g.location && <span>Housing / Location: {g.location}</span>}
                {g.healthStatus && <span>Health: {g.healthStatus}</span>}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #ECE7DC', paddingTop: '10px' }}>
                <button type="button" style={btnSecondary} onClick={() => openEdit(g)}>
                  <IconEdit size={13} /> Edit
                </button>
                <button type="button" style={{ ...btnSecondary, color: '#B91C1C', borderColor: '#FECACA' }} onClick={() => deleteGroup(g)}>
                  <IconTrash size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(22,66,48,0.4)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <form onSubmit={saveGroup} style={{ ...cardStyle, width: 'min(96vw, 540px)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#164230' }}>{modal.mode === 'create' ? 'Create Animal Group' : 'Edit Animal Group'}</h3>
              <button type="button" onClick={() => setModal(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><IconClose size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Farmer</label>
                <select value={modal.data.farmerId} onChange={(e) => setModal({ ...modal, data: { ...modal.data, farmerId: e.target.value } })} style={inputStyle} required>
                  {farmers.map((f) => <option key={f.id} value={f.id}>{f.fullName}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Farm (optional)</label>
                <select value={modal.data.farmId} onChange={(e) => setModal({ ...modal, data: { ...modal.data, farmId: e.target.value } })} style={inputStyle}>
                  <option value="">Unassigned</option>
                  {farms.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.farmerName})</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Group Name</label>
                <input value={modal.data.name} onChange={(e) => setModal({ ...modal, data: { ...modal.data, name: e.target.value } })} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Animal Type</label>
                <select value={modal.data.animalType} onChange={(e) => setModal({ ...modal, data: { ...modal.data, animalType: e.target.value } })} style={inputStyle}>
                  {ANIMAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Breed</label>
                <input value={modal.data.breed} onChange={(e) => setModal({ ...modal, data: { ...modal.data, breed: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Initial Population</label>
                <input type="number" min="0" value={modal.data.initialPopulation} onChange={(e) => setModal({ ...modal, data: { ...modal.data, initialPopulation: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Current Population</label>
                <input type="number" min="0" value={modal.data.currentPopulation} onChange={(e) => setModal({ ...modal, data: { ...modal.data, currentPopulation: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={modal.data.status} onChange={(e) => setModal({ ...modal, data: { ...modal.data, status: e.target.value } })} style={inputStyle}>
                  {GROUP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Location / Housing</label>
                <input value={modal.data.location} onChange={(e) => setModal({ ...modal, data: { ...modal.data, location: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Health Status</label>
                <input value={modal.data.healthStatus} onChange={(e) => setModal({ ...modal, data: { ...modal.data, healthStatus: e.target.value } })} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginTop: '12px' }}>
              <label style={labelStyle}>Notes</label>
              <textarea rows={2} value={modal.data.notes} onChange={(e) => setModal({ ...modal, data: { ...modal.data, notes: e.target.value } })} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button type="button" style={btnSecondary} onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" style={btnPrimary} disabled={saving}>{saving ? 'Saving…' : 'Save Group'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

