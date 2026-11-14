import React, { useState, useEffect } from 'react';
import { animalGroupService } from '../services/animalGroupService';
import { MetricCard } from '../../../shared/components/MetricCard';
import { Skeleton, SkeletonCard, SkeletonText } from '../../../shared/components/Skeleton';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import {
  IconActivities,
  IconPlus,
  IconClose,
  IconCheck,
  IconTrash,
  IconPencil,
  IconCalendar,
  IconLivestock
} from '../../../shared/components/Icons';

const ACTIVITY_TYPES = [
  { value: 'FEEDING', label: 'Feeding & Ration' },
  { value: 'VACCINATION', label: 'Vaccination' },
  { value: 'DEWORMING', label: 'Deworming' },
  { value: 'HEALTH_CHECK', label: 'Veterinary / Health Check' },
  { value: 'BREEDING', label: 'Breeding / Insemination' },
  { value: 'CLEANING', label: 'Housing / Pen Cleaning' },
  { value: 'WEIGHING', label: 'Weighing & Growth Check' },
  { value: 'OTHER', label: 'Other Intervention' }
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

export function AnimalActivitiesPanel({ groups, groupsLoading, onToast }) {
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || null);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    activityType: 'FEEDING',
    activityDate: today,
    performedBy: '',
    cost: '',
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
        setActivities([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await animalGroupService.getActivities(selectedGroupId);
        setActivities(Array.isArray(data) ? data : []);
      } catch {
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [selectedGroupId]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;

  const openCreateForm = () => {
    setEditing(null);
    setForm({ activityType: 'FEEDING', activityDate: today, performedBy: '', cost: '', notes: '' });
    setShowForm(true);
  };

  const openEditForm = (act) => {
    setEditing(act);
    setForm({
      activityType: act.activityType || 'FEEDING',
      activityDate: act.activityDate || today,
      performedBy: act.performedBy || '',
      cost: act.cost ?? '',
      notes: act.notes || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroupId) return;
    setIsSubmitting(true);
    const payload = {
      activityType: form.activityType,
      activityDate: form.activityDate,
      performedBy: form.performedBy.trim() || null,
      cost: form.cost !== '' ? Number(form.cost) : null,
      notes: form.notes.trim() || null
    };
    try {
      if (editing) {
        const updated = await animalGroupService.updateActivity(selectedGroupId, editing.id, payload);
        setActivities((prev) => prev.map((a) => (a.id === editing.id ? updated : a)));
        onToast?.('Animal activity updated.');
      } else {
        const created = await animalGroupService.createActivity(selectedGroupId, payload);
        setActivities((prev) => [created, ...prev]);
        onToast?.('Animal activity recorded.');
      }
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      onToast?.(err?.message || 'Failed to save animal activity.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !selectedGroupId) return;
    setIsDeleting(true);
    try {
      await animalGroupService.deleteActivity(selectedGroupId, deleteTarget.id);
      setActivities((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      onToast?.('Animal activity deleted.');
    } catch (err) {
      onToast?.(err?.message || 'Failed to delete activity.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const healthCount = activities.filter((a) => ['VACCINATION', 'DEWORMING', 'HEALTH_CHECK'].includes(a.activityType)).length;
  const feedingCount = activities.filter((a) => a.activityType === 'FEEDING').length;
  const totalCost = activities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Animal Activity"
        message="Are you sure you want to delete this livestock activity record?"
        confirmText={isDeleting ? 'Deleting...' : 'Delete Activity'}
        isDestructive
        isLoading={isDeleting}
      />

      {/* Dropdown & Record Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: '1 1 260px' }}>
          <label htmlFor="animal-activities-group-select" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#788680', whiteSpace: 'nowrap' }}>
            SELECT ANIMAL GROUP:
          </label>
          {groupsLoading ? (
            <Skeleton width="240px" height="40px" borderRadius="10px" />
          ) : groups.length > 0 ? (
            <select
              id="animal-activities-group-select"
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

        {selectedGroup && (
          <button
            type="button"
            onClick={() => (showForm ? setShowForm(false) : openCreateForm())}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
              borderRadius: '9999px', backgroundColor: showForm ? '#FFFFFF' : '#3E7B52',
              color: showForm ? '#19201C' : '#FFFFFF',
              border: showForm ? '1px solid #ECE7DC' : 'none',
              fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer'
            }}
          >
            {showForm ? <IconClose size={16} /> : <IconPlus size={16} />}
            <span>{showForm ? 'Close Form' : 'Record Activity'}</span>
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && selectedGroup && (
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC', borderRadius: '20px',
            padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: '#19201C' }}>
            {editing ? 'Edit Animal Activity' : `Log Activity for ${selectedGroup.name}`}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>Activity Type *</label>
              <select value={form.activityType} onChange={(e) => setForm({ ...form, activityType: e.target.value })} style={inputStyle}>
                {ACTIVITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>Date *</label>
              <input type="date" required value={form.activityDate} onChange={(e) => setForm({ ...form, activityDate: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>Performed By</label>
              <input type="text" placeholder="e.g. Dr. Mbah / Farm Staff" value={form.performedBy} onChange={(e) => setForm({ ...form, performedBy: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>Cost (XAF)</label>
              <input type="number" min="0" step="1" placeholder="e.g. 5000" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>Notes</label>
            <textarea rows={2} placeholder="Feed quantity, vaccine batch, observations..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '9px 16px', borderRadius: '10px', border: '1px solid #DFD8CA', backgroundColor: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#3E7B52', color: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}>
              <IconCheck size={15} color="#FFFFFF" />
              <span>{isSubmitting ? 'Saving...' : 'Save Activity'}</span>
            </button>
          </div>
        </form>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '18px' }}>
        <MetricCard label="Total Activities" value={String(activities.length)} subtext={selectedGroup?.name || 'No group'} icon={<IconActivities size={20} color="#3E7B52" />} iconBg="#EAF4ED" loading={groupsLoading || isLoading} />
        <MetricCard label="Health & Vaccines" value={String(healthCount)} subtext="Vaccinations, deworming, checks" icon={<IconLivestock size={20} color="#7C3AED" />} iconBg="#EDE9FE" loading={groupsLoading || isLoading} />
        <MetricCard label="Feeding Logs" value={String(feedingCount)} subtext="Ration & nutrition entries" icon={<IconCalendar size={20} color="#D97706" />} iconBg="#FEF3C7" loading={groupsLoading || isLoading} />
        <MetricCard label="Activity Cost" value={`${totalCost.toLocaleString('fr-CM')} XAF`} subtext="Recorded care expenses" icon={<IconCheck size={20} color="#2A6740" />} iconBg="#EAF4ED" loading={groupsLoading || isLoading} />
      </div>

      {/* History List */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #ECE7DC', padding: '24px' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.125rem', fontWeight: 600, color: '#19201C' }}>Livestock Activity Log</h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.8125rem', color: '#788680' }}>Feeding, vaccinations, health checks, and housing care for this group.</p>

        {groupsLoading || isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <SkeletonCard height="84px"><SkeletonText lines={2} /></SkeletonCard>
            <SkeletonCard height="84px"><SkeletonText lines={2} /></SkeletonCard>
          </div>
        ) : groups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#FAF8F5', borderRadius: '12px', border: '1px dashed #ECE7DC' }}>
            <p style={{ fontWeight: 600, margin: 0 }}>No animal groups registered</p>
            <p style={{ fontSize: '0.8125rem', color: '#788680', marginTop: '4px' }}>Register an animal group in Livestock before logging animal activities.</p>
          </div>
        ) : activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#FAF8F5', borderRadius: '12px', border: '1px dashed #ECE7DC' }}>
            <p style={{ fontWeight: 600, margin: 0 }}>No activities recorded yet</p>
            <p style={{ fontSize: '0.8125rem', color: '#788680', marginTop: '4px' }}>Click &quot;Record Activity&quot; above to log feeding, vaccination, or health care.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activities.map((act) => (
              <div key={act.id} style={{ padding: '16px', borderRadius: '14px', border: '1px solid #ECE7DC', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '9999px', backgroundColor: '#EAF4ED', color: '#164230', fontSize: '0.75rem', fontWeight: 700 }}>
                      {ACTIVITY_TYPES.find((t) => t.value === act.activityType)?.label || act.activityType}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: '#788680' }}>{act.activityDate}</span>
                    {act.performedBy && <span style={{ fontSize: '0.8125rem', color: '#4B5752' }}>• By {act.performedBy}</span>}
                    {act.cost != null && <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#164230' }}>• {Number(act.cost).toLocaleString('fr-CM')} XAF</span>}
                  </div>
                  {act.notes && <p style={{ margin: '8px 0 0 0', fontSize: '0.875rem', color: '#4B5752' }}>{act.notes}</p>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => openEditForm(act)} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #DFD8CA', backgroundColor: '#FFFFFF', cursor: 'pointer' }} title="Edit">
                    <IconPencil size={14} color="#4B5752" />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(act)} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', cursor: 'pointer' }} title="Delete">
                    <IconTrash size={14} color="#DC2626" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

