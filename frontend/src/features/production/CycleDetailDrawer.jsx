import React, { useState, useEffect } from 'react';
import { cropCycleService } from '../crops/services/cropCycleService';
import { cycleActivityService } from '../crop/services/cycleActivityService';
import { cycleIncidentService } from '../crop/services/cycleIncidentService';
import { harvestService } from '../crop/services/harvestService';
import { HarvestForm } from '../crop/components/HarvestForm';
import {
  IconClose,
  IconSprout,
  IconTomato,
  IconBean,
  IconLeaf,
  IconDroplets,
  IconShieldAlert,
  IconWheat,
  IconScale,
  IconWarning,
  IconCheckCircle
} from '../../shared/components/Icons';

function getCropIcon(cropName, size = 20) {
  const name = (cropName || '').toLowerCase();
  if (name.includes('tomato')) return <IconTomato size={size} />;
  if (name.includes('bean')) return <IconBean size={size} />;
  if (name.includes('cassava') || name.includes('potato')) return <IconLeaf size={size} />;
  return <IconSprout size={size} />;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

const ACTIVITY_LABELS = {
  WATERING: 'Watering',
  TREATMENT: 'Treatment',
  FERTILIZING: 'Fertilizing',
  WEEDING: 'Weeding'
};

const ACTIVITY_ICONS = {
  WATERING: IconDroplets,
  TREATMENT: IconShieldAlert,
  FERTILIZING: IconSprout,
  WEEDING: IconWheat
};

const INCIDENT_LABELS = {
  DISEASE: 'Disease',
  PEST: 'Pest',
  DAMAGE: 'Damage',
  WEATHER: 'Weather',
  OTHER: 'Other'
};

const SEVERITY_LABELS = ['', 'Low', 'Minor', 'Moderate', 'Serious', 'Critical'];

function severityColor(level) {
  if (!level) return null;
  if (level <= 2) return { bg: '#E8F5E9', color: '#2E7D32' };
  if (level === 3) return { bg: '#FEF3C7', color: '#92400E' };
  return { bg: '#FEE2E2', color: '#991B1B' };
}

function InfoCell({ label, value, highlight = false }) {
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: '#788680', marginBottom: '3px' }}>{label}</div>
      <div style={{
        fontSize: '0.875rem', fontWeight: highlight ? 700 : 500,
        color: highlight ? '#19201C' : '#4B5752', wordBreak: 'break-word'
      }}>
        {value || '—'}
      </div>
    </div>
  );
}

function TabButton({ active, label, count, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 16px',
        fontSize: '0.8125rem',
        fontWeight: active ? 600 : 500,
        color: active ? '#3E7B52' : '#788680',
        border: 'none',
        borderBottom: active ? '2px solid #3E7B52' : '2px solid transparent',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      }}
    >
      {label}{count != null ? ` (${count})` : ''}
    </button>
  );
}

/**
 * Full detail drawer for a selected production cycle.
 * Shows the cycle summary plus its activities, incidents, harvest and yield.
 */
export function CycleDetailDrawer({ isOpen, cycle, farmerId, onClose, onCycleUpdated }) {
  const [detail, setDetail] = useState(null);
  const [activities, setActivities] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [harvest, setHarvest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSubmittingHarvest, setIsSubmittingHarvest] = useState(false);
  const [toast, setToast] = useState(null);

  const cycleId = cycle?.id;
  const status = ((detail?.status || cycle?.status || 'ACTIVE') + '').toUpperCase();
  const isCompleted = status === 'COMPLETED';

  useEffect(() => {
    if (!isOpen || !cycleId) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      setActiveTab('overview');
      const [cycleRes, actRes, incRes, harvestRes] = await Promise.allSettled([
        cropCycleService.getCycleById(farmerId, cycleId),
        cycleActivityService.getActivities(farmerId, cycleId),
        cycleIncidentService.getIncidents(farmerId, cycleId),
        harvestService.getHarvest(farmerId, cycleId)
      ]);
      if (cancelled) return;
      if (cycleRes.status === 'fulfilled') setDetail(cycleRes.value);
      else setLoadError('Could not load cycle details. ' + (cycleRes.reason?.message || ''));
      setActivities(actRes.status === 'fulfilled' ? actRes.value : []);
      setIncidents(incRes.status === 'fulfilled' ? incRes.value : []);
      setHarvest(harvestRes.status === 'fulfilled' ? harvestRes.value : null);
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [isOpen, cycleId, farmerId]);

  useEffect(() => {
    if (!isOpen) {
      setDetail(null);
      setActivities([]);
      setIncidents([]);
      setHarvest(null);
      setToast(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const currentCycle = detail || cycle || {};
  const gap = currentCycle.gapQuantity;
  const gapPct = currentCycle.gapPercentage;
  const hasHarvest = harvest != null || currentCycle.harvestedQuantity != null;

  const handleRecordHarvest = async (formData) => {
    setIsSubmittingHarvest(true);
    try {
      const recorded = await harvestService.recordHarvest(farmerId, cycleId, formData);
      setHarvest(recorded);
      // Refresh the cycle detail behind the drawer (status → COMPLETED)
      try {
        const refreshed = await cropCycleService.getCycleById(farmerId, cycleId);
        setDetail(refreshed);
        if (onCycleUpdated) onCycleUpdated(refreshed);
      } catch {
        if (onCycleUpdated) onCycleUpdated({ ...currentCycle, status: 'COMPLETED' });
      }
      showToast('Harvest recorded — cycle marked as completed.');
    } catch (err) {
      showToast(err?.message || 'Failed to record the harvest. Please try again.');
    } finally {
      setIsSubmittingHarvest(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(19, 32, 28, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 1200, display: 'flex', justifyContent: 'flex-end', padding: 0
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(640px, 100%)', height: '100%',
          backgroundColor: '#F9F6F0', borderLeft: '1px solid #ECE7DC',
          boxShadow: '-12px 0 40px rgba(22, 66, 48, 0.18)',
          display: 'flex', flexDirection: 'column',
          animation: 'drawerIn 220ms cubic-bezier(0.16,1,0.3,1)'
        }}
      >
        <style>{`
          @keyframes drawerIn { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        `}</style>

        {/* Header */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #ECE7DC',
          padding: '20px 24px 0 24px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                backgroundColor: '#EAF4ED', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#2D7A52'
              }}>
                {getCropIcon(currentCycle.cropName)}
              </div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{
                  fontSize: '1.125rem', fontWeight: 700, color: '#19201C',
                  margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3
                }}>
                  {currentCycle.cropName || 'Crop'} · {currentCycle.plotName || 'Plot'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    backgroundColor: isCompleted ? '#F1F5F9' : '#EAF4ED',
                    color: isCompleted ? '#475569' : '#2A6740',
                    border: `1px solid ${isCompleted ? '#E2E8F0' : '#CDE2D4'}`,
                    borderRadius: '9999px',
                    padding: '2px 8px', fontSize: '0.7rem', fontWeight: 600
                  }}>
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      backgroundColor: isCompleted ? '#64748B' : '#3E7B52'
                    }} />
                    {isCompleted ? 'Completed' : 'Ongoing'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#788680' }}>
                    {currentCycle.stage || '—'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close cycle detail"
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                backgroundColor: 'transparent', border: 'none',
                color: '#788680', cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background-color 150ms ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F4EFE6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <IconClose size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: '4px', marginTop: '16px',
            borderBottom: '1px solid #ECE7DC', overflowX: 'auto'
          }}>
            <TabButton
              active={activeTab === 'overview'}
              label="Overview"
              onClick={() => setActiveTab('overview')}
            />
            <TabButton
              active={activeTab === 'activities'}
              label="Activities"
              count={activities.length}
              onClick={() => setActiveTab('activities')}
            />
            <TabButton
              active={activeTab === 'incidents'}
              label="Incidents"
              count={incidents.length}
              onClick={() => setActiveTab('incidents')}
            />
            <TabButton
              active={activeTab === 'harvest'}
              label="Harvest & Yield"
              onClick={() => setActiveTab('harvest')}
            />
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#788680', fontSize: '0.875rem', padding: '48px 0' }}>
              Loading cycle details…
            </div>
          ) : loadError ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ color: '#B91C1C', fontWeight: 600, fontSize: '0.875rem', marginBottom: '8px' }}>{loadError}</div>
              <IconWarning size={24} color="#B91C1C" />
            </div>
          ) : (
            <>
              {/* ------------------------------- OVERVIEW ------------------------------- */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Progress card */}
                  <div style={{
                    backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC',
                    borderRadius: '16px', padding: '20px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#4B5752' }}>
                        Cycle progress
                      </span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#19201C' }}>
                        {currentCycle.progress ?? 0}%
                      </span>
                    </div>
                    <div style={{
                      height: '8px', borderRadius: '999px', backgroundColor: '#ECE7DC', overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min(100, Math.max(0, currentCycle.progress ?? 0))}%`,
                        height: '100%',
                        backgroundColor: isCompleted ? '#2E7D32' : '#3E7B52',
                        borderRadius: '999px', transition: 'width 400ms ease-out'
                      }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#788680', marginTop: '8px' }}>
                      {currentCycle.subStatus || (isCompleted ? 'Completed' : 'On track')}
                    </div>
                  </div>

                  {/* Info grid */}
                  <div style={{
                    backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC',
                    borderRadius: '16px', padding: '20px',
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px'
                  }}>
                    <InfoCell label="Planting date" value={formatDateDisplay(currentCycle.plantingDate)} />
                    <InfoCell
                      label={isCompleted && harvest?.harvestDate ? 'Harvest date' : 'Planned harvest'}
                      value={formatDateDisplay(harvest?.harvestDate || currentCycle.plannedHarvestDate)}
                    />
                    <InfoCell
                      label="Cultivated area"
                      value={currentCycle.acreage != null ? `${currentCycle.acreage} ha` : null}
                    />
                    <InfoCell
                      label="Expected quantity"
                      value={currentCycle.expectedQuantity != null
                        ? `${Number(currentCycle.expectedQuantity).toLocaleString()} ${currentCycle.expectedQuantityUnit || 'kg'}`
                        : null}
                    />
                    <InfoCell
                      label="Harvested quantity"
                      value={currentCycle.harvestedQuantity != null
                        ? `${Number(currentCycle.harvestedQuantity).toLocaleString()} ${currentCycle.harvestedUnit || 'kg'}`
                        : 'Not harvested yet'}
                      highlight
                    />
                    <InfoCell
                      label="Target gap (harvested − expected)"
                      value={gap != null
                        ? `${gap > 0 ? '+' : ''}${Number(gap).toLocaleString()} ${currentCycle.expectedQuantityUnit || 'kg'}${gapPct != null ? ` (${gapPct > 0 ? '+' : ''}${Number(gapPct).toFixed(1)}%)` : ''}`
                        : '—'}
                    />
                  </div>
                </div>
              )}

              {/* ------------------------------- ACTIVITIES ------------------------------ */}
              {activeTab === 'activities' && (
                activities.length === 0 ? (
                  <div style={{
                    backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC',
                    borderRadius: '16px', padding: '40px 24px', textAlign: 'center'
                  }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      backgroundColor: '#EAF4ED', margin: '0 auto 12px auto',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <IconWheat size={20} color="#3E7B52" />
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#19201C', margin: 0 }}>
                      No activities recorded
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: '#788680', margin: '6px 0 0 0' }}>
                      Field work logged in the Activities module will appear here.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {activities.map((act) => {
                      const label = ACTIVITY_LABELS[act.activityType] || 'Activity';
                      const IconComp = ACTIVITY_ICONS[act.activityType] || IconWheat;
                      return (
                        <div key={act.id} style={{
                          backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC',
                          borderRadius: '14px', padding: '14px 18px',
                          display: 'flex', gap: '14px', alignItems: 'flex-start'
                        }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            backgroundColor: '#EAF4ED', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#2D7A52'
                          }}>
                            <IconComp size={16} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#19201C' }}>
                                {label}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#788680', whiteSpace: 'nowrap' }}>
                                {formatDateDisplay(act.activityDate)}
                              </span>
                            </div>
                            {act.notes && (
                              <div style={{
                                fontSize: '0.8125rem', color: '#4B5752', marginTop: '4px', lineHeight: 1.45
                              }}>
                                {act.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* ------------------------------- INCIDENTS ------------------------------ */}
              {activeTab === 'incidents' && (
                incidents.length === 0 ? (
                  <div style={{
                    backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC',
                    borderRadius: '16px', padding: '40px 24px', textAlign: 'center'
                  }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      backgroundColor: '#E8F5E9', margin: '0 auto 12px auto',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <IconCheckCircle size={20} color="#2E7D32" />
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#19201C', margin: 0 }}>
                      No incidents recorded
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: '#788680', margin: '6px 0 0 0' }}>
                      Diseases, pests or damage logged for this cycle will appear here.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {incidents.map((inc) => {
                      const sev = severityColor(inc.severityLevel);
                      return (
                        <div key={inc.id} style={{
                          backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC',
                          borderRadius: '14px', padding: '14px 18px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#19201C' }}>
                              {INCIDENT_LABELS[inc.incidentType] || 'Incident'}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {sev && (
                                <span style={{
                                  backgroundColor: sev.bg, color: sev.color,
                                  borderRadius: '9999px', padding: '2px 8px',
                                  fontSize: '0.7rem', fontWeight: 600
                                }}>
                                  {SEVERITY_LABELS[inc.severityLevel] || `Level ${inc.severityLevel}`}
                                </span>
                              )}
                              <span style={{ fontSize: '0.75rem', color: '#788680', whiteSpace: 'nowrap' }}>
                                {formatDateDisplay(inc.incidentDate)}
                              </span>
                            </div>
                          </div>
                          {inc.description && (
                            <div style={{ fontSize: '0.8125rem', color: '#4B5752', marginTop: '6px', lineHeight: 1.45 }}>
                              {inc.description}
                            </div>
                          )}
                          {inc.actionTaken && (
                            <div style={{ fontSize: '0.75rem', color: '#788680', marginTop: '6px' }}>
                              <span style={{ fontWeight: 600 }}>Action taken: </span>
                              {inc.actionTaken}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* ---------------------------- HARVEST & YIELD --------------------------- */}
              {activeTab === 'harvest' && (
                hasHarvest ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Yield hero */}
                    <div style={{
                      backgroundColor: '#FFFFFF', border: '1px solid #C8E2D0',
                      borderRadius: '16px', padding: '24px', backgroundColor: '#FFFFFF'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          backgroundColor: '#E6F6F4',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <IconScale size={18} color="#0D9488" />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#788680', fontWeight: 600, letterSpacing: '0.03em' }}>
                            ACTUAL YIELD
                          </div>
                          <div style={{
                            fontSize: '1.75rem', fontWeight: 700, color: '#19201C',
                            letterSpacing: '-0.02em', lineHeight: 1.2
                          }}>
                            {harvest?.yieldDisplay
                              || (currentCycle.harvestedQuantity != null
                                ? `${Number(currentCycle.harvestedQuantity).toLocaleString()} ${currentCycle.harvestedUnit || 'kg'}`
                                : '—')}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
                        paddingTop: '16px', borderTop: '1px solid #F4EFE6'
                      }}>
                        <InfoCell
                          label="Harvested quantity"
                          value={harvest?.quantity != null
                            ? `${Number(harvest.quantity).toLocaleString()} ${harvest.unit || ''}`
                            : (currentCycle.harvestedQuantity != null
                              ? `${Number(currentCycle.harvestedQuantity).toLocaleString()} ${currentCycle.harvestedUnit || ''}`
                              : null)}
                        />
                        <InfoCell label="Harvest date" value={formatDateDisplay(harvest?.harvestDate)} />
                      </div>
                      {harvest?.notes && (
                        <div style={{
                          marginTop: '14px', padding: '12px 14px',
                          backgroundColor: '#F4EFE6', borderRadius: '10px',
                          fontSize: '0.8125rem', color: '#4B5752', lineHeight: 1.5
                        }}>
                          {harvest.notes}
                        </div>
                      )}
                    </div>

                    {gap != null && (
                      <div style={{
                        backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC',
                        borderRadius: '16px', padding: '18px 20px',
                        display: 'flex', alignItems: 'center', gap: '12px'
                      }}>
                        <IconCheckCircle size={18} color={gapPct != null && gapPct < 0 ? '#92400E' : '#2E7D32'} />
                        <div style={{ fontSize: '0.8125rem', color: '#4B5752' }}>
                          Target: <strong style={{ color: '#19201C' }}>
                            {Number(currentCycle.expectedQuantity).toLocaleString()} {currentCycle.expectedQuantityUnit || 'kg'}
                          </strong>{' '}
                          — actual is{' '}
                          <strong style={{ color: gapPct != null && gapPct < 0 ? '#92400E' : '#2E7D32' }}>
                            {gapPct != null ? `${gapPct > 0 ? '+' : ''}${Number(gapPct).toFixed(1)}%` : `${gap > 0 ? '+' : ''}${Number(gap).toLocaleString()} ${currentCycle.expectedQuantityUnit || 'kg'}`}
                          </strong>{' '}
                          vs expected.
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {!isCompleted && (
                      <div style={{
                        backgroundColor: '#FEF3C7', border: '1px solid #FDE68A',
                        borderRadius: '12px', padding: '12px 16px',
                        fontSize: '0.8125rem', color: '#92400E'
                      }}>
                        Recording a harvest will mark this production cycle as completed.
                      </div>
                    )}
                    <div style={{
                      backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC',
                      borderRadius: '16px', padding: '24px'
                    }}>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#19201C', marginBottom: '4px' }}>
                        Record harvest
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#788680', marginTop: '0 0 8px 0', marginBottom: '14px' }}>
                        Enter the actual harvested quantity to compute the real yield.
                      </p>
                      <HarvestForm
                        onSubmit={handleRecordHarvest}
                        isSubmitting={isSubmittingHarvest}
                      />
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'absolute', bottom: '20px', left: '20px', right: '20px',
            backgroundColor: '#164230', color: '#FFFFFF',
            padding: '12px 18px', borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            fontSize: '0.8125rem', fontWeight: 500
          }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
