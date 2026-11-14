import React, { useState } from 'react';
import {
  IconClose,
  IconFarms,
  IconCrop,
  IconProduction,
  IconLivestock,
  IconActivities,
  IconCheck
} from '../../../shared/components/Icons.jsx';

export function ManagerFarmerDetailModal({ detail, onClose, onUpdateStatus }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!detail || !detail.farmer) return null;
  const { farmer, farms = [], plots = [], cycles = [], harvests = [], incidents = [], animalGroups = [] } = detail;

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      await onUpdateStatus(farmer.id, 'APPROVED', null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectConfirm = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onUpdateStatus(farmer.id, 'REJECTED', rejectionReason);
      setRejecting(false);
    } finally {
      setSubmitting(false);
    }
  };

  const statusClass = (farmer.status || 'APPROVED').toLowerCase();

  return (
    <div className="mgr-modal-backdrop" onClick={onClose}>
      <div className="mgr-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="mgr-modal-head">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary, #19201C)', margin: 0 }}>
                {farmer.fullName}
              </h2>
              <span className={`mgr-pill ${statusClass}`}>
                {farmer.status}
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted, #788680)', marginTop: '4px' }}>
              {farmer.farmName} · {farmer.location} · {farmer.emailOrPhone}
            </div>
          </div>
          <button
            onClick={onClose}
            className="mgr-btn"
            style={{ padding: '6px 8px', borderRadius: '50%' }}
            aria-label="Close modal"
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* Tab Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '0 28px',
          borderBottom: '1px solid var(--color-border-subtle, #ECE7DC)',
          background: 'var(--color-surface-subtle, #F4EFE6)',
          overflowX: 'auto',
        }}>
          {[
            { id: 'overview', label: 'Overview & Farms', icon: IconFarms, count: farms.length },
            { id: 'cycles', label: 'Cycles & Plots', icon: IconCrop, count: cycles.length },
            { id: 'harvests', label: 'Harvest Records', icon: IconProduction, count: harvests.length },
            { id: 'incidents', label: 'Field Incidents', icon: IconActivities, count: incidents.length },
            { id: 'animals', label: 'Livestock', icon: IconLivestock, count: animalGroups.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 14px',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-brand-primary, #3E7B52)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--color-brand-primary, #3E7B52)' : 'var(--color-text-muted, #788680)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                fontSize: '0.6875rem',
                padding: '2px 6px',
                borderRadius: '10px',
                background: activeTab === tab.id ? 'var(--color-brand-tint, #EAF4ED)' : '#E8E3D8',
                color: activeTab === tab.id ? '#2A6740' : '#6A7670',
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="mgr-modal-body">
          {rejecting ? (
            <form onSubmit={handleRejectConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                padding: '14px 18px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                color: '#991B1B',
                fontSize: '0.875rem'
              }}>
                <strong>Reject Farmer Registration:</strong> Please provide a clear explanation for this decision.
                The farmer will see this message if they attempt to sign in.
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Reason for rejection *
                </label>
                <textarea
                  className="mgr-input"
                  style={{ width: '100%', minHeight: '100px', boxSizing: 'border-box' }}
                  required
                  placeholder="e.g. Documents d'identité non conformes; exploitation hors de la zone coopérative de l'Ouest/Bandjoun."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="mgr-btn"
                  onClick={() => setRejecting(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mgr-btn mgr-btn-reject"
                  disabled={submitting || !rejectionReason.trim()}
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Tab: Overview */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {farmer.rejectionReason && (
                    <div style={{
                      padding: '12px 16px',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      color: '#991B1B'
                    }}>
                      <strong>Rejection Note:</strong> {farmer.rejectionReason}
                    </div>
                  )}

                  {/* Summary Metric Strip */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                    <div style={{ padding: '12px 16px', background: 'var(--color-surface-subtle, #F4EFE6)', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Cultivated Area</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {plots.reduce((acc, p) => acc + (p.area || 0), 0).toFixed(1)} <span style={{ fontSize: '0.75rem' }}>ha</span>
                      </div>
                    </div>
                    <div style={{ padding: '12px 16px', background: 'var(--color-surface-subtle, #F4EFE6)', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Active Cycles</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3E7B52' }}>
                        {farmer.activeCycles}
                      </div>
                    </div>
                    <div style={{ padding: '12px 16px', background: 'var(--color-surface-subtle, #F4EFE6)', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Total Harvested</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {farmer.harvestedTons} <span style={{ fontSize: '0.75rem' }}>t</span>
                      </div>
                    </div>
                    <div style={{ padding: '12px 16px', background: 'var(--color-surface-subtle, #F4EFE6)', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Animals Registered</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#D97706' }}>
                        {animalGroups.reduce((acc, a) => acc + (a.currentPopulation || 0), 0)}
                      </div>
                    </div>
                  </div>

                  {/* Farms List */}
                  <div>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '10px' }}>Registered Farm Holdings</h3>
                    {farms.length === 0 ? (
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No farms registered yet.</p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                        {farms.map(f => (
                          <div key={f.id} style={{
                            padding: '14px',
                            background: '#FFFFFF',
                            border: '1px solid var(--color-border-subtle, #ECE7DC)',
                            borderRadius: '10px'
                          }}>
                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.875rem' }}>{f.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                              Type: {f.type} · Size: {f.size} {f.sizeUnit}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                              Location: {f.region}, {f.district}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Crops Grown */}
                  <div>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '8px' }}>Crops Tracked</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {farmer.cropsGrown && farmer.cropsGrown.length > 0 ? (
                        farmer.cropsGrown.map((c, i) => (
                          <span key={i} className="mgr-pill active">
                            {c}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>No crops declared yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Cycles & Plots */}
              {activeTab === 'cycles' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>Production Cycles ({cycles.length})</h3>
                  {cycles.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No production cycles recorded.</p>
                  ) : (
                    <div className="mgr-table-wrap">
                      <table className="mgr-table">
                        <thead>
                          <tr>
                            <th>Cycle Name</th>
                            <th>Crop</th>
                            <th>Plot</th>
                            <th>Acreage</th>
                            <th>Status</th>
                            <th>Timeline</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cycles.map(c => (
                            <tr key={c.id}>
                              <td style={{ fontWeight: 600 }}>{c.name}</td>
                              <td>{c.cropName || '—'}</td>
                              <td>{c.plotName || '—'}</td>
                              <td>{c.acreage ? `${c.acreage} ha` : '—'}</td>
                              <td>
                                <span className={`mgr-pill ${c.status === 'ACTIVE' ? 'approved' : 'neutral'}`}>
                                  {c.status}
                                </span>
                              </td>
                              <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                {c.startDate} {c.endDate ? `to ${c.endDate}` : ''}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '14px 0 0' }}>Plots ({plots.length})</h3>
                  <div className="mgr-table-wrap">
                    <table className="mgr-table">
                      <thead>
                        <tr>
                          <th>Plot Name</th>
                          <th>Area</th>
                          <th>Crop Type</th>
                          <th>Stage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plots.map(p => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 600 }}>{p.name}</td>
                            <td>{p.area ? `${p.area} ha` : '—'}</td>
                            <td>{p.cropType || '—'}</td>
                            <td>{p.stage || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab: Harvests */}
              {activeTab === 'harvests' && (
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '12px' }}>Harvest Logs</h3>
                  {harvests.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No harvests recorded yet for this farmer.</p>
                  ) : (
                    <div className="mgr-table-wrap">
                      <table className="mgr-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Crop</th>
                            <th className="num">Quantity (Kg)</th>
                            <th className="num">Yield Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {harvests.map(h => (
                            <tr key={h.id}>
                              <td>{h.harvestDate}</td>
                              <td style={{ fontWeight: 600 }}>{h.cropName}</td>
                              <td className="num">{h.quantityKg?.toLocaleString() || 0} kg</td>
                              <td className="num">
                                {h.quantityKg ? (h.quantityKg / 1000).toFixed(2) + ' t' : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Incidents */}
              {activeTab === 'incidents' && (
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '12px' }}>Field Incidents & Alerts</h3>
                  {incidents.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No recorded incidents.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {incidents.map(inc => (
                        <div key={inc.id} style={{
                          padding: '14px',
                          border: '1px solid var(--color-border-subtle)',
                          borderRadius: '10px',
                          background: inc.severityLevel >= 3 ? '#FFFBEB' : '#FFFFFF',
                          borderColor: inc.severityLevel >= 3 ? '#FDE68A' : 'var(--color-border-subtle)',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#19201C' }}>
                              {inc.incidentType} (Severity: {inc.severityLevel || 'N/A'}/5)
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{inc.incidentDate}</span>
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                            {inc.description}
                          </div>
                          {inc.actionTaken && (
                            <div style={{ fontSize: '0.75rem', color: '#2A6740', marginTop: '6px', fontWeight: 500 }}>
                              Action: {inc.actionTaken}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Livestock */}
              {activeTab === 'animals' && (
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '12px' }}>Livestock Groups</h3>
                  {animalGroups.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No animal groups registered.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                      {animalGroups.map(ag => (
                        <div key={ag.id} style={{
                          padding: '14px',
                          background: '#FFFFFF',
                          border: '1px solid var(--color-border-subtle, #ECE7DC)',
                          borderRadius: '10px'
                        }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{ag.name || ag.animalType}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            Breed: {ag.breed || 'Standard'} · {ag.currentPopulation} heads
                          </div>
                          {ag.location && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                              Housing: {ag.location}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="mgr-modal-foot">
          <div style={{ flex: 1, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Status: <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{farmer.status}</span>
          </div>
          {!rejecting && (
            <>
              {farmer.status !== 'APPROVED' && (
                <button
                  type="button"
                  className="mgr-btn mgr-btn-approve"
                  onClick={handleApprove}
                  disabled={submitting}
                >
                  <IconCheck size={14} /> Approve Farmer
                </button>
              )}
              {farmer.status !== 'REJECTED' && (
                <button
                  type="button"
                  className="mgr-btn mgr-btn-reject"
                  onClick={() => setRejecting(true)}
                  disabled={submitting}
                >
                  <IconClose size={14} /> Reject Farmer
                </button>
              )}
            </>
          )}
          <button type="button" className="mgr-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
