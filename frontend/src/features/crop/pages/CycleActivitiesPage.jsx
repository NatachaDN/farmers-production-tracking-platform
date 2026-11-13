import React, { useState, useEffect } from 'react';
import { cycleActivityService } from '../services/cycleActivityService';
import { ActivityForm } from '../components/ActivityForm';
import { ActivityList } from '../components/ActivityList';
import {
  IconActivities,
  IconPlus,
  IconCrop,
  IconSprout,
  IconWater,
  IconClose
} from '../../../shared/components/Icons';
import { MetricCard } from '../../../shared/components/MetricCard';
import { CycleSelector } from '../components/CycleSelector';
import { useFarmerCycles, cycleLabel } from '../hooks/useFarmerCycles';

export function CycleActivitiesPage({ farmerId }) {
  const {
    cycles, selectedCycle, selectedCycleId, setSelectedCycleId,
    isLoading: cyclesLoading, error: cyclesError, reload: reloadCycles
  } = useFarmerCycles(farmerId);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const canRecord = selectedCycle?.status === 'ACTIVE';
  useEffect(() => {
    if (!showForm) return;
    const form = document.getElementById('activity-form-container');
    form?.scrollIntoView({ block: 'start' });
    form?.querySelector('input, select, button')?.focus({ preventScroll: true });
  }, [showForm, editingActivity]);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    setShowForm(false);
    setEditingActivity(null);
    if (!selectedCycleId) {
      setActivities([]);
      return;
    }
    let isMounted = true;
    setIsLoading(true);
    cycleActivityService.getActivities(farmerId, selectedCycleId)
      .then((data) => { if (isMounted) setActivities(Array.isArray(data) ? data : []); })
      .catch((err) => {
        if (!isMounted) return;
        setActivities([]);
        showToast(err?.message || 'Could not load activities for this cycle.', 'error');
      })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [farmerId, selectedCycleId]);

  // Handle Create or Update
  const handleSaveActivity = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingActivity) {
        const updated = await cycleActivityService.updateActivity(
          farmerId,
          selectedCycleId,
          editingActivity.id,
          formData
        );
        setActivities((prev) => prev.map((a) => (a.id === editingActivity.id ? updated : a)));
        showToast('Activity intervention updated successfully.');
        setEditingActivity(null);
      } else {
        const created = await cycleActivityService.createActivity(farmerId, selectedCycleId, formData);
        setActivities((prev) => [created, ...prev]);
        showToast('New activity intervention logged successfully.');
      }
      setShowForm(false);
    } catch (err) {
      showToast(err?.message || 'Failed to save activity.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('Are you sure you want to delete this activity record?')) return;
    try {
      await cycleActivityService.deleteActivity(farmerId, selectedCycleId, activityId);
      setActivities((prev) => prev.filter((a) => a.id !== activityId));
      showToast('Activity deleted successfully.');
      if (editingActivity?.id === activityId) {
        setEditingActivity(null);
        setShowForm(false);
      }
    } catch (err) {
      showToast(err?.message || 'Failed to delete activity.', 'error');
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

  // KPI Calculations (activities are already scoped to the selected cycle)
  const cycleActivities = activities;
  const totalCount = cycleActivities.length;
  const wateringCount = cycleActivities.filter((a) => a.activityType === 'WATERING').length;
  const treatmentCount = cycleActivities.filter((a) => a.activityType === 'TREATMENT').length;
  const fertilizingCount = cycleActivities.filter((a) => a.activityType === 'FERTILIZING').length;
  const lastIntervention = cycleActivities.length > 0 ? cycleActivities[0].activityDate : 'None';

  return (
    <div className="workspace-screen fade-in activities-workspace">
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          padding: '12px 20px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: toastMessage.type === 'error' ? 'var(--color-accent-red-bg)' : 'var(--color-brand-tint)',
          color: toastMessage.type === 'error' ? 'var(--color-accent-red)' : 'var(--color-brand-primary)',
          border: `1px solid ${toastMessage.type === 'error' ? 'var(--color-accent-red-border)' : 'var(--color-brand-border)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 600,
          fontSize: '0.875rem'
        }}>
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <IconClose size={16} color="currentColor" />
          </button>
        </div>
      )}

      {/* Control Bar: Cycle Selector & Action Button */}
      <div className="workspace-toolbar workspace-toolbar-panel">
        <CycleSelector
          disabled={isSubmitting}
          cycles={cycles}
          selectedCycleId={selectedCycleId}
          onSelect={setSelectedCycleId}
          isLoading={cyclesLoading}
          error={cyclesError}
          onRetry={reloadCycles}
        />

        {/* Action Button: Record Activity */}
        <button
          type="button"
          aria-expanded={showForm}
          disabled={!canRecord}
          title={canRecord ? undefined : 'Activities can only be recorded on an active cycle'}
          onClick={() => {
            setEditingActivity(null);
            setShowForm(!showForm);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: showForm && !editingActivity ? 'var(--color-text-muted)' : 'var(--color-brand-primary)',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            boxShadow: 'var(--shadow-subtle)',
            cursor: canRecord ? 'pointer' : 'not-allowed',
            opacity: canRecord ? 1 : 0.5,
            transition: 'background-color var(--transition-fast)'
          }}
        >
          {showForm && !editingActivity ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <IconClose size={16} color="currentColor" />
              <span>Close Form</span>
            </span>
          ) : (
            <>
              <IconPlus size={16} />
              <span>Record Activity</span>
            </>
          )}
        </button>
      </div>

      {/* 4 KPI Summary Cards Row */}
      <div className="acrea-responsive-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px'
      }}>
        <MetricCard
          label="Selected Cycle"
          value={selectedCycle ? cycleLabel(selectedCycle) : '—'}
          subtext={selectedCycle ? `${selectedCycle.acreage ?? '—'} ha · Status: ${selectedCycle.status}` : 'No cycle selected'}
          icon={<IconSprout size={20} color="#2D7A52" />}
          iconBg="#EAF4ED"
        />
        <MetricCard
          label="Total Interventions"
          value={totalCount}
          subtext={`Last: ${lastIntervention}`}
          icon={<IconActivities size={20} color="#0D9488" />}
          iconBg="#E6F6F4"
        />
        <MetricCard
          label="Watering & Nutrients"
          value={`${wateringCount + fertilizingCount} logs`}
          subtext={`${wateringCount} irrigation · ${fertilizingCount} feeding`}
          icon={<IconWater size={20} color="#3A86C8" />}
          iconBg="#EBF3FA"
        />
        <MetricCard
          label="Crop Treatments"
          value={`${treatmentCount} applied`}
          subtext="Pest & disease controls"
          icon={<IconCrop size={20} color="#D97706" />}
          iconBg="#FEF3C7"
        />
      </div>

      {/* Form Drawer / Container */}
      {showForm && (canRecord || editingActivity) && (
        <div id="activity-form-container" style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-card-border)',
          padding: '32px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <ActivityForm
            key={editingActivity?.id ?? 'new'}
            plantingDate={selectedCycle?.plantingDate}
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

      {/* Activities Timeline & History List */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-card-border)',
        padding: '24px 32px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <ActivityList
          activities={cycleActivities}
          isLoading={isLoading}
          onEdit={handleEditTrigger}
          onDelete={handleDeleteActivity}
        />
      </div>
    </div>
  );
}

export default CycleActivitiesPage;
