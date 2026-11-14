import React, { useState, useEffect } from 'react';
import './CycleIncidentsPage.css';
import { cycleIncidentService } from '../services/cycleIncidentService';
import { cropCycleService } from '../../crops/services/cropCycleService';
import { animalGroupService } from '../../livestock/services/animalGroupService';
import { IncidentList } from '../components/IncidentList';
import { MetricCard } from '../../../shared/components/MetricCard';
import { Skeleton } from '../../../shared/components/Skeleton';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import {
  IconAlertTriangle,
  IconShieldAlert,
  IconBug,
  IconAlertCircle,
  IconClose,
  IconPlus,
  IconCheck,
  IconCrop,
  IconLivestock
} from '../../../shared/components/Icons';

/**
 * CycleIncidentsPage — Unified Incidents & Protection view for both
 * Crop Cycles and Animal Groups (livestock herds/flocks).
 */
export function CycleIncidentsPage({
  farmerId,
  initialMode = 'crop',
  initialCycleId = null,
  onCreateIncident,
  onEditIncident
}) {
  const [mode, setMode] = useState(initialMode || 'crop');
  const [cycles, setCycles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [targetsLoading, setTargetsLoading] = useState(true);
  const [selectedTargetId, setSelectedTargetId] = useState(initialCycleId || null);
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [incidentToDelete, setIncidentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch both crop cycles and animal groups
  useEffect(() => {
    async function fetchTargets() {
      if (!farmerId) {
        setTargetsLoading(false);
        return;
      }
      setTargetsLoading(true);
      try {
        const [cycleRes, groupRes] = await Promise.allSettled([
          cropCycleService.getCycles(farmerId),
          animalGroupService.getGroups()
        ]);
        const cycleList = cycleRes.status === 'fulfilled' && Array.isArray(cycleRes.value) ? cycleRes.value : [];
        const groupList = groupRes.status === 'fulfilled' && Array.isArray(groupRes.value) ? groupRes.value : [];
        setCycles(cycleList);
        setGroups(groupList);

        const activeList = (initialMode || 'crop') === 'animal' ? groupList : cycleList;
        if (activeList.length > 0) {
          const targetId = initialCycleId && activeList.some((x) => x.id === initialCycleId)
            ? initialCycleId
            : (activeList.find((x) => (x.status || '').toUpperCase() === 'ACTIVE') || activeList[0]).id;
          setSelectedTargetId(targetId);
        } else {
          setSelectedTargetId(null);
        }
      } finally {
        setTargetsLoading(false);
      }
    }
    fetchTargets();
  }, [farmerId, initialCycleId, initialMode]);

  const handleModeSwitch = (nextMode) => {
    setMode(nextMode);
    const list = nextMode === 'animal' ? groups : cycles;
    if (list.length > 0) {
      const first = list.find((x) => (x.status || '').toUpperCase() === 'ACTIVE') || list[0];
      setSelectedTargetId(first.id);
    } else {
      setSelectedTargetId(null);
    }
  };

  const targetList = mode === 'animal' ? groups : cycles;
  const selectedTarget = targetList.find((x) => x.id === selectedTargetId) || null;

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Load incidents for selected cycle or animal group
  useEffect(() => {
    async function loadIncidents() {
      if (!selectedTargetId || !farmerId) {
        setIncidents([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = mode === 'animal'
          ? await animalGroupService.getIncidents(selectedTargetId)
          : await cycleIncidentService.getIncidents(farmerId, selectedTargetId);
        setIncidents(Array.isArray(data) ? data : []);
      } catch {
        setIncidents([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadIncidents();
  }, [selectedTargetId, farmerId, mode]);

  const confirmDelete = async () => {
    if (!incidentToDelete || !selectedTargetId) return;
    setIsDeleting(true);
    try {
      if (mode === 'animal') {
        await animalGroupService.deleteIncident(selectedTargetId, incidentToDelete.id);
      } else {
        await cycleIncidentService.deleteIncident(farmerId, selectedTargetId, incidentToDelete.id);
      }
      setIncidents((prev) => prev.filter((i) => i.id !== incidentToDelete.id));
      showToast('Incident record deleted.');
    } catch (err) {
      showToast(err?.message || 'Failed to delete incident.', 'error');
    } finally {
      setIsDeleting(false);
      setIncidentToDelete(null);
    }
  };

  // KPIs
  const totalIncidents = incidents.length;
  const diseaseCount = incidents.filter((i) => i.incidentType === 'DISEASE').length;
  const thirdCardCount = mode === 'animal'
    ? incidents.filter((i) => i.incidentType === 'MORTALITY' || i.incidentType === 'INJURY').length
    : incidents.filter((i) => i.incidentType === 'PEST').length;
  const highSeverity = incidents.filter((i) => i.severityLevel && i.severityLevel >= 4).length;

  const latestIncidentDate = incidents.length > 0
    ? incidents.map((i) => i.incidentDate).filter(Boolean).sort().reverse()[0]
    : null;

  const formattedLatestDate = latestIncidentDate
    ? new Date(latestIncidentDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : null;

  const targetDisplayName = selectedTarget
    ? mode === 'animal'
      ? `${selectedTarget.name} (${selectedTarget.animalType})`
      : selectedTarget.name || `${selectedTarget.cropName || 'Crop'}${selectedTarget.plotName ? ` (${selectedTarget.plotName})` : ''}`
    : mode === 'animal' ? 'No group selected' : 'No cycle selected';

  return (
    <div className="cycle-incidents-page fade-in">
      {toastMessage && (
        <div className={`toast-bar ${toastMessage.type}`}>
          <span>{toastMessage.text}</span>
          <button type="button" className="toast-close-btn" onClick={() => setToastMessage(null)} aria-label="Close">
            <IconClose size={14} />
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(incidentToDelete)}
        title="Delete Incident Record"
        message="Are you sure you want to remove this incident report? This action cannot be undone."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Incident'}
        isDestructive
        onConfirm={confirmDelete}
        onCancel={() => setIncidentToDelete(null)}
      />

      {/* Mode Switcher: Crop Cycles vs Animal Groups */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'inline-flex', backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC', borderRadius: '12px', padding: '4px', gap: '4px' }}>
          <button
            type="button"
            onClick={() => handleModeSwitch('crop')}
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
            onClick={() => handleModeSwitch('animal')}
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

      {/* Dropdown Selector + Report Incident Action */}
      <div className="incident-selector-card">
        <div className="incident-selector-group">
          <label htmlFor="incidents-cycle-dropdown" className="incident-selector-label">
            {mode === 'animal' ? 'Select Animal Group:' : 'Select Crop Cycle:'}
          </label>
          {targetsLoading ? (
            <Skeleton width="260px" height="40px" borderRadius="10px" />
          ) : targetList.length > 0 ? (
            <select
              id="incidents-cycle-dropdown"
              className="incident-cycle-select"
              value={selectedTargetId || ''}
              onChange={(e) => setSelectedTargetId(Number(e.target.value))}
            >
              {targetList.map((item) => {
                const label = mode === 'animal'
                  ? `${item.name} — ${item.animalType} (${item.currentPopulation ?? item.initialPopulation ?? 0} head)`
                  : item.name || `${item.cropName || 'Crop'}${item.plotName ? ` (${item.plotName})` : ''}`;
                return (
                  <option key={item.id} value={item.id}>
                    {label} — [{(item.status || 'ACTIVE').toUpperCase()}]
                  </option>
                );
              })}
            </select>
          ) : (
            <span style={{ fontSize: '0.875rem', color: '#788680' }}>
              {mode === 'animal' ? 'No animal groups registered yet' : 'No crop cycles registered yet'}
            </span>
          )}
        </div>

        {!targetsLoading && targetList.length > 0 && (
          <button
            id="report-incident-btn"
            type="button"
            className="record-incident-btn"
            onClick={() => onCreateIncident?.(mode, selectedTargetId)}
          >
            <IconPlus size={16} color="#FFFFFF" />
            <span>Report Incident</span>
          </button>
        )}
      </div>

      {/* Incident Occurrence Indicator Banner */}
      {!targetsLoading && selectedTarget && (
        isLoading ? (
          <Skeleton width="100%" height="68px" borderRadius="16px" />
        ) : totalIncidents > 0 ? (
          <div className="incident-status-banner has-incidents">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <IconAlertTriangle size={20} color="#DC2626" />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#991B1B' }}>
                  Incidents Occurred on {targetDisplayName}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#B91C1C', marginTop: '2px' }}>
                  {totalIncidents} incident{totalIncidents > 1 ? 's' : ''} recorded
                  {formattedLatestDate ? ` • Latest on ${formattedLatestDate}` : ''}
                  {highSeverity > 0 ? ` • ${highSeverity} high-severity` : ''}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onCreateIncident?.(mode, selectedTargetId)}
              style={{
                padding: '8px 14px', borderRadius: '10px', border: '1px solid #FCA5A5',
                backgroundColor: '#FFFFFF', color: '#991B1B', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              + Add Another Incident
            </button>
          </div>
        ) : (
          <div className="incident-status-banner no-incidents">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <IconCheck size={20} color="#2A6740" />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#164230' }}>
                  No Incidents Occurred on {targetDisplayName}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#2A6740', marginTop: '2px' }}>
                  {mode === 'animal'
                    ? 'Herd / flock is currently clear — no diseases, injuries, or losses reported.'
                    : 'No pests, diseases, weather damage, or field issues have been reported for this cycle.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onCreateIncident?.(mode, selectedTargetId)}
              style={{
                padding: '8px 14px', borderRadius: '10px', border: '1px solid #C8E2D0',
                backgroundColor: '#FFFFFF', color: '#164230', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              + Report an Incident
            </button>
          </div>
        )
      )}

      {/* KPI Row */}
      <div className="kpi-grid">
        <MetricCard
          label="Total Incidents"
          value={String(totalIncidents)}
          subtext={targetDisplayName}
          icon={<IconAlertTriangle size={20} color="#DC2626" />}
          iconBg="#FEF2F2"
          loading={targetsLoading || isLoading}
        />
        <MetricCard
          label="Disease Reports"
          value={String(diseaseCount)}
          subtext={mode === 'animal' ? 'Infectious / illness' : 'Fungal / bacterial / viral'}
          icon={<IconShieldAlert size={20} color="#7C3AED" />}
          iconBg="#EDE9FE"
          loading={targetsLoading || isLoading}
        />
        <MetricCard
          label={mode === 'animal' ? 'Mortality / Injury' : 'Pest Infestations'}
          value={String(thirdCardCount)}
          subtext={mode === 'animal' ? 'Trauma or animal loss' : 'Insects / mites / nematodes'}
          icon={<IconBug size={20} color="#D97706" />}
          iconBg="#FEF3C7"
          loading={targetsLoading || isLoading}
        />
        <MetricCard
          label="High Severity"
          value={String(highSeverity)}
          subtext="Level 4 (Serious) or 5 (Critical)"
          icon={<IconAlertCircle size={20} color="#DC2626" />}
          iconBg="#FEE2E2"
          loading={targetsLoading || isLoading}
        />
      </div>

      {/* Incident List */}
      <div className="incident-list-container">
        <div className="list-header">
          <div>
            <h3>{mode === 'animal' ? 'Animal Group Incident Log' : 'Cycle Incident Log'}</h3>
            <p>
              {mode === 'animal'
                ? 'Health alerts, injuries, mortalities, and veterinary actions recorded for this group.'
                : 'Pests, diseases, damages, and remedial actions recorded for this cycle.'}
            </p>
          </div>
        </div>

        {targetsLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton width="100%" height="76px" borderRadius="12px" />
            <Skeleton width="100%" height="76px" borderRadius="12px" />
          </div>
        ) : targetList.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            backgroundColor: '#FAF8F5', borderRadius: '12px', border: '1px dashed #ECE7DC'
          }}>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#19201C', margin: 0 }}>
              {mode === 'animal' ? 'No animal groups registered' : 'No crop cycles registered'}
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#788680', marginTop: '4px', marginBottom: 0 }}>
              {mode === 'animal'
                ? 'Register an animal group in the Livestock module before logging incidents.'
                : 'Create a crop cycle in the Crop Production module before logging incidents.'}
            </p>
          </div>
        ) : (
          <IncidentList
            incidents={incidents}
            isLoading={isLoading}
            onEdit={(inc) => onEditIncident?.(mode, selectedTargetId, inc)}
            onDelete={(id) => {
              const target = incidents.find((i) => i.id === id);
              if (target) setIncidentToDelete(target);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default CycleIncidentsPage;
