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
  IconCheck
} from '../../../shared/components/Icons';
import { MetricCard } from '../../../shared/components/MetricCard';

const DEMO_CYCLES = [
  { id: 1, name: 'Maize (Plot A)', crop: 'Maize', plot: 'Plot A', status: 'ACTIVE', area: '2.5 ha' },
  { id: 2, name: 'Tomatoes (Plot B)', crop: 'Tomatoes', plot: 'Plot B', status: 'ACTIVE', area: '1.0 ha' },
  { id: 3, name: 'Beans (Plot C)', crop: 'Beans', plot: 'Plot C', status: 'ACTIVE', area: '0.8 ha' },
];

const INITIAL_DEMO_ACTIVITIES = [
  {
    id: 1,
    cycleId: 1,
    activityType: 'FERTILIZING',
    activityDate: '2026-10-06',
    notes: 'Applied Field A organic compost & NPK fertilizer (15-15-15) at root depth.',
    createdAt: '2026-10-06T09:30:00',
  },
  {
    id: 2,
    cycleId: 1,
    activityType: 'TREATMENT',
    activityDate: '2026-10-04',
    notes: 'Preventative bio-fungicide treatment applied to foliage in morning.',
    createdAt: '2026-10-04T08:15:00',
  },
  {
    id: 3,
    cycleId: 1,
    activityType: 'WATERING',
    activityDate: '2026-10-02',
    notes: 'Automated drip irrigation running 45 min per zone.',
    createdAt: '2026-10-02T07:00:00',
  },
  {
    id: 4,
    cycleId: 1,
    activityType: 'WEEDING',
    activityDate: '2026-09-28',
    notes: 'Manual weeding performed between rows 1 through 12.',
    createdAt: '2026-09-28T11:00:00',
  },
];

export function CycleActivitiesPage({ farmerId = 1 }) {
  const [selectedCycleId, setSelectedCycleId] = useState(1);
  const [activities, setActivities] = useState(INITIAL_DEMO_ACTIVITIES);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const selectedCycle = DEMO_CYCLES.find((c) => c.id === selectedCycleId) || DEMO_CYCLES[0];

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch activities from backend (with fallback to demo state)
  const loadActivities = async (cycleId) => {
    setIsLoading(true);
    try {
      const data = await cycleActivityService.getActivities(farmerId, cycleId);
      if (Array.isArray(data) && data.length > 0) {
        setActivities(data);
      }
    } catch {
      console.info('Using active session state for activities.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities(selectedCycleId);
  }, [selectedCycleId]);

  // Handle Create or Update
  const handleSaveActivity = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingActivity) {
        try {
          const updated = await cycleActivityService.updateActivity(
            farmerId,
            selectedCycleId,
            editingActivity.id,
            formData
          );
          setActivities((prev) =>
            prev.map((a) => (a.id === editingActivity.id ? updated : a))
          );
        } catch {
          setActivities((prev) =>
            prev.map((a) =>
              a.id === editingActivity.id
                ? { ...a, ...formData, updatedAt: new Date().toISOString() }
                : a
            )
          );
        }
        showToast('Activity record updated successfully!');
      } else {
        try {
          const created = await cycleActivityService.createActivity(
            farmerId,
            selectedCycleId,
            formData
          );
          setActivities((prev) => [created, ...prev]);
        } catch {
          const newEntry = {
            id: Date.now(),
            cycleId: selectedCycleId,
            ...formData,
            createdAt: new Date().toISOString(),
          };
          setActivities((prev) => [newEntry, ...prev]);
        }
        showToast('New activity recorded successfully!');
      }
      setShowForm(false);
      setEditingActivity(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('Are you sure you want to delete this activity record?')) {
      return;
    }
    try {
      try {
        await cycleActivityService.deleteActivity(farmerId, selectedCycleId, activityId);
      } catch {
        // Fallback
      }
      setActivities((prev) => prev.filter((a) => a.id !== activityId));
      showToast('Activity removed.', 'info');
    } catch {
      showToast('Failed to delete activity.', 'error');
    }
  };

  const handleStartEdit = (activity) => {
    setEditingActivity(activity);
    setShowForm(true);
    setTimeout(() => {
      const formEl = document.getElementById('activity-form-container');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  const wateringCount = activities.filter((a) => a.activityType === 'WATERING').length;
  const treatmentCount = activities.filter((a) => a.activityType === 'TREATMENT').length;
  const fertilizingCount = activities.filter((a) => a.activityType === 'FERTILIZING').length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            style={{ fontSize: '1rem', color: 'inherit', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Control Bar: Cycle Selector & Action Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        {/* Cycle Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', marginRight: '4px' }}>
            SELECT CYCLE:
          </span>
          {DEMO_CYCLES.map((c) => {
            const isSelected = selectedCycleId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCycleId(c.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 700 : 500,
                  backgroundColor: isSelected ? 'var(--color-brand-primary)' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : 'var(--color-text-primary)',
                  border: isSelected ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-card-border)',
                  boxShadow: isSelected ? '0 2px 8px rgba(62, 123, 82, 0.25)' : 'var(--shadow-subtle)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Action Button: Record Activity */}
        <button
          type="button"
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
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast)'
          }}
        >
          {showForm && !editingActivity ? (
            <span>✕ Close Form</span>
          ) : (
            <>
              <IconPlus size={16} />
              <span>Record Activity</span>
            </>
          )}
        </button>
      </div>

      {/* 4 KPI Summary Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px'
      }}>
        <MetricCard
          label="Active Cycle"
          value={selectedCycle.name}
          subtext={`${selectedCycle.area} · Status: ${selectedCycle.status}`}
          icon={<IconSprout size={20} color="#2D7A52" />}
          iconBg="#EAF4ED"
        />
        <MetricCard
          label="Total Interventions"
          value={activities.length.toString()}
          subtext="Recorded to date"
          icon={<IconActivities size={20} color="#2D7A52" />}
          iconBg="#E8F5E9"
        />
        <MetricCard
          label="Watering Logs"
          value={wateringCount.toString()}
          subtext="Irrigation cycles"
          icon={<IconWater size={20} color="#2563EB" />}
          iconBg="#EFF6FF"
        />
        <MetricCard
          label="Treatments & Fert."
          value={(treatmentCount + fertilizingCount).toString()}
          subtext={`${treatmentCount} treatments · ${fertilizingCount} fertilizers`}
          icon={<IconCrop size={20} color="#D97706" />}
          iconBg="#FEF3C7"
        />
      </div>

      {/* Form Drawer / Section */}
      {showForm && (
        <div className="fade-in" style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-card-border)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <ActivityForm
            key={editingActivity ? `edit-${editingActivity.id}` : 'new-activity'}
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

      {/* Activities History Section */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-card-border)',
        padding: '24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <ActivityList
          activities={activities}
          isLoading={isLoading}
          onEdit={handleStartEdit}
          onDelete={handleDeleteActivity}
        />
      </div>
    </div>
  );
}

export default CycleActivitiesPage;
