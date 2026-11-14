import React, { useState, useEffect, useMemo } from 'react';
import { managerService } from './services/managerService.js';
import { ManagerFarmerDetailModal } from './components/ManagerFarmerDetailModal.jsx';
import {
  IconUsers,
  IconSearch,
  IconCheck,
  IconClose,
  IconRefresh
} from '../../shared/components/Icons.jsx';
import { Skeleton } from '../../shared/components/Skeleton.jsx';
import './manager.css';

export function ManagerFarmersView() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Filters state
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [cropFilter, setCropFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('name');

  // Drilldown Modal
  const [selectedFarmerId, setSelectedFarmerId] = useState(null);
  const [farmerDetail, setFarmerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Rejection modal prompt
  const [rejectPromptFarmer, setRejectPromptFarmer] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await managerService.getFarmers({
        search,
        region: regionFilter,
        crop: cropFilter,
        status: statusFilter,
        sort: sortField,
      });
      setFarmers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load farmers list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, [search, regionFilter, cropFilter, statusFilter, sortField]);

  // Extract distinct regions and crops across all loaded data for filter dropdowns
  const availableRegions = useMemo(() => {
    const set = new Set();
    farmers.forEach(f => {
      if (f.region) set.add(f.region);
    });
    return Array.from(set).sort();
  }, [farmers]);

  const availableCrops = useMemo(() => {
    const set = new Set();
    farmers.forEach(f => {
      if (f.cropsGrown) {
        f.cropsGrown.forEach(c => set.add(c));
      }
    });
    return Array.from(set).sort();
  }, [farmers]);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = { ALL: farmers.length, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    farmers.forEach(f => {
      if (f.status && counts[f.status] !== undefined) {
        counts[f.status]++;
      }
    });
    return counts;
  }, [farmers]);

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

  const handleUpdateStatus = async (farmerId, status, reason) => {
    try {
      setSubmittingAction(true);
      await managerService.updateFarmerStatus(farmerId, status, reason);
      setActionSuccess(`Farmer status successfully updated to ${status}.`);
      setTimeout(() => setActionSuccess(''), 4000);
      setRejectPromptFarmer(null);
      setRejectionReason('');
      handleCloseDetail();
      await fetchFarmers();
    } catch (err) {
      alert(err.message || 'Failed to update farmer status');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="mgr-stack">
      {/* Title & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary, #19201C)', margin: 0 }}>
            Supervised Farmers Overview
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #788680)', margin: '4px 0 0' }}>
            Comprehensive directory of supervised members, farms, crops, active cycles, and verification status.
          </p>
        </div>
        <button className="mgr-btn" onClick={fetchFarmers} disabled={loading}>
          <IconRefresh size={15} /> Refresh List
        </button>
      </div>

      {actionSuccess && (
        <div style={{
          padding: '12px 18px',
          background: '#EAF4ED',
          border: '1px solid #C8E2D0',
          borderRadius: '8px',
          color: '#2A6740',
          fontSize: '0.875rem',
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

      {/* Filter and Search Bar (US-31, US-32) */}
      <div className="mgr-card" style={{ padding: '16px 20px' }}>
        <div className="mgr-toolbar">
          {/* Status Tabs (US-32, US-34) */}
          <div className="mgr-toolbar-group">
            {[
              { id: 'ALL', label: 'All Members', count: statusCounts.ALL },
              { id: 'PENDING', label: 'Pending Approval', count: statusCounts.PENDING },
              { id: 'APPROVED', label: 'Approved', count: statusCounts.APPROVED },
              { id: 'REJECTED', label: 'Rejected', count: statusCounts.REJECTED },
            ].map(tab => (
              <button
                key={tab.id}
                className={`mgr-chip ${statusFilter === tab.id ? 'active' : ''}`}
                onClick={() => setStatusFilter(tab.id)}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              className="mgr-input"
              placeholder="Rechercher nom (Kamga, Mbida), localité (Bandjoun, Bassa)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Second Row: Region, Crop, and Sort dropdowns */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--color-border-subtle, #ECE7DC)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Region:</span>
            <select
              className="mgr-select"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              <option value="ALL">All Regions</option>
              {availableRegions.map(reg => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Crop:</span>
            <select
              className="mgr-select"
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
            >
              <option value="ALL">All Crops</option>
              {availableCrops.map(crp => (
                <option key={crp} value={crp}>{crp}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Sort by:</span>
            <select
              className="mgr-select"
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="name">Name (A-Z)</option>
              <option value="cycles">Active Cycles (High-Low)</option>
              <option value="plots">Plots Count (High-Low)</option>
              <option value="harvest">Total Harvest (High-Low)</option>
              <option value="joined">Date Joined (Newest)</option>
              <option value="status">Status (Pending First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Farmers Table (US-31) */}
      <div className="mgr-card">
        <div className="mgr-table-wrap">
          <table className="mgr-table">
            <thead>
              <tr>
                <th>Farmer</th>
                <th>Farm / Location</th>
                <th>Crops Grown</th>
                <th className="num">Plots</th>
                <th className="num">Active Cycles</th>
                <th className="num">Harvested</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && farmers.length === 0 ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td>
                      <Skeleton width="130px" height="16px" style={{ marginBottom: '6px' }} />
                      <Skeleton width="90px" height="12px" />
                    </td>
                    <td>
                      <Skeleton width="110px" height="14px" style={{ marginBottom: '4px' }} />
                      <Skeleton width="80px" height="12px" />
                    </td>
                    <td><Skeleton width="100px" height="14px" /></td>
                    <td className="num"><Skeleton width="30px" height="16px" style={{ marginLeft: 'auto' }} /></td>
                    <td className="num"><Skeleton width="30px" height="16px" style={{ marginLeft: 'auto' }} /></td>
                    <td className="num"><Skeleton width="60px" height="16px" style={{ marginLeft: 'auto' }} /></td>
                    <td><Skeleton width="70px" height="22px" borderRadius="9999px" /></td>
                    <td><Skeleton width="80px" height="28px" borderRadius="6px" /></td>
                  </tr>
                ))
              ) : farmers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                    No farmers found matching the specified filters. Try adjusting your search query or criteria.
                  </td>
                </tr>
              ) : (
                farmers.map(farmer => {
                  const statusClass = (farmer.status || 'APPROVED').toLowerCase();
                  return (
                    <tr
                      key={farmer.id}
                      className="clickable"
                      onClick={() => handleOpenDetail(farmer.id)}
                    >
                      {/* Farmer Name & Contact */}
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{farmer.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{farmer.emailOrPhone}</div>
                      </td>

                      {/* Farm & Location */}
                      <td>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{farmer.farmName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{farmer.location}</div>
                      </td>

                      {/* Crops Grown */}
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '200px' }}>
                          {farmer.cropsGrown && farmer.cropsGrown.length > 0 ? (
                            farmer.cropsGrown.map((c, i) => (
                              <span key={i} className="mgr-pill neutral" style={{ fontSize: '0.6875rem' }}>
                                {c}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>None declared</span>
                          )}
                        </div>
                      </td>

                      {/* Plots Count (US-31) */}
                      <td className="num">
                        <strong style={{ color: 'var(--color-text-primary)' }}>{farmer.plotsCount}</strong>
                      </td>

                      {/* Active Cycles (US-31) */}
                      <td className="num">
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: farmer.activeCycles > 0 ? 'var(--color-brand-tint, #EAF4ED)' : '#F4EFE6',
                          color: farmer.activeCycles > 0 ? '#2A6740' : '#788680',
                          fontWeight: 600,
                        }}>
                          {farmer.activeCycles}
                        </span>
                      </td>

                      {/* Harvested */}
                      <td className="num">
                        <strong style={{ color: 'var(--color-brand-primary, #3E7B52)' }}>{farmer.harvestedTons} t</strong>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                          {farmer.harvestedKg?.toLocaleString() || 0} kg
                        </div>
                      </td>

                      {/* Registration Status (US-34) */}
                      <td>
                        <span className={`mgr-pill ${statusClass}`}>
                          {farmer.status}
                        </span>
                      </td>

                      {/* Actions (US-34) */}
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="mgr-btn"
                            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                            onClick={() => handleOpenDetail(farmer.id)}
                            title="Drill down into full farmer portfolio"
                          >
                            Details
                          </button>
                          {farmer.status !== 'APPROVED' && (
                            <button
                              className="mgr-btn-approve"
                              onClick={() => handleUpdateStatus(farmer.id, 'APPROVED', null)}
                              title="Approve registration"
                            >
                              <IconCheck size={12} />
                            </button>
                          )}
                          {farmer.status !== 'REJECTED' && (
                            <button
                              className="mgr-btn-reject"
                              onClick={() => setRejectPromptFarmer(farmer)}
                              title="Reject registration"
                            >
                              <IconClose size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Prompt Modal */}
      {rejectPromptFarmer && (
        <div className="mgr-modal-backdrop" onClick={() => setRejectPromptFarmer(null)}>
          <div className="mgr-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="mgr-modal-head">
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                Reject Farmer Registration
              </h3>
            </div>
            <div className="mgr-modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: 0 }}>
                You are about to reject <strong>{rejectPromptFarmer.fullName}</strong> ({rejectPromptFarmer.emailOrPhone}).
                Please provide an explanatory reason.
              </p>
              <textarea
                className="mgr-input"
                style={{ width: '100%', minHeight: '90px', boxSizing: 'border-box' }}
                placeholder="Motif du rejet (e.g., Limites de l'exploitation de Bandjoun non certifiées ou pièces incomplètes)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="mgr-modal-foot">
              <button
                className="mgr-btn"
                onClick={() => setRejectPromptFarmer(null)}
                disabled={submittingAction}
              >
                Cancel
              </button>
              <button
                className="mgr-btn mgr-btn-reject"
                onClick={() => handleUpdateStatus(rejectPromptFarmer.id, 'REJECTED', rejectionReason)}
                disabled={submittingAction || !rejectionReason.trim()}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

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
