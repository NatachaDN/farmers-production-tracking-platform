import React, { useState, useEffect } from 'react';
import { managerService } from './services/managerService.js';
import { ManagerFarmerDetailModal } from './components/ManagerFarmerDetailModal.jsx';
import {
  IconDashboard,
  IconUsers,
  IconFarms,
  IconCrop,
  IconProduction,
  IconLivestock,
  IconActivities,
  IconCheck,
  IconClose,
  IconRefresh
} from '../../shared/components/Icons.jsx';
import { Skeleton } from '../../shared/components/Skeleton.jsx';
import './manager.css';

export function ManagerDashboardView({ onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [selectedFarmerId, setSelectedFarmerId] = useState(null);
  const [farmerDetail, setFarmerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await managerService.getDashboard();
      setSummary(data);
    } catch (err) {
      setError(err.message || 'Unable to load manager dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleOpenDetail = async (farmerId) => {
    try {
      setSelectedFarmerId(farmerId);
      setLoadingDetail(true);
      const detail = await managerService.getFarmerDetail(farmerId);
      setFarmerDetail(detail);
    } catch (err) {
      alert(err.message || 'Could not load farmer details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedFarmerId(null);
    setFarmerDetail(null);
  };

  const handleUpdateStatus = async (farmerId, status, rejectionReason) => {
    try {
      await managerService.updateFarmerStatus(farmerId, status, rejectionReason);
      setActionSuccess(`Farmer registration marked as ${status}.`);
      setTimeout(() => setActionSuccess(''), 4000);
      handleCloseDetail();
      await fetchDashboard();
    } catch (err) {
      alert(err.message || 'Failed to update farmer status');
    }
  };

  if (loading && !summary) {
    return (
      <div className="mgr-stack">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Skeleton width="280px" height="32px" style={{ marginBottom: '8px' }} />
            <Skeleton width="420px" height="16px" />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Skeleton width="100px" height="38px" borderRadius="8px" />
            <Skeleton width="160px" height="38px" borderRadius="8px" />
          </div>
        </div>

        {/* Skeleton KPI Grid */}
        <div className="mgr-grid cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mgr-card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Skeleton width="110px" height="14px" />
                <Skeleton width="30px" height="30px" borderRadius="8px" />
              </div>
              <Skeleton width="90px" height="36px" style={{ marginBottom: '10px' }} />
              <Skeleton width="140px" height="14px" />
            </div>
          ))}
        </div>

        {/* Skeleton Detail Panels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {[1, 2].map((i) => (
            <div key={i} className="mgr-card" style={{ padding: '24px' }}>
              <Skeleton width="160px" height="22px" style={{ marginBottom: '16px' }} />
              <Skeleton width="100%" height="180px" borderRadius="10px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mgr-stack">
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary, #19201C)', margin: 0 }}>
            Manager Supervision Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #788680)', margin: '4px 0 0' }}>
            Aggregated production, active cycles, and member verification across all supervised farmers.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="mgr-btn"
            onClick={fetchDashboard}
            disabled={loading}
          >
            <IconRefresh size={15} /> Refresh
          </button>
          <button
            className="mgr-btn mgr-btn-primary"
            onClick={() => onNavigate && onNavigate('manager-reports')}
          >
            Consolidated Reports
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div style={{
          padding: '12px 18px',
          background: '#EAF4ED',
          border: '1px solid #C8E2D0',
          borderRadius: '8px',
          color: '#2A6740',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}>
          {actionSuccess}
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 18px',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '8px',
          color: '#B91C1C',
          fontSize: '0.875rem',
        }}>
          {error}
        </div>
      )}

      {/* Primary Aggregated KPIs (US-33) */}
      <div className="mgr-grid cols-4">
        {/* Total Supervised Farmers */}
        <div className="mgr-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              SUPERVISED FARMERS
            </span>
            <div style={{ padding: '6px', background: '#EAF4ED', borderRadius: '8px', color: '#3E7B52' }}>
              <IconUsers size={18} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <span className="mgr-stat-val">{summary?.totalFarmers || 0}</span>
            <span className="mgr-stat-unit">members</span>
          </div>
          <div className="mgr-stat-sub">
            <span style={{ color: '#2A6740', fontWeight: 600 }}>{summary?.approvedFarmers || 0} approved</span>
            <span>·</span>
            <span style={{ color: '#D97706', fontWeight: 600 }}>{summary?.pendingFarmers || 0} pending</span>
          </div>
        </div>

        {/* Total Harvest Yield */}
        <div className="mgr-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              TOTAL YIELD OUTPUT
            </span>
            <div style={{ padding: '6px', background: '#FEF3C7', borderRadius: '8px', color: '#D97706' }}>
              <IconProduction size={18} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <span className="mgr-stat-val">{summary?.totalHarvestTons || 0}</span>
            <span className="mgr-stat-unit">Tons</span>
          </div>
          <div className="mgr-stat-sub">
            <span>{(summary?.totalHarvestKg || 0).toLocaleString()} kg recorded</span>
          </div>
        </div>

        {/* Active Cycles & Area */}
        <div className="mgr-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              ACTIVE PRODUCTION CYCLES
            </span>
            <div style={{ padding: '6px', background: '#EAF4ED', borderRadius: '8px', color: '#3E7B52' }}>
              <IconCrop size={18} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <span className="mgr-stat-val" style={{ color: '#3E7B52' }}>{summary?.activeCyclesCount || 0}</span>
            <span className="mgr-stat-unit">active cycles</span>
          </div>
          <div className="mgr-stat-sub">
            <span>{summary?.totalCultivatedAreaHa || 0} ha across {summary?.totalPlotsCount || 0} plots</span>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="mgr-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              INCIDENTS & ALERTS
            </span>
            <div style={{ padding: '6px', background: summary?.activeAlertsCount > 0 ? '#FEF2F2' : '#F4EFE6', borderRadius: '8px', color: summary?.activeAlertsCount > 0 ? '#B91C1C' : '#788680' }}>
              <IconActivities size={18} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <span className="mgr-stat-val" style={{ color: summary?.activeAlertsCount > 0 ? '#B91C1C' : 'var(--color-text-primary)' }}>
              {summary?.activeAlertsCount || 0}
            </span>
            <span className="mgr-stat-unit">alerts</span>
          </div>
          <div className="mgr-stat-sub">
            <span>{summary?.totalAnimalPopulation || 0} livestock registered</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Pending Approvals (US-34) & Top Producers (US-33) */}
      <div className="mgr-grid wide-left">
        {/* Pending Registrations Awaiting Action (US-34) */}
        <div className="mgr-card">
          <div className="mgr-card-head">
            <div>
              <div className="mgr-card-title">Pending Farmer Registrations</div>
              <div className="mgr-card-sub">
                Review and approve new member sign-ups before granting platform access.
              </div>
            </div>
            <button
              className="mgr-btn"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
              onClick={() => onNavigate && onNavigate('manager-farmers')}
            >
              View All ({summary?.pendingFarmers || 0})
            </button>
          </div>

          <div className="mgr-card-body flush">
            {(!summary?.pendingRegistrations || summary.pendingRegistrations.length === 0) ? (
              <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No pending registrations at this time. All farmer accounts are up to date!
              </div>
            ) : (
              <div className="mgr-table-wrap">
                <table className="mgr-table">
                  <thead>
                    <tr>
                      <th>Farmer Name</th>
                      <th>Location / Region</th>
                      <th>Farm Type</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.pendingRegistrations.map((f) => (
                      <tr key={f.id}>
                        <td>
                          <button
                            onClick={() => handleOpenDetail(f.id)}
                            style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
                          >
                            <div style={{ fontWeight: 600, color: 'var(--color-brand-primary, #3E7B52)' }}>{f.fullName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{f.emailOrPhone}</div>
                          </button>
                        </td>
                        <td>{f.location}</td>
                        <td>
                          <span className="mgr-pill neutral">{f.farmType}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="mgr-btn-approve"
                              onClick={() => handleUpdateStatus(f.id, 'APPROVED', null)}
                              title="Approve this farmer"
                            >
                              <IconCheck size={13} /> Approve
                            </button>
                            <button
                              className="mgr-btn-reject"
                              onClick={() => handleOpenDetail(f.id)}
                              title="Reject with explanation"
                            >
                              <IconClose size={13} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Top Producers Leaderboard (US-33) */}
        <div className="mgr-card">
          <div className="mgr-card-head">
            <div>
              <div className="mgr-card-title">Top Producers</div>
              <div className="mgr-card-sub">Highest cumulative yield</div>
            </div>
            <button
              className="mgr-btn"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
              onClick={() => onNavigate && onNavigate('manager-farmers')}
            >
              All Farmers
            </button>
          </div>

          <div className="mgr-card-body flush">
            {(!summary?.topProducers || summary.topProducers.length === 0) ? (
              <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No harvest records recorded yet.
              </div>
            ) : (
              <div className="mgr-table-wrap">
                <table className="mgr-table">
                  <thead>
                    <tr>
                      <th>Farmer</th>
                      <th>Location</th>
                      <th className="num">Yield (Tons)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.topProducers.map((tp, idx) => (
                      <tr
                        key={tp.farmerId}
                        className="clickable"
                        onClick={() => handleOpenDetail(tp.farmerId)}
                        title="Click to drill down into farmer details"
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: idx === 0 ? '#FEF3C7' : '#F4EFE6',
                              color: idx === 0 ? '#92400E' : '#4B5752',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                            }}>
                              {idx + 1}
                            </span>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{tp.farmerName}</div>
                              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                                {tp.activeCycles} active cycles · {tp.plotsCount} plots
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8125rem' }}>{tp.location}</td>
                        <td className="num">
                          <strong style={{ color: 'var(--color-brand-primary, #3E7B52)' }}>{tp.totalYieldTons} t</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Monthly Trend & Recent Alerts */}
      <div className="mgr-grid even-2">
        {/* Monthly Production Timeline */}
        <div className="mgr-card">
          <div className="mgr-card-head">
            <div>
              <div className="mgr-card-title">Production Trend (Last 12 Months)</div>
              <div className="mgr-card-sub">Aggregated output across all supervised farms</div>
            </div>
          </div>
          <div className="mgr-card-body">
            {summary?.monthlyProduction && summary.monthlyProduction.length > 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '8px',
                height: '160px',
                paddingTop: '20px',
                borderBottom: '1px solid var(--color-border-subtle)',
              }}>
                {(() => {
                  const maxVal = Math.max(...summary.monthlyProduction.map(m => m.yieldKg), 1);
                  return summary.monthlyProduction.map((m, i) => {
                    const heightPercent = Math.max((m.yieldKg / maxVal) * 100, 4);
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <div
                          title={`${m.month}: ${m.yieldKg.toLocaleString()} kg`}
                          style={{
                            width: '100%',
                            maxWidth: '28px',
                            height: `${heightPercent}%`,
                            backgroundColor: m.yieldKg > 0 ? 'var(--color-brand-primary, #3E7B52)' : '#E8E3D8',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease',
                          }}
                        />
                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                          {m.month}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No monthly production records available.
              </div>
            )}
          </div>
        </div>

        {/* Recent Alerts & Crop Incidents */}
        <div className="mgr-card">
          <div className="mgr-card-head">
            <div>
              <div className="mgr-card-title">Recent Field Incidents & Alerts</div>
              <div className="mgr-card-sub">Pest attacks, disease, and field risks</div>
            </div>
          </div>
          <div className="mgr-card-body flush">
            {(!summary?.recentAlerts || summary.recentAlerts.length === 0) ? (
              <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No active severe incidents reported.
              </div>
            ) : (
              <div className="mgr-table-wrap">
                <table className="mgr-table">
                  <thead>
                    <tr>
                      <th>Farmer / Plot</th>
                      <th>Incident</th>
                      <th>Severity</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recentAlerts.map(alert => (
                      <tr
                        key={alert.id}
                        className="clickable"
                        onClick={() => alert.farmerId && handleOpenDetail(alert.farmerId)}
                      >
                        <td>
                          <div style={{ fontWeight: 600 }}>{alert.farmerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{alert.plotName}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{alert.incidentType}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {alert.description}
                          </div>
                        </td>
                        <td>
                          <span className={`mgr-pill ${alert.severityLevel >= 4 ? 'rejected' : 'pending'}`}>
                            Level {alert.severityLevel}/5
                          </span>
                        </td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {alert.incidentDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drill-down Detail Modal */}
      {selectedFarmerId && farmerDetail && (
        <ManagerFarmerDetailModal
          detail={farmerDetail}
          onClose={handleCloseDetail}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
