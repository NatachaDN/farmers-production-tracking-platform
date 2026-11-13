import React, { useState, useEffect } from 'react';
import { cycleActivityService } from '../services/cycleActivityService';
import { cropCycleService } from '../../crops/services/cropCycleService';
import { ActivityForm } from '../components/ActivityForm';
import { ActivityList } from '../components/ActivityList';
import { CycleActivityKpiCards } from '../components/CycleActivityKpiCards';
import { CycleActivityMap } from '../components/CycleActivityMap';
import {
  IconActivities,
  IconPlus,
  IconCrop,
  IconClose
} from '../../../shared/components/Icons';

export function CycleActivitiesPage({ farmerId }) {
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch cycles from database
  useEffect(() => {
    async function fetchCycles() {
      if (!farmerId) return;
      try {
        const data = await cropCycleService.getCycles(farmerId);
        const list = Array.isArray(data) ? data : [];
        setCycles(list);
        if (list.length > 0) {
          const active = list.find((c) => (c.status || '').toUpperCase() === 'ACTIVE') || list[0];
          setSelectedCycleId(active.id);
        }
      } catch (err) {
        console.error('Failed to load cycles for activities:', err);
        setCycles([]);
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
    } catch {
      setActivities([]);
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

      {/* Control Bar: Cycle Selector & Action Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        {/* Cycle Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', marginRight: '4px' }}>
            SELECT CYCLE:
          </span>
          {cycles.length > 0 ? (
            cycles.map((c) => {
              const isSelected = selectedCycleId === c.id;
              const displayName = c.name || `${c.cropName || 'Crop'} (${c.plotName || 'Plot'})`;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCycleId(c.id)}
                  style={{
                    padding: '8px 16px', borderRadius: 'var(--radius-pill)', fontSize: '0.8125rem',
                    fontWeight: isSelected ? 700 : 500, cursor: 'pointer', transition: 'all var(--transition-fast)',
                    backgroundColor: isSelected ? 'var(--color-brand-primary)' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : 'var(--color-text-primary)',
                    border: isSelected ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-card-border)',
                    boxShadow: isSelected ? '0 2px 8px rgba(62, 123, 82, 0.25)' : 'var(--shadow-subtle)'
                  }}
                >
                  {displayName}
                </button>
              );
            })
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
        isLoading={isLoading}
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

        {cycles.length === 0 ? (
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
    </div>
  );
}

export default CycleActivitiesPage;
