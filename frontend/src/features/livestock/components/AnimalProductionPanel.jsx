import React, { useState, useEffect } from 'react';
import { animalGroupService } from '../services/animalGroupService';
import { MetricCard } from '../../../shared/components/MetricCard';
import { Skeleton, SkeletonCard, SkeletonText } from '../../../shared/components/Skeleton';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import {
  IconLivestock,
  IconProduction,
  IconCheck,
  IconTrash,
  IconPlus,
  IconCalendar
} from '../../../shared/components/Icons';

const PRODUCTION_TYPES = [
  { value: 'MILK', label: 'Milk', defaultUnit: 'L' },
  { value: 'EGGS', label: 'Eggs', defaultUnit: 'trays' },
  { value: 'MEAT', label: 'Meat / Live Weight', defaultUnit: 'kg' },
  { value: 'HONEY', label: 'Honey', defaultUnit: 'L' },
  { value: 'WOOL', label: 'Wool / Fiber', defaultUnit: 'kg' },
  { value: 'MANURE', label: 'Organic Manure', defaultUnit: 'bag' },
  { value: 'OTHER', label: 'Other Output', defaultUnit: 'unit' }
];

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid #DFD8CA',
  fontSize: '0.875rem',
  color: '#19201C',
  backgroundColor: '#FFFFFF',
  boxSizing: 'border-box'
};

export function AnimalProductionPanel({ groups, groupsLoading, onToast }) {
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || null);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    productionType: 'EGGS',
    quantity: '',
    unit: 'trays',
    productionDate: today,
    qualityGrade: 'Grade A',
    estimatedRevenue: '',
    notes: ''
  });

  useEffect(() => {
    if (!selectedGroupId && groups.length > 0) {
      const active = groups.find((g) => (g.status || '').toUpperCase() === 'ACTIVE') || groups[0];
      setSelectedGroupId(active.id);
    }
  }, [groups, selectedGroupId]);

  useEffect(() => {
    async function load() {
      if (!selectedGroupId) {
        setRecords([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await animalGroupService.getProductions(selectedGroupId);
        setRecords(Array.isArray(data) ? data : []);
      } catch {
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [selectedGroupId]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroupId) return;
    const qty = Number(form.quantity);
    if (!qty || qty <= 0) {
      onToast?.('Quantity must be a positive number.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await animalGroupService.createProduction(selectedGroupId, {
        productionType: form.productionType,
        quantity: qty,
        unit: form.unit.trim() || 'unit',
        productionDate: form.productionDate,
        qualityGrade: form.qualityGrade.trim() || null,
        estimatedRevenue: form.estimatedRevenue !== '' ? Number(form.estimatedRevenue) : null,
        notes: form.notes.trim() || null
      });
      setRecords((prev) => [created, ...prev]);
      setForm((prev) => ({ ...prev, quantity: '', estimatedRevenue: '', notes: '' }));
      onToast?.('Animal production recorded successfully.');
    } catch (err) {
      onToast?.(err?.message || 'Failed to save animal production.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !selectedGroupId) return;
    setIsDeleting(true);
    try {
      await animalGroupService.deleteProduction(selectedGroupId, deleteTarget.id);
      setRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      onToast?.('Animal production record deleted.');
    } catch (err) {
      onToast?.(err?.message || 'Failed to delete record.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const latest = records[0] || null;
  const totalRevenue = records.reduce((sum, r) => sum + (Number(r.estimatedRevenue) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Production Record"
        message="Are you sure you want to delete this animal production record?"
        confirmText={isDeleting ? 'Deleting...' : 'Delete Record'}
        isDestructive
        isLoading={isDeleting}
      />

      {/* Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <label htmlFor="animal-prod-group-select" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#788680', whiteSpace: 'nowrap' }}>
          SELECT ANIMAL GROUP:
        </label>
        {groupsLoading ? (
          <Skeleton width="240px" height="40px" borderRadius="10px" />
        ) : groups.length > 0 ? (
          <select
            id="animal-prod-group-select"
            value={selectedGroupId || ''}
            onChange={(e) => setSelectedGroupId(Number(e.target.value))}
            style={{
              padding: '9px 14px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600,
              backgroundColor: '#FFFFFF', color: '#19201C', border: '1px solid #DFD8CA', minWidth: '220px', maxWidth: '100%', cursor: 'pointer'
            }}
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} — {g.animalType} [{(g.status || 'ACTIVE').toUpperCase()}]
              </option>
            ))}
          </select>
        ) : (
          <span style={{ fontSize: '0.8125rem', color: '#788680' }}>No animal groups registered yet</span>
        )}
      </div>

      {groupsLoading ? (
        <SkeletonCard height="180px"><SkeletonText lines={3} /></SkeletonCard>
      ) : groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: '#FAF8F5', borderRadius: '16px', border: '1px dashed #ECE7DC' }}>
          <p style={{ fontWeight: 600, margin: 0 }}>No animal groups found</p>
          <p style={{ fontSize: '0.8125rem', color: '#788680', marginTop: '4px' }}>Register a herd, flock, or pen in the Livestock module before recording animal production.</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '18px' }}>
            <MetricCard label="Selected Group" value={selectedGroup?.name || '—'} subtext={`${selectedGroup?.animalType || ''} · ${selectedGroup?.currentPopulation ?? 0} head`} icon={<IconLivestock size={20} color="#2D7A52" />} iconBg="#EAF4ED" loading={isLoading} />
            <MetricCard label="Production Logs" value={String(records.length)} subtext="Recorded output entries" icon={<IconProduction size={20} color="#0D9488" />} iconBg="#E6F6F4" loading={isLoading} />
            <MetricCard label="Latest Output" value={latest ? `${latest.quantity} ${latest.unit}` : '—'} subtext={latest ? `${latest.productionType} on ${latest.productionDate}` : 'No output recorded yet'} icon={<IconCalendar size={20} color="#D97706" />} iconBg="#FEF3C7" loading={isLoading} />
            <MetricCard label="Estimated Revenue" value={`${totalRevenue.toLocaleString('fr-CM')} XAF`} subtext="Cumulative value logged" icon={<IconCheck size={20} color="#2A6740" />} iconBg="#EAF4ED" loading={isLoading} />
          </div>

          {/* Record Production Form */}
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #ECE7DC', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#19201C' }}>Record Animal Production</h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.8125rem', color: '#788680' }}>Log milk, eggs, meat, honey, wool, or manure output for {selectedGroup?.name}.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>Output Type *</label>
                <select
                  value={form.productionType}
                  onChange={(e) => {
                    const found = PRODUCTION_TYPES.find((p) => p.value === e.target.value);
                    setForm({ ...form, productionType: e.target.value, unit: found?.defaultUnit || form.unit });
                  }}
                  style={inputStyle}
                >
                  {PRODUCTION_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>Quantity *</label>
                <input type="number" step="0.01" min="0.01" required placeholder="e.g. 25" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>Unit *</label>
                <input type="text" required placeholder="e.g. L, trays, kg" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>Date *</label>
                <input type="date" required value={form.productionDate} onChange={(e) => setForm({ ...form, productionDate: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>Quality Grade</label>
                <input type="text" placeholder="e.g. Grade A" value={form.qualityGrade} onChange={(e) => setForm({ ...form, qualityGrade: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>Estimated Revenue (XAF)</label>
                <input type="number" min="0" step="1" placeholder="e.g. 45000" value={form.estimatedRevenue} onChange={(e) => setForm({ ...form, estimatedRevenue: e.target.value })} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>Notes</label>
              <textarea rows={2} placeholder="Collection notes, buyer, or storage details..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={isSubmitting} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: '#3E7B52', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}>
                <IconPlus size={16} color="#FFFFFF" />
                <span>{isSubmitting ? 'Saving...' : 'Save Production Record'}</span>
              </button>
            </div>
          </form>

          {/* Production History */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #ECE7DC', padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.0625rem', fontWeight: 700, color: '#19201C' }}>Production History</h3>
            {records.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#788680' }}>No production records logged for this group yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {records.map((r) => (
                  <div key={r.id} style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #ECE7DC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#19201C', fontSize: '0.9375rem' }}>
                        {r.quantity} {r.unit} — {r.productionType}
                        {r.qualityGrade ? ` (${r.qualityGrade})` : ''}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#788680', marginTop: '2px' }}>
                        {r.productionDate}
                        {r.estimatedRevenue != null ? ` • Est. ${Number(r.estimatedRevenue).toLocaleString('fr-CM')} XAF` : ''}
                        {r.notes ? ` • ${r.notes}` : ''}
                      </div>
                    </div>
                    <button type="button" onClick={() => setDeleteTarget(r)} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', cursor: 'pointer' }} title="Delete">
                      <IconTrash size={14} color="#DC2626" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

