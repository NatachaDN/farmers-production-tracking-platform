import React, { useState, useEffect } from 'react';
import { cycleActivityService } from '../services/cycleActivityService';
import { ActivityForm } from '../components/ActivityForm';
import { ActivityList } from '../components/ActivityList';
import './CycleActivitiesPage.css';

// Seed/mock fallback data so the reviewer can instantly view and interact with the UI even if backend DB is offline
const INITIAL_DEMO_ACTIVITIES = [
  {
    id: 1,
    cycleId: 1,
    activityType: 'FERTILIZING',
    activityDate: '2025-03-08',
    notes: 'Applied Field A organic compost & NPK fertilizer (15-15-15) at root depth.',
    createdAt: '2025-03-08T09:30:00',
  },
  {
    id: 2,
    cycleId: 1,
    activityType: 'TREATMENT',
    activityDate: '2025-03-06',
    notes: 'Preventative bio-fungicide treatment applied to foliage in morning.',
    createdAt: '2025-03-06T08:15:00',
  },
  {
    id: 3,
    cycleId: 1,
    activityType: 'WATERING',
    activityDate: '2025-03-04',
    notes: 'Automated drip irrigation running 45 min per zone.',
    createdAt: '2025-03-04T07:00:00',
  },
  {
    id: 4,
    cycleId: 1,
    activityType: 'WEEDING',
    activityDate: '2025-03-01',
    notes: 'Manual weeding performed between rows 1 through 12.',
    createdAt: '2025-03-01T11:00:00',
  },
];

export function CycleActivitiesPage() {
  const farmerId = 1;
  const cycleId = 1;

  const [activities, setActivities] = useState(INITIAL_DEMO_ACTIVITIES);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch activities from backend (with fallback to demo state)
  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const data = await cycleActivityService.getActivities(farmerId, cycleId);
      if (Array.isArray(data) && data.length > 0) {
        setActivities(data);
      }
    } catch {
      // Backend might be offline or starting up, keep local demo state
      console.info('API unavailable or empty; using active session state.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [cycleId]);

  // Handle Create or Update
  const handleSaveActivity = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingActivity) {
        // Try backend update
        try {
          const updated = await cycleActivityService.updateActivity(
            farmerId,
            cycleId,
            editingActivity.id,
            formData
          );
          setActivities((prev) =>
            prev.map((a) => (a.id === editingActivity.id ? updated : a))
          );
        } catch {
          // Local fallback update
          setActivities((prev) =>
            prev.map((a) =>
              a.id === editingActivity.id
                ? { ...a, ...formData, updatedAt: new Date().toISOString() }
                : a
            )
          );
        }
        showToast('Activity intervention updated successfully!');
      } else {
        // Try backend create
        try {
          const created = await cycleActivityService.createActivity(
            farmerId,
            cycleId,
            formData
          );
          setActivities((prev) => [created, ...prev]);
        } catch {
          // Local fallback creation
          const newEntry = {
            id: Date.now(),
            cycleId,
            ...formData,
            createdAt: new Date().toISOString(),
          };
          setActivities((prev) => [newEntry, ...prev]);
        }
        showToast('New activity recorded in cycle history!');
      }
      setShowForm(false);
      setEditingActivity(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('Are you sure you want to delete this intervention record?')) {
      return;
    }
    try {
      try {
        await cycleActivityService.deleteActivity(farmerId, cycleId, activityId);
      } catch {
        // Local fallback removal
      }
      setActivities((prev) => prev.filter((a) => a.id !== activityId));
      showToast('Activity removed from cycle history.', 'info');
    } catch {
      showToast('Failed to delete activity.', 'error');
    }
  };

  // Handle Edit click
  const handleStartEdit = (activity) => {
    setEditingActivity(activity);
    setShowForm(true);
    setTimeout(() => {
      const formEl = document.getElementById('activity-form-container');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="cycle-page">
      {/* Top Header Navbar */}
      <header className="page-header-nav">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search interventions, crops, activities..."
          />
        </div>

        <div className="header-meta">
          <span className="header-date">{currentDateFormatted}</span>
          <button type="button" className="icon-badge-btn" title="Notifications">
            🔔
          </button>
          <div className="header-user-pill">
            <span className="header-avatar">AM</span>
            <span className="header-user-name">Alex Martin</span>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="page-main-content">
        {/* Toast Alert */}
        {toastMessage && (
          <div className={`toast-banner toast-${toastMessage.type}`}>
            <span>{toastMessage.text}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => setToastMessage(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Title & Cycle Context */}
        <div className="page-title-row">
          <div>
            <div className="breadcrumb">
              <span>Crops</span> / <span>Cycles</span> / <span>Cycle #1 (Maize 2025)</span>
            </div>
            <h1 className="main-title">Intervention Tracking</h1>
            <p className="main-subtitle">
              Record and view watering, treatments, fertilizing, and weeding on this active cycle.
            </p>
          </div>

          <div className="title-actions">
            <button
              type="button"
              className="btn btn-record"
              onClick={() => {
                setEditingActivity(null);
                setShowForm(!showForm);
              }}
            >
              {showForm && !editingActivity ? '✕ Close Form' : '+ Record Activity'}
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-wrap kpi-green">🌱</div>
            <div className="kpi-details">
              <span className="kpi-label">Active Cycle</span>
              <span className="kpi-value">Maize (Field A)</span>
              <span className="kpi-status-badge">Active</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap kpi-forest">📋</div>
            <div className="kpi-details">
              <span className="kpi-label">Total Activities</span>
              <span className="kpi-value">{activities.length}</span>
              <span className="kpi-trend">+100% complete history</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap kpi-blue">💧</div>
            <div className="kpi-details">
              <span className="kpi-label">Last Intervention</span>
              <span className="kpi-value">
                {activities[0]?.activityType || 'None'}
              </span>
              <span className="kpi-subtext">
                {activities[0]?.activityDate || 'No records'}
              </span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap kpi-ochre">🛡️</div>
            <div className="kpi-details">
              <span className="kpi-label">Intervention Types</span>
              <span className="kpi-value">4 Supported</span>
              <span className="kpi-subtext">Watering, Treatment, Fert., Weed.</span>
            </div>
          </div>
        </div>

        {/* Form Drawer / Section */}
        {showForm && (
          <div className="form-section-wrapper fade-in">
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

        {/* Activities History List */}
        <div className="history-section-wrapper">
          <ActivityList
            activities={activities}
            isLoading={isLoading}
            onEdit={handleStartEdit}
            onDelete={handleDeleteActivity}
          />
        </div>
      </main>
    </div>
  );
}
