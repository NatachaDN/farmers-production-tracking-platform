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

const HARVEST_UNITS = ['KG', 'BAGS', 'TONS'];
const INPUT_TYPES = ['SEEDS', 'FERTILIZER', 'PESTICIDE', 'OTHER'];

export function ManageHarvestsInputsView() {
  const [tab, setTab] = useState('harvests');
  const [search, setSearch] = useState('');
  const [harvests, setHarvests] = useState([]);
  const [inputs, setInputs] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [harvestModal, setHarvestModal] = useState(null);
  const [inputModal, setInputModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [hList, iList, cList, fList] = await Promise.all([
        managerService.listHarvests(search),
        managerService.listInputs(search),
        managerService.listCycleOptions(),
        managerService.getFarmers({}),
      ]);
      setHarvests(Array.isArray(hList) ? hList : []);
      setInputs(Array.isArray(iList) ? iList : []);
      setCycles(Array.isArray(cList) ? cList : []);
      setFarmers(Array.isArray(fList) ? fList : []);
    } catch (err) {
      setError(err.message || 'Failed to load harvests and inputs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openCreateHarvest = () => {
    setHarvestModal({
      mode: 'create',
      data: {
        cycleId: cycles[0]?.id ? String(cycles[0].id) : '',
        quantity: '',
        unit: 'KG',
        harvestDate: new Date().toISOString().slice(0, 10),
        qualityGrade: 'Grade A',
        marketDestination: '',
        estimatedRevenue: '',
        notes: '',
      },
    });
  };

  const openEditHarvest = (h) => {
    setHarvestModal({
      mode: 'edit',
      id: h.id,
      data: {
        cycleId: String(h.cycleId || ''),
        quantity: String(h.quantity ?? ''),
        unit: h.unit || 'KG',
        harvestDate: h.harvestDate || new Date().toISOString().slice(0, 10),
        qualityGrade: h.qualityGrade || '',
        marketDestination: h.marketDestination || '',
        estimatedRevenue: h.estimatedRevenue != null ? String(h.estimatedRevenue) : '',
        notes: h.notes || '',
      },
    });
  };

  const saveHarvest = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const d = harvestModal.data;
      const payload = {
        cycleId: Number(d.cycleId),
        quantity: Number(d.quantity),
        unit: d.unit,
        harvestDate: d.harvestDate,
        qualityGrade: d.qualityGrade,
        marketDestination: d.marketDestination,
        estimatedRevenue: d.estimatedRevenue ? Number(d.estimatedRevenue) : null,
        notes: d.notes,
      };
      if (harvestModal.mode === 'create') {
        await managerService.createHarvest(payload);
        flash('Harvest recorded.');
      } else {
        await managerService.updateHarvest(harvestModal.id, payload);
        flash('Harvest updated.');
      }
      setHarvestModal(null);
      await loadAll();
    } catch (err) {
      setError(err.message || 'Could not save harvest.');
    } finally {
      setSaving(false);
    }
  };

  const deleteHarvest = async (h) => {
    if (!window.confirm(`Delete harvest record for "${h.cropName}"?`)) return;
    try {
      await managerService.deleteHarvest(h.id);
      flash('Harvest deleted.');
      await loadAll();
    } catch (err) {
      setError(err.message || 'Could not delete harvest.');
    }
  };

  const openCreateInput = () => {
    setInputModal({
      mode: 'create',
      data: {
        farmerId: farmers[0]?.id ? String(farmers[0].id) : '',
        name: '',
        type: 'FERTILIZER',
        quantity: '1',
        unit: 'kg',
        purchaseDate: new Date().toISOString().slice(0, 10),
        purchasePrice: '0',
        brand: '',
        supplier: '',
        storageLocation: '',
        description: '',
      },
    });
  };

  const openEditInput = (i) => {
    setInputModal({
      mode: 'edit',
      id: i.id,
      data: {
        farmerId: String(i.farmerId),
        name: i.name || '',
        type: i.type || 'OTHER',
        quantity: String(i.quantity ?? 0),
        unit: i.unit || 'kg',
        purchaseDate: i.purchaseDate || new Date().toISOString().slice(0, 10),
        purchasePrice: String(i.purchasePrice ?? 0),
        brand: i.brand || '',
        supplier: i.supplier || '',
        storageLocation: i.storageLocation || '',
        description: i.description || '',
      },
    });
  };

  const saveInput = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const d = inputModal.data;
      const qty = Number(d.quantity) || 0;
      const price = Number(d.purchasePrice) || 0;
      const payload = {
        farmerId: Number(d.farmerId),
        name: d.name.trim(),
        type: d.type,
        quantity: qty,
        unit: d.unit.trim() || 'kg',
        purchaseDate: d.purchaseDate,
        purchasePrice: price,
        cumulativeCost: price * Math.max(1, qty),
        brand: d.brand,
        supplier: d.supplier,
        storageLocation: d.storageLocation,
        description: d.description,
      };
      if (inputModal.mode === 'create') {
        await managerService.createInput(payload);
        flash('Farm input added.');
      } else {
        await managerService.updateInput(inputModal.id, payload);
        flash('Farm input updated.');
      }
      setInputModal(null);
      await loadAll();
    } catch (err) {
      setError(err.message || 'Could not save farm input.');
    } finally {
      setSaving(false);
    }
  };

  const deleteInput = async (i) => {
    if (!window.confirm(`Delete farm input "${i.name}"?`)) return;
    try {
      await managerService.deleteInput(i.id);
      flash('Farm input deleted.');
      await loadAll();
    } catch (err) {
      setError(err.message || 'Could not delete farm input.');
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
            <button type="button" onClick={() => setTab('harvests')} style={tab === 'harvests' ? btnPrimary : btnSecondary}>
              Harvests ({harvests.length})
            </button>
            <button type="button" onClick={() => setTab('inputs')} style={tab === 'inputs' ? btnPrimary : btnSecondary}>
              Farm Inputs ({inputs.length})
            </button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); loadAll(); }} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: '1 1 260px', justifyContent: 'flex-end' }}>
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
            <button type="button" style={btnPrimary} onClick={tab === 'harvests' ? openCreateHarvest : openCreateInput}>
              <IconPlus size={15} /> {tab === 'harvests' ? 'Record Harvest' : 'Add Input'}
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div style={cardStyle}><p style={{ margin: 0, color: '#64716B' }}>Loading {tab}…</p></div>
      ) : tab === 'harvests' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
          {harvests.length === 0 ? (
            <div style={cardStyle}><p style={{ margin: 0, color: '#64716B' }}>No harvests recorded yet.</p></div>
          ) : harvests.map((h) => (
            <div key={h.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#164230' }}>{h.cropName || h.cycleName}</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: '#64716B' }}>
                    Farmer: <strong>{h.farmerName}</strong> · {h.harvestDate}
                  </p>
                </div>
                <span style={{ padding: '3px 9px', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#EAF4ED', color: '#164230' }}>
                  {h.quantity} {h.unit}
                </span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#4B5752', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                {h.qualityGrade && <span>Quality: <strong>{h.qualityGrade}</strong></span>}
                {h.marketDestination && <span>Market: {h.marketDestination}</span>}
                {h.notes && <span>Notes: {h.notes}</span>}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #ECE7DC', paddingTop: '10px' }}>
                <button type="button" style={btnSecondary} onClick={() => openEditHarvest(h)}>
                  <IconEdit size={13} /> Edit
                </button>
                <button type="button" style={{ ...btnSecondary, color: '#B91C1C', borderColor: '#FECACA' }} onClick={() => deleteHarvest(h)}>
                  <IconTrash size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
          {inputs.length === 0 ? (
            <div style={cardStyle}><p style={{ margin: 0, color: '#64716B' }}>No farm inputs found.</p></div>
          ) : inputs.map((i) => (
            <div key={i.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#164230' }}>{i.name}</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: '#64716B' }}>
                    Farmer: <strong>{i.farmerName}</strong>
                  </p>
                </div>
                <span style={{ padding: '3px 9px', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#F4EFE6', color: '#164230' }}>
                  {i.type}
                </span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#4B5752', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                <span>Quantity: <strong>{i.quantity} {i.unit}</strong></span>
                <span>Total Cost: <strong>{Math.round(i.cumulativeCost || 0).toLocaleString()} XAF</strong></span>
                {i.supplier && <span>Supplier: {i.supplier}</span>}
                <span>Purchased: {i.purchaseDate}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #ECE7DC', paddingTop: '10px' }}>
                <button type="button" style={btnSecondary} onClick={() => openEditInput(i)}>
                  <IconEdit size={13} /> Edit
                </button>
                <button type="button" style={{ ...btnSecondary, color: '#B91C1C', borderColor: '#FECACA' }} onClick={() => deleteInput(i)}>
                  <IconTrash size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {harvestModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(22,66,48,0.4)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <form onSubmit={saveHarvest} style={{ ...cardStyle, width: 'min(96vw, 500px)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#164230' }}>{harvestModal.mode === 'create' ? 'Record Harvest' : 'Edit Harvest'}</h3>
              <button type="button" onClick={() => setHarvestModal(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><IconClose size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Production Cycle *</label>
                <select required value={harvestModal.data.cycleId} onChange={(e) => setHarvestModal({ ...harvestModal, data: { ...harvestModal.data, cycleId: e.target.value } })} style={inputStyle}>
                  <option value="">Select cycle…</option>
                  {cycles.map((c) => <option key={c.id} value={c.id}>{c.cropName || c.name} — {c.farmerName}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Quantity *</label>
                <input type="number" step="0.1" min="0.1" required value={harvestModal.data.quantity} onChange={(e) => setHarvestModal({ ...harvestModal, data: { ...harvestModal.data, quantity: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Unit</label>
                <select value={harvestModal.data.unit} onChange={(e) => setHarvestModal({ ...harvestModal, data: { ...harvestModal.data, unit: e.target.value } })} style={inputStyle}>
                  {HARVEST_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Harvest Date</label>
                <input type="date" value={harvestModal.data.harvestDate} onChange={(e) => setHarvestModal({ ...harvestModal, data: { ...harvestModal.data, harvestDate: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Quality Grade</label>
                <input value={harvestModal.data.qualityGrade} onChange={(e) => setHarvestModal({ ...harvestModal, data: { ...harvestModal.data, qualityGrade: e.target.value } })} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginTop: '12px' }}>
              <label style={labelStyle}>Notes</label>
              <textarea rows={2} value={harvestModal.data.notes} onChange={(e) => setHarvestModal({ ...harvestModal, data: { ...harvestModal.data, notes: e.target.value } })} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button type="button" style={btnSecondary} onClick={() => setHarvestModal(null)}>Cancel</button>
              <button type="submit" style={btnPrimary} disabled={saving}>{saving ? 'Saving…' : 'Save Harvest'}</button>
            </div>
          </form>
        </div>
      )}

      {inputModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(22,66,48,0.4)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <form onSubmit={saveInput} style={{ ...cardStyle, width: 'min(96vw, 520px)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#164230' }}>{inputModal.mode === 'create' ? 'Add Farm Input' : 'Edit Farm Input'}</h3>
              <button type="button" onClick={() => setInputModal(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><IconClose size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Farmer *</label>
                <select required value={inputModal.data.farmerId} onChange={(e) => setInputModal({ ...inputModal, data: { ...inputModal.data, farmerId: e.target.value } })} style={inputStyle}>
                  {farmers.map((f) => <option key={f.id} value={f.id}>{f.fullName}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Input Name *</label>
                <input required value={inputModal.data.name} onChange={(e) => setInputModal({ ...inputModal, data: { ...inputModal.data, name: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Type</label>
                <select value={inputModal.data.type} onChange={(e) => setInputModal({ ...inputModal, data: { ...inputModal.data, type: e.target.value } })} style={inputStyle}>
                  {INPUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Quantity *</label>
                <input type="number" step="0.1" min="0.1" required value={inputModal.data.quantity} onChange={(e) => setInputModal({ ...inputModal, data: { ...inputModal.data, quantity: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Unit *</label>
                <input required value={inputModal.data.unit} onChange={(e) => setInputModal({ ...inputModal, data: { ...inputModal.data, unit: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Unit Price (XAF) *</label>
                <input type="number" step="1" min="0" required value={inputModal.data.purchasePrice} onChange={(e) => setInputModal({ ...inputModal, data: { ...inputModal.data, purchasePrice: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Purchase Date</label>
                <input type="date" value={inputModal.data.purchaseDate} onChange={(e) => setInputModal({ ...inputModal, data: { ...inputModal.data, purchaseDate: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Supplier</label>
                <input value={inputModal.data.supplier} onChange={(e) => setInputModal({ ...inputModal, data: { ...inputModal.data, supplier: e.target.value } })} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button type="button" style={btnSecondary} onClick={() => setInputModal(null)}>Cancel</button>
              <button type="submit" style={btnPrimary} disabled={saving}>{saving ? 'Saving…' : 'Save Input'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

