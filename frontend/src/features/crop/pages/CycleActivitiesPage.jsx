import React, { useState, useEffect } from 'react';
import { cycleActivityService } from '../services/cycleActivityService';
import { cropCycleService } from '../../crops/services/cropCycleService';
import { animalGroupService } from '../../livestock/services/animalGroupService';
import { AnimalActivitiesPanel } from '../../livestock/components/AnimalActivitiesPanel';
import { ActivityForm } from '../components/ActivityForm';
import { ActivityList } from '../components/ActivityList';
import { CycleActivityKpiCards } from '../components/CycleActivityKpiCards';
import { CycleActivityMap } from '../components/CycleActivityMap';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { Skeleton, SkeletonCard, SkeletonText } from '../../../shared/components/Skeleton';
import {
  IconActivities,
  IconPlus,
  IconCrop,
  IconClose,
  IconLivestock
} from '../../../shared/components/Icons';

export function CycleActivitiesPage({ farmerId }) {
  const [mode, setMode] = useState('crop');
  const [cycles, setCycles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [selectedCycleId, setSelectedCycleId] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoadingCycles, setIsLoadingCycles] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityIdToDelete, setActivityIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch cycles from database
  useEffect(() => {
    async function fetchCycles() {
      if (!farmerId) {
        setIsLoadingCycles(false);
        return;
      }
      setIsLoadingCycles(true);
      setGroupsLoading(true);
      try {
        const [cycleRes, groupRes] = await Promise.allSettled([
          cropCycleService.getCycles(farmerId),
          animalGroupService.getGroups()
        ]);
        const list = cycleRes.status === 'fulfilled' && Array.isArray(cycleRes.value) ? cycleRes.value : [];
        const groupList = groupRes.status === 'fulfilled' && Array.isArray(groupRes.value) ? groupRes.value : [];
        setCycles(list);
        setGroups(groupList);
        if (list.length > 0) {
          const active = list.find((c) => (c.status || '').toUpperCase() === 'ACTIVE') || list[0];
          setSelectedCycleId(active.id);
        }
      } catch (err) {
        console.error('Failed to load cycles for activities:', err);
        setCycles([]);
      } finally {
        setIsLoadingCycles(false);
        setGroupsLoading(false);
      }
    }
    fetchCycles();
  }, [farmerId]);

  const selectedCycle = cycles.find((c) => c.id === selectedCycleId) || (cycles.length > 0 ? cycles[0] : null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch activities from backend
  const loadActivities = async (cycleId) => {
    if (!cycleId || !farmerId) {
      setActivities([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await cycleActivityService.getActivities(farmerId, cycleId);
      setActivities(Array.isArray(data) ? data : []);
    } catch (err) {
      setActivities([]);
      showToast(err?.message || 'Failed to load activities from server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCycleId) {
      loadActivities(selectedCycleId);
    } else {
      setActivities([]);
    }
  }, [selectedCycleId, farmerId]);

  // Handle Create or Update
  const handleSaveActivity = async (formData) => {
    if (!selectedCycleId) return;
    setIsSubmitting(true);
    try {
      if (editingActivity) {
        const updated = await cycleActivityService.updateActivity(
          farmerId,
          selectedCycleId,
          editingActivity.id,
          formData
        );
        setActivities((prev) =>
          prev.map((a) => (a.id === editingActivity.id ? { ...a, ...updated } : a))
        );
        showToast('Activity intervention updated successfully.');
        setEditingActivity(null);
        setShowForm(false);
      } else {
        const created = await cycleActivityService.createActivity(
          farmerId,
          selectedCycleId,
          formData
        );
        setActivities((prev) => [created, ...prev]);
        showToast('New activity intervention logged successfully.');
        setShowForm(false);
      }
    } catch (err) {
      showToast(err?.message || 'Failed to save activity.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteActivity = (activityId) => {
    setActivityIdToDelete(activityId);
  };

  const confirmDeleteActivity = async () => {
    if (!activityIdToDelete) return;
    setIsDeleting(true);
    try {
      await cycleActivityService.deleteActivity(farmerId, selectedCycleId, activityIdToDelete);
      setActivities((prev) => prev.filter((a) => a.id !== activityIdToDelete));
      showToast('Activity deleted successfully.');
      if (editingActivity?.id === activityIdToDelete) {
        setEditingActivity(null);
        setShowForm(false);
      }
      setActivityIdToDelete(null);
    } catch (err) {
      showToast(err?.message || 'Failed to delete activity.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Edit Trigger
  const handleEditTrigger = (activity) => {
    setEditingActivity(activity);
    setShowForm(true);
    const formElement = document.getElementById('activity-form-container');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // KPI Calculations
  const totalCount = activities.length;
  const wateringCount = activities.filter((a) => a.activityType === 'WATERING').length;
  const treatmentCount = activities.filter((a) => a.activityType === 'TREATMENT').length;
  const fertilizingCount = activities.filter((a) => a.activityType === 'FERTILIZING').length;
  const lastIntervention = activities.length > 0 ? activities[0].activityDate : 'None';

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          padding: '12px 20px', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '0.875rem',
          backgroundColor: toastMessage.type === 'error' ? 'var(--color-accent-red-bg)' : 'var(--color-brand-tint)',
          color: toastMessage.type === 'error' ? 'var(--color-accent-red)' : 'var(--color-brand-primary)',
          border: `1px solid ${toastMessage.type === 'error' ? 'var(--color-accent-red-border)' : 'var(--color-brand-border)'}`
        }}>
          <span>{toastMessage.text}</span>
          <button type="button" onClick={() => setToastMessage(null)} style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer' }}>
            <IconClose size={16} color="currentColor" />
          </button>
        </div>
      )}

      {/* Mode Switcher: Crop Cycles vs Animal Groups */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'inline-flex', backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC', borderRadius: '12px', padding: '4px', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setMode('crop')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '8px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
              fontSize: '0.8125rem', fontWeight: 600,
              backgroundColor: mode === 'crop' ? '#164230' : 'transparent',
              color: mode === 'crop' ? '#FFFFFF' : '#4B5752'
            }}
          >
            <IconCrop size={15} color={mode === 'crop' ? '#FFFFFF' : '#4B5752'} />
            <span>Crop Cycles ({cycles.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('animal')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '8px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
              fontSize: '0.8125rem', fontWeight: 600,
              backgroundColor: mode === 'animal' ? '#164230' : 'transparent',
              color: mode === 'animal' ? '#FFFFFF' : '#4B5752'
            }}
          >
            <IconLivestock size={15} color={mode === 'animal' ? '#FFFFFF' : '#4B5752'} />
            <span>Animal Groups ({groups.length})</span>
          </button>
        </div>
      </div>

      {mode === 'animal' ? (
        <AnimalActivitiesPanel groups={groups} groupsLoading={groupsLoading} onToast={showToast} />
      ) : (
        <>
          {/* Control Bar: Cycle Dropdown & Action Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: '1 1 260px' }}>
              <label
                htmlFor="activities-cycle-select"
                style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}
              >
                SELECT CYCLE:
              </label>
              {isLoadingCycles ? (
                <Skeleton width="240px" height="40px" borderRadius="10px" />
              ) : cycles.length > 0 ? (
                <select
                  id="activities-cycle-select"
                  value={selectedCycleId || ''}
                  onChange={(e) => setSelectedCycleId(Number(e.target.value))}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: '#FFFFFF',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-input)',
                    boxShadow: 'var(--shadow-subtle)',
                    minWidth: '220px',
                    maxWidth: '100%',
                    cursor: 'pointer'
                  }}
                >
                  {cycles.map((c) => {
                    const label = c.name || [c.cropName, c.plotName].filter(Boolean).join(' · ') || `Cycle #${c.id}`;
                    return (
                      <option key={c.id} value={c.id}>
                        {label} — [{c.status || 'ACTIVE'}]
                      </option>
                    );
                  })}
                </select>
              ) : (
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  No crop cycles registered yet
                </span>
              )}
            </div>

            {/* Action Button: Record Activity */}
            {selectedCycle && (
              <button
                type="button"
                onClick={() => {
                  setEditingActivity(null);
                  setShowForm(!showForm);
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                  borderRadius: 'var(--radius-pill)', backgroundColor: showForm ? '#FFFFFF' : 'var(--color-brand-primary)',
                  color: showForm ? 'var(--color-text-primary)' : '#FFFFFF',
                  border: showForm ? '1px solid var(--color-card-border)' : 'none',
                  fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', boxShadow: 'var(--shadow-subtle)'
                }}
              >
                {showForm ? <IconClose size={16} /> : <IconPlus size={16} />}
                <span>{showForm ? 'Close Form' : 'Record Activity'}</span>
              </button>
            )}
          </div>

          {/* Inline Create / Edit Form Container */}
          {showForm && selectedCycle && (
            <div id="activity-form-container">
              <ActivityForm
                onSubmit={handleSaveActivity}
                isSubmitting={isSubmitting}
                initialData={editingActivity}
                onCancel={() => {
                  setShowForm(false);
                  setEditingActivity(null);
                }}
              />
            </div>
          )}

          {/* KPI Metric Summary Cards */}
          <CycleActivityKpiCards
            totalCount={totalCount}
            wateringCount={wateringCount}
            fertilizingCount={fertilizingCount}
            treatmentCount={treatmentCount}
            lastIntervention={lastIntervention}
            cycleName={selectedCycle?.name || (cycles.length === 0 ? 'No cycles' : 'None')}
            isLoading={isLoadingCycles || isLoading}
          />

          {/* Interactive Field Interventions Map */}
          {selectedCycle && activities.length > 0 && (
            <CycleActivityMap
              activities={activities}
              cycleName={selectedCycle?.name || selectedCycle?.plotName || ''}
            />
          )}

          {/* Activity Timeline List */}
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-card-border)',
            boxShadow: 'var(--shadow-card)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Intervention History & Log
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Chronological log of agronomic activities applied to this crop cycle.
                </p>
              </div>
            </div>

            {isLoadingCycles ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <SkeletonCard height="96px">
                  <SkeletonText lines={2} />
                </SkeletonCard>
                <SkeletonCard height="96px">
                  <SkeletonText lines={2} />
                </SkeletonCard>
              </div>
            ) : cycles.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 20px',
                backgroundColor: '#FAF8F5',
                borderRadius: '12px',
                border: '1px dashed #ECE7DC'
              }}>
                <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  No crop cycles registered
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Create a crop cycle in the Crop Production module before logging field interventions.
                </p>
              </div>
            ) : (
              <ActivityList
                activities={activities}
                isLoading={isLoading}
                onEdit={handleEditTrigger}
                onDelete={handleDeleteActivity}
              />
            )}
          </div>

          <ConfirmModal
            isOpen={!!activityIdToDelete}
            onClose={() => setActivityIdToDelete(null)}
            onConfirm={confirmDeleteActivity}
            title="Delete Activity"
            message="Are you sure you want to delete this activity record?"
            confirmText="Delete Activity"
            isDestructive={true}
            isLoading={isDeleting}
          />
        </>
      )}
    </div>
  );
}

export default CycleActivitiesPage;
