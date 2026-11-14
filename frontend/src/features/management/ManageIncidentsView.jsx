import React, { useEffect, useState } from 'react';
import { managerService } from '../manager/services/managerService';
import { IconSearch, IconClose } from '../../shared/components/Icons';

const cardStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #ECE7DC',
  borderRadius: '16px',
  padding: 'clamp(16px, 3vw, 24px)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
};

const inputStyle = {
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid #DFD8CA',
  fontSize: '0.875rem',
  backgroundColor: '#FFFFFF',
  color: '#19201C',
  boxSizing: 'border-box',
};

const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 14px',
  borderRadius: '9999px',
  border: 'none',
  backgroundColor: '#164230',
  color: '#FFFFFF',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnSecondary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 14px',
  borderRadius: '9999px',
  border: '1px solid #DFD8CA',
  backgroundColor: '#FFFFFF',
  color: '#19201C',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const statusBadgeStyle = (status) => {
  const s = (status || 'OPEN').toUpperCase();
  if (s === 'RESOLVED') return { backgroundColor: '#EAF4ED', color: '#164230' };
  if (s === 'IN_PROGRESS') return { backgroundColor: '#FEF3C7', color: '#92400E' };
  if (s === 'DISMISSED') return { backgroundColor: '#F3F4F6', color: '#4B5563' };
  return { backgroundColor: '#FEE2E2', color: '#991B1B' };
};

export function ManageIncidentsView() {
  const [incidents, setIncidents] = useState([]);
  const [kind, setKind] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [actionModal, setActionModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadIncidents = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await managerService.listIncidents({ kind, status, search });
      setIncidents(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Failed to load incidents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [kind, status]);

  const openActionModal = (inc) => {
    setActionModal({
      incident: inc,
      status: inc.status === 'OPEN' ? 'IN_PROGRESS' : (inc.status || 'RESOLVED'),
      actionTaken: inc.actionTaken || '',
      notifyFarmer: true,
      notificationMessage: '',
    });
  };

  const submitAction = async (e) => {
    e.preventDefault();
    if (!actionModal.actionTaken.trim()) {
      setError('Please describe the action taken.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await managerService.takeIncidentAction(actionModal.incident.kind, actionModal.incident.id, {
        status: actionModal.status,
        actionTaken: actionModal.actionTaken.trim(),
        notifyFarmer: actionModal.notifyFarmer,
        notificationMessage: actionModal.notificationMessage.trim() || null,
      });
      setToast(`Action recorded for ${actionModal.incident.targetName}.`);
      setTimeout(() => setToast(''), 3500);
      setActionModal(null);
      await loadIncidents();
    } catch (err) {
      setError(err.message || 'Could not record incident action.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toast && (
        <div style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: '#EAF4ED', border: '1px solid #B7DEC2', color: '#164230', fontWeight: 600, fontSize: '0.875rem' }}>
          {toast}
        </div>
      )}
      {error && (
        <div style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontWeight: 600, fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#164230' }}>
              Platform Incidents ({incidents.length})
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: '#64716B' }}>
              Review crop and livestock incidents, take supervisory action, and notify farmers.
            </p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); loadIncidents(); }} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={kind} onChange={(e) => setKind(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
              <option value="ALL">All Types</option>
              <option value="CROP">Crop Incidents</option>
              <option value="ANIMAL">Livestock Incidents</option>
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #DFD8CA', borderRadius: '9999px', padding: '6px 12px', minWidth: 0 }}>
              <IconSearch size={14} color="#7A8680" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.8125rem', width: '130px' }}
              />
            </div>
            <button type="submit" style={btnSecondary}>Filter</button>
          </form>
        </div>
      </div>

      {loading ? (
        <div style={cardStyle}><p style={{ margin: 0, color: '#64716B' }}>Loading incidents…</p></div>
      ) : incidents.length === 0 ? (
        <div style={cardStyle}><p style={{ margin: 0, color: '#64716B' }}>No incidents match your filters.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '16px' }}>
          {incidents.map((inc) => (
            <div key={`${inc.kind}-${inc.id}`} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#3E7B52', textTransform: 'uppercase' }}>
                    {inc.kind} · {inc.incidentType}
                  </span>
                  <h3 style={{ margin: '2px 0 0', fontSize: '1rem', fontWeight: 700, color: '#19201C' }}>
                    {inc.targetName}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: '#64716B' }}>
                    Farmer: <strong>{inc.farmerName}</strong> · {inc.incidentDate}
                  </p>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, ...statusBadgeStyle(inc.status) }}>
                  {inc.status || 'OPEN'}
                </span>
              </div>

              <p style={{ fontSize: '0.8125rem', color: '#4B5752', margin: '8px 0', lineHeight: 1.45 }}>
                {inc.description}
              </p>

              <div style={{ fontSize: '0.75rem', color: '#64716B', display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {inc.severityLevel != null && <span>Severity: <strong>{inc.severityLevel}/5</strong></span>}
                {inc.affectedCount != null && <span>Affected: <strong>{inc.affectedCount}</strong></span>}
              </div>

              {inc.actionTaken && (
                <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: '#F9F6F0', border: '1px solid #ECE7DC', fontSize: '0.8125rem', marginBottom: '12px' }}>
                  <strong>Action Taken:</strong> {inc.actionTaken}
                  {inc.resolvedBy && <div style={{ fontSize: '0.7rem', color: '#64716B', marginTop: '2px' }}>By {inc.resolvedBy}</div>}
                </div>
              )}

              <button type="button" style={btnPrimary} onClick={() => openActionModal(inc)}>
                Take Action
              </button>
            </div>
          ))}
        </div>
      )}

      {actionModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(22,66,48,0.4)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <form onSubmit={submitAction} style={{ ...cardStyle, width: 'min(96vw, 480px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, color: '#164230' }}>Take Action on Incident</h3>
              <button type="button" onClick={() => setActionModal(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><IconClose size={18} /></button>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#64716B', margin: '0 0 14px' }}>
              {actionModal.incident.targetName} — {actionModal.incident.farmerName}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Decision / Status</label>
                <select value={actionModal.status} onChange={(e) => setActionModal({ ...actionModal, status: e.target.value })} style={inputStyle}>
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="DISMISSED">DISMISSED</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Action Taken / Instructions *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the intervention, advice, or resolution..."
                  value={actionModal.actionTaken}
                  onChange={(e) => setActionModal({ ...actionModal, actionTaken: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={actionModal.notifyFarmer}
                  onChange={(e) => setActionModal({ ...actionModal, notifyFarmer: e.target.checked })}
                  style={{ accentColor: '#164230' }}
                />
                <span>Send notification to {actionModal.incident.farmerName}</span>
              </label>
              {actionModal.notifyFarmer && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Custom Notification Message (optional)</label>
                  <input
                    placeholder="Leave blank to send default action summary"
                    value={actionModal.notificationMessage}
                    onChange={(e) => setActionModal({ ...actionModal, notificationMessage: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button type="button" style={btnSecondary} onClick={() => setActionModal(null)}>Cancel</button>
              <button type="submit" style={btnPrimary} disabled={saving}>{saving ? 'Saving…' : 'Submit Action'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

